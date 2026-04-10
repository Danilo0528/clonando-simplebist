import prisma from './prisma';
import { applyLevelMultiplier } from './progression';
import { grantActivityXp } from './progression';

// Time interval for faucet claims (in milliseconds) - currently set to 1 hour
const FAUCET_INTERVAL = 60 * 60 * 1000; // 1 hour

// Anti-bot rate limiting window (5 minutes)
const FAUCET_RATE_LIMIT_WINDOW = 5 * 60 * 1000;
const FAUCET_MAX_ATTEMPTS = 3; // Max attempts within the window

// Get last faucet claim time for user
export const getLastFaucetClaim = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      lastFaucetClaim: true,
    },
  });

  return user?.lastFaucetClaim;
};

// ✅ NUEVO: Calcular recompensa acumulada basada en timestamps (Lógica del Tiempo)
export const calculateAccumulatedFaucetReward = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      lastFaucetClaim: true,
      level: true,
      hashpowerVirtual: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  
  // Si nunca ha reclamado, no hay recompensa acumulada
  if (!user.lastFaucetClaim) {
    return {
      accumulatedReward: 0,
      timeSinceLastClaim: 0,
      canClaim: true,
    };
  }

  // Calcular diferencia de tiempo en milisegundos
  const timeDiff = now - user.lastFaucetClaim;
  
  // Calcular cuántos períodos de FAUCET_INTERVAL han pasado
  const intervalsPassed = Math.floor(timeDiff / FAUCET_INTERVAL);
  
  // Recompensa base por intervalo
  const baseRewardPerInterval = 0.01;
  
  // Aplicar multiplicador de nivel
  const levelMultiplier = 1 + (user.level * 0.1);
  const rewardPerInterval = baseRewardPerInterval * levelMultiplier;
  
  // Recompensa acumulada total
  const accumulatedReward = intervalsPassed * rewardPerInterval;
  
  // Puede reclamar si ha pasado al menos un intervalo completo
  const canClaim = intervalsPassed >= 1;

  return {
    accumulatedReward,
    timeSinceLastClaim: timeDiff,
    intervalsPassed,
    canClaim,
    timeRemaining: canClaim ? 0 : FAUCET_INTERVAL - timeDiff,
  };
};

// ✅ NUEVO: Verificación anti-bots con validación de tiempo del servidor
export const checkFaucetRateLimit = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      lastFaucetRequest: true,
      faucetAttempts: true,
    },
  });

  const now = new Date();
  
  // Si nunca ha hecho una solicitud, permitir
  if (!user.lastFaucetRequest) {
    return { allowed: true, attempts: 0 };
  }

  const timeSinceLastRequest = now - user.lastFaucetRequest;
  
  // Si pasó la ventana de rate limiting, resetear contador
  if (timeSinceLastRequest > FAUCET_RATE_LIMIT_WINDOW) {
    return { allowed: true, attempts: 0, shouldReset: true };
  }

  // Dentro de la ventana, verificar intentos
  if (user.faucetAttempts >= FAUCET_MAX_ATTEMPTS) {
    const timeRemaining = FAUCET_RATE_LIMIT_WINDOW - timeSinceLastRequest;
    return { 
      allowed: false, 
      attempts: user.faucetAttempts,
      timeRemaining,
      error: 'Too Many Requests - Rate limit exceeded'
    };
  }

  return { allowed: true, attempts: user.faucetAttempts };
};

// ✅ NUEVO: Registrar intento de faucet para rate limiting
export const recordFaucetAttempt = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      lastFaucetRequest: true,
      faucetAttempts: true,
    },
  });

  const now = new Date();
  let newAttempts = user.faucetAttempts + 1;
  
  // Si la ventana de tiempo ya pasó, resetear a 1
  if (user.lastFaucetRequest && (now - user.lastFaucetRequest) > FAUCET_RATE_LIMIT_WINDOW) {
    newAttempts = 1;
  }

  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      lastFaucetRequest: now,
      faucetAttempts: newAttempts,
    },
  });
};

// Check if user can claim faucet
export const canClaimFaucet = async (userId) => {
  const lastClaim = await getLastFaucetClaim(userId);

  if (!lastClaim) {
    // User never claimed before, allow claim
    return { canClaim: true, timeRemaining: 0 };
  }

  const now = new Date();
  const timeSinceLastClaim = now - lastClaim;

  if (timeSinceLastClaim >= FAUCET_INTERVAL) {
    // Enough time has passed, allow claim
    return { canClaim: true, timeRemaining: 0 };
  } else {
    // Not enough time has passed
    const timeRemaining = FAUCET_INTERVAL - timeSinceLastClaim;
    return { canClaim: false, timeRemaining };
  }
};

// Claim faucet reward
export const claimFaucet = async (userId) => {
  const { canClaim } = await canClaimFaucet(userId);

  if (!canClaim) {
    throw new Error('Cannot claim faucet yet');
  }

  // Base faucet reward amount (this can be configurable)
  const baseRewardAmount = 0.01; // 0.01 tokens

  // Apply level multiplier to the reward
  const multiplierResult = await applyLevelMultiplier(userId, baseRewardAmount);
  const rewardAmount = multiplierResult.finalReward;

  // Otorgar XP por reclamar la faucet
  const xpResult = await grantActivityXp(userId, 'faucet');

  // Update user's token balance and last faucet claim time
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update user's token balance and last faucet claim time
    const user = await tx.user.update({
      where: { id: parseInt(userId) },
      data: {
        balance: { increment: rewardAmount }, // Update the main balance field
        tokenBalance: { increment: rewardAmount }, // Also update tokenBalance for consistency
        lastFaucetClaim: new Date(),
        lastEnergyUpdate: new Date() // Actualizar la última fecha de actualización de energía
      },
    });

    return user;
  });

  return {
    baseRewardAmount,
    rewardAmount,
    multiplier: multiplierResult.multiplier,
    level: multiplierResult.level,
    newBalance: updatedUser.tokenBalance,
    lastFaucetClaim: updatedUser.lastFaucetClaim,
    xpGained: xpResult.xpInCurrentLevel, // XP ganado al reclamar faucet
    currentLevel: xpResult.level,
    currentXP: xpResult.xpInCurrentLevel,
    xpNeededForNextLevel: xpResult.xpNeededForNextLevel
  };
};

// Get faucet configuration
export const getFaucetConfig = () => {
  return {
    interval: FAUCET_INTERVAL,
    rewardAmount: 0.01,
    description: 'Claim free tokens every hour',
  };
};

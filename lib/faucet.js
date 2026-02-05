import prisma from './prisma';
import { applyLevelMultiplier } from './progression';
import { grantActivityXp } from './progression'; // Importar la función para otorgar XP

// Time interval for faucet claims (in milliseconds) - currently set to 1 hour
const FAUCET_INTERVAL = 60 * 60 * 1000; // 1 hour

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

    // Skip activity log creation since ActivityLog model doesn't exist in schema
    // In a production environment, you would either create the ActivityLog model in schema.prisma
    // or use an alternative logging mechanism

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
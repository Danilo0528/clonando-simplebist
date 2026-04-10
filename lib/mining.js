import prisma from './prisma';
import { grantActivityXp, getLevelFromXp, awardXp } from './progression';

// ✅ NUEVO: Calcular recompensa acumulada de minería basada en timestamps
export const calculateAccumulatedMiningReward = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      lastMiningClaim: true,
      hashpowerVirtual: true,
      totalHashrate: true,
      level: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Si no tiene hashpower, no hay recompensa
  const effectiveHashrate = user.totalHashrate || user.hashpowerVirtual;
  if (effectiveHashrate <= 0) {
    return {
      accumulatedReward: 0,
      timeSinceLastClaim: 0,
      canClaim: false,
      hashrate: 0,
    };
  }

  const now = new Date();
  
  // Si nunca ha reclamado, usar fecha de creación como referencia
  const lastClaimDate = user.lastMiningClaim || user.createdAt;
  
  // Calcular diferencia de tiempo en segundos
  const timeDiffSeconds = Math.floor((now - lastClaimDate) / 1000);
  
  // Tasa base: 0.001 tokens por hashpower por minuto
  const baseRatePerMinute = 0.001;
  
  // Bonus por nivel (10% por nivel)
  const levelBonus = 1 + (user.level * 0.1);
  
  // Calcular recompensa: (hashrate * tasa * minutos * bonus)
  const minutesPassed = timeDiffSeconds / 60;
  const accumulatedReward = effectiveHashrate * baseRatePerMinute * minutesPassed * levelBonus;

  return {
    accumulatedReward,
    timeSinceLastClaim: timeDiffSeconds * 1000, // en ms
    minutesPassed,
    canClaim: timeDiffSeconds >= 60, // Mínimo 1 minuto para reclamar
    hashrate: effectiveHashrate,
    levelBonus,
  };
};

// Get mining status for a user
export const getUserMiningStatus = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        hashpowerVirtual: true,
        energyPoints: true,
        balance: true,
        level: true,
        xp: true,
        totalHashrate: true,
        lastMiningClaim: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // ✅ Usar lógica de timestamps para calcular recompensa acumulada
    const accumulatedReward = await calculateAccumulatedMiningReward(userId);

    return {
      userId: user.id,
      status: accumulatedReward.hashrate > 0 ? 'active' : 'inactive',
      hashpower: accumulatedReward.hashrate,
      energy: user.energyPoints,
      potentialReward: accumulatedReward.accumulatedReward,
      timeWindow: 60 * 60 * 1000, // 1 hour in milliseconds
      level: user.level,
      xp: user.xp,
      // ✅ Nueva información de timestamps
      accumulatedReward: accumulatedReward.accumulatedReward,
      minutesPassed: accumulatedReward.minutesPassed || 0,
      canClaimMining: accumulatedReward.canClaim,
      levelBonus: accumulatedReward.levelBonus || 1,
    };
  } catch (error) {
    console.error('Error getting user mining status:', error);
    throw error;
  }
};

// Start mining session
export const startMiningSession = async (userId) => {
  try {
    // In this simplified version, we just verify the user can mine
    // More complex implementations would track sessions in a separate table
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        hashpowerVirtual: true,
        energyPoints: true
      }
    });

    if (!user || user.hashpowerVirtual <= 0) {
      throw new Error('User has no virtual hashpower to mine');
    }

    return {
      success: true,
      message: 'Mining session started',
      userId: user.id,
      hashpower: user.hashpowerVirtual
    };
  } catch (error) {
    console.error('Error starting mining session:', error);
    throw error;
  }
};

// Claim mining rewards
export const claimMiningRewards = async (userId) => {
  try {
    // ✅ Usar lógica de timestamps para calcular recompensa acumulada
    const accumulatedReward = await calculateAccumulatedMiningReward(userId);

    if (!accumulatedReward.canClaim) {
      throw new Error('Not enough time has passed since last mining claim');
    }

    if (accumulatedReward.accumulatedReward <= 0) {
      throw new Error('No mining rewards to claim');
    }

    // Verificar que el usuario tenga suficiente energía
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { energyPoints: true },
    });

    const energyCost = 10;
    if (user.energyPoints < energyCost) {
      throw new Error(`Insufficient energy. Need ${energyCost} energy points but only have ${user.energyPoints}`);
    }

    // Otorgar XP usando el sistema estándar de actividades (5 XP por mining claim)
    const xpResult = await grantActivityXp(userId, 'mining');

    // ✅ Transacción atómica para actualizar balances y timestamp
    const updatedUser = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: parseInt(userId) },
        data: {
          balance: { increment: accumulatedReward.accumulatedReward },
          tokenBalance: { increment: accumulatedReward.accumulatedReward },
          // Gastar energía al minar
          energyPoints: { decrement: energyCost },
          lastMiningClaim: new Date(), // ✅ Actualizar timestamp del último claim
          lastEnergyUpdate: new Date()
        },
        select: {
          id: true,
          username: true,
          balance: true,
          tokenBalance: true,
          hashpowerVirtual: true,
          totalHashrate: true,
          energyPoints: true,
          level: true,
          xp: true,
          lastMiningClaim: true,
        }
      });

      return updatedUser;
    });

    return {
      success: true,
      message: `Successfully claimed ${accumulatedReward.accumulatedReward.toFixed(6)} tokens from mining and gained ${xpResult.xpInCurrentLevel} XP`,
      reward: accumulatedReward.accumulatedReward,
      newUserBalance: updatedUser.balance,
      newTokenBalance: updatedUser.tokenBalance,
      newEnergyPoints: updatedUser.energyPoints,
      lastMiningClaim: updatedUser.lastMiningClaim,
      xpGained: xpResult.xpInCurrentLevel,
      currentLevel: xpResult.level,
      currentXP: xpResult.xpInCurrentLevel,
      xpNeededForNextLevel: xpResult.xpNeededForNextLevel
    };
  } catch (error) {
    console.error('Error claiming mining rewards:', error);
    throw error;
  }
};

// Function to consume energy and give XP (simulates mining activity)
export const consumeEnergyForMining = async (userId, energyConsumed) => {
  try {
    // Get user to verify eligibility and current status
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        energyPoints: true,
        level: true,
        xp: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.energyPoints < energyConsumed) {
      throw new Error('Insufficient energy points');
    }

    // Get current level before XP award
    const levelBeforeXp = getLevelFromXp(user.xp);

    // Otorgar XP proporcional a la energía consumida (5 XP por punto de energía)
    const xpToAward = energyConsumed * 5;
    const xpResult = await awardXp(userId, xpToAward, 'mining');

    // Check if leveled up
    const leveledUp = xpResult.level > levelBeforeXp;

    // Update user's energy points
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        energyPoints: { decrement: energyConsumed },
        lastEnergyUpdate: new Date() // Actualizar la última fecha de actualización de energía
      },
      select: {
        id: true,
        energyPoints: true,
        level: true,
        xp: true
      }
    });

    // Calculate rewards based on level and energy consumed
    const baseRewardRate = 0.005; // Base reward per energy point
    const levelMultiplier = 1 + (user.level * 0.1); // Bonus por nivel
    const reward = energyConsumed * baseRewardRate * levelMultiplier;

    // Incrementar balance con la recompensa
    const finalUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        balance: { increment: reward },
        tokenBalance: { increment: reward }
      },
      select: {
        id: true,
        username: true,
        balance: true,
        tokenBalance: true,
        energyPoints: true,
        level: true,
        xp: true
      }
    });

    return {
      success: true,
      energyConsumed: energyConsumed,
      reward: reward,
      xpGained: xpResult.xpInCurrentLevel, // XP ganado en esta sesión
      currentLevel: xpResult.level,
      currentXP: xpResult.xpInCurrentLevel,
      xpNeededForNextLevel: xpResult.xpNeededForNextLevel,
      newEnergyPoints: finalUser.energyPoints,
      leveledUp: leveledUp,
      newMaxEnergy: leveledUp ? xpResult.newMaxEnergy : undefined,
      message: leveledUp 
        ? `LEVEL UP! Consumed ${energyConsumed} energy and reached level ${xpResult.level}! Energy refilled to ${xpResult.newMaxEnergy}.`
        : `Successfully consumed ${energyConsumed} energy and gained ${xpResult.xpInCurrentLevel} XP`
    };
  } catch (error) {
    console.error('Error consuming energy for mining:', error);
    throw error;
  }
};
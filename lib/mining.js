import prisma from './prisma';
import { grantActivityXp, getLevelFromXp, awardXp } from './progression'; // Importar funciones de XP

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
        xp: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate potential earnings based on hashpower and other factors
    const baseRate = 0.001; // Base rate per minute
    const timeWindow = 60 * 60 * 1000; // 1 hour in milliseconds
    const potentialReward = user.hashpowerVirtual * baseRate * (timeWindow / (60 * 1000)); // Adjust for time window
    
    // Calculate mining efficiency based on level
    const levelBonus = user.level * 0.1; // 10% bonus per level
    const efficiency = 1 + levelBonus;
    
    return {
      userId: user.id,
      status: user.hashpowerVirtual > 0 ? 'active' : 'inactive',
      hashpower: user.hashpowerVirtual,
      energy: user.energyPoints,
      potentialReward: potentialReward * efficiency,
      timeWindow: timeWindow,
      level: user.level,
      xp: user.xp
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
    // Get user's mining status to calculate reward
    const miningStatus = await getUserMiningStatus(userId);
    
    if (miningStatus.status !== 'active') {
      throw new Error('User has no active mining');
    }

    // Otorgar XP proporcional a la energía consumida (5 XP por punto de energía)
    const energyCost = 10;
    const xpToAward = energyCost * 5;
    const xpResult = await awardXp(userId, xpToAward, 'mining');

    // Update user's balance with mining rewards
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        balance: { increment: miningStatus.potentialReward },
        tokenBalance: { increment: miningStatus.potentialReward },
        // Gastar energía al minar
        energyPoints: { decrement: energyCost },
        lastEnergyUpdate: new Date()
      },
      select: {
        id: true,
        username: true,
        balance: true,
        tokenBalance: true,
        hashpowerVirtual: true,
        energyPoints: true,
        level: true,
        xp: true
      }
    });

    // Skip activity log since ActivityLog model doesn't exist in schema
    // In a production environment, you would either create the ActivityLog model in schema.prisma
    // or use an alternative logging mechanism

    return {
      success: true,
      message: `Successfully claimed ${miningStatus.potentialReward} tokens from mining and gained ${xpResult.xpInCurrentLevel} XP`,
      reward: miningStatus.potentialReward,
      newUserBalance: updatedUser.balance,
      newTokenBalance: updatedUser.tokenBalance,
      newEnergyPoints: updatedUser.energyPoints,
      xpGained: xpResult.xpInCurrentLevel, // XP ganado en esta sesión
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
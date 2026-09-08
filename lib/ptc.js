import prisma from './prisma.mjs';
import { grantActivityXp, getLevelMultiplier } from './progression'; 
import { syncUserEnergy } from './energy.mjs'; 

// Get PTC tasks for a user
export const getPTCTasks = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, level: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Fetch active ads from the database
    const ads = await prisma.pTCAd.findMany({
      where: { isActive: true },
    });

    // Apply level multiplier dynamically
    const tasks = ads.map(ad => {
      const levelMultiplier = getLevelMultiplier(user.level);
      return {
        ...ad,
        reward: ad.reward * levelMultiplier,
        completed: false // Basic implementation: all ads available
      };
    });

    return tasks;
  } catch (error) {
    console.error('Error getting PTC tasks:', error);
    throw error;
  }
};

// Complete a PTC task
export const completePTCTask = async (userId, taskId) => {
  try {
    // 1. Fetch user and the specific ad to verify reward
    let user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    const ad = await prisma.pTCAd.findUnique({
      where: { id: parseInt(taskId) }
    });

    if (!user || !ad) {
      throw new Error('User or Ad not found');
    }

    // Sincronizar energía antes de verificar
    user = await syncUserEnergy(user);

    if (user.energyPoints < 5) {
      throw new Error('Insufficient energy');
    }

    // 2. Calculate dynamic reward
    const levelMultiplier = getLevelMultiplier(user.level);
    const reward = ad.reward * levelMultiplier;

    // 3. Otorgar XP por completar la tarea PTC
    const xpResult = await grantActivityXp(userId, 'ptc');

    // 4. Update user's balance with the reward within a transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      return await tx.user.update({
        where: { id: parseInt(userId) },
        data: {
          balance: { increment: reward },
          tokenBalance: { increment: reward },
          energyPoints: { decrement: 5 }, // PTC tasks consume energy
          lastEnergyUpdate: new Date()
        },
        select: {
          id: true,
          balance: true,
          tokenBalance: true,
          energyPoints: true,
          level: true,
          xp: true
        }
      });
    });

    return {
      success: true,
      message: `Successfully completed PTC task and earned ${reward.toFixed(4)} tokens and ${xpResult.xpInCurrentLevel} XP`,
      reward: reward,
      xpGained: xpResult.xpInCurrentLevel,
      currentLevel: xpResult.level,
      currentXP: xpResult.xpInCurrentLevel,
      xpNeededForNextLevel: xpResult.xpNeededForNextLevel,
      newUserBalance: updatedUser.balance,
      newTokenBalance: updatedUser.tokenBalance,
      newEnergyPoints: updatedUser.energyPoints
    };
  } catch (error) {
    console.error('Error completing PTC task:', error);
    throw error;
  }
};

// Get PTC statistics for a user
export const getPTCStats = async (userId) => {
  try {
    const [user, adCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: { id: true, level: true }
      }),
      prisma.pTCAd.count({ where: { isActive: true } })
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    // Aggregating statistics (simplified for MVP)
    const stats = {
      todayEarnings: 0, 
      totalTasksCompleted: 0, 
      availableTasks: adCount,
      energyRequiredPerTask: 5
    };

    return stats;
  } catch (error) {
    console.error('Error getting PTC stats:', error);
    throw error;
  }
};
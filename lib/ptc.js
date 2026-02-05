import prisma from './prisma';
import { grantActivityXp } from './progression'; // Importar la función para otorgar XP

// Get PTC tasks for a user
export const getPTCTasks = async (userId) => {
  try {
    // In a real implementation, this would fetch from a tasks table
    // For now, we'll simulate available PTC tasks
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        level: true,
        energyPoints: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate sample PTC tasks
    const tasks = [
      {
        id: 1,
        title: 'Visit Tech Blog',
        description: 'Read and spend 30 seconds on our tech blog',
        reward: 0.05 + (user.level * 0.01), // Reward increases with level
        estimatedTime: 30, // seconds
        url: 'https://example.com/tech-blog',
        completed: false
      },
      {
        id: 2,
        title: 'Watch Video Ad',
        description: 'Watch a promotional video',
        reward: 0.1 + (user.level * 0.02),
        estimatedTime: 60,
        url: 'https://example.com/video-ad',
        completed: false
      },
      {
        id: 3,
        title: 'Survey: Product Feedback',
        description: 'Share your opinion about our product',
        reward: 0.2 + (user.level * 0.03),
        estimatedTime: 120,
        url: 'https://example.com/survey',
        completed: false
      }
    ];

    return tasks;
  } catch (error) {
    console.error('Error getting PTC tasks:', error);
    throw error;
  }
};

// Complete a PTC task
export const completePTCTask = async (userId, taskId) => {
  try {
    // In a real implementation, this would verify the user actually spent time on the task
    // For now, we'll just award the reward
    
    // Get user to verify eligibility and calculate reward
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        level: true,
        energyPoints: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // In this simulation, we'll use a standard reward structure
    // based on the task ID (in a real app, this would be stored in a tasks table)
    let reward;
    switch(taskId) {
      case 1:
        reward = 0.05 + (user.level * 0.01);
        break;
      case 2:
        reward = 0.1 + (user.level * 0.02);
        break;
      case 3:
        reward = 0.2 + (user.level * 0.03);
        break;
      default:
        reward = 0.1 + (user.level * 0.01);
    }

    // Otorgar XP por completar la tarea PTC
    const xpResult = await grantActivityXp(userId, 'ptc');

    // Update user's balance with the reward
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        balance: { increment: reward },
        tokenBalance: { increment: reward },
        energyPoints: { decrement: 5 }, // PTC tasks consume energy
        lastEnergyUpdate: new Date() // Actualizar la última fecha de actualización de energía
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

    // Skip activity log since ActivityLog model doesn't exist in schema
    // In a production environment, you would either create the ActivityLog model in schema.prisma
    // or use an alternative logging mechanism

    return {
      success: true,
      message: `Successfully completed PTC task and earned ${reward} tokens and ${xpResult.xpInCurrentLevel} XP`,
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
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        level: true,
        energyPoints: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // In a real implementation, this would aggregate data from a PTC completion history
    // For now, we'll simulate some statistics
    const stats = {
      todayEarnings: 0.5 + (user.level * 0.05),
      totalTasksCompleted: 25 + user.level * 3,
      availableTasks: 3,
      energyRequiredPerTask: 5
    };

    return stats;
  } catch (error) {
    console.error('Error getting PTC stats:', error);
    throw error;
  }
};
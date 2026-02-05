import prisma from './prisma';
import { grantActivityXp } from './progression'; // Importar la función para otorgar XP

// Get available shortlinks for a user
export const getAvailableShortlinks = async (userId) => {
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

    // Generate sample shortlinks
    const shortlinks = [
      {
        id: 1,
        title: 'Tech News Daily',
        description: 'Read the latest tech news',
        reward: 0.02 + (user.level * 0.005), // Reward increases with level
        url: 'https://example.com/tech-news',
        visitTime: 10, // seconds
        status: 'available'
      },
      {
        id: 2,
        title: 'Product Review Site',
        description: 'Check out new product reviews',
        reward: 0.03 + (user.level * 0.007),
        url: 'https://example.com/product-reviews',
        visitTime: 15,
        status: 'available'
      },
      {
        id: 3,
        title: 'Entertainment Hub',
        description: 'Browse trending entertainment',
        reward: 0.01 + (user.level * 0.003),
        url: 'https://example.com/entertainment',
        visitTime: 8,
        status: 'available'
      },
      {
        id: 4,
        title: 'Finance Tips',
        description: 'Learn about personal finance',
        reward: 0.04 + (user.level * 0.01),
        url: 'https://example.com/finance-tips',
        visitTime: 20,
        status: 'available'
      }
    ];

    return shortlinks;
  } catch (error) {
    console.error('Error getting available shortlinks:', error);
    throw error;
  }
};

// Complete a shortlink
export const completeShortlink = async (userId, shortlinkId) => {
  try {
    // In a real implementation, this would verify the user actually visited the link for required time
    // For now, we'll just award the reward based on the shortlink ID
    
    // Get user to verify eligibility and calculate reward
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        level: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate reward based on shortlink ID
    let reward;
    switch(shortlinkId) {
      case 1:
        reward = 0.02 + (user.level * 0.005);
        break;
      case 2:
        reward = 0.03 + (user.level * 0.007);
        break;
      case 3:
        reward = 0.01 + (user.level * 0.003);
        break;
      case 4:
        reward = 0.04 + (user.level * 0.01);
        break;
      default:
        reward = 0.02 + (user.level * 0.005);
    }

    // Otorgar XP por completar el shortlink
    const xpResult = await grantActivityXp(userId, 'shortlink');

    // Update user's balance with the reward
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        balance: { increment: reward },
        tokenBalance: { increment: reward },
        lastEnergyUpdate: new Date() // Actualizar la última fecha de actualización de energía
      },
      select: {
        id: true,
        username: true,
        balance: true,
        tokenBalance: true,
        level: true,
        xp: true
      }
    });

    // Skip activity log since ActivityLog model doesn't exist in schema
    // In a production environment, you would either create the ActivityLog model in schema.prisma
    // or use an alternative logging mechanism

    return {
      success: true,
      message: `Successfully completed shortlink and earned ${reward} tokens and ${xpResult.xpInCurrentLevel} XP`,
      reward: reward,
      xpGained: xpResult.xpInCurrentLevel,
      currentLevel: xpResult.level,
      currentXP: xpResult.xpInCurrentLevel,
      xpNeededForNextLevel: xpResult.xpNeededForNextLevel,
      newUserBalance: updatedUser.balance,
      newTokenBalance: updatedUser.tokenBalance
    };
  } catch (error) {
    console.error('Error completing shortlink:', error);
    throw error;
  }
};

// Get shortlink statistics for a user
export const getShortlinkStats = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        level: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // In a real implementation, this would aggregate data from a shortlink completion history
    // For now, we'll simulate some statistics
    const stats = {
      todayEarnings: 0.2 + (user.level * 0.02),
      totalCompleted: 10 + user.level * 5,
      availableToday: 4,
      avgReward: 0.025 + (user.level * 0.003)
    };

    return stats;
  } catch (error) {
    console.error('Error getting shortlink stats:', error);
    throw error;
  }
};
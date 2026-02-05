import prisma from './prisma';
import { grantActivityXp } from './progression'; // Importar la función para otorgar XP

// Get available offerwalls for a user
export const getAvailableOfferwalls = async (userId) => {
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

    // Generate sample offerwalls
    const offerwalls = [
      {
        id: 1,
        name: 'Mobile App Installation',
        description: 'Install and use a mobile app for 3 days',
        reward: 0.5 + (user.level * 0.1), // Reward increases with level
        estimatedTime: '3 days',
        category: 'mobile',
        requirements: 'iOS or Android device',
        status: 'available',
        verificationTime: '24-48 hours'
      },
      {
        id: 2,
        name: 'Online Survey',
        description: 'Complete a detailed survey about consumer habits',
        reward: 0.3 + (user.level * 0.05),
        estimatedTime: '15 minutes',
        category: 'survey',
        requirements: 'Must be 18+ years old',
        status: 'available',
        verificationTime: 'Immediately'
      },
      {
        id: 3,
        name: 'Credit Card Application',
        description: 'Apply for a credit card through our partner',
        reward: 5.0 + (user.level * 0.5),
        estimatedTime: '10 minutes',
        category: 'finance',
        requirements: 'Must be 21+ years old, US resident',
        status: 'available',
        verificationTime: '7-14 days'
      },
      {
        id: 4,
        name: 'Free Trial Signup',
        description: 'Sign up for a free trial (cancel anytime)',
        reward: 1.0 + (user.level * 0.1),
        estimatedTime: '5 minutes',
        category: 'trial',
        requirements: 'Valid email and payment method',
        status: 'available',
        verificationTime: '48 hours'
      }
    ];

    return offerwalls;
  } catch (error) {
    console.error('Error getting available offerwalls:', error);
    throw error;
  }
};

// Complete an offerwall
export const completeOfferwall = async (userId, offerwallId) => {
  try {
    // In a real implementation, this would involve verification with offerwall providers
    // For now, we'll just award the reward based on the offerwall ID
    
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

    // Calculate reward based on offerwall ID
    let reward;
    switch(offerwallId) {
      case 1:
        reward = 0.5 + (user.level * 0.1);
        break;
      case 2:
        reward = 0.3 + (user.level * 0.05);
        break;
      case 3:
        reward = 5.0 + (user.level * 0.5);
        break;
      case 4:
        reward = 1.0 + (user.level * 0.1);
        break;
      default:
        reward = 1.0 + (user.level * 0.1);
    }

    // Otorgar XP por completar la oferta
    const xpResult = await grantActivityXp(userId, 'offerwall');

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
      message: `Successfully completed offerwall and earned ${reward} tokens and ${xpResult.xpInCurrentLevel} XP`,
      reward: reward,
      xpGained: xpResult.xpInCurrentLevel,
      currentLevel: xpResult.level,
      currentXP: xpResult.xpInCurrentLevel,
      xpNeededForNextLevel: xpResult.xpNeededForNextLevel,
      newUserBalance: updatedUser.balance,
      newTokenBalance: updatedUser.tokenBalance
    };
  } catch (error) {
    console.error('Error completing offerwall:', error);
    throw error;
  }
};

// Get offerwall statistics for a user
export const getOfferwallStats = async (userId) => {
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

    // In a real implementation, this would aggregate data from an offerwall completion history
    // For now, we'll simulate some statistics
    const stats = {
      todayEarnings: 1.5 + (user.level * 0.1),
      totalCompleted: 5 + user.level * 2,
      availableToday: 4,
      pendingVerifications: 2
    };

    return stats;
  } catch (error) {
    console.error('Error getting offerwall stats:', error);
    throw error;
  }
};
import { PrismaClient } from '@prisma/client';
import { applyLevelMultiplier, awardXp } from './progression';

const prisma = new PrismaClient();

// Duration of each mining pool in milliseconds (8 hours)
const POOL_DURATION = 8 * 60 * 60 * 1000;

// Base reward for each pool
const BASE_POOL_REWARD = 100.0;

// Calculate current active pool ID based on time
const getCurrentPoolId = () => {
  const now = new Date();
  // Use the number of 8-hour periods since epoch to create unique pool IDs
  const poolNumber = Math.floor(now.getTime() / POOL_DURATION);
  return `pool_${poolNumber}`;
};

// Get or create current mining pool
export const getCurrentMiningPool = async () => {
  const poolId = getCurrentPoolId();
  
  let pool = await prisma.miningPool.findUnique({
    where: { poolIdentifier: poolId },
  });

  if (!pool) {
    // Create a new pool if one doesn't exist
    pool = await prisma.miningPool.create({
      data: {
        poolIdentifier: poolId,
        startTime: new Date(Date.now() - (Date.now() % POOL_DURATION)), // Start of current 8-hour window
        endTime: new Date(Date.now() - (Date.now() % POOL_DURATION) + POOL_DURATION), // End of current 8-hour window
        totalRewards: BASE_POOL_REWARD,
        totalHashpower: 0,
        isActive: true,
      },
    });
  }

  return pool;
};

// Get user's mining contribution to the current pool
export const getUserPoolContribution = async (userId) => {
  const currentPool = await getCurrentMiningPool();
  
  const contribution = await prisma.miningPoolContribution.findUnique({
    where: {
      userId_poolId: {
        userId: parseInt(userId),
        poolId: currentPool.id,
      },
    },
  });

  return contribution;
};

// Calculate mining reward based on user's hashpower contribution
export const calculateMiningReward = async (userId) => {
  const currentPool = await getCurrentMiningPool();
  const userContribution = await getUserPoolContribution(userId);
  
  if (!userContribution || userContribution.contributedHashpower <= 0) {
    return { reward: 0, share: 0 };
  }
  
  // Calculate user's share of the pool based on their hashpower contribution
  const userShare = currentPool.totalHashpower > 0 
    ? userContribution.contributedHashpower / currentPool.totalHashpower 
    : 0;
  
  const reward = userShare * currentPool.totalRewards;
  
  return { 
    reward, 
    share: userShare,
    poolInfo: {
      totalRewards: currentPool.totalRewards,
      totalHashpower: currentPool.totalHashpower,
    },
    userInfo: {
      contributedHashpower: userContribution.contributedHashpower,
    }
  };
};

// Perform mining action - contribute hashpower to the current pool
export const performMiningAction = async (userId) => {
  const currentPool = await getCurrentMiningPool();

  // Get user's virtual hashpower from their profile
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      hashpowerVirtual: true,
      energyPoints: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user has enough energy points
  const energyCost = 10; // Cost per mining action
  if (user.energyPoints < energyCost) {
    throw new Error('Not enough energy points');
  }

  // Calculate how much hashpower to contribute (based on user's virtual hashpower)
  const hashpowerContribution = user.hashpowerVirtual > 0 ? Math.min(user.hashpowerVirtual, 100) : 1;

  // Update user's energy points
  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      energyPoints: { decrement: energyCost },
    },
  });

  // Update the pool's total hashpower
  await prisma.miningPool.update({
    where: { id: currentPool.id },
    data: {
      totalHashpower: { increment: hashpowerContribution },
    },
  });

  // Create or update user's contribution to the pool
  const contribution = await prisma.miningPoolContribution.upsert({
    where: {
      userId_poolId: {
        userId: parseInt(userId),
        poolId: currentPool.id,
      },
    },
    update: {
      contributedHashpower: { increment: hashpowerContribution },
    },
    create: {
      userId: parseInt(userId),
      poolId: currentPool.id,
      contributedHashpower: hashpowerContribution,
    },
  });

  // Calculate potential reward
  const rewardInfo = await calculateMiningReward(userId);

  // Award XP for mining action
  const xpGained = 5; // Fixed XP for mining action
  const { newXp, newLevel, levelUp } = await awardXp(userId, xpGained, 'mining');

  return {
    hashpowerContribution,
    newEnergyPoints: user.energyPoints - energyCost,
    poolInfo: {
      id: currentPool.poolIdentifier,
      totalHashpower: currentPool.totalHashpower + hashpowerContribution,
      totalRewards: currentPool.totalRewards,
    },
    potentialReward: rewardInfo.reward,
    userShare: rewardInfo.share,
    xpGained,
    newLevel,
    levelUp
  };
};

// Claim mining rewards from completed pools
export const claimMiningRewards = async (userId) => {
  // Get all pools that the user contributed to that have ended and rewards not yet claimed
  const now = new Date();

  const unclaimedContributions = await prisma.miningPoolContribution.findMany({
    where: {
      userId: parseInt(userId),
      miningPool: {
        endTime: { lt: now }, // Pool has ended
      },
      claimed: false, // Rewards not yet claimed
    },
    include: {
      miningPool: true,
    },
  });

  if (unclaimedContributions.length === 0) {
    return { claimed: 0, rewards: [] };
  }

  let totalClaimed = 0;
  const rewards = [];

  // Process each unclaimed reward
  for (const contribution of unclaimedContributions) {
    // Calculate reward based on user's share
    const userShare = contribution.miningPool.totalHashpower > 0
      ? contribution.contributedHashpower / contribution.miningPool.totalHashpower
      : 0;

    const baseRewardAmount = userShare * contribution.miningPool.totalRewards;

    // Apply level multiplier to the reward
    const multiplierResult = await applyLevelMultiplier(userId, baseRewardAmount);
    const rewardAmount = multiplierResult.finalReward;

    // Update user's token balance and mark contribution as claimed
    await prisma.$transaction(async (tx) => {
      // Update user's token balance
      await tx.user.update({
        where: { id: parseInt(userId) },
        data: {
          tokenBalance: { increment: rewardAmount },
        },
      });

      // Mark contribution as claimed
      await tx.miningPoolContribution.update({
        where: { id: contribution.id },
        data: { claimed: true },
      });

      // Create activity log entry
      await tx.activityLog.create({
        data: {
          userId: parseInt(userId),
          activityType: 'mining',
          amountTokens: rewardAmount,
          metadata: {
            poolId: contribution.miningPool.poolIdentifier,
            contributedHashpower: contribution.contributedHashpower,
            baseReward: baseRewardAmount,
            reward: rewardAmount,
            multiplier: multiplierResult.multiplier,
            level: multiplierResult.level,
            share: userShare,
          },
        },
      });
    });

    totalClaimed += rewardAmount;
    rewards.push({
      poolId: contribution.miningPool.poolIdentifier,
      baseReward: baseRewardAmount,
      reward: rewardAmount,
      multiplier: multiplierResult.multiplier,
      level: multiplierResult.level,
      share: userShare,
    });
  }

  return { claimed: totalClaimed, rewards };
};

// Get mining statistics for user
export const getMiningStats = async (userId) => {
  const currentPool = await getCurrentMiningPool();
  const userContribution = await getUserPoolContribution(userId);
  const rewardInfo = await calculateMiningReward(userId);
  
  // Get user's overall mining stats
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      hashpowerVirtual: true,
      energyPoints: true,
      energyRegenTimestamp: true,
    },
  });
  
  // Calculate time until next energy regeneration
  const energyRegenInterval = 5 * 60 * 1000; // 5 minutes per energy point
  const now = new Date();
  const timeSinceLastRegen = now - user.energyRegenTimestamp;
  const energyToAdd = Math.floor(timeSinceLastRegen / energyRegenInterval);
  
  let currentEnergy = user.energyPoints;
  let nextRegenTime = new Date(user.energyRegenTimestamp.getTime() + ((energyRegenInterval)));
  
  if (energyToAdd > 0) {
    // Update energy points in DB if needed
    if (currentEnergy < 100) {
      const newEnergy = Math.min(100, currentEnergy + energyToAdd);
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          energyPoints: newEnergy,
          energyRegenTimestamp: now,
        },
      });
      currentEnergy = newEnergy;
    }
  }
  
  // If current energy is less than 100, calculate next regen time
  if (currentEnergy < 100) {
    nextRegenTime = new Date(now.getTime() + (100 - currentEnergy) * energyRegenInterval);
  }
  
  return {
    currentPool: {
      id: currentPool.poolIdentifier,
      startTime: currentPool.startTime,
      endTime: currentPool.endTime,
      totalRewards: currentPool.totalRewards,
      totalHashpower: currentPool.totalHashpower,
      isActive: currentPool.isActive,
    },
    userContribution: userContribution ? {
      contributedHashpower: userContribution.contributedHashpower,
      rewardShare: rewardInfo.share,
      potentialReward: rewardInfo.reward,
    } : null,
    userStats: {
      hashpowerVirtual: user.hashpowerVirtual,
      energyPoints: currentEnergy,
      nextRegenTime,
    },
    rewardInfo,
  };
};

// Upgrade user's virtual hashpower
export const upgradeHashpower = async (userId, amount) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      tokenBalance: true,
      hashpowerVirtual: true,
    },
  });
  
  // Cost for upgrading hashpower (could be configurable)
  const upgradeCost = amount * 10; // 10 tokens per unit of hashpower
  
  if (user.tokenBalance < upgradeCost) {
    throw new Error('Insufficient tokens for upgrade');
  }
  
  // Deduct cost and upgrade hashpower
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update user's token balance and hashpower
    const updated = await tx.user.update({
      where: { id: parseInt(userId) },
      data: {
        tokenBalance: { decrement: upgradeCost },
        hashpowerVirtual: { increment: amount },
      },
    });
    
    // Create activity log entry
    await tx.activityLog.create({
      data: {
        userId: parseInt(userId),
        activityType: 'mining_upgrade',
        amountTokens: -upgradeCost,
        metadata: {
          upgradeType: 'hashpower',
          amount: amount,
          cost: upgradeCost,
        },
      },
    });
    
    return updated;
  });
  
  return {
    newHashpower: updatedUser.hashpowerVirtual,
    newBalance: updatedUser.tokenBalance,
    cost: upgradeCost,
  };
};
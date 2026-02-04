import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Experience points required for each level
// Formula: XP for level n = 100 * n^2
export const getXpForLevel = (level) => {
  return 100 * level * level;
};

// Calculate level from total XP
export const getLevelFromXp = (totalXp) => {
  // Solve: level = sqrt(totalXp / 100)
  const level = Math.floor(Math.sqrt(totalXp / 100));
  return level;
};

// Get XP needed to reach next level
export const getXpNextLevel = (currentLevel) => {
  return getXpForLevel(currentLevel + 1);
};

// Get XP needed to reach specified level
export const getXpToReachLevel = (targetLevel) => {
  return getXpForLevel(targetLevel);
};

// Calculate XP progress toward next level
export const getXpProgressToNextLevel = (totalXp) => {
  const currentLevel = getLevelFromXp(totalXp);
  const xpForCurrentLevel = getXpForLevel(currentLevel);
  const xpForNextLevel = getXpForLevel(currentLevel + 1);
  
  const progress = totalXp - xpForCurrentLevel;
  const neededForNext = xpForNextLevel - xpForCurrentLevel;
  
  return {
    currentLevel,
    xpInCurrentLevel: progress,
    xpNeededForNextLevel: neededForNext,
    progressPercentage: neededForNext > 0 ? (progress / neededForNext) * 100 : 100,
  };
};

// Award XP to user for various activities
export const awardXp = async (userId, xpAmount, activityType) => {
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update user's XP
    const user = await tx.user.update({
      where: { id: parseInt(userId) },
      data: {
        xp: { increment: xpAmount },
      },
      select: {
        id: true,
        username: true,
        level: true,
        xp: true,
        tokenBalance: true,
      },
    });

    // Check if user leveled up
    const newLevel = getLevelFromXp(user.xp);
    let levelUp = false;
    
    if (newLevel > user.level) {
      // Update user's level
      await tx.user.update({
        where: { id: parseInt(userId) },
        data: {
          level: newLevel,
        },
      });
      
      levelUp = true;
    }

    // Create activity log entry
    await tx.activityLog.create({
      data: {
        userId: parseInt(userId),
        activityType: 'xp_gain',
        amountTokens: 0,
        amountBoundTokens: 0,
        metadata: {
          xpGained: xpAmount,
          activityType: activityType,
          newLevel: levelUp ? newLevel : undefined,
          levelUp: levelUp,
        },
      },
    });

    return { ...user, level: levelUp ? newLevel : user.level, levelUp };
  });

  return {
    newXp: updatedUser.xp,
    newLevel: updatedUser.level,
    levelUp: updatedUser.levelUp,
    xpAmount,
  };
};

// Get user's progression stats
export const getUserProgression = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      level: true,
      xp: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const progress = getXpProgressToNextLevel(user.xp);

  return {
    level: user.level,
    totalXp: user.xp,
    xpInCurrentLevel: progress.xpInCurrentLevel,
    xpNeededForNextLevel: progress.xpNeededForNextLevel,
    progressPercentage: progress.progressPercentage,
    nextLevel: progress.currentLevel + 1,
  };
};

// Get leaderboard of top users by level and XP
export const getLeaderboard = async (limit = 10) => {
  const users = await prisma.user.findMany({
    take: limit,
    orderBy: [
      { level: 'desc' },
      { xp: 'desc' },
    ],
    select: {
      id: true,
      username: true,
      level: true,
      xp: true,
    },
  });

  return users.map((user, index) => ({
    rank: index + 1,
    ...user,
  }));
};

// Calculate XP for different activities
export const calculateXpForActivity = (activityType, rewardAmount = 0) => {
  switch (activityType) {
    case 'faucet':
      return 10; // Fixed XP for faucet claim
    case 'ptc':
      return Math.round(rewardAmount * 200); // 200 XP per token earned from PTC
    case 'shortlink':
      return Math.round(rewardAmount * 500); // 500 XP per token earned from shortlinks
    case 'mining':
      return Math.round(rewardAmount * 100); // 100 XP per token earned from mining
    case 'task':
      return 50; // Fixed XP for completing tasks
    default:
      return Math.round(rewardAmount * 100); // Default: 100 XP per token
  }
};

// Calculate multiplier based on user level
export const getMultiplierByLevel = (level) => {
  // Progressive multiplier system:
  // Level 1-5: 1.0x (base)
  // Level 6-10: 1.1x (+10%)
  // Level 11-20: 1.25x (+25%)
  // Level 21-30: 1.5x (+50%)
  // Level 31-40: 1.75x (+75%)
  // Level 41+: 2.0x (+100%)

  if (level >= 41) return 2.0;
  if (level >= 31) return 1.75;
  if (level >= 21) return 1.5;
  if (level >= 11) return 1.25;
  if (level >= 6) return 1.1;
  return 1.0;
};

// Apply multiplier to rewards based on user level
export const applyLevelMultiplier = async (userId, baseReward) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: { level: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const multiplier = getMultiplierByLevel(user.level);
  const multipliedReward = baseReward * multiplier;

  return {
    baseReward,
    multiplier,
    finalReward: multipliedReward,
    level: user.level
  };
};

// Get user's level and multiplier info
export const getUserLevelInfo = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: { level: true, xp: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const multiplier = getMultiplierByLevel(user.level);
  const progress = getXpProgressToNextLevel(user.xp);

  return {
    level: user.level,
    xp: user.xp,
    multiplier,
    xpToNextLevel: progress.xpNeededForNextLevel - progress.xpInCurrentLevel,
    percentToNextLevel: progress.progressPercentage
  };
};
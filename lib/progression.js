import prisma from './prisma';

// Experience points thresholds for each level
// Formula: XP threshold for level n = 100 * (n-1)^2
// Level 1: 0 XP (base)
// Level 2: 100 XP total
// Level 3: 400 XP total
// Level 4: 900 XP total
export const getXpForLevel = (level) => {
  return 100 * Math.pow(level - 1, 2);
};

// Calculate level from total XP
export const getLevelFromXp = (totalXp) => {
  // Solve: level = 1 + floor(sqrt(totalXp / 100))
  const level = 1 + Math.floor(Math.sqrt(totalXp / 100));
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
  // First, get current user state to check for level-up
  const currentUser = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: { xp: true, level: true },
  });

  const currentLevel = getLevelFromXp(currentUser.xp);
  const newTotalXp = currentUser.xp + xpAmount;
  const newLevel = getLevelFromXp(newTotalXp);

  // Check if user leveled up
  const leveledUp = newLevel > currentLevel;

  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update user's XP and level if changed
    const updateData = {
      xp: { increment: xpAmount },
    };

    // If leveled up, update level field and refill energy
    if (leveledUp) {
      const newMaxEnergy = 100 + (newLevel * 10);
      updateData.level = newLevel;
      updateData.energyPoints = newMaxEnergy;
      updateData.lastEnergyUpdate = new Date();
    }

    const user = await tx.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        level: true,
        xp: true,
        username: true,
        energyPoints: true,
      },
    });

    return user;
  });

  // Calculate new level and progression info
  const progression = getXpProgressToNextLevel(updatedUser.xp);

  return {
    ...updatedUser,
    level: progression.currentLevel,
    xpInCurrentLevel: progression.xpInCurrentLevel,
    xpNeededForNextLevel: progression.xpNeededForNextLevel,
    progressPercentage: progression.progressPercentage,
    leveledUp,
    newMaxEnergy: leveledUp ? 100 + (newLevel * 10) : undefined,
  };
};

// Apply level-based multiplier to rewards
export const applyLevelMultiplier = async (userId, baseReward) => {
  try {
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        level: true,
        xp: true,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Calculate progression info
    const progression = getXpProgressToNextLevel(user.xp);

    // Level-based multiplier (higher levels get higher multipliers)
    // Multiplier formula: 1 + (level * 0.1) - meaning level 1 gets 1.1x, level 10 gets 2x, etc.
    const multiplier = 1 + (progression.currentLevel * 0.1);
    const finalReward = baseReward * multiplier;

    return {
      baseReward,
      multiplier,
      finalReward,
      level: progression.currentLevel,
      xp: user.xp,
      xpInCurrentLevel: progression.xpInCurrentLevel,
      xpNeededForNextLevel: progression.xpNeededForNextLevel,
      progressPercentage: progression.progressPercentage,
    };
  } catch (error) {
    console.error('Error applying level multiplier:', error);
    // Return basic reward without multiplier in case of error
    return {
      baseReward,
      multiplier: 1,
      finalReward: baseReward,
      level: 1,
      xp: 0,
      xpInCurrentLevel: 0,
      xpNeededForNextLevel: 100,
      progressPercentage: 0,
    };
  }
};

// Get user's progression info
export const getUserProgression = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        level: true,
        xp: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const progression = getXpProgressToNextLevel(user.xp);
    
    return {
      level: progression.currentLevel,
      xp: user.xp,
      xpInCurrentLevel: progression.xpInCurrentLevel,
      xpNeededForNextLevel: progression.xpNeededForNextLevel,
      progressPercentage: progression.progressPercentage,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('Error getting user progression:', error);
    return {
      level: 1,
      xp: 0,
      xpInCurrentLevel: 0,
      xpNeededForNextLevel: 100,
      progressPercentage: 0,
      createdAt: new Date(),
    };
  }
};

// Calculate rewards for different activities based on level
export const calculateActivityReward = async (userId, activityType) => {
  try {
    // Base rewards for different activities
    const baseRewards = {
      faucet: 0.01,    // 0.01 tokens
      mining: 0.05,    // 0.05 tokens
      ptc: 0.02,       // 0.02 tokens
      shortlink: 0.03, // 0.03 tokens
      offerwall: 0.50, // 0.50 tokens
    };

    const baseReward = baseRewards[activityType] || 0.01; // Default to 0.01 if unknown activity
    
    // Apply level multiplier
    const multiplierResult = await applyLevelMultiplier(userId, baseReward);
    
    // Additional bonuses based on activity type
    const activityBonuses = {
      faucet: 1.0,     // No bonus for faucet
      mining: 1.2,     // 20% bonus for mining
      ptc: 1.1,        // 10% bonus for PTC
      shortlink: 1.15, // 15% bonus for shortlinks
      offerwall: 1.5,  // 50% bonus for offerwalls
    };

    const bonusMultiplier = activityBonuses[activityType] || 1.0;
    const finalReward = multiplierResult.finalReward * bonusMultiplier;

    return {
      ...multiplierResult,
      baseReward,
      bonusMultiplier,
      finalReward,
      activityType,
    };
  } catch (error) {
    console.error('Error calculating activity reward:', error);
    return {
      baseReward: 0.01,
      multiplier: 1,
      bonusMultiplier: 1,
      finalReward: 0.01,
      activityType,
      level: 1,
      xp: 0,
      xpInCurrentLevel: 0,
      xpNeededForNextLevel: 100,
      progressPercentage: 0,
    };
  }
};

// Grant XP for activities
export const grantActivityXp = async (userId, activityType) => {
  // XP amounts for different activities
  const xpAmounts = {
    faucet: 10,      // Fixed XP for faucet claim
    mining: 5,       // Fixed XP for mining
    ptc: 20,         // XP for PTC ads
    shortlink: 15,   // XP for shortlink
    offerwall: 50,   // XP for completing offerwalls
  };

  const xpAmount = xpAmounts[activityType] || 10; // Default to 10 XP if unknown activity
  
  return await awardXp(userId, xpAmount, activityType);
};
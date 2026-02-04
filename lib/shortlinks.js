import { PrismaClient } from '@prisma/client';
import { applyLevelMultiplier } from './progression';

const prisma = new PrismaClient();

// Reward amount for visiting shortlinks
const SHORTLINK_REWARD = 0.002; // 0.002 tokens per shortlink visit

// Character set for generating short codes
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Generate a random short code
const generateShortCode = (length = 6) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return result;
};

// Create a new shortlink
export const createShortlink = async (originalUrl, userId) => {
  // Validate URL
  try {
    new URL(originalUrl);
  } catch (error) {
    throw new Error('Invalid URL');
  }

  // Generate unique short code
  let shortCode;
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    shortCode = generateShortCode();
    const existingLink = await prisma.shortlink.findUnique({
      where: { code: shortCode },
    });
    
    if (!existingLink) {
      isUnique = true;
    }
    
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Could not generate unique short code');
  }

  // Create the shortlink
  const shortlink = await prisma.shortlink.create({
    data: {
      code: shortCode,
      originalUrl,
      createdBy: userId,
      visits: 0,
      earnings: 0,
    },
  });

  return shortlink;
};

// Get shortlink by code
export const getShortlinkByCode = async (code) => {
  const shortlink = await prisma.shortlink.findUnique({
    where: { code },
  });

  return shortlink;
};

// Process shortlink visit
export const processShortlinkVisit = async (code, userId) => {
  // Get the shortlink
  const shortlink = await getShortlinkByCode(code);

  if (!shortlink) {
    throw new Error('Shortlink not found');
  }

  // Apply level multiplier to the reward
  const multiplierResult = await applyLevelMultiplier(userId, SHORTLINK_REWARD);
  const rewardWithMultiplier = multiplierResult.finalReward;

  // Update shortlink stats
  await prisma.shortlink.update({
    where: { code },
    data: {
      visits: { increment: 1 },
    },
  });

  // Credit user with reward
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update user's token balance
    const user = await tx.user.update({
      where: { id: parseInt(userId) },
      data: {
        tokenBalance: { increment: rewardWithMultiplier },
      },
    });

    // Create activity log entry
    await tx.activityLog.create({
      data: {
        userId: parseInt(userId),
        activityType: 'shortlink',
        amountTokens: rewardWithMultiplier,
        metadata: {
          shortlinkCode: code,
          originalUrl: shortlink.originalUrl,
          baseReward: SHORTLINK_REWARD,
          reward: rewardWithMultiplier,
          multiplier: multiplierResult.multiplier,
          level: multiplierResult.level,
        },
      },
    });

    return user;
  });

  return {
    baseReward: SHORTLINK_REWARD,
    reward: rewardWithMultiplier,
    multiplier: multiplierResult.multiplier,
    level: multiplierResult.level,
    newBalance: updatedUser.tokenBalance,
    originalUrl: shortlink.originalUrl,
  };
};

// Get user's shortlinks
export const getUserShortlinks = async (userId) => {
  const shortlinks = await prisma.shortlink.findMany({
    where: { createdBy: userId },
    orderBy: { createdAt: 'desc' },
  });

  return shortlinks;
};

// Get shortlink configuration
export const getShortlinkConfig = () => {
  return {
    rewardPerVisit: SHORTLINK_REWARD,
    description: 'Earn tokens by visiting shortlinks',
  };
};
import { PrismaClient } from '@prisma/client';
import { applyLevelMultiplier } from './progression';

const prisma = new PrismaClient();

// Reward amount per valid click
const CLICK_REWARD = 0.005; // 0.005 tokens per click

// Time window for rate limiting clicks (in milliseconds)
const CLICK_RATE_LIMIT_WINDOW = 30 * 1000; // 30 seconds

// Create a new PTC ad
export const createAd = async (adData) => {
  const ad = await prisma.ad.create({
    data: {
      title: adData.title,
      description: adData.description,
      url: adData.url,
      reward: adData.reward || CLICK_REWARD,
      isActive: true,
      views: 0,
      clicks: 0,
      maxViews: adData.maxViews || 1000,
      advertiserId: adData.advertiserId,
    },
  });

  return ad;
};

// Get random active PTC ad
export const getRandomActiveAd = async () => {
  const activeAds = await prisma.ad.findMany({
    where: {
      isActive: true,
      views: {
        lt: prisma.ad.fields.maxViews, // Views less than maxViews
      },
    },
  });

  if (activeAds.length === 0) {
    return null;
  }

  // Return a random ad from the active ones
  const randomIndex = Math.floor(Math.random() * activeAds.length);
  return activeAds[randomIndex];
};

// Check if user can click on an ad (rate limiting)
export const canClickAd = async (userId, adId) => {
  const now = new Date();
  const timeAgo = new Date(now - CLICK_RATE_LIMIT_WINDOW);

  // Check if user clicked the same ad recently
  const recentClick = await prisma.activityLog.findFirst({
    where: {
      userId: parseInt(userId),
      activityType: 'ptc',
      createdAt: {
        gte: timeAgo,
      },
      metadata: {
        path: ['adId'],
        equals: adId,
      },
    },
  });

  if (recentClick) {
    return {
      canClick: false,
      reason: 'Rate limit: You clicked this ad too recently',
    };
  }

  // Check total clicks in time window
  const recentClicksCount = await prisma.activityLog.count({
    where: {
      userId: parseInt(userId),
      activityType: 'ptc',
      createdAt: {
        gte: timeAgo,
      },
    },
  });

  // Limit to 5 clicks per user per 30 seconds
  if (recentClicksCount >= 5) {
    return {
      canClick: false,
      reason: 'Rate limit: Too many clicks in a short time',
    };
  }

  return { canClick: true };
};

// Process PTC click
export const processPtcClick = async (userId, adId) => {
  const { canClick, reason } = await canClickAd(userId, adId);

  if (!canClick) {
    throw new Error(reason);
  }

  // Get the ad to verify it's still active and hasn't exceeded max views
  const ad = await prisma.ad.findUnique({
    where: { id: parseInt(adId) },
  });

  if (!ad || !ad.isActive || ad.views >= ad.maxViews) {
    throw new Error('Ad is no longer available');
  }

  // Apply level multiplier to the reward
  const multiplierResult = await applyLevelMultiplier(userId, ad.reward);
  const rewardWithMultiplier = multiplierResult.finalReward;

  // Update ad stats
  await prisma.ad.update({
    where: { id: parseInt(adId) },
    data: {
      views: { increment: 1 },
      clicks: { increment: 1 },
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
        activityType: 'ptc',
        amountTokens: rewardWithMultiplier,
        metadata: {
          adId: parseInt(adId),
          adTitle: ad.title,
          baseReward: ad.reward,
          reward: rewardWithMultiplier,
          multiplier: multiplierResult.multiplier,
          level: multiplierResult.level,
        },
      },
    });

    return user;
  });

  return {
    baseReward: ad.reward,
    reward: rewardWithMultiplier,
    multiplier: multiplierResult.multiplier,
    level: multiplierResult.level,
    newBalance: updatedUser.tokenBalance,
  };
};

// Get PTC configuration
export const getPtcConfig = () => {
  return {
    rewardPerClick: CLICK_REWARD,
    rateLimitWindow: CLICK_RATE_LIMIT_WINDOW,
    maxClicksPerWindow: 5,
    description: 'Earn tokens by viewing and clicking on ads',
  };
};
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Offerwall providers configuration
export const OFFERWALL_PROVIDERS = {
  adscendMedia: {
    name: 'Adscend Media',
    enabled: true,
    reward: 0.01, // 0.01 tokens per completed offer
    description: 'Complete offers from Adscend Media network'
  },
  cpalead: {
    name: 'CPALead',
    enabled: true,
    reward: 0.015, // 0.015 tokens per completed offer
    description: 'Complete offers from CPALead network'
  },
  superrewards: {
    name: 'SuperRewards',
    enabled: true,
    reward: 0.02, // 0.02 tokens per completed offer
    description: 'Complete offers from SuperRewards network'
  }
};

// Get available offerwalls
export const getAvailableOfferwalls = async () => {
  const activeProviders = Object.keys(OFFERWALL_PROVIDERS).filter(
    key => OFFERWALL_PROVIDERS[key].enabled
  );

  return activeProviders.map(key => ({
    id: key,
    name: OFFERWALL_PROVIDERS[key].name,
    reward: OFFERWALL_PROVIDERS[key].reward,
    description: OFFERWALL_PROVIDERS[key].description
  }));
};

// Process completed offer
export const processCompletedOffer = async (userId, providerId, offerId, payoutAmount) => {
  if (!OFFERWALL_PROVIDERS[providerId]) {
    throw new Error(`Unknown offerwall provider: ${providerId}`);
  }

  // Validate provider is enabled
  if (!OFFERWALL_PROVIDERS[providerId].enabled) {
    throw new Error(`Offerwall provider ${providerId} is not enabled`);
  }

  // Use the configured reward amount unless a specific payout is provided
  const rewardAmount = payoutAmount || OFFERWALL_PROVIDERS[providerId].reward;

  // Update user's token balance
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update user's token balance
    const user = await tx.user.update({
      where: { id: parseInt(userId) },
      data: {
        tokenBalance: { increment: rewardAmount },
      },
    });

    // Create activity log entry
    await tx.activityLog.create({
      data: {
        userId: parseInt(userId),
        activityType: 'offerwall',
        amountTokens: rewardAmount,
        metadata: {
          provider: providerId,
          offerId: offerId,
          reward: rewardAmount,
        },
      },
    });

    return user;
  });

  return {
    reward: rewardAmount,
    newBalance: updatedUser.tokenBalance,
  };
};

// Get user's offerwall history
export const getUserOfferwallHistory = async (userId) => {
  const history = await prisma.activityLog.findMany({
    where: {
      userId: parseInt(userId),
      activityType: 'offerwall',
    },
    orderBy: { createdAt: 'desc' },
    take: 20, // Last 20 offer completions
  });

  return history.map(log => ({
    id: log.id,
    provider: log.metadata.provider,
    offerId: log.metadata.offerId,
    reward: log.amountTokens,
    date: log.createdAt,
  }));
};

// Validate offerwall webhook callback
export const validateOfferwallCallback = async (providerId, payload) => {
  // In a real implementation, this would validate the callback signature
  // from the offerwall provider to prevent fraud
  try {
    // Basic validation
    if (!providerId || !payload) {
      return { valid: false, error: 'Missing provider or payload' };
    }

    // Provider-specific validation would go here
    switch (providerId) {
      case 'adscendMedia':
        // Validate Adscend Media callback
        // This is a simplified example - real validation would involve
        // verifying the signature with the provider's public key
        if (!payload.uid || !payload.oid || !payload.payout) {
          return { valid: false, error: 'Missing required fields for Adscend Media' };
        }
        break;
      case 'cpalead':
        // Validate CPALead callback
        if (!payload.click_transaction_id || !payload.payout) {
          return { valid: false, error: 'Missing required fields for CPALead' };
        }
        break;
      case 'superrewards':
        // Validate SuperRewards callback
        if (!payload.userid || !payload.offerid || !payload.payout) {
          return { valid: false, error: 'Missing required fields for SuperRewards' };
        }
        break;
      default:
        return { valid: false, error: `Unknown provider: ${providerId}` };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Get offerwall configuration
export const getOfferwallConfig = () => {
  return {
    providers: OFFERWALL_PROVIDERS,
    description: 'Complete offers from partner networks to earn tokens',
  };
};
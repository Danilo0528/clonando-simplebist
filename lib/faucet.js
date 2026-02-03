import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Time interval for faucet claims (in milliseconds) - currently set to 1 hour
const FAUCET_INTERVAL = 60 * 60 * 1000; // 1 hour

// Get last faucet claim time for user
export const getLastFaucetClaim = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      lastFaucetClaim: true,
    },
  });

  return user?.lastFaucetClaim;
};

// Check if user can claim faucet
export const canClaimFaucet = async (userId) => {
  const lastClaim = await getLastFaucetClaim(userId);
  
  if (!lastClaim) {
    // User never claimed before, allow claim
    return { canClaim: true, timeRemaining: 0 };
  }

  const now = new Date();
  const timeSinceLastClaim = now - lastClaim;
  
  if (timeSinceLastClaim >= FAUCET_INTERVAL) {
    // Enough time has passed, allow claim
    return { canClaim: true, timeRemaining: 0 };
  } else {
    // Not enough time has passed
    const timeRemaining = FAUCET_INTERVAL - timeSinceLastClaim;
    return { canClaim: false, timeRemaining };
  }
};

// Claim faucet reward
export const claimFaucet = async (userId) => {
  const { canClaim } = await canClaimFaucet(userId);
  
  if (!canClaim) {
    throw new Error('Cannot claim faucet yet');
  }

  // Faucet reward amount (this can be configurable)
  const rewardAmount = 0.01; // 0.01 tokens
  
  // Update user's token balance and last faucet claim time
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update user's token balance and last faucet claim time
    const user = await tx.user.update({
      where: { id: parseInt(userId) },
      data: {
        tokenBalance: { increment: rewardAmount },
        lastFaucetClaim: new Date(),
      },
    });

    // Create activity log entry
    await tx.activityLog.create({
      data: {
        userId: parseInt(userId),
        activityType: 'faucet',
        amountTokens: rewardAmount,
        metadata: {
          type: 'faucet_claim',
          rewardAmount: rewardAmount,
        },
      },
    });

    return user;
  });

  return {
    rewardAmount,
    newBalance: updatedUser.tokenBalance,
    lastFaucetClaim: updatedUser.lastFaucetClaim,
  };
};

// Get faucet configuration
export const getFaucetConfig = () => {
  return {
    interval: FAUCET_INTERVAL,
    rewardAmount: 0.01,
    description: 'Claim free tokens every hour',
  };
};
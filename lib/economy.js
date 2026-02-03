import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user balances
export const getUserBalances = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      tokenBalance: true,
      boundTokenBalance: true,
      level: true,
      xp: true,
      energyPoints: true,
      hashpowerVirtual: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

// Update user token balance
export const updateUserTokenBalance = async (userId, amount, type = 'credit') => {
  const user = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      tokenBalance: {
        increment: type === 'credit' ? amount : -amount,
      },
    },
  });

  return user;
};

// Update user bound token balance
export const updateUserBoundTokenBalance = async (userId, amount, type = 'credit') => {
  const user = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      boundTokenBalance: {
        increment: type === 'credit' ? amount : -amount,
      },
    },
  });

  return user;
};

// Convert tokens (internal to bound or vice versa)
export const convertTokens = async (userId, amount, fromType, toType) => {
  if (fromType === toType) {
    throw new Error('Cannot convert tokens to the same type');
  }

  if (fromType === 'internal' && toType === 'bound') {
    // Convert internal tokens to bound tokens
    const user = await prisma.$transaction(async (tx) => {
      // Check if user has enough internal tokens
      const currentUser = await tx.user.findUnique({
        where: { id: parseInt(userId) },
        select: { tokenBalance: true }
      });

      if (currentUser.tokenBalance < amount) {
        throw new Error('Insufficient internal tokens');
      }

      // Update both balances
      const updatedUser = await tx.user.update({
        where: { id: parseInt(userId) },
        data: {
          tokenBalance: { decrement: amount },
          boundTokenBalance: { increment: amount },
        },
      });

      // Create activity log entry
      await tx.activityLog.create({
        data: {
          userId: parseInt(userId),
          activityType: 'token_conversion',
          amountTokens: -amount,
          amountBoundTokens: amount,
          metadata: {
            conversionType: 'internal_to_bound',
            amount: amount,
          },
        },
      });

      return updatedUser;
    });

    return user;
  } else if (fromType === 'bound' && toType === 'internal') {
    // Convert bound tokens to internal tokens
    const user = await prisma.$transaction(async (tx) => {
      // Check if user has enough bound tokens
      const currentUser = await tx.user.findUnique({
        where: { id: parseInt(userId) },
        select: { boundTokenBalance: true }
      });

      if (currentUser.boundTokenBalance < amount) {
        throw new Error('Insufficient bound tokens');
      }

      // Update both balances
      const updatedUser = await tx.user.update({
        where: { id: parseInt(userId) },
        data: {
          boundTokenBalance: { decrement: amount },
          tokenBalance: { increment: amount },
        },
      });

      // Create activity log entry
      await tx.activityLog.create({
        data: {
          userId: parseInt(userId),
          activityType: 'token_conversion',
          amountTokens: amount,
          amountBoundTokens: -amount,
          metadata: {
            conversionType: 'bound_to_internal',
            amount: amount,
          },
        },
      });

      return updatedUser;
    });

    return user;
  } else {
    throw new Error('Invalid conversion types');
  }
};

// Get economy configuration
export const getEconomyConfig = () => {
  return {
    conversionRate: 1, // 1:1 ratio for internal to bound tokens
    minConversionAmount: 0.01, // Minimum amount for conversion
    description: 'Convert internal tokens to bound tokens for withdrawals',
  };
};

// Get economy statistics
export const getEconomyStats = async () => {
  // Get total tokens in circulation
  const totalTokens = await prisma.user.aggregate({
    _sum: {
      tokenBalance: true,
    },
  });

  // Get total bound tokens
  const totalBoundTokens = await prisma.user.aggregate({
    _sum: {
      boundTokenBalance: true,
    },
  });

  // Get total users
  const totalUsers = await prisma.user.count();

  return {
    totalTokens: totalTokens._sum.tokenBalance || 0,
    totalBoundTokens: totalBoundTokens._sum.boundTokenBalance || 0,
    totalUsers,
    totalEconomy: (totalTokens._sum.tokenBalance || 0) + (totalBoundTokens._sum.boundTokenBalance || 0),
  };
};
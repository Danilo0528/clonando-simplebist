import prisma from './prisma.mjs';

// Configuration for withdrawals
export const WITHDRAWAL_CONFIG = {
  MIN_WITHDRAWAL_AMOUNT: 0.1, // Minimum withdrawal amount
  MAX_WITHDRAWAL_PER_DAY: 100, // Maximum withdrawal per day
  WITHDRAWAL_FEE_PERCENTAGE: 0.02, // 2% fee
  PROCESSING_TIME_HOURS: 24, // Processing time in hours
  DAILY_WITHDRAWAL_LIMIT: 3 // Maximum withdrawals per day
};

// Request a withdrawal
export const requestWithdrawal = async (userId, amount, walletAddress, cryptoCurrency = 'BTC') => {
  try {
    // Validate withdrawal amount
    if (amount < WITHDRAWAL_CONFIG.MIN_WITHDRAWAL_AMOUNT) {
      throw new Error(`Minimum withdrawal amount is ${WITHDRAWAL_CONFIG.MIN_WITHDRAWAL_AMOUNT}`);
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        balance: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      throw new Error('Insufficient balance for withdrawal');
    }

    // Calculate fees
    const fee = amount * WITHDRAWAL_CONFIG.WITHDRAWAL_FEE_PERCENTAGE;
    const netAmount = amount - fee;

    // Use transaction to ensure balance update and withdrawal record creation are atomic
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update user's balance
      const updatedUser = await tx.user.update({
        where: { id: parseInt(userId) },
        data: {
          balance: { decrement: amount }
        }
      });

      // 2. Create withdrawal record
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: parseInt(userId),
          amount: amount,
          cryptoCurrency: cryptoCurrency,
          address: walletAddress,
          fee: fee,
          netAmount: netAmount,
          status: 'pending'
        }
      });

      return { updatedUser, withdrawal };
    });

    return {
      success: true,
      message: `Withdrawal of ${netAmount} tokens requested successfully (fee: ${fee})`,
      requestedAmount: amount,
      fee: fee,
      netAmount: netAmount,
      processingTime: `${WITHDRAWAL_CONFIG.PROCESSING_TIME_HOURS} hours`,
      newUserBalance: result.updatedUser.balance,
      withdrawalId: result.withdrawal.id
    };
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    throw error;
  }
};

// Get withdrawal history for a user
export const getUserWithdrawalHistory = async (userId) => {
  try {
    // Fetch real history from Withdrawal table
    const history = await prisma.withdrawal.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });

    return history;
  } catch (error) {
    console.error('Error getting withdrawal history:', error);
    throw error;
  }
};

// Get withdrawal statistics for a user
export const getWithdrawalStats = async (userId) => {
  try {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        balance: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get aggregated stats
    const history = await getUserWithdrawalHistory(userId);
    const totalWithdrawn = history
        .filter(w => w.status === 'completed')
        .reduce((sum, w) => sum + w.amount, 0);
    const pendingWithdrawals = history.filter(w => w.status === 'pending').length;

    const stats = {
      availableBalance: user.balance,
      minWithdrawal: WITHDRAWAL_CONFIG.MIN_WITHDRAWAL_AMOUNT,
      maxWithdrawal: Math.min(user.balance, WITHDRAWAL_CONFIG.MAX_WITHDRAWAL_PER_DAY),
      dailyLimit: WITHDRAWAL_CONFIG.DAILY_WITHDRAWAL_LIMIT,
      feePercentage: WITHDRAWAL_CONFIG.WITHDRAWAL_FEE_PERCENTAGE * 100, // As percentage
      nextProcessingTime: WITHDRAWAL_CONFIG.PROCESSING_TIME_HOURS,
      totalWithdrawn: totalWithdrawn,
      completedWithdrawals: history.filter(w => w.status === 'completed').length,
      pendingWithdrawals: pendingWithdrawals
    };

    return stats;
  } catch (error) {
    console.error('Error getting withdrawal stats:', error);
    throw error;
  }
};

// Cancel a pending withdrawal
export const cancelWithdrawal = async (userId, withdrawalId) => {
  try {
    // Check if withdrawal exists and belongs to user
    const withdrawal = await prisma.withdrawal.findFirst({
        where: { id: parseInt(withdrawalId), userId: parseInt(userId) }
    });

    if (!withdrawal) {
        throw new Error('Withdrawal not found or unauthorized');
    }

    if (withdrawal.status !== 'pending') {
        throw new Error('Only pending withdrawals can be cancelled');
    }

    // Transaction: return balance and set status to rejected
    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: parseInt(userId) },
            data: { balance: { increment: withdrawal.amount } }
        });

        await tx.withdrawal.update({
            where: { id: parseInt(withdrawalId) },
            data: { status: 'rejected' } // Using 'rejected' as status for cancelled
        });
    });

    return {
      success: true,
      message: 'Withdrawal cancelled and balance returned',
      withdrawalId: withdrawalId,
      userId: userId
    };
  } catch (error) {
    console.error('Error cancelling withdrawal:', error);
    throw error;
  }
};
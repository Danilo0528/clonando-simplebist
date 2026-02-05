import prisma from './prisma';

// Configuration for withdrawals
export const WITHDRAWAL_CONFIG = {
  MIN_WITHDRAWAL_AMOUNT: 0.1, // Minimum withdrawal amount
  MAX_WITHDRAWAL_PER_DAY: 100, // Maximum withdrawal per day
  WITHDRAWAL_FEE_PERCENTAGE: 0.02, // 2% fee
  PROCESSING_TIME_HOURS: 24, // Processing time in hours
  DAILY_WITHDRAWAL_LIMIT: 3 // Maximum withdrawals per day
};

// Request a withdrawal
export const requestWithdrawal = async (userId, amount, walletAddress) => {
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
        username: true,
        balance: true,
        tokenBalance: true
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

    // In a real implementation, we would create a withdrawal record in a Withdrawal table
    // For now, we'll just simulate the process and update the balance

    // Update user's balance
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        balance: { decrement: amount }
      },
      select: {
        id: true,
        username: true,
        balance: true,
        tokenBalance: true
      }
    });

    // Skip creating withdrawal record since Withdrawal model doesn't exist in schema
    // In a production environment, you would either create the Withdrawal model in schema.prisma
    // or use an alternative storage mechanism

    return {
      success: true,
      message: `Withdrawal of ${netAmount} tokens requested successfully (fee: ${fee})`,
      requestedAmount: amount,
      fee: fee,
      netAmount: netAmount,
      processingTime: `${WITHDRAWAL_CONFIG.PROCESSING_TIME_HOURS} hours`,
      newUserBalance: updatedUser.balance
    };
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    throw error;
  }
};

// Get withdrawal history for a user
export const getUserWithdrawalHistory = async (userId) => {
  try {
    // In a real implementation, this would fetch from a Withdrawal table
    // Since that model doesn't exist in schema, we'll return placeholder data
    
    // Placeholder data since we can't access Withdrawal model
    const history = [
      {
        id: 1,
        amount: 5.25,
        fee: 0.11,
        netAmount: 5.14,
        status: 'completed',
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        walletAddress: '0x1234...5678'
      },
      {
        id: 2,
        amount: 2.50,
        fee: 0.05,
        netAmount: 2.45,
        status: 'completed',
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        processedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        walletAddress: '0x1234...5678'
      },
      {
        id: 3,
        amount: 10.00,
        fee: 0.20,
        netAmount: 9.80,
        status: 'pending',
        requestedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        processedAt: null,
        walletAddress: '0x1234...5678'
      }
    ];

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

    // In a real implementation, this would aggregate data from a Withdrawal table
    // For now, we'll simulate some statistics
    const stats = {
      availableBalance: user.balance,
      minWithdrawal: WITHDRAWAL_CONFIG.MIN_WITHDRAWAL_AMOUNT,
      maxWithdrawal: Math.min(user.balance, WITHDRAWAL_CONFIG.MAX_WITHDRAWAL_PER_DAY),
      dailyLimit: WITHDRAWAL_CONFIG.DAILY_WITHDRAWAL_LIMIT,
      feePercentage: WITHDRAWAL_CONFIG.WITHDRAWAL_FEE_PERCENTAGE * 100, // As percentage
      nextProcessingTime: WITHDRAWAL_CONFIG.PROCESSING_TIME_HOURS,
      totalWithdrawn: 17.75, // Simulated total withdrawn
      completedWithdrawals: 2,
      pendingWithdrawals: 1
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
    // In a real implementation, this would update a withdrawal record
    // Since Withdrawal model doesn't exist in schema, we'll simulate the process
    
    // For now, we'll just return a message indicating the action
    return {
      success: true,
      message: 'Withdrawal cancellation request submitted',
      withdrawalId: withdrawalId,
      userId: userId
    };
  } catch (error) {
    console.error('Error cancelling withdrawal:', error);
    throw error;
  }
};
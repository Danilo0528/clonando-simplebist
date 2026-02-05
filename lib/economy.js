import prisma from './prisma';

// Function to update user balance
export const updateUserBalance = async (userId, amount, type = 'credit') => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        balance: type === 'credit' 
          ? { increment: amount } 
          : { decrement: amount },
      },
      select: {
        id: true,
        username: true,
        balance: true,
        tokenBalance: true
      }
    });

    return user;
  } catch (error) {
    console.error('Error updating user balance:', error);
    throw error;
  }
};

// Function to transfer tokens between users
export const transferTokens = async (fromUserId, toUserId, amount) => {
  try {
    // Verify sender has sufficient balance
    const sender = await prisma.user.findUnique({
      where: { id: parseInt(fromUserId) },
      select: { balance: true }
    });

    if (!sender || sender.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Perform transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from sender
      const updatedSender = await tx.user.update({
        where: { id: parseInt(fromUserId) },
        data: { balance: { decrement: amount } },
        select: {
          id: true,
          username: true,
          balance: true
        }
      });

      // Credit to receiver
      const updatedReceiver = await tx.user.update({
        where: { id: parseInt(toUserId) },
        data: { balance: { increment: amount } },
        select: {
          id: true,
          username: true,
          balance: true
        }
      });

      return { sender: updatedSender, receiver: updatedReceiver };
    });

    return result;
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
};

// Function to get leaderboard
export const getLeaderboard = async (limit = 10) => {
  try {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: {
        balance: 'desc'
      },
      select: {
        id: true,
        username: true,
        balance: true,
        level: true
      }
    });

    return users;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

// Function to award tokens for activities
export const awardTokens = async (userId, amount, activityType) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        balance: { increment: amount },
        tokenBalance: { increment: amount }
      },
      select: {
        id: true,
        username: true,
        balance: true,
        tokenBalance: true,
        level: true
      }
    });

    // Skip activity log since ActivityLog model doesn't exist in schema
    // In a production environment, you would either create the ActivityLog model in schema.prisma
    // or use an alternative logging mechanism

    return user;
  } catch (error) {
    console.error('Error awarding tokens:', error);
    throw error;
  }
};
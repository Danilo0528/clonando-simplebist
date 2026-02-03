import { PrismaClient } from '@prisma/client';
import { blockchainConnector } from './blockchain';

const prisma = new PrismaClient();

// Supported cryptocurrencies
export const SUPPORTED_CRYPTOS = ['BTC', 'LTC', 'DOGE', 'ADA', 'BCH', 'DASH'];

// Minimum withdrawal amounts for each cryptocurrency
export const MIN_WITH_DRAWAL_AMOUNTS = {
  'BTC': 0.001,
  'LTC': 0.01,
  'DOGE': 10,
  'ADA': 1,
  'BCH': 0.001,
  'DASH': 0.01,
};

// Fee structure for withdrawals (percentage)
export const WITHDRAWAL_FEES = {  // 2% fee
  'BTC': 0.02,
  'LTC': 0.02,
  'DOGE': 0.02,
  'ADA': 0.02,
  'BCH': 0.02,
  'DASH': 0.02,
};

// Validate cryptocurrency
export const validateCrypto = (crypto) => {
  return SUPPORTED_CRYPTOS.includes(crypto.toUpperCase());
};

// Validate withdrawal address
export const validateAddress = (address, crypto) => {
  // Use the blockchain connector for validation
  return blockchainConnector.validateAddress(address, crypto);
};

// Calculate withdrawal fee
export const calculateFee = (amount, crypto) => {
  const feeRate = WITHDRAWAL_FEES[crypto.toUpperCase()] || 0.02;
  return amount * feeRate;
};

// Calculate net amount (after fees)
export const calculateNetAmount = (grossAmount, crypto) => {
  const fee = calculateFee(grossAmount, crypto);
  return grossAmount - fee;
};

// Create a new withdrawal request
export const createWithdrawal = async (userId, amount, crypto, address) => {
  // Validate inputs
  if (!validateCrypto(crypto)) {
    throw new Error(`Unsupported cryptocurrency: ${crypto}. Supported: ${SUPPORTED_CRYPTOS.join(', ')}`);
  }

  if (!validateAddress(address, crypto)) {
    throw new Error(`Invalid ${crypto} address: ${address}`);
  }

  const minAmount = MIN_WITH_DRAWAL_AMOUNTS[crypto.toUpperCase()];
  if (amount < minAmount) {
    throw new Error(`Minimum withdrawal amount for ${crypto} is ${minAmount}`);
  }

  // Get user's bound token balance
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      boundTokenBalance: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Calculate fee and net amount
  const fee = calculateFee(amount, crypto);
  const netAmount = calculateNetAmount(amount, crypto);
  
  // Check if user has enough bound tokens
  if (user.boundTokenBalance < amount) {
    throw new Error(`Insufficient bound token balance. Required: ${amount}, Available: ${user.boundTokenBalance}`);
  }

  // Create withdrawal request
  const withdrawal = await prisma.$transaction(async (tx) => {
    // Deduct bound tokens from user
    await tx.user.update({
      where: { id: parseInt(userId) },
      data: {
        boundTokenBalance: { decrement: amount },
      },
    });

    // Create withdrawal record
    const withdrawalRecord = await tx.withdrawal.create({
      data: {
        userId: parseInt(userId),
        amount: amount,
        cryptoCurrency: crypto.toUpperCase(),
        address: address,
        status: 'pending',
      },
    });

    // Create activity log entry
    await tx.activityLog.create({
      data: {
        userId: parseInt(userId),
        activityType: 'withdrawal_request',
        amountBoundTokens: -amount, // Negative because it's a deduction
        metadata: {
          withdrawalId: withdrawalRecord.id,
          crypto: crypto.toUpperCase(),
          address: address,
          fee: fee,
          netAmount: netAmount,
        },
      },
    });

    return withdrawalRecord;
  });

  return {
    withdrawal,
    fee,
    netAmount,
  };
};

// Process withdrawal using blockchain connector
export const processWithdrawal = async (withdrawalId, processorId) => {
  // Get withdrawal details
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: parseInt(withdrawalId) },
  });

  if (!withdrawal) {
    throw new Error('Withdrawal not found');
  }

  try {
    // Process the withdrawal via blockchain connector
    const result = await blockchainConnector.processWithdrawalRequest(
      withdrawal.id,
      withdrawal.userId,
      withdrawal.amount,
      withdrawal.cryptoCurrency,
      withdrawal.address
    );

    // Update withdrawal record with transaction details
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id: parseInt(withdrawalId) },
      data: {
        status: 'processing',
        transactionHash: result.transaction.id,
        processedAt: new Date(),
      },
    });

    return updatedWithdrawal;
  } catch (error) {
    // If processing fails, update status to failed
    await prisma.withdrawal.update({
      where: { id: parseInt(withdrawalId) },
      data: {
        status: 'failed',
        processedAt: new Date(),
      },
    });

    throw error;
  }
};

// Complete withdrawal
export const completeWithdrawal = async (withdrawalId, transactionHash) => {
  const withdrawal = await prisma.withdrawal.update({
    where: { id: parseInt(withdrawalId) },
    data: {
      status: 'completed',
      transactionHash: transactionHash,
    },
  });

  return withdrawal;
};

// Cancel withdrawal
export const cancelWithdrawal = async (withdrawalId, reason = 'Cancelled') => {
  // Get the withdrawal to access the amount and user ID
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: parseInt(withdrawalId) },
    select: {
      userId: true,
      amount: true,
      status: true,
    },
  });

  if (!withdrawal) {
    throw new Error('Withdrawal not found');
  }

  if (withdrawal.status !== 'pending') {
    throw new Error('Cannot cancel withdrawal that is not pending');
  }

  // Roll back the transaction by refunding the bound tokens
  await prisma.$transaction(async (tx) => {
    // Refund bound tokens to user
    await tx.user.update({
      where: { id: withdrawal.userId },
      data: {
        boundTokenBalance: { increment: withdrawal.amount },
      },
    });

    // Update withdrawal status
    await tx.withdrawal.update({
      where: { id: parseInt(withdrawalId) },
      data: {
        status: 'failed',
      },
    });

    // Create activity log entry
    await tx.activityLog.create({
      data: {
        userId: withdrawal.userId,
        activityType: 'withdrawal_cancelled',
        amountBoundTokens: withdrawal.amount, // Positive because it's a refund
        metadata: {
          withdrawalId: parseInt(withdrawalId),
          reason: reason,
        },
      },
    });
  });

  return { message: 'Withdrawal cancelled and funds refunded' };
};

// Get user's withdrawal history
export const getUserWithdrawalHistory = async (userId, limit = 10, offset = 0) => {
  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  return withdrawals;
};

// Get withdrawal configuration
export const getWithdrawalConfig = () => {
  return {
    supportedCryptos: SUPPORTED_CRYPTOS,
    minAmounts: MIN_WITH_DRAWAL_AMOUNTS,
    fees: WITHDRAWAL_FEES,
    description: 'Withdraw bound tokens as cryptocurrency',
  };
};
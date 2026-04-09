import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

const WITHDRAWAL_FEE = 0.02; // 2% fee
const MIN_WITHDRAWAL_AMOUNTS = {
  BTC: 0.001,
  ETH: 0.01,
  LTC: 0.1,
  DOGE: 100,
  USDT: 10,
};

const SUPPORTED_CRYPTOS = Object.keys(MIN_WITHDRAWAL_AMOUNTS);

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    const mockReq = {
      headers: {
        authorization: authHeader,
        cookie: cookieHeader,
      },
    };

    const user = await getUserFromRequest(mockReq);

    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Get withdrawal history from database
    // For now, we'll use a simple approach - in production, you'd have a Withdrawal model
    const withdrawalHistory = []; // TODO: Implement withdrawal model

    return NextResponse.json({
      history: withdrawalHistory,
      config: {
        supportedCryptos: SUPPORTED_CRYPTOS,
        minAmounts: MIN_WITHDRAWAL_AMOUNTS,
        fees: {
          BTC: WITHDRAWAL_FEE,
          ETH: WITHDRAWAL_FEE,
          LTC: WITHDRAWAL_FEE,
          DOGE: WITHDRAWAL_FEE,
          USDT: WITHDRAWAL_FEE,
        },
      },
    });
  } catch (error) {
    console.error('Error in withdrawal GET route:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    const mockReq = {
      headers: {
        authorization: authHeader,
        cookie: cookieHeader,
      },
    };

    const user = await getUserFromRequest(mockReq);

    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, crypto, address } = body;

    // Validate inputs
    if (!amount || !crypto || !address) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return NextResponse.json(
        { message: 'Invalid withdrawal amount' },
        { status: 400 }
      );
    }

    if (!SUPPORTED_CRYPTOS.includes(crypto)) {
      return NextResponse.json(
        { message: 'Unsupported cryptocurrency' },
        { status: 400 }
      );
    }

    // Check minimum withdrawal amount
    const minAmount = MIN_WITHDRAWAL_AMOUNTS[crypto];
    if (withdrawalAmount < minAmount) {
      return NextResponse.json(
        { message: `Minimum withdrawal amount for ${crypto} is ${minAmount}` },
        { status: 400 }
      );
    }

    // Get user from database
    const fullUser = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
    });

    if (!fullUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has enough bound token balance
    if (fullUser.boundTokenBalance < withdrawalAmount) {
      return NextResponse.json(
        { message: 'Insufficient bound token balance' },
        { status: 400 }
      );
    }

    // Calculate fee
    const fee = withdrawalAmount * WITHDRAWAL_FEE;
    const netAmount = withdrawalAmount - fee;

    // Update user balance - deduct withdrawal amount
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(user.id) },
      data: {
        boundTokenBalance: fullUser.boundTokenBalance - withdrawalAmount,
      },
    });

    // TODO: Save withdrawal to database when model is created
    // For now, we'll just return success response

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request created successfully',
      withdrawal: {
        amount: withdrawalAmount,
        crypto: crypto,
        address: address,
        fee: fee,
        netAmount: netAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      newBalance: {
        boundTokenBalance: updatedUser.boundTokenBalance,
      },
    });
  } catch (error) {
    console.error('Error in withdrawal POST route:', error);
    return NextResponse.json(
      { message: 'Failed to process withdrawal request' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma.mjs';
import { getUserFromRequest } from '../../../../lib/auth';
import { 
  getUserWithdrawalHistory, 
  requestWithdrawal, 
  WITHDRAWAL_CONFIG 
} from '../../../../lib/withdrawal';

const SUPPORTED_CRYPTOS = ['BTC', 'ETH', 'LTC', 'DOGE', 'USDT'];
const MIN_WITHDRAWAL_AMOUNTS = {
  BTC: 0.001,
  ETH: 0.01,
  LTC: 0.1,
  DOGE: 100,
  USDT: 10,
};

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

    // Get real withdrawal history from database using refactored lib
    const withdrawalHistory = await getUserWithdrawalHistory(user.id);

    return NextResponse.json({
      history: withdrawalHistory,
      config: {
        supportedCryptos: SUPPORTED_CRYPTOS,
        minAmounts: MIN_WITHDRAWAL_AMOUNTS,
        fees: {
          BTC: WITHDRAWAL_CONFIG.WITHDRAWAL_FEE_PERCENTAGE,
          ETH: WITHDRAWAL_CONFIG.WITHDRAWAL_FEE_PERCENTAGE,
          LTC: WITHDRAWAL_CONFIG.WITHDRAWAL_FEE_PERCENTAGE,
          DOGE: WITHDRAWAL_CONFIG.WITHDRAWAL_FEE_PERCENTAGE,
          USDT: WITHDRAWAL_CONFIG.WITHDRAWAL_FEE_PERCENTAGE,
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

    // Call refactored service function
    const result = await requestWithdrawal(user.id, amount, address, crypto);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in withdrawal POST route:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to process withdrawal request' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

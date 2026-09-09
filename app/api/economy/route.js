import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma.mjs';
import { convertToBound } from '../../../lib/economy';

// GET - Fetch economy stats
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tokenBalance: true,
        boundTokenBalance: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      balances: {
        token: user.tokenBalance,
        bound: user.boundTokenBalance,
      }
    });
  } catch (error) {
    console.error('Economy GET error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to fetch economy data',
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Exchange: Tokens → Bound (1:1, un solo sentido)
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const body = await request.json();
    const { from, to, amount } = body;

    // Exchange es de un solo sentido: Tokens → Bound
    if (from !== 'token' || to !== 'bound') {
      return NextResponse.json(
        { message: 'Exchange is one-way: tokens → bound (1:1)' },
        { status: 400 }
      );
    }

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }

    const amountFloat = parseFloat(amount);

    // Conversión atómica con helper centralizado
    await convertToBound(userId, amountFloat);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tokenBalance: true,
        boundTokenBalance: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully converted ${amountFloat} tokens to bound`,
      newBalances: {
        token: user.tokenBalance,
        bound: user.boundTokenBalance,
      }
    });
  } catch (error) {
    console.error('Economy POST error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    if (error.message.startsWith('Insufficient')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to process transfer',
      error: error.message 
    }, { status: 500 });
  }
}

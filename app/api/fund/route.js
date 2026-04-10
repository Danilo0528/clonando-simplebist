import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

// GET - Fetch user's deposit addresses and balance info
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        balance: true,
        tokenBalance: true,
        boundTokenBalance: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate a deterministic but unique deposit address for the user
    // In production, you'd integrate with a real payment processor
    const depositAddress = `0x${user.username.toLowerCase().padEnd(40, '0').substring(0, 40)}`;

    return NextResponse.json({
      depositAddress,
      balances: {
        main: user.balance,
        token: user.tokenBalance,
        bound: user.boundTokenBalance,
      }
    });
  } catch (error) {
    console.error('Fund GET error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to fetch deposit info',
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Simulate a deposit (for testing/demo purposes)
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const body = await request.json();
    const { amount, type } = body; // type: 'main', 'token', or 'bound'

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }

    const amountFloat = parseFloat(amount);
    let updateData = {};

    if (type === 'main') {
      updateData.balance = { increment: amountFloat };
    } else if (type === 'token') {
      updateData.tokenBalance = { increment: amountFloat };
    } else if (type === 'bound') {
      updateData.boundTokenBalance = { increment: amountFloat };
    } else {
      return NextResponse.json({ message: 'Invalid balance type' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        username: true,
        balance: true,
        tokenBalance: true,
        boundTokenBalance: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deposited ${amountFloat} to ${type} balance`,
      newBalances: {
        main: updatedUser.balance,
        token: updatedUser.tokenBalance,
        bound: updatedUser.boundTokenBalance,
      }
    });
  } catch (error) {
    console.error('Fund POST error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to process deposit',
      error: error.message 
    }, { status: 500 });
  }
}

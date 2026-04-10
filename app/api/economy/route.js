import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

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
      where: { id: parseInt(userId) },
      select: {
        id: true,
        balance: true,
        tokenBalance: true,
        boundTokenBalance: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      balances: {
        main: user.balance,
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

// POST - Transfer between balances
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

    if (!from || !to || !amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ message: 'Invalid transfer parameters' }, { status: 400 });
    }

    if (from === to) {
      return NextResponse.json({ message: 'Source and destination must be different' }, { status: 400 });
    }

    const amountFloat = parseFloat(amount);

    // Get user to check balance
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        balance: true,
        tokenBalance: true,
        boundTokenBalance: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check sufficient balance
    let currentBalance;
    if (from === 'main') {
      currentBalance = user.balance;
    } else if (from === 'token') {
      currentBalance = user.tokenBalance;
    } else if (from === 'bound') {
      currentBalance = user.boundTokenBalance;
    } else {
      return NextResponse.json({ message: 'Invalid source balance type' }, { status: 400 });
    }

    if (amountFloat > currentBalance) {
      return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
    }

    // Perform transfer using Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from source
      const deductData = {};
      if (from === 'main') {
        deductData.balance = { decrement: amountFloat };
      } else if (from === 'token') {
        deductData.tokenBalance = { decrement: amountFloat };
      } else if (from === 'bound') {
        deductData.boundTokenBalance = { decrement: amountFloat };
      }

      // Add to destination
      const addData = {};
      if (to === 'main') {
        addData.balance = { increment: amountFloat };
      } else if (to === 'token') {
        addData.tokenBalance = { increment: amountFloat };
      } else if (to === 'bound') {
        addData.boundTokenBalance = { increment: amountFloat };
      }

      // Update user with both operations
      const updatedUser = await tx.user.update({
        where: { id: parseInt(userId) },
        data: {
          ...deductData,
          ...addData,
        },
        select: {
          id: true,
          balance: true,
          tokenBalance: true,
          boundTokenBalance: true,
        }
      });

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${amountFloat} from ${from} to ${to}`,
      newBalances: {
        main: result.balance,
        token: result.tokenBalance,
        bound: result.boundTokenBalance,
      }
    });
  } catch (error) {
    console.error('Economy POST error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to process transfer',
      error: error.message 
    }, { status: 500 });
  }
}

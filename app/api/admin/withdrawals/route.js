import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

// GET - Get all withdrawals
export async function GET(request) {
  try {
    const user = await getUserFromRequest({
      headers: {
        authorization: request.headers.get('authorization'),
        cookie: request.headers.get('cookie'),
      },
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(withdrawals);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json({ message: 'Failed to fetch withdrawals' }, { status: 500 });
  }
}

// PUT - Update withdrawal status (approve/reject)
export async function PUT(request) {
  try {
    const user = await getUserFromRequest({
      headers: {
        authorization: request.headers.get('authorization'),
        cookie: request.headers.get('cookie'),
      },
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { message: 'Withdrawal ID and status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'processing', 'completed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { message: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    // If rejecting, refund the user
    if (status === 'rejected') {
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: parseInt(id) },
          data: { status },
        }),
        prisma.user.update({
          where: { id: withdrawal.userId },
          data: {
            boundTokenBalance: {
              increment: withdrawal.amount,
            },
          },
        }),
      ]);
    } else {
      await prisma.withdrawal.update({
        where: { id: parseInt(id) },
        data: { status },
      });
    }

    return NextResponse.json({
      message: `Withdrawal ${status} successfully`,
    });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json({ message: 'Failed to update withdrawal' }, { status: 500 });
  }
}

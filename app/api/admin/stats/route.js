import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

// GET - Get dashboard stats
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

    const [
      totalUsers,
      activeUsers,
      totalBalance,
      pendingWithdrawals,
      totalWithdrawals,
      recentUsers,
      recentWithdrawals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.aggregate({
        _sum: {
          balance: true,
          tokenBalance: true,
          boundTokenBalance: true,
        },
      }),
      prisma.withdrawal.count({ where: { status: 'pending' } }),
      prisma.withdrawal.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          username: true,
          email: true,
          balance: true,
          level: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.withdrawal.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalBalance: totalBalance._sum.balance || 0,
        totalTokens: totalBalance._sum.tokenBalance || 0,
        totalBoundTokens: totalBalance._sum.boundTokenBalance || 0,
        pendingWithdrawals,
        totalWithdrawn: totalWithdrawals._sum.amount || 0,
      },
      recentUsers,
      recentWithdrawals,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

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

    // Fetch user balances from database
    const fullUser = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
      select: {
        balance: true,
        tokenBalance: true,
        boundTokenBalance: true,
        energyPoints: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      balances: {
        main: fullUser.balance,
        token: fullUser.tokenBalance,
        boundToken: fullUser.boundTokenBalance,
        energy: fullUser.energyPoints,
      },
    });
  } catch (error) {
    console.error('Error in balances GET route:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

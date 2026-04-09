import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

// GET - Get all users
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
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';

    const where = search
      ? {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          balance: true,
          tokenBalance: true,
          boundTokenBalance: true,
          energyPoints: true,
          level: true,
          xp: true,
          isAdmin: true,
          isActive: true,
          createdAt: true,
          lastFaucetClaim: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}

// PUT - Update user
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
    const { id, balance, tokenBalance, boundTokenBalance, energyPoints, level, isAdmin, isActive } = body;

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(typeof balance === 'number' && { balance }),
        ...(typeof tokenBalance === 'number' && { tokenBalance }),
        ...(typeof boundTokenBalance === 'number' && { boundTokenBalance }),
        ...(typeof energyPoints === 'number' && { energyPoints }),
        ...(typeof level === 'number' && { level }),
        ...(typeof isAdmin === 'boolean' && { isAdmin }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
        tokenBalance: true,
        boundTokenBalance: true,
        energyPoints: true,
        level: true,
        isAdmin: true,
        isActive: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(request) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Don't allow deleting yourself
    if (parseInt(id) === user.id) {
      return NextResponse.json(
        { message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    let user;
    if (identifier.includes('@')) {
      user = await prisma.user.findUnique({
        where: { email: identifier },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: identifier },
      });
    }

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    return NextResponse.json({ 
      user: { 
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      },
      token 
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An error occurred during login' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

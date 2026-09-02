import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma.mjs'; // Updated import
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, username } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email or username already in use' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An error occurred during registration' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

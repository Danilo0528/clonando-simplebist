import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from './lib/auth';

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create the test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        balance: 100.0, // Give some starting balance
        tokenBalance: 100.0,
        energyPoints: 100,
        level: 1,
        xp: 0,
      },
    });

    // Generate a token for the test user
    const token = generateToken(user);

    console.log('Test user created successfully!');
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Password: password123');
    console.log('Token:', token);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

function generateToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
}

async function createTestUser() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (existingUser) {
      console.log('Test user already exists');
      console.log('Email: test@example.com');
      console.log('Username: testuser');
      console.log('Password: password123');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        balance: 1000.0,
        tokenBalance: 500.0,
        boundTokenBalance: 200.0,
        energyPoints: 100,
        level: 5,
        xp: 250,
        isAdmin: true,
        isActive: true,
      },
    });

    const token = generateToken(user);

    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Username:', user.username);
    console.log('🔑 Password: password123');
    console.log('🛡️ Admin: Yes');
    console.log('💰 Balance:', user.balance, 'SBT');
    console.log('🎫 Token Balance:', user.tokenBalance);
    console.log('📦 Bound Tokens:', user.boundTokenBalance);
    console.log('⚡ Energy:', user.energyPoints);
    console.log('🏆 Level:', user.level);
    console.log('\n🔐 Your Token:', token);
    console.log('\n📍 You can now access the admin panel at: http://localhost:3000/admin');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

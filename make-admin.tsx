// Run with: npx tsx make-admin.tsx
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Checking for admin user...\n');

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'test@example.com' },
          { username: 'testuser' },
        ],
      },
    });

    if (existingUser) {
      console.log('✅ User exists!');
      console.log('ID:', existingUser.id);
      console.log('Username:', existingUser.username);
      console.log('Email:', existingUser.email);
      console.log('Is Admin:', existingUser.isAdmin ? 'YES ✓' : 'NO ✗');

      if (!existingUser.isAdmin) {
        console.log('\n⚠️  Making user admin...');
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { isAdmin: true },
        });
        console.log('✅ User is now admin!');
      }

      console.log('\n📍 Login with:');
      console.log('   Username: testuser');
      console.log('   Password: password123');
      console.log('   Admin panel: http://localhost:3000/admin');
    } else {
      console.log('📝 Creating new admin user...\n');

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

      console.log('✅ Admin user created!');
      console.log('\n📍 Login with:');
      console.log('   Username: testuser');
      console.log('   Email: test@example.com');
      console.log('   Password: password123');
      console.log('   Admin panel: http://localhost:3000/admin');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\n✨ Done!');
  }
}

main();

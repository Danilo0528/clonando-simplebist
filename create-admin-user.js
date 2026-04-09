const prisma = require('./lib/prisma').default;
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    console.log('🔍 Checking for existing admin user...\n');

    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (existingUser) {
      console.log('✅ Test user already exists!');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Username:', existingUser.username);
      console.log('🔑 Password: password123');
      console.log('🛡️ Admin:', existingUser.isAdmin ? 'Yes' : 'No');
      
      if (!existingUser.isAdmin) {
        console.log('\n⚠️  User exists but is NOT admin. Making admin...');
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { isAdmin: true },
        });
        console.log('✅ User is now admin!');
      }
      return;
    }

    console.log('📝 Creating new admin user...\n');

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create the test user with admin privileges
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

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('👤 Username: testuser');
    console.log('🔑 Password: password123');
    console.log('🛡️ Admin: Yes');
    console.log('💰 Balance:', user.balance, 'SBT');
    console.log('\n📍 You can now access the admin panel at: http://localhost:3000/admin');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

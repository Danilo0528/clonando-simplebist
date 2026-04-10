const prisma = require('./lib/prisma').default;

async function resetTestUser() {
  try {
    console.log('🔄 Resetting test user...\n');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'test@example.com' },
          { username: 'testuser' },
        ],
      },
    });

    if (!user) {
      console.log('❌ Test user not found!');
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        energyPoints: 100,
        xp: 0,
        level: 1,
        balance: 1000,
        tokenBalance: 500,
        boundTokenBalance: 200,
        lastEnergyUpdate: new Date(),
      },
    });

    console.log('✅ Test user reset successfully!');
    console.log('\n📊 Current stats:');
    console.log('   Username:', updated.username);
    console.log('   Level:', updated.level);
    console.log('   XP:', updated.xp);
    console.log('   Energy:', updated.energyPoints);
    console.log('   Balance:', updated.balance, 'SBT');
    console.log('   Token Balance:', updated.tokenBalance);
    console.log('\n🎯 XP needed for next levels:');
    for (let lvl = 1; lvl <= 5; lvl++) {
      const xpNeeded = 100 * Math.pow(lvl, 2);
      console.log(`   Level ${lvl} → ${lvl + 1}: ${xpNeeded} XP total`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetTestUser();

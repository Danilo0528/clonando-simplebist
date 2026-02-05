import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';
import { getXpProgressToNextLevel } from '../../../lib/progression'; // Import the new function

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

    // Fetch full user data from Prisma
    const fullUser = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
    });

    if (!fullUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Calculate level progression details using the new function
    const progression = getXpProgressToNextLevel(fullUser.xp);

    // Calculate max energy based on level (100 + level * 10)
    const maxEnergy = 100 + (progression.currentLevel * 10);

    // Calculate current energy considering regeneration (8 points every 5 minutes)
    const lastEnergyUpdate = fullUser.lastEnergyUpdate || fullUser.updatedAt;
    const now = new Date();
    const timeDiff = now - new Date(lastEnergyUpdate); // in milliseconds
    
    // Convert to minutes to calculate regeneration
    const minutesPassed = timeDiff / (1000 * 60);
    
    // Calculate how many 5-minute cycles have passed
    const fiveMinuteCycles = Math.floor(minutesPassed / 5);
    
    // Calculate regenerated energy (8 points every 5 minutes)
    const energyRegenerated = fiveMinuteCycles * 8;
    
    // Calculate current energy (don't exceed max energy)
    const currentEnergy = Math.min(
      fullUser.energyPoints + energyRegenerated, 
      maxEnergy
    );

    // Only update the database if energy has actually increased
    let updatedUser = fullUser;
    if (currentEnergy > fullUser.energyPoints) {
      updatedUser = await prisma.user.update({
        where: { id: parseInt(user.id) },
        data: {
          energyPoints: currentEnergy,
          lastEnergyUpdate: now
        },
        select: {
          id: true,
          username: true,
          email: true,
          balance: true,
          tokenBalance: true,
          energyPoints: true,
          hashpowerVirtual: true,
          level: true,
          xp: true,
          createdAt: true,
          lastFaucetClaim: true,
        }
      });
    }

    // Construct the response object expected by the frontend
    return NextResponse.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      balance: updatedUser.balance, // Use the main balance field
      tokenBalance: updatedUser.tokenBalance, // Include tokenBalance for consistency
      energyPoints: currentEnergy, // Current energy after regeneration
      level: progression.currentLevel, // Use the calculated level
      xp: updatedUser.xp,
      xpInCurrentLevel: progression.xpInCurrentLevel, // Use the calculated XP in current level
      xpNeededForNextLevel: progression.xpNeededForNextLevel, // Use the calculated XP needed for next level
      progressPercentage: progression.progressPercentage, // Use the calculated progress percentage
      createdAt: updatedUser.createdAt,
      lastFaucetClaim: updatedUser.lastFaucetClaim, // Include the last faucet claim time
      // Include energy-related information
      maxEnergy: maxEnergy,
      energyRegenerationRate: 8, // 8 points every 5 minutes
      lastEnergyUpdate: updatedUser.lastEnergyUpdate || updatedUser.updatedAt
    });
  } catch (error) {
    console.error('Error in user GET route:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
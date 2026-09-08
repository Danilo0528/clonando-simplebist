import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma.mjs';
import { getUserFromRequest } from '../../../lib/auth';
import { getXpProgressToNextLevel } from '../../../lib/progression';
import { syncUserEnergy, calculateCurrentEnergy } from '../../../lib/energy.mjs'; // Importar el nuevo módulo

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
    let fullUser = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
    });

    if (!fullUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Usar el módulo centralizado para sincronizar la energía en DB si es necesario
    fullUser = await syncUserEnergy(fullUser);

    // Obtener los datos calculados de energía actual
    const energyData = calculateCurrentEnergy(fullUser);

    // Calculate level progression details using the new function
    const progression = getXpProgressToNextLevel(fullUser.xp);

    // Construct the response object expected by the frontend
    return NextResponse.json({
      id: fullUser.id,
      username: fullUser.username,
      email: fullUser.email,
      tokenBalance: fullUser.tokenBalance, 
      boundTokenBalance: fullUser.boundTokenBalance, 
      energyPoints: energyData.current, // Current energy
      level: progression.currentLevel, 
      xp: fullUser.xp,
      xpInCurrentLevel: progression.xpInCurrentLevel, 
      xpNeededForNextLevel: progression.xpNeededForNextLevel, 
      progressPercentage: progression.progressPercentage, 
      createdAt: fullUser.createdAt,
      lastFaucetClaim: fullUser.lastFaucetClaim, 
      isAdmin: fullUser.isAdmin, 
      isActive: fullUser.isActive, 
      // Include energy-related information
      maxEnergy: energyData.max,
      energyRegenerationRate: 8, 
      lastEnergyUpdate: energyData.lastUpdate
    });
  } catch (error) {
    console.error('Error in user GET route:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
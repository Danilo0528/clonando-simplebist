import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma.mjs';
import { getUserFromRequest } from '../../../lib/auth';
import { getXpProgressToNextLevel } from '../../../lib/progression';
import { syncUserEnergy, calculateCurrentEnergy } from '../../../lib/energy.mjs';

export async function GET(request) {
  try {
    // 1. Obtener usuario desde el request (JWT Bearer o cookies Supabase)
    const dbUser = await getUserFromRequest(request);

    if (!dbUser) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // 2. Usar el módulo centralizado para sincronizar la energía en DB si es necesario
    const syncedUser = await syncUserEnergy(dbUser);

    // 4. Obtener los datos calculados de energía actual
    const energyData = calculateCurrentEnergy(syncedUser);

    // 5. Calculate level progression details
    const progression = getXpProgressToNextLevel(syncedUser.xp);

    // Construct the response object expected by the frontend
    return NextResponse.json({
      id: syncedUser.id,
      username: syncedUser.username,
      email: syncedUser.email,
      tokenBalance: syncedUser.tokenBalance, 
      boundTokenBalance: syncedUser.boundTokenBalance, 
      energyPoints: energyData.current,
      level: progression.currentLevel, 
      xp: syncedUser.xp,
      xpInCurrentLevel: progression.xpInCurrentLevel, 
      xpNeededForNextLevel: progression.xpNeededForNextLevel, 
      progressPercentage: progression.progressPercentage, 
      createdAt: syncedUser.createdAt,
      lastFaucetClaim: syncedUser.lastFaucetClaim, 
      isAdmin: syncedUser.isAdmin, 
      isActive: syncedUser.isActive, 
      maxEnergy: energyData.max,
      energyRegenerationRate: 8, 
      lastEnergyUpdate: energyData.lastUpdate
    });
  } catch (error) {
    console.error('Error in user GET route:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

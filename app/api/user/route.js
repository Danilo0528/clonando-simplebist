import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';
import { cookies } from 'next/headers';
import { getXpProgressToNextLevel } from '../../../lib/progression';
import { syncUserEnergy, calculateCurrentEnergy } from '../../../lib/energy.mjs';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Obtener usuario desde Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // 2. Intentar buscar o crear el usuario en Prisma
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    if (!dbUser) {
      console.log('Creando perfil de usuario en Prisma...');
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || 'user'
        }
      });
    }

    // 3. Usar el módulo centralizado para sincronizar la energía en DB si es necesario
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

import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
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

    // 2. Fetch full user data from Supabase 'profiles' table (asumiendo este nombre)
    const { data: fullUser, error: dbError } = await supabase
      .from('profiles') // O 'users' dependiendo de tu esquema
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError || !fullUser) {
      console.error('Error fetching user profile:', dbError);
      return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }

    // 3. Usar el módulo centralizado para sincronizar la energía en DB si es necesario
    // Nota: syncUserEnergy espera un objeto user compatible con Prisma.
    // Firebase/Supabase podría requerir ajustar esta función si usa tipos diferentes.
    const syncedUser = await syncUserEnergy(fullUser);

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

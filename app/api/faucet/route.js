import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { 
  canClaimFaucet, 
  getFaucetConfig, 
  claimFaucet,
  calculateAccumulatedFaucetReward,
  checkFaucetRateLimit,
  recordFaucetAttempt
} from '../../../lib/faucet';

export async function GET(request) {
  try {
    // Extraer cookies del encabezado
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    // Crear un objeto req simulado para que funcione con la función existente
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

    // ✅ Usar la nueva lógica de timestamps para calcular recompensa acumulada
    const accumulatedReward = await calculateAccumulatedFaucetReward(user.id);
    const faucetStatus = await canClaimFaucet(user.id);
    const faucetConfig = await getFaucetConfig();

    // Calcular tiempo restante si no se puede reclamar
    let timeLeft = 0;
    if (!faucetStatus.canClaim && faucetStatus.timeRemaining > 0) {
      timeLeft = Math.ceil(faucetStatus.timeRemaining / 1000); // Convertir a segundos
    }

    return NextResponse.json({
      isReady: faucetStatus.canClaim,
      timeLeft: timeLeft,
      reward: faucetConfig.rewardAmount,
      description: faucetConfig.description,
      // ✅ Nueva información de recompensa acumulada
      accumulatedReward: accumulatedReward.accumulatedReward,
      intervalsPassed: accumulatedReward.intervalsPassed || 0,
    });
  } catch (error) {
    console.error('Error in faucet GET:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Extraer cookies del encabezado
    const authHeader = request.headers.get('authorization');
    const postCookieHeader = request.headers.get('cookie');

    // Crear un objeto req simulado para que funcione con la función existente
    const postMockReq = {
      headers: {
        authorization: authHeader,
        cookie: postCookieHeader,
      },
    };

    const user = await getUserFromRequest(postMockReq);

    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // ✅ ANTI-BOTS: Verificar rate limit antes de procesar
    const rateLimitCheck = await checkFaucetRateLimit(user.id);
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          message: rateLimitCheck.error || 'Too Many Requests',
          timeRemaining: Math.ceil(rateLimitCheck.timeRemaining / 1000),
          attempts: rateLimitCheck.attempts
        },
        { status: 429 } // ✅ Error 429 Too Many Requests
      );
    }

    // ✅ Registrar el intento para rate limiting
    await recordFaucetAttempt(user.id);

    // Intentar reclamar el faucet
    const claimResult = await claimFaucet(user.id);

    return NextResponse.json({
      message: `You successfully claimed ${claimResult.rewardAmount} Bits!`,
      claimedAmount: claimResult.rewardAmount,
      newUserBalance: claimResult.newBalance,
      newTokenBalance: claimResult.newBalance
    });
  } catch (error) {
    console.error('Error in faucet POST:', error);
    
    // Si el error es por cooldown, devolver 429
    if (error.message.includes('Cannot claim faucet yet')) {
      return NextResponse.json(
        { message: 'Faucet is still on cooldown' },
        { status: 429 }
      );
    }
    
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
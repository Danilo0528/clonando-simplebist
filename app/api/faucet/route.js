import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { canClaimFaucet, getFaucetConfig, claimFaucet } from '../../../lib/faucet';

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

    // Obtener información sobre la disponibilidad del faucet
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
      description: faucetConfig.description
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

    // Intentar reclamar el faucet
    const claimResult = await claimFaucet(user.id);

    if (!claimResult.success) {
      return NextResponse.json({ message: claimResult.message }, { status: 429 });
    }

    // Actualizar ambos balances del usuario en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: claimResult.rewardAmount || claimResult.reward },
        tokenBalance: { increment: claimResult.rewardAmount || claimResult.reward }
      },
      select: {
        id: true,
        username: true,
        balance: true,
        tokenBalance: true,
        energyPoints: true,
        level: true,
        xp: true
      }
    });

    return NextResponse.json({
      message: `You successfully claimed ${claimResult.rewardAmount} Bits!`,
      claimedAmount: claimResult.rewardAmount,
      newUserBalance: updatedUser.balance,
      newTokenBalance: updatedUser.tokenBalance
    });
  } catch (error) {
    console.error('Error in faucet POST:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
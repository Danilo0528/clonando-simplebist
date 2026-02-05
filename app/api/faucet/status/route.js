import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { canClaimFaucet, getFaucetConfig } from '../../../../lib/faucet';

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
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
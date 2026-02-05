import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { getUserMiningStatus, consumeEnergyForMining } from '../../../../lib/mining';

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

    // Obtener estado de minería del usuario
    const miningStatus = await getUserMiningStatus(user.id);

    return NextResponse.json({
      status: miningStatus.status,
      potentialReward: miningStatus.potentialReward,
      hashpower: miningStatus.hashpower,
      energy: miningStatus.energy,
      level: miningStatus.level,
      xp: miningStatus.xp,
      timeWindow: miningStatus.timeWindow
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
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

    const currentUser = await getUserFromRequest(mockReq);

    if (!currentUser) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Parsear el cuerpo de la solicitud
    const body = await request.json();
    const { energyToConsume = 5 } = body; // Por defecto consumir 5 puntos de energía

    // Consumir energía para minería y otorgar XP
    const result = await consumeEnergyForMining(currentUser.id, energyToConsume);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in mining POST:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
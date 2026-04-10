import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { 
  getUserMiningStatus, 
  claimMiningRewards,
  consumeEnergyForMining,
  calculateAccumulatedMiningReward
} from '../../../lib/mining';

// ✅ GET: Obtener estado de minería con recompensa acumulada
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

    // ✅ Usar lógica de timestamps para calcular recompensa acumulada
    const status = await getUserMiningStatus(user.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error in mine GET:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ POST: Consumir energía y/o reclamar recompensas de minería
export async function POST(request) {
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

    const body = await request.json();
    const { energyAmount, claimRewards } = body;

    // ✅ Si el usuario quiere reclamar recompensas acumuladas
    if (claimRewards) {
      try {
        const result = await claimMiningRewards(user.id);
        return NextResponse.json(result);
      } catch (error) {
        if (error.message.includes('Not enough time') || error.message.includes('No mining rewards')) {
          return NextResponse.json(
            { message: error.message },
            { status: 429 }
          );
        }
        throw error;
      }
    }

    // ✅ Si el usuario quiere consumir energía para minar
    if (energyAmount && energyAmount > 0) {
      try {
        const result = await consumeEnergyForMining(user.id, energyAmount);
        return NextResponse.json(result);
      } catch (error) {
        if (error.message.includes('Insufficient energy')) {
          return NextResponse.json(
            { message: error.message },
            { status: 400 }
          );
        }
        throw error;
      }
    }

    return NextResponse.json(
      { message: 'Invalid request. Provide energyAmount or claimRewards' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in mine POST:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import {
  getHardwarePlans,
  rentHardware,
  getUserHardwareStatus,
  claimHardwareReward,
} from '../../../lib/hardware';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const status = await getUserHardwareStatus(user.id);

    return NextResponse.json({
      plans: status.plans,
      stats: {
        totalHardware: status.totalHardware,
        totalContracts: status.totalContracts,
        dailyIncome: status.dailyIncome,
        totalHash: status.totalHash,
        accrued: status.accrued,
        lastClaim: status.lastClaim,
      },
      activeRentals: status.activeRentals,
    });
  } catch (error) {
    console.error('Error in hardware GET route:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { action, plan, quantity } = body;

    if (action === 'rent') {
      if (!plan) {
        return NextResponse.json({ message: 'Missing plan name' }, { status: 400 });
      }
      const result = await rentHardware(user.id, plan, quantity || 1);
      return NextResponse.json(result);
    }

    if (action === 'claim') {
      const result = await claimHardwareReward(user.id);
      return NextResponse.json(result);
    }

    return NextResponse.json({ message: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in hardware POST route:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
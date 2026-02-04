import { NextResponse } from 'next/server';
import { getUserFromToken, updateUser } from '../../../lib/auth'; 

const ENERGY_COST_PER_UNIT = 1;
const XP_GAIN_PER_UNIT = 5;

export async function POST(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { amount } = await req.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ message: 'Invalid mining amount' }, { status: 400 });
    }

    let { level, xp, energyPoints } = user;

    const totalEnergyCost = ENERGY_COST_PER_UNIT * amount;
    if (energyPoints < totalEnergyCost) {
      return NextResponse.json({ message: 'Not enough energy to mine.' }, { status: 400 });
    }

    const totalXpGain = XP_GAIN_PER_UNIT * amount;
    energyPoints -= totalEnergyCost;
    xp += totalXpGain;

    const xpNeededForNextLevel = level * 1000;
    if (xp >= xpNeededForNextLevel) {
      level += 1; 
      xp -= xpNeededForNextLevel; 
      energyPoints = level * 100; 
    }

    const updatedUserData = { 
        level, 
        xp, 
        energyPoints 
    };

    await updateUser(user.id, updatedUserData);

    return NextResponse.json({
      message: 'Mining successful!',
      xpGained: totalXpGain,
      newEnergy: energyPoints,
      newXP: xp,
      newLevel: level,
    }, { status: 200 });

  } catch (error) {
    console.error('Mine API error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

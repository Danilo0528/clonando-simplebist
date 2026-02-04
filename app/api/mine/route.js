import { NextResponse } from 'next/server';
import { getUserFromToken, updateUser } from '../../../lib/auth'; // Assuming you have these helpers

// The amount of energy consumed and XP gained per mining tick
const ENERGY_COST = 10;
const XP_GAIN = 50;

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

    let { level, xp, energyPoints } = user;

    // 1. Check for sufficient energy
    if (energyPoints < ENERGY_COST) {
      return NextResponse.json({ message: 'Not enough energy to mine.' }, { status: 400 });
    }

    // 2. Reduce energy and increase XP
    energyPoints -= ENERGY_COST;
    xp += XP_GAIN;

    // 3. Check for level up
    const xpNeededForNextLevel = level * 1000;
    if (xp >= xpNeededForNextLevel) {
      level += 1; // Level up!
      xp -= xpNeededForNextLevel; // Reset XP for the new level
      // Optional: Fully or partially refill energy on level up
      energyPoints = level * 100; 
    }

    // 4. Update the user in the database
    const updatedUserData = { 
        level, 
        xp, 
        energyPoints 
    };

    await updateUser(user.id, updatedUserData);

    // 5. Return a success response
    return NextResponse.json({
      message: 'Mining successful!',
      xpGained: XP_GAIN,
      newEnergy: energyPoints,
      newXP: xp,
      newLevel: level,
    }, { status: 200 });

  } catch (error) {
    console.error('Mine API error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

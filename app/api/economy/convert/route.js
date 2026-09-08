import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import { convertToBound } from '../../../lib/economy';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }

    // Realizar la conversión usando el helper centralizado
    await convertToBound(user.id, parseFloat(amount));

    return NextResponse.json({ message: 'Conversion successful' });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

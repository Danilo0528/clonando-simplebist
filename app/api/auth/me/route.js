import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';

export async function GET(request) {
  try {
    // Crear un objeto req simulado para que funcione con la función existente
    const mockReq = {
      headers: {
        authorization: request.headers.get('authorization'),
        cookie: request.headers.get('cookie'),
      },
    };

    const user = await getUserFromRequest(mockReq);

    if (!user) {
      console.log('No user found from getUserFromRequest, returning 401');
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    console.log('User found:', user.username);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
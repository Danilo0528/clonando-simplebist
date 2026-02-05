import { NextResponse } from 'next/server';
import cookie from 'cookie';

export async function POST(request) {
  // Set cookie to be expired to clear the token
  const response = NextResponse.json({ message: 'Successfully logged out' });
  
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  return response;
}
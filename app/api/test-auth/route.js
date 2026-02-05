import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function GET(request) {
  try {
    // Obtener el token de las cabeceras
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    const response = {
      headers: {
        hasAuthHeader: !!authHeader,
        hasCookieHeader: !!cookieHeader,
        userAgent: request.headers.get('user-agent')
      }
    };
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      response.tokenInHeader = 'present';
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        response.tokenValid = true;
        response.decoded = decoded;
      } catch (verifyError) {
        response.tokenValid = false;
        response.verifyError = verifyError.message;
      }
    } else {
      response.tokenInHeader = 'missing or wrong format';
    }
    
    if (cookieHeader) {
      // Buscar token en cookies
      const cookies = cookieHeader.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') {
          response.tokenInCookie = 'present';
          
          try {
            const decoded = jwt.verify(value, JWT_SECRET);
            response.tokenInCookieValid = true;
            response.tokenInCookieDecoded = decoded;
          } catch (verifyError) {
            response.tokenInCookieValid = false;
            response.tokenInCookieVerifyError = verifyError.message;
          }
          break;
        }
      }
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ error: error.message });
  }
}
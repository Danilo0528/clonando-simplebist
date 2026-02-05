import { NextResponse } from 'next/server';
import { getUserFromToken } from '../../../../lib/auth';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function GET(request) {
  try {
    // Obtener todas las cabeceras para ver qué está llegando
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    console.log('Cabecera de autorización:', authHeader);
    console.log('Cabecera de cookies:', cookieHeader);

    let token = null;

    // Intentar obtener el token del header de autorización (formato: "Bearer TOKEN")
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('Token encontrado en header de autorización');
    }

    // Si no está en el header de autorización, intentar obtenerlo de las cookies
    if (!token && cookieHeader) {
      const cookies = cookie.parse(cookieHeader);
      token = cookies.token;
      if (token) {
        console.log('Token encontrado en cookies');
      }
    }

    const debugInfo = {
      hasAuthHeader: !!authHeader,
      hasCookieHeader: !!cookieHeader,
      hasToken: !!token,
      tokenPresent: token ? 'yes' : 'no',
      userAgent: request.headers.get('user-agent')
    };

    if (!token) {
      console.log('No se encontró token para la autenticación');
      return NextResponse.json({ 
        authenticated: false, 
        debug: debugInfo,
        message: 'No token found' 
      });
    }

    // Verificar y decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token verificado exitosamente');
    } catch (error) {
      console.error('Error al verificar token:', error);
      return NextResponse.json({ 
        authenticated: false, 
        debug: debugInfo,
        message: 'Invalid or expired token',
        error: error.message 
      });
    }

    // Obtener el usuario usando el ID del token
    const user = await getUserFromToken(token);

    if (!user) {
      console.log('Usuario no encontrado en la base de datos');
      return NextResponse.json({ 
        authenticated: false, 
        debug: debugInfo,
        message: 'User not found' 
      });
    }

    console.log('Autenticación exitosa para usuario:', user.username);
    return NextResponse.json({ 
      authenticated: true, 
      debug: debugInfo,
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
        energyPoints: user.energyPoints,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Error en debug/auth-test:', error);
    return NextResponse.json({ 
      authenticated: false, 
      message: error.message,
      error: error.toString()
    });
  }
}
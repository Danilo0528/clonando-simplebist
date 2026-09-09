import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
import { cookies } from 'next/headers';
import { generateToken } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma.mjs';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const body = await request.json();
    let { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Credenciales incompletas' }, { status: 400 });
    }

    // 1. Si el identificador no es un email, buscar el email asociado al username en Prisma
    let emailToLogin = identifier;
    if (!identifier.includes('@')) {
      const user = await prisma.user.findUnique({
        where: { username: identifier },
        select: { email: true }
      });
      if (!user) {
        return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 401 });
      }
      emailToLogin = user.email;
    }

    // 2. Configuración de Supabase para login usando el email resuelto
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password: password,
    });

    if (error) {
      console.error('Login error:', error);
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    // Resolver el usuario en Prisma (por email) y firmar el token con SU id,
    // para que las APIs que usan el JWT siempre encuentren la fila.
    let prismaUser = await prisma.user.findUnique({ where: { email: emailToLogin } });
    if (!prismaUser) {
      prismaUser = await prisma.user.create({
        data: {
          id: data.user.id,
          email: emailToLogin,
          username: data.user.user_metadata?.username || emailToLogin.split('@')[0],
        },
      });
    }

    const token = generateToken(prismaUser);

    // Supabase maneja cookies automáticamente si está configurado en el middleware/utils
    return NextResponse.json({ 
      user: { id: prismaUser.id, email: prismaUser.email },
      token: token 
    });

  } catch (error) {
    console.error('System error:', error);
    // Aseguramos que siempre sea JSON
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

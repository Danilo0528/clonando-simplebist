import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Credenciales incompletas' }, { status: 400 });
    }

    // Configuración de Supabase para login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: password,
    });

    if (error) {
      console.error('Login error:', error);
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    // Supabase maneja cookies automáticamente si está configurado en el middleware/utils
    return NextResponse.json({ 
      user: { id: data.user.id, email: data.user.email },
      token: data.session.access_token 
    });

  } catch (error) {
    console.error('System error:', error);
    // Aseguramos que siempre sea JSON
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

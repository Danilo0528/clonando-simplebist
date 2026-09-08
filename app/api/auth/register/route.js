import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
import { cookies } from 'next/headers';
import { validatePasswordStrength } from '../../../../lib/security';

export async function POST(request) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ message: 'Password does not meet security requirements' }, { status: 400 });
    }

    // Configurar cliente de Supabase
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Registrar usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (error) {
      console.error('ERROR COMPLETO DE SUPABASE:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        message: error.message || 'Error desconocido de Supabase',
        details: error 
      }, { status: 400 });
    }

    return NextResponse.json({ message: 'User created successfully', user: data.user }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An error occurred during registration' }, { status: 500 });
  }
}

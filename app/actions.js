'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  // Destroy the session
  cookies().set('session', '', { expires: new Date(0) });

  // Redirect to the login page
  redirect('/login');
}

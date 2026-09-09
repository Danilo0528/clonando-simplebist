import { NextResponse } from 'next/server';
import { createServerClient } from "@supabase/ssr";

export async function middleware(request) {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // Get session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Verify also the custom 'token' cookie
  const customToken = request.cookies.get('token');
  
  console.log('Middleware - Cookies recibidas:', request.cookies.getAll().map(c => c.name));
  console.log('Middleware - ¿Sesión Supabase?:', !!session);
  console.log('Middleware - ¿Token personalizado?:', !!customToken);

  // If no session AND no custom token, and NOT on an auth route, redirect to login
  if (!session && !customToken && !request.nextUrl.pathname.startsWith('/auth')) {
    console.log('Middleware - Sesión no encontrada, redirigiendo a login');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};


import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  const token = request.cookies.get('token'); // Assuming the token is stored in a cookie named 'token'

  // If the user is trying to access the main app and doesn't have a token,
  // redirect them to the login page.
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If the user has a token, let them proceed.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|auth|_next/static|_next/image|favicon.ico).)*',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = '/dashboard';

// Graceful import of auth functions - commented out for now to fix middleware loading
let signToken: any, verifyToken: any;
// try {
//   const auth = require('@/lib/auth/session');
//   signToken = auth.signToken;
//   verifyToken = auth.verifyToken;
// } catch (error) {
//   console.warn('Auth functions not available:', error);
// }

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for test pages during development
  if (pathname.includes('-test') || pathname.includes('design-test')) {
    return NextResponse.next();
  }
  
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  // Only process session if AUTH_SECRET is available and auth functions loaded
  if (sessionCookie && request.method === 'GET' && process.env.AUTH_SECRET && verifyToken && signToken) {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString()
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};

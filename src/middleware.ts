
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthenticated = !!authToken;

  // If the user is trying to access the login page
  if (pathname.startsWith('/login')) {
    if (isAuthenticated) {
      // If already authenticated, redirect to the main application page
      return NextResponse.redirect(new URL('/', request.url));
    }
    // If not authenticated, allow access to the login page
    return NextResponse.next();
  }

  // For any other page covered by the matcher:
  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated, allow access to the requested page
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any files in the public folder (e.g., images, manifests)
     *
     * This matcher aims to protect actual pages while allowing static assets.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    // Explicitly include the root path if the above doesn't catch it as a "page"
    // However, the above regex with negative lookahead should cover '/'
    // The matcher also needs to apply to /login itself for the redirect logic if already authenticated.
    // The regex already includes /login because it doesn't have an extension and isn't an excluded path.
  ],
};

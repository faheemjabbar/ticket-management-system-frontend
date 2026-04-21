import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from localStorage (we'll check this on client side)
  // Note: We can't access localStorage in middleware, so we'll handle auth on client
  // This middleware is mainly for redirecting logged-in users away from auth pages

  // Define public routes (accessible without authentication)
  const publicRoutes = ['/', '/login', '/register', '/about-us', '/pricing', '/blog'];
  
  // Define protected routes (require authentication)
  const protectedRoutes = [
    '/dashboard', 
    '/tickets', 
    '/users', 
    '/projects', 
    '/organizations',
    '/sprints',
    '/labels',
    '/settings',
    '/forgot-password',
    '/reset-password'
  ];

  // Check if current path is a public route (exact match or blog sub-paths)
  const isPublicRoute = publicRoutes.some(route => pathname === route) || pathname.startsWith('/blog');
  
  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, let client-side auth handle it
  // (since we can't access localStorage in middleware)
  if (isProtectedRoute) {
    return NextResponse.next();
  }

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
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

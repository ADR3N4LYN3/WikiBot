import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';

// Routes protégées (nécessitent authentification)
const protectedRoutes = ['/dashboard'];

// Routes qui redirigent vers dashboard si connecté
const authRoutes = ['/login'];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isLandingPage = nextUrl.pathname === '/';

  // Utilisateur non connecté essaie d'accéder aux routes protégées
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Utilisateur connecté essaie d'accéder aux routes d'auth ou landing
  if (isLoggedIn && (isAuthRoute || isLandingPage)) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Ajouter headers anti-cache pour les routes protégées
  if (isProtectedRoute && isLoggedIn) {
    const response = NextResponse.next();
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = ['/login', '/register', '/api/auth'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow Next.js internals & static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Check JWT token (Edge-safe — no Node.js imports)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // On HTTPS (Vercel), Auth.js uses the __Secure- cookie prefix.
    // If we don't set this, getToken() looks for the non-secure cookie name and returns null.
    secureCookie: req.nextUrl.protocol === 'https:',
  });

  if (!token) {
    // API routes → 401 JSON (not an HTML redirect, which breaks fetch())
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Pages → redirect to login
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|images/).*)',
  ],
};

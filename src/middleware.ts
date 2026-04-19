import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev';
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('abacus_session')?.value;
  const path = request.nextUrl.pathname;

  const isPublicRoute = path === '/' || path.startsWith('/api/auth') || path.startsWith('/login') || path.startsWith('/register');

  let decryptedSession = null;
  if (session) {
    try {
      const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] });
      decryptedSession = payload as any;
    } catch (e) {
      // Invalid token
    }
  }

  if (!isPublicRoute && !decryptedSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (decryptedSession) {
    const role = decryptedSession.role;
    
    if (path.startsWith('/admin') && role !== 'ADMIN') {
       return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
    
    if (path === '/login' || path === '/register') {
       return NextResponse.redirect(new URL(role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

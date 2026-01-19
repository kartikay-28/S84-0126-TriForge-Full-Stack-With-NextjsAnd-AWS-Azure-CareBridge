import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { verifyToken, JWTPayload } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run middleware on dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = cookies().get('token')?.value;
    const loginUrl = new URL('/auth/login', request.url);

    if (!token) {
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = await verifyToken(token) as JWTPayload;
      // Example of role-based protection
      if (pathname.startsWith('/dashboard/doctor') && payload.role !== 'DOCTOR') {
        return NextResponse.redirect(loginUrl);
      }
      if (pathname.startsWith('/dashboard/patient') && payload.role !== 'PATIENT') {
        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
}
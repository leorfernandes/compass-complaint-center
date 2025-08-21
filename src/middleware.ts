import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken, UserRole } from '@/lib/auth';

// Force Node.js runtime for middleware
export const runtime = 'nodejs';

// Define protected routes
const protectedRoutes = {
  admin: ['/admin'],
  user: ['/submit-complaint', '/my-complaints'],
  public: ['/', '/complaints', '/api/complaints', '/api/auth/login', '/api/auth/register'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (protectedRoutes.public.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow specific API routes that don't require auth
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Get token from request
  const token = getTokenFromRequest(request);
  
  // Redirect to login if no token
  if (!token) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + encodeURIComponent(pathname), request.url));
    }
    if (pathname.startsWith('/submit-complaint') || pathname.startsWith('/my-complaints')) {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + encodeURIComponent(pathname), request.url));
    }
    if (pathname.startsWith('/api/admin/') || pathname.startsWith('/api/user/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth/login?error=expired', request.url));
    }
    if (pathname.startsWith('/submit-complaint') || pathname.startsWith('/my-complaints')) {
      return NextResponse.redirect(new URL('/auth/login?error=expired', request.url));
    }
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Check admin routes (including admin API routes)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin/') || 
      (pathname.startsWith('/api/complaints') && payload.role === UserRole.ADMIN)) {
    if (payload.role !== UserRole.ADMIN) {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/auth/login?error=unauthorized', request.url));
      }
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
    }
  }

  // Check user routes
  if (pathname.startsWith('/my-complaints') || pathname.startsWith('/api/user/')) {
    if (payload.role !== UserRole.USER && payload.role !== UserRole.ADMIN) {
      if (pathname.startsWith('/my-complaints')) {
        return NextResponse.redirect(new URL('/auth/login?error=unauthorized', request.url));
      }
      if (pathname.startsWith('/api/user/')) {
        return NextResponse.json(
          { success: false, error: 'User access required' },
          { status: 403 }
        );
      }
    }
  }

  // Add user info to headers for API routes
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

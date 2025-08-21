import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Simple password check (in production, use proper hashing)
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      // Create a simple auth token (in production, use JWT)
      const authToken = process.env.ADMIN_AUTH_TOKEN || 'admin123';
      
      const response = NextResponse.json({
        success: true,
        message: 'Authentication successful'
      });

      // Set HTTP-only cookie for security
      response.cookies.set('admin-auth', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid password'
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Authentication failed'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Logout - clear the auth cookie
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  response.cookies.delete('admin-auth');
  
  return response;
}

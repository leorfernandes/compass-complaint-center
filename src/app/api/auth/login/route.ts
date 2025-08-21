import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserSettingsService } from '@/lib/userSettingsService';
import { 
  comparePassword, 
  generateToken, 
  isValidEmail,
  createAuthCookie,
  isValidAdminPassword,
  UserRole 
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, isAdminLogin } = await request.json();
    
    // Debug logging
    console.log('🔍 Login attempt:', { 
      email, 
      isAdminLogin, 
      passwordLength: password?.length,
      adminPassword: process.env.ADMIN_PASSWORD 
    });

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Legacy admin login support
    console.log('🔐 Checking legacy admin:', { isAdminLogin, password, adminPass: process.env.ADMIN_PASSWORD });
    if (isAdminLogin && isValidAdminPassword(password)) {
      console.log('✅ Legacy admin login successful');
      
      // Clean demo user settings on each login
      const demoUserId = 'demo';
      try {
        await UserSettingsService.cleanDemoUserSettings();
        console.log('🧹 Demo user email settings cleaned');
      } catch (error) {
        console.error('Error cleaning demo settings:', error);
      }
      
      const token = generateToken({
        userId: demoUserId,
        email: email,
        role: UserRole.ADMIN,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: demoUserId,
          email: email,
          role: UserRole.ADMIN,
        },
        token,
      });

      response.headers.set('Set-Cookie', createAuthCookie(token));
      return response;
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Please contact support.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: (user as any)._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: user.toObject(),
      token,
    });

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', createAuthCookie(token));

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

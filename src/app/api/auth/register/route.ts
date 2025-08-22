import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { 
  hashPassword, 
  generateToken, 
  isValidEmail, 
  isValidPassword, 
  UserRole,
  createAuthCookie 
} from '@/lib/auth';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors 
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Determine user role (admin registration might be restricted)
    let userRole = UserRole.USER;
    if (role === UserRole.ADMIN) {
      // Only allow admin registration with special admin key or if no admin exists
      const adminExists = await User.findOne({ role: UserRole.ADMIN });
      if (!adminExists || request.headers.get('X-Admin-Key') === process.env.ADMIN_REGISTRATION_KEY) {
        userRole = UserRole.ADMIN;
      }
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
    });

    // Generate JWT token
    const token = generateToken({
      userId: (user._id as mongoose.Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: user.toSafeObject(),
      token,
    });

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', createAuthCookie(token));

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.message.includes('E11000')) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

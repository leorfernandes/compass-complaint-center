import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * User roles enum defining access levels
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

/**
 * JWT payload interface for token generation and verification
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * User interface for database models and API responses
 */
export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Auth response interface
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password'>;
  error?: string;
}

/**
 * Generate JWT token for user authentication
 * @param payload - User payload containing userId, email, and role
 * @returns Signed JWT token string
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as string,
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify and decode JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid, null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Extract and verify JWT token from Next.js request
 * @param request - NextRequest object
 * @returns Object with validation status and user data
 */
export function verifyRequestToken(request: any): { valid: boolean; user?: any } {
  try {
    // Use the same token extraction as getTokenFromRequest for consistency
    const token = getTokenFromRequest(request);
    
    // Debug: Log the extraction process
    console.log('🔍 Auth Debug - Request cookies:', request.headers.get('Cookie'));
    console.log('🔍 Auth Debug - Authorization header:', request.headers.get('authorization'));
    console.log('🔍 Auth Debug - Extracted token:', token ? token.substring(0, 30) + '...' : 'None');

    if (!token) {
      console.log('❌ Auth Debug - No token found');
      return { valid: false };
    }

    const decoded = verifyToken(token);
    console.log('🔍 Auth Debug - Token decoded:', decoded ? 'Success' : 'Failed');
    if (!decoded) {
      return { valid: false };
    }

    const result = {
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    };
    
    console.log('✅ Auth Debug - Authentication successful for user:', result.user.id);
    return result;
  } catch (error) {
    console.error('Request token verification failed:', error);
    return { valid: false };
  }
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Get token from request (headers or cookies)
 */
export function getTokenFromRequest(request: Request): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    return extractTokenFromHeader(authHeader);
  }

  // Try cookie fallback
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    return cookies.token || null;
  }

  return null;
}

/**
 * Create auth cookie
 */
export function createAuthCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? 'Secure; ' : '';
  return `token=${token}; HttpOnly; ${secureFlag}SameSite=Strict; Max-Age=${maxAge}; Path=/`;
}

/**
 * Create logout cookie
 */
export function createLogoutCookie(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? 'Secure; ' : '';
  return `token=; HttpOnly; ${secureFlag}SameSite=Strict; Max-Age=0; Path=/`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Admin authentication (legacy support)
 */
export function isValidAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  console.log('🔍 Admin password check:', { 
    provided: password, 
    expected: adminPassword, 
    match: password === adminPassword 
  });
  return password === adminPassword;
}

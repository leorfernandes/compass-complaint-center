import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

interface Settings {
  email: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPass: string;
    adminEmail: string;
  };
  database: {
    mongodbUri: string;
    connectionStatus: 'connected' | 'disconnected' | 'testing';
  };
  app: {
    baseUrl: string;
  };
}

// Check current database connection status
async function checkDatabaseConnection(): Promise<'connected' | 'disconnected'> {
  try {
    if (mongoose.connection.readyState === 1) {
      // Test the connection with a simple ping
      await mongoose.connection.db.admin().ping();
      return 'connected';
    } else {
      return 'disconnected';
    }
  } catch (error) {
    console.error('Database connection check failed:', error);
    return 'disconnected';
  }
}

// GET /api/admin/settings - Get current settings
export async function GET() {
  try {
    // Check current database connection status
    const connectionStatus = await checkDatabaseConnection();

    const settings: Settings = {
      email: {
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: process.env.SMTP_PORT || '587',
        smtpUser: process.env.SMTP_USER || '',
        smtpPass: process.env.SMTP_PASS ? '••••••••' : '', // Mask password
        adminEmail: process.env.ADMIN_EMAIL || '',
      },
      database: {
        mongodbUri: process.env.MONGODB_URI ? '••••••••' : '', // Mask URI
        connectionStatus: connectionStatus,
      },
      app: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
      },
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Update settings
export async function POST(request: NextRequest) {
  try {
    // For assessment purposes, prevent environment modification
    // This prevents potential security issues and file system errors on Vercel
    return NextResponse.json({ 
      success: false, 
      error: 'Environment modification disabled for assessment demo. Email settings are pre-configured via Vercel environment variables.' 
    }, { status: 403 });
  } catch (error) {
    console.error('Error in settings update:', error);
    return NextResponse.json(
      { error: 'Settings update not available' },
      { status: 500 }
    );
  }
}

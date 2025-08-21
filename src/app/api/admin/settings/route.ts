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
    const body = await request.json();
    const { email, database, app } = body;

    // Read current .env.local file
    let envContent = '';
    try {
      envContent = await fs.readFile(ENV_FILE_PATH, 'utf-8');
    } catch (error) {
      // File doesn't exist, create new content
      envContent = '';
    }

    // Parse existing env variables
    const envVars: Record<string, string> = {};
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    // Update with new values
    if (email) {
      if (email.smtpHost) envVars.SMTP_HOST = email.smtpHost;
      if (email.smtpPort) envVars.SMTP_PORT = email.smtpPort;
      if (email.smtpUser) envVars.SMTP_USER = email.smtpUser;
      if (email.smtpPass && email.smtpPass !== '••••••••') envVars.SMTP_PASS = email.smtpPass;
      if (email.adminEmail) envVars.ADMIN_EMAIL = email.adminEmail;
    }

    if (database) {
      if (database.mongodbUri && database.mongodbUri !== '••••••••') {
        envVars.MONGODB_URI = database.mongodbUri;
      }
    }

    if (app) {
      if (app.baseUrl) envVars.NEXT_PUBLIC_BASE_URL = app.baseUrl;
    }

    // Generate new .env.local content
    const newEnvContent = [
      '# MongoDB Configuration - MongoDB Atlas',
      `MONGODB_URI=${envVars.MONGODB_URI || ''}`,
      '',
      '# Email Configuration',
      `SMTP_HOST=${envVars.SMTP_HOST || ''}`,
      `SMTP_PORT=${envVars.SMTP_PORT || '587'}`,
      `SMTP_USER=${envVars.SMTP_USER || ''}`,
      `SMTP_PASS=${envVars.SMTP_PASS || ''}`,
      `ADMIN_EMAIL=${envVars.ADMIN_EMAIL || ''}`,
      '',
      '# Application Configuration',
      `NEXT_PUBLIC_BASE_URL=${envVars.NEXT_PUBLIC_BASE_URL || ''}`,
      '',
    ].join('\n');

    // Write to .env.local file
    await fs.writeFile(ENV_FILE_PATH, newEnvContent, 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully. Please restart the server for changes to take effect.' 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

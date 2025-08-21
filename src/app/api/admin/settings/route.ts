import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/settingsService';
import { UserSettingsService } from '@/lib/userSettingsService';
import { verifyRequestToken } from '@/lib/auth';

// Force Node.js runtime
export const runtime = 'nodejs';

/**
 * GET - Retrieve current system and user settings
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and get user ID
    const authResult = verifyRequestToken(request);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    
    // For demo account, return default settings without database interaction
    if (userId === 'demo') {
      const demoResponse = {
        systemSettings: {
          appConfig: {
            baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001',
            systemName: 'Compass Complaint Center (Demo)'
          },
          smtpConfigured: false
        },
        userSettings: {
          emailConfig: {
            notificationEmail: 'demo@example.com',
            receiveNewComplaints: true,
            receiveStatusUpdates: true
          },
          preferences: {
            theme: 'light',
            language: 'en'
          }
        }
      };

      return NextResponse.json({
        success: true,
        data: demoResponse
      });
    }
    
    // Get system-wide SMTP settings (for admin reference only)
    const systemSettings = await SettingsService.getSettings();
    
    // Get user-specific settings
    const userSettings = await UserSettingsService.getUserSettings(userId);
    
    // Return combined settings with user-specific email config taking precedence
    const response = {
      systemSettings: {
        appConfig: systemSettings.appConfig,
        // Only show if SMTP is configured system-wide
        smtpConfigured: systemSettings.emailConfig.isConfigured
      },
      userSettings: {
        emailConfig: userSettings.emailConfig,
        preferences: userSettings.preferences
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * POST - Update user-specific settings
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and get user ID
    const authResult = verifyRequestToken(request);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    
    // Demo account cannot save settings - return success with demo data
    if (userId === 'demo') {
      return NextResponse.json({ 
        success: true, 
        message: 'Demo mode: Settings appear saved but are not persisted.',
        data: {
          userSettings: {
            emailConfig: {
              notificationEmail: 'demo@example.com',
              receiveNewComplaints: true,
              receiveStatusUpdates: true
            },
            preferences: {
              theme: 'light',
              language: 'en'
            }
          }
        }
      });
    }

    const body = await request.json();
    const { emailConfig, preferences, systemSettings } = body;

    let updatedUserSettings;

    // Update user email configuration if provided
    if (emailConfig) {
      updatedUserSettings = await UserSettingsService.updateUserEmailConfig(userId, {
        notificationEmail: emailConfig.notificationEmail,
        receiveNewComplaints: emailConfig.receiveNewComplaints,
        receiveStatusUpdates: emailConfig.receiveStatusUpdates
      });
    }

    // Update user preferences if provided
    if (preferences) {
      updatedUserSettings = await UserSettingsService.updateUserPreferences(userId, preferences);
    }

    // Update system settings if provided (admin only)
    if (systemSettings && authResult.user.role === 'admin') {
      if (systemSettings.app) {
        await SettingsService.updateAppConfig(systemSettings.app);
      }
      
      // System-wide SMTP settings (for the email service to use)
      if (systemSettings.smtp) {
        const emailConfig = {
          smtpHost: systemSettings.smtp.smtpHost,
          smtpPort: parseInt(systemSettings.smtp.smtpPort) || 587,
          smtpUser: systemSettings.smtp.smtpUser,
          adminEmail: 'system@compass.com', // System placeholder
        };

        // Only update password if it's not masked
        if (systemSettings.smtp.smtpPass && systemSettings.smtp.smtpPass !== '••••••••') {
          (emailConfig as any).smtpPass = systemSettings.smtp.smtpPass;
        }

        await SettingsService.updateEmailConfig(emailConfig);
      }
    }

    // Get updated settings
    if (!updatedUserSettings) {
      updatedUserSettings = await UserSettingsService.getUserSettings(userId);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully.',
      data: {
        userSettings: {
          emailConfig: updatedUserSettings.emailConfig,
          preferences: updatedUserSettings.preferences
        }
      }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

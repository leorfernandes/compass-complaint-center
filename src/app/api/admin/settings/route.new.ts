import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/settingsService';

/**
 * GET - Retrieve current system settings
 */
export async function GET() {
  try {
    const settings = await SettingsService.getSettings();
    
    // Mask sensitive information
    const maskedSettings = {
      ...settings.toObject(),
      emailConfig: {
        ...settings.emailConfig,
        smtpPass: settings.emailConfig.smtpPass ? '••••••••' : '',
      }
    };

    return NextResponse.json({
      success: true,
      data: maskedSettings
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
 * POST - Update system settings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, app } = body;

    let updatedSettings;

    // Update email configuration if provided
    if (email) {
      const emailConfig = {
        smtpHost: email.smtpHost,
        smtpPort: parseInt(email.smtpPort) || 587,
        smtpUser: email.smtpUser,
        adminEmail: email.adminEmail,
      };

      // Only update password if it's not masked
      if (email.smtpPass && email.smtpPass !== '••••••••') {
        (emailConfig as any).smtpPass = email.smtpPass;
      }

      updatedSettings = await SettingsService.updateEmailConfig(emailConfig);
    }

    // Update app configuration if provided
    if (app) {
      updatedSettings = await SettingsService.updateAppConfig({
        baseUrl: app.baseUrl,
        systemName: app.systemName,
      });
    }

    // If no updates provided, get current settings
    if (!email && !app) {
      updatedSettings = await SettingsService.getSettings();
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully.',
      data: {
        ...updatedSettings.toObject(),
        emailConfig: {
          ...updatedSettings.emailConfig,
          smtpPass: updatedSettings.emailConfig.smtpPass ? '••••••••' : '',
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

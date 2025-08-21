import Settings from '@/models/Settings';
import connectDB from '@/lib/mongodb';

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  adminEmail: string;
  isConfigured: boolean;
}

export interface AppConfig {
  baseUrl: string;
  systemName: string;
}

export interface SystemSettings {
  emailConfig: EmailConfig;
  appConfig: AppConfig;
  lastUpdated: Date;
}

/**
 * Settings Service for managing application configuration
 */
export class SettingsService {
  
  /**
   * Get current system settings
   */
  static async getSettings(): Promise<SystemSettings> {
    try {
      await connectDB();
      
      let settings = await Settings.findById('system_settings');
      
      // Create default settings if none exist
      if (!settings) {
        settings = new Settings({
          _id: 'system_settings',
          emailConfig: {
            smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
            smtpPort: parseInt(process.env.SMTP_PORT || '587'),
            smtpUser: process.env.SMTP_USER || '',
            smtpPass: process.env.SMTP_PASS || '',
            adminEmail: process.env.ADMIN_EMAIL || '',
            isConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.ADMIN_EMAIL)
          },
          appConfig: {
            baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
            systemName: 'Compass Complaint Center'
          }
        });
        
        await settings.save();
      }
      
      return settings;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw new Error('Failed to retrieve settings');
    }
  }
  
  /**
   * Update email configuration
   */
  static async updateEmailConfig(emailConfig: Partial<EmailConfig>): Promise<SystemSettings> {
    try {
      await connectDB();
      
      const settings = await Settings.findByIdAndUpdate(
        'system_settings',
        {
          $set: {
            'emailConfig.smtpHost': emailConfig.smtpHost,
            'emailConfig.smtpPort': emailConfig.smtpPort,
            'emailConfig.smtpUser': emailConfig.smtpUser,
            'emailConfig.smtpPass': emailConfig.smtpPass,
            'emailConfig.adminEmail': emailConfig.adminEmail,
            'emailConfig.isConfigured': !!(
              emailConfig.smtpUser && 
              emailConfig.smtpPass && 
              emailConfig.adminEmail
            ),
            lastUpdated: new Date()
          }
        },
        { new: true, upsert: true }
      );
      
      return settings;
    } catch (error) {
      console.error('Error updating email config:', error);
      throw new Error('Failed to update email configuration');
    }
  }
  
  /**
   * Update application configuration
   */
  static async updateAppConfig(appConfig: Partial<AppConfig>): Promise<SystemSettings> {
    try {
      await connectDB();
      
      const settings = await Settings.findByIdAndUpdate(
        'system_settings',
        {
          $set: {
            'appConfig.baseUrl': appConfig.baseUrl,
            'appConfig.systemName': appConfig.systemName,
            lastUpdated: new Date()
          }
        },
        { new: true, upsert: true }
      );
      
      return settings;
    } catch (error) {
      console.error('Error updating app config:', error);
      throw new Error('Failed to update application configuration');
    }
  }
  
  /**
   * Get email configuration for email service
   */
  static async getEmailConfig(): Promise<EmailConfig> {
    const settings = await this.getSettings();
    return settings.emailConfig;
  }
  
  /**
   * Test email configuration
   */
  static async testEmailConfig(emailConfig: Partial<EmailConfig>): Promise<boolean> {
    const nodemailer = require('nodemailer');
    
    try {
      const transporter = nodemailer.createTransporter({
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort,
        secure: false,
        auth: {
          user: emailConfig.smtpUser,
          pass: emailConfig.smtpPass,
        },
      });
      
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('Email config test failed:', error);
      return false;
    }
  }
}

import nodemailer from 'nodemailer';
import { EmailNotification } from '@/types';
import { SettingsService } from '@/lib/settingsService';

/**
 * Email Service for sending notifications
 * Uses database-stored configuration for flexible admin control
 */
export class EmailService {

  /**
   * Create email transporter using database settings
   */
  static async createTransporter() {
    try {
      const emailConfig = await SettingsService.getEmailConfig();
      
      if (!emailConfig.isConfigured || !emailConfig.smtpUser || !emailConfig.smtpPass) {
        console.warn('Email configuration not found or incomplete. Email notifications will be disabled.');
        return null;
      }

      return nodemailer.createTransporter({
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort,
        secure: false, // true for 465, false for other ports
        auth: {
          user: emailConfig.smtpUser,
          pass: emailConfig.smtpPass,
        },
      });
    } catch (error) {
      console.error('Failed to create email transporter:', error);
      return null;
    }
  }

  /**
   * Send email using configured SMTP settings
   */
  static async sendEmail(notification: EmailNotification): Promise<boolean> {
    const transporter = await this.createTransporter();
    
    if (!transporter) {
      console.log('Email service not configured. Skipping email notification.');
      return false;
    }

    try {
      const emailConfig = await SettingsService.getEmailConfig();
      
      const mailOptions = {
        from: `"Compass Complaint Center Support" <${emailConfig.smtpUser}>`,
        to: notification.to,
        subject: notification.subject,
        html: notification.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send notification for new complaint
   */
  static async sendNewComplaintNotification(complaint: any): Promise<boolean> {
    try {
      const emailConfig = await SettingsService.getEmailConfig();
      
      if (!emailConfig.adminEmail) {
        console.warn('Admin email not configured. Skipping new complaint notification.');
        return false;
      }

      const notification: EmailNotification = {
        to: emailConfig.adminEmail,
        subject: `🚨 New Complaint Received - ${complaint.title}`,
        html: this.generateNewComplaintEmail(complaint),
        type: 'new_complaint',
      };

      return await this.sendEmail(notification);
    } catch (error) {
      console.error('Error sending new complaint notification:', error);
      return false;
    }
  }

  /**
   * Send notification for status update
   */
  static async sendStatusUpdateNotification(complaint: any, oldStatus: string): Promise<boolean> {
    try {
      const emailConfig = await SettingsService.getEmailConfig();
      
      if (!emailConfig.adminEmail) {
        console.warn('Admin email not configured. Skipping status update notification.');
        return false;
      }

      const notification: EmailNotification = {
        to: emailConfig.adminEmail,
        subject: `📋 Complaint Status Updated - ${complaint.title}`,
        html: this.generateStatusUpdateEmail(complaint, oldStatus),
        type: 'status_update',
      };

      return await this.sendEmail(notification);
    } catch (error) {
      console.error('Error sending status update notification:', error);
      return false;
    }
  }

  /**
   * Test email configuration
   */
  static async testEmailConfiguration(testEmail?: string): Promise<boolean> {
    try {
      const transporter = await this.createTransporter();
      
      if (!transporter) {
        return false;
      }

      const emailConfig = await SettingsService.getEmailConfig();
      const recipient = testEmail || emailConfig.adminEmail;

      if (!recipient) {
        console.error('No recipient email for test');
        return false;
      }

      const testNotification: EmailNotification = {
        to: recipient,
        subject: '🧪 Test Email - Compass Complaint Center',
        html: this.generateTestEmail(),
        type: 'test',
      };

      await this.sendEmail(testNotification);
      console.log('Test email sent successfully');
      return true;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }

  /**
   * Generate HTML template for test email
   */
  private static generateTestEmail(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .footer { background: #1e293b; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; }
          .success-box { background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🧪 Email Configuration Test</h1>
          <p>Your email configuration is working correctly!</p>
        </div>
        
        <div class="content">
          <div class="success-box">
            <h2 style="color: #10b981; margin: 0 0 10px 0;">✅ Success!</h2>
            <p style="margin: 0; color: #065f46;">
              If you're reading this email, your SMTP configuration is working perfectly. 
              Email notifications for new complaints and status updates will be delivered successfully.
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Next Steps:</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li>Email notifications are now active</li>
              <li>You'll receive alerts for new complaints</li>
              <li>Status updates will be sent automatically</li>
              <li>Your email configuration is saved securely</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Compass Complaint Center - Support Portal</p>
          <p style="font-size: 12px; opacity: 0.8;">Test email sent at ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML template for new complaint email
   */
  private static generateNewComplaintEmail(complaint: any): string {
    const priorityColor = {
      Low: '#10b981',
      Medium: '#f59e0b',
      High: '#ef4444',
    }[complaint.priority] || '#6b7280';

    const categoryIcon = {
      Product: '📦',
      Service: '🛎️',
      Support: '💬',
    }[complaint.category] || '📋';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Complaint Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .footer { background: #1e293b; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; }
          .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-weight: bold; font-size: 12px; }
          .detail-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #2563eb; }
          .label { font-weight: bold; color: #1e293b; }
          .value { margin-top: 5px; }
          .description { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚨 New Complaint Received</h1>
          <p>A new complaint has been submitted and requires your attention.</p>
        </div>
        
        <div class="content">
          <div class="detail-row">
            <div class="label">Complaint Title:</div>
            <div class="value"><strong>${complaint.title}</strong></div>
          </div>
          
          <div class="detail-row">
            <div class="label">Category:</div>
            <div class="value">${categoryIcon} ${complaint.category}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Priority Level:</div>
            <div class="value">
              <span class="priority-badge" style="background-color: ${priorityColor};">
                ${complaint.priority}
              </span>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="label">Status:</div>
            <div class="value">${complaint.status}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Date Submitted:</div>
            <div class="value">${new Date(complaint.dateSubmitted).toLocaleString()}</div>
          </div>
          
          <div class="description">
            <div class="label">Description:</div>
            <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${complaint.description}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Compass Complaint Center - Support Portal</p>
          <p style="font-size: 12px; opacity: 0.8;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML template for status update email
   */
  private static generateStatusUpdateEmail(complaint: any, oldStatus: string): string {
    const statusColor = {
      Pending: '#f59e0b',
      'In Progress': '#2563eb',
      Resolved: '#10b981',
    }[complaint.status] || '#6b7280';

    const statusIcon = {
      Pending: '⏳',
      'In Progress': '🔄',
      Resolved: '✅',
    }[complaint.status] || '📋';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complaint Status Updated</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .footer { background: #1e293b; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; }
          .status-update { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid ${statusColor}; }
          .detail-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #10b981; }
          .label { font-weight: bold; color: #1e293b; }
          .value { margin-top: 5px; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Complaint Status Updated</h1>
          <p>The status of a complaint has been updated.</p>
        </div>
        
        <div class="content">
          <div class="status-update">
            <h2>Status Change</h2>
            <p style="margin: 15px 0;">
              <span style="background: #6b7280; color: white; padding: 6px 12px; border-radius: 15px; margin-right: 10px;">${oldStatus}</span>
              <span style="font-size: 18px;">→</span>
              <span class="status-badge" style="background-color: ${statusColor}; margin-left: 10px;">
                ${statusIcon} ${complaint.status}
              </span>
            </p>
          </div>
          
          <div class="detail-row">
            <div class="label">Complaint:</div>
            <div class="value"><strong>${complaint.title}</strong></div>
          </div>
          
          <div class="detail-row">
            <div class="label">Category:</div>
            <div class="value">${complaint.category}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Priority:</div>
            <div class="value">${complaint.priority}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Updated:</div>
            <div class="value">${new Date().toLocaleString()}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Compass Complaint Center - Support Portal</p>
          <p style="font-size: 12px; opacity: 0.8;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }
}

import nodemailer from 'nodemailer';
import { EmailNotification } from '@/types';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email configuration not found. Email notifications will be disabled.');
    return null;
  }

  return nodemailer.createTransport(emailConfig);
};

// Email service class
export class EmailService {
  private static transporter = createTransporter();

  static async sendEmail(notification: EmailNotification): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email service not configured. Skipping email notification.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"Compass Complaint Center Support" <${process.env.SMTP_USER}>`,
        to: notification.to,
        subject: notification.subject,
        html: notification.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Send notification for new complaint
  static async sendNewComplaintNotification(complaint: any): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.warn('Admin email not configured. Skipping new complaint notification.');
      return false;
    }

    const notification: EmailNotification = {
      to: adminEmail,
      subject: `🚨 New Complaint Received - ${complaint.title}`,
      html: this.generateNewComplaintEmail(complaint),
      type: 'new_complaint',
    };

    return await this.sendEmail(notification);
  }

  // Send notification for status update
  static async sendStatusUpdateNotification(complaint: any, oldStatus: string): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.warn('Admin email not configured. Skipping status update notification.');
      return false;
    }

    const notification: EmailNotification = {
      to: adminEmail,
      subject: `📋 Complaint Status Updated - ${complaint.title}`,
      html: this.generateStatusUpdateEmail(complaint, oldStatus),
      type: 'status_update',
    };

    return await this.sendEmail(notification);
  }

  // Generate HTML template for new complaint email
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
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/complaints" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Manage This Complaint
            </a>
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

  // Generate HTML template for status update email
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
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/complaints" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View All Complaints
            </a>
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

  // Test email configuration
  static async testEmailConfiguration(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email configuration is valid');
      return true;
    } catch (error) {
      console.error('Email configuration error:', error);
      return false;
    }
  }
}

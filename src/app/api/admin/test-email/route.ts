import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPass, adminEmail } = await request.json();

    // Validate required fields
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !adminEmail) {
      return NextResponse.json(
        { error: 'All email settings are required for testing' },
        { status: 400 }
      );
    }

    // Create test transporter
    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    const testEmail = {
      from: `"Prime Vacations" <${smtpUser}>`,
      to: adminEmail,
      subject: 'Prime Vacations - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Email Test Successful!</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Congratulations!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Your email configuration is working correctly. The Prime Vacations complaint management 
              system can now send email notifications for:
            </p>
            
            <ul style="color: #666; line-height: 1.8;">
              <li>New complaint submissions</li>
              <li>Complaint status updates</li>
              <li>System notifications</li>
            </ul>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2; font-weight: bold;">
                📧 Email Settings Configured:
              </p>
              <p style="margin: 5px 0 0 0; color: #666; font-family: monospace; font-size: 14px;">
                SMTP Host: ${smtpHost}<br>
                SMTP Port: ${smtpPort}<br>
                SMTP User: ${smtpUser}<br>
                Admin Email: ${adminEmail}
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              You can now safely submit complaints through the system and receive notifications.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                This is an automated test message from Prime Vacations Complaint Management System<br>
                Sent at: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(testEmail);

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully!' 
    });
  } catch (error) {
    console.error('Email test failed:', error);
    
    let errorMessage = 'Failed to send test email';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Invalid email credentials. Please check your username and password.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Unable to connect to SMTP server. Please check your host and port settings.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'SMTP server not found. Please check your host setting.';
      } else {
        errorMessage = `Email error: ${error.message}`;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

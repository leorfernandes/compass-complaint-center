import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    console.log('=== EMAIL DEBUG TEST STARTING ===');
    console.log('Environment variables check:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***HIDDEN***' : 'NOT SET');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

    // Create a test complaint object
    const testComplaint = {
      _id: 'test-complaint-id',
      title: 'Email Test Complaint',
      description: 'This is a test complaint to debug email functionality',
      category: 'Service',
      priority: 'Medium',
      status: 'Pending',
      dateSubmitted: new Date(),
    };

    console.log('Attempting to send test email...');
    await EmailService.sendNewComplaintNotification(testComplaint);
    
    console.log('✅ Email sent successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      config: {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        smtpUser: process.env.SMTP_USER,
        adminEmail: process.env.ADMIN_EMAIL,
      }
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    const errorObj = error as Error;
    console.error('Error details:', {
      message: errorObj.message,
      code: (errorObj as any).code,
      stack: errorObj.stack
    });
    
    return NextResponse.json({
      success: false,
      error: errorObj.message,
      details: {
        code: (errorObj as any).code,
        config: {
          smtpHost: process.env.SMTP_HOST,
          smtpPort: process.env.SMTP_PORT,
          smtpUser: process.env.SMTP_USER,
          adminEmail: process.env.ADMIN_EMAIL,
        }
      }
    }, { status: 500 });
  }
}

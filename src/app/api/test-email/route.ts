import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/emailService';
import { ApiResponse } from '@/types';

// POST /api/test-email - Test email configuration (development only)
export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    const response: ApiResponse = {
      success: false,
      error: 'Email testing is only available in development mode',
    };

    return NextResponse.json(response, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type = 'test' } = body;

    if (type === 'config') {
      // Test email configuration (use 'demo' as default userId for testing)
      const isValid = await EmailService.testEmailConfiguration('demo');
      
      const response: ApiResponse = {
        success: isValid,
        message: isValid ? 'Email configuration is valid' : 'Email configuration is invalid',
      };

      return NextResponse.json(response, { status: isValid ? 200 : 400 });
    }

    if (type === 'new-complaint') {
      // Test new complaint notification
      const testComplaint = {
        _id: 'test-id-123',
        title: 'Test Complaint - Email Notification',
        description: 'This is a test complaint to verify email notifications are working correctly.',
        category: 'Service',
        priority: 'High',
        status: 'Pending',
        dateSubmitted: new Date().toISOString(),
      };

      const emailSent = await EmailService.sendNewComplaintNotification(testComplaint);
      
      const response: ApiResponse = {
        success: emailSent,
        message: emailSent 
          ? 'Test new complaint email sent successfully' 
          : 'Failed to send test email',
      };

      return NextResponse.json(response, { status: emailSent ? 200 : 500 });
    }

    if (type === 'status-update') {
      // Test status update notification
      const testComplaint = {
        _id: 'test-id-456',
        title: 'Test Complaint - Status Update',
        description: 'This is a test complaint to verify status update notifications.',
        category: 'Product',
        priority: 'Medium',
        status: 'Resolved',
        dateSubmitted: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      };

      const emailSent = await EmailService.sendStatusUpdateNotification(testComplaint, 'In Progress');
      
      const response: ApiResponse = {
        success: emailSent,
        message: emailSent 
          ? 'Test status update email sent successfully' 
          : 'Failed to send test email',
      };

      return NextResponse.json(response, { status: emailSent ? 200 : 500 });
    }

    // Default test - check configuration (use 'demo' as default userId for testing)
    const isValid = await EmailService.testEmailConfiguration('demo');
    
    const response: ApiResponse = {
      success: isValid,
      data: {
        configValid: isValid,
        smtpHost: process.env.SMTP_HOST || 'Not configured',
        smtpUser: process.env.SMTP_USER ? 'Configured' : 'Not configured',
        adminEmail: process.env.ADMIN_EMAIL || 'Not configured',
      },
      message: isValid 
        ? 'Email service is ready' 
        : 'Email service is not properly configured',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error testing email:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to test email configuration',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

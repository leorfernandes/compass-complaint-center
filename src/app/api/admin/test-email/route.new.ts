import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/emailService';

/**
 * POST - Test email configuration from database settings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testEmail } = body;

    // Test the email configuration using database settings
    const emailWorking = await EmailService.testEmailConfiguration(testEmail);

    if (emailWorking) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully! Check your inbox.'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email. Please check your SMTP configuration in settings.'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Email test failed. Please verify your configuration and try again.'
    }, { status: 500 });
  }
}

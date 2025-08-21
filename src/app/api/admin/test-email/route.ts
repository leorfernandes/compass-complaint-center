import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/emailService';
import { verifyRequestToken } from '@/lib/auth';

// Force Node.js runtime
export const runtime = 'nodejs';

/**
 * POST - Test email configuration from user-specific settings
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
    const body = await request.json();
    const { testEmail } = body;

    // Test the email configuration using user-specific settings
    const emailWorking = await EmailService.testEmailConfiguration(userId, testEmail);

    if (emailWorking) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully! Check your inbox.'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email. Please check your notification email configuration.'
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

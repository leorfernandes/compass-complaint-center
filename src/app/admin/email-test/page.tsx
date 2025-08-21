'use client';

import { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EmailTestResult {
  success: boolean;
  message: string;
  data?: any;
}

export default function EmailTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<Record<string, EmailTestResult>>({});

  const testEmailFunction = async (type: string, description: string) => {
    setTesting(true);
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const result = await response.json();
      
      setResults(prev => ({
        ...prev,
        [type]: {
          success: result.success,
          message: result.message,
          data: result.data,
        },
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [type]: {
          success: false,
          message: 'Failed to test email function',
        },
      }));
    } finally {
      setTesting(false);
    }
  };

  const TestResult = ({ type, result }: { type: string; result: EmailTestResult }) => (
    <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center mb-2">
        {result.success ? (
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Test
        </span>
      </div>
      <p className={result.success ? 'text-green-700' : 'text-red-700'}>
        {result.message}
      </p>
      {result.data && (
        <div className="mt-2 text-sm">
          <pre className="bg-white p-2 rounded border overflow-x-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-yellow-800 mb-2">Email Testing</h1>
          <p className="text-yellow-700">Email testing is only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email System Testing</h1>
        <p className="text-gray-600">Test email notifications and configuration</p>
        
        <div className="flex gap-2 mt-4">
          <a
            href="/admin"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Admin
          </a>
        </div>
      </div>

      {/* Configuration Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-3">Email Configuration</h2>
        <div className="text-blue-700 space-y-2">
          <p><strong>Required Environment Variables:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><code>SMTP_HOST</code> - SMTP server hostname (e.g., smtp.gmail.com)</li>
            <li><code>SMTP_PORT</code> - SMTP port (usually 587 for TLS)</li>
            <li><code>SMTP_USER</code> - Your email address</li>
            <li><code>SMTP_PASS</code> - Your email password or app password</li>
            <li><code>ADMIN_EMAIL</code> - Email address to receive notifications</li>
          </ul>
          <div className="mt-3 p-3 bg-white rounded border text-xs">
            <strong>Gmail Setup:</strong> For Gmail, enable 2FA and use an App Password instead of your regular password.
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => testEmailFunction('config', 'Test email configuration')}
          disabled={testing}
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {testing ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Test Configuration
        </button>

        <button
          onClick={() => testEmailFunction('new-complaint', 'Test new complaint notification')}
          disabled={testing}
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {testing ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Test New Complaint Email
        </button>

        <button
          onClick={() => testEmailFunction('status-update', 'Test status update notification')}
          disabled={testing}
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {testing ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Test Status Update Email
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Test Results</h2>
        
        {Object.keys(results).length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
            No tests run yet. Click a test button above to begin.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(results).map(([type, result]) => (
              <TestResult key={type} type={type} result={result} />
            ))}
          </div>
        )}
      </div>

      {/* Email Samples */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Email Templates</h2>
        <p className="text-gray-600 text-sm mb-4">
          The system sends two types of emails:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-medium text-gray-800 mb-2">🚨 New Complaint Notification</h3>
            <p className="text-sm text-gray-600">
              Sent to admin when a new complaint is submitted. Includes complaint details, priority, and direct link to manage.
            </p>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-medium text-gray-800 mb-2">📋 Status Update Notification</h3>
            <p className="text-sm text-gray-600">
              Sent to admin when a complaint status is changed. Shows old status, new status, and update timestamp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface UserEmailConfig {
  notificationEmail: string;
  receiveNewComplaints: boolean;
  receiveStatusUpdates: boolean;
}

interface UserSettings {
  emailConfig: UserEmailConfig;
}

interface SystemSettings {
  appConfig: {
    baseUrl: string;
    systemName: string;
  };
  smtpConfigured: boolean;
}

interface SettingsData {
  userSettings: UserSettings;
  systemSettings: SystemSettings;
}

export default function UserSettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    emailConfig: {
      notificationEmail: '',
      receiveNewComplaints: true,
      receiveStatusUpdates: true,
    }
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    appConfig: {
      baseUrl: '',
      systemName: 'Compass Complaint Center'
    },
    smtpConfigured: false
  });

  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        const settingsData = data.data as SettingsData;
        
        setUserSettings(settingsData.userSettings);
        setSystemSettings(settingsData.systemSettings);
      } else {
        throw new Error('Failed to load settings');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    }
  };

  const saveUserSettings = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailConfig: userSettings.emailConfig,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Your notification settings saved successfully!' });
        // Reload to get fresh data
        await loadSettings();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const testEmailSettings = async () => {
    setTestingEmail(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail: userSettings.emailConfig.notificationEmail
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Test email sent successfully! Check your inbox.' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send test email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test email settings' });
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">User Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your personal notification preferences and email settings
            </p>
          </div>

          <div className="p-6">
            {/* System Status Info */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  systemSettings.smtpConfigured ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <h3 className="font-semibold text-blue-900">System Email Status</h3>
                  <p className="text-blue-700 text-sm">
                    {systemSettings.smtpConfigured 
                      ? '✅ Email system is configured and ready to send notifications'
                      : '⚠️ System email not fully configured - contact administrator'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* User-Specific Demo Account Warning */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-yellow-800">Demo Account Notice</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    This is a demo account. Your email settings are personal to you and will be cleared 
                    when you log out. This ensures privacy between different users of this demo system.
                  </p>
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Email Notification Settings */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📧 Personal Email Notifications
                </h2>
                
                {/* Notification Email */}
                <div className="mb-6">
                  <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Email Address
                  </label>
                  <input
                    type="email"
                    id="notificationEmail"
                    value={userSettings.emailConfig.notificationEmail}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      emailConfig: {
                        ...prev.emailConfig,
                        notificationEmail: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address to receive notifications"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This email will receive complaint notifications. Leave blank to disable email notifications for your account.
                  </p>
                </div>

                {/* Notification Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="receiveNewComplaints"
                      checked={userSettings.emailConfig.receiveNewComplaints}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        emailConfig: {
                          ...prev.emailConfig,
                          receiveNewComplaints: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="receiveNewComplaints" className="ml-2 text-sm text-gray-700">
                      📨 Receive notifications for new complaints
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="receiveStatusUpdates"
                      checked={userSettings.emailConfig.receiveStatusUpdates}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        emailConfig: {
                          ...prev.emailConfig,
                          receiveStatusUpdates: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="receiveStatusUpdates" className="ml-2 text-sm text-gray-700">
                      📋 Receive notifications for complaint status updates
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={saveUserSettings}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    '💾 Save Settings'
                  )}
                </button>

                <button
                  onClick={testEmailSettings}
                  disabled={testingEmail || !userSettings.emailConfig.notificationEmail || !systemSettings.smtpConfigured}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {testingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Test...
                    </>
                  ) : (
                    '🧪 Send Test Email'
                  )}
                </button>

                <button
                  onClick={loadSettings}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center"
                >
                  🔄 Refresh Settings
                </button>
              </div>

              {/* Help Text */}
              <div className="pt-4 text-sm text-gray-500">
                <h3 className="font-medium text-gray-700 mb-2">💡 How it works:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Each user has their own personal notification email settings</li>
                  <li>You can set a different email address than your login email for notifications</li>
                  <li>Choose which types of notifications you want to receive</li>
                  <li>Demo account settings are cleared on each login for privacy</li>
                  <li>Test emails help verify your configuration is working</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  adminEmail: string;
}

interface DatabaseSettings {
  mongodbUri: string;
  connectionStatus: 'connected' | 'disconnected' | 'testing';
}

interface AppSettings {
  baseUrl: string;
}

export default function SettingsPage() {
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    adminEmail: '',
  });

  const [databaseSettings, setDatabaseSettings] = useState<DatabaseSettings>({
    mongodbUri: '',
    connectionStatus: 'disconnected',
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    baseUrl: '',
  });

  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingDatabase, setTestingDatabase] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setEmailSettings(data.email || emailSettings);
        setDatabaseSettings(data.database || databaseSettings);
        setAppSettings(data.app || appSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailSettings,
          database: databaseSettings,
          app: appSettings,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
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
        body: JSON.stringify(emailSettings),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Test email sent successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send test email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test email settings' });
    } finally {
      setTestingEmail(false);
    }
  };

  const testDatabaseConnection = async () => {
    setTestingDatabase(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/test-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mongodbUri: databaseSettings.mongodbUri }),
      });

      const result = await response.json();

      if (response.ok) {
        setDatabaseSettings(prev => ({ ...prev, connectionStatus: 'connected' }));
        setMessage({ type: 'success', text: 'Database connection successful!' });
      } else {
        setDatabaseSettings(prev => ({ ...prev, connectionStatus: 'disconnected' }));
        setMessage({ type: 'error', text: result.error || 'Database connection failed' });
      }
    } catch (error) {
      setDatabaseSettings(prev => ({ ...prev, connectionStatus: 'disconnected' }));
      setMessage({ type: 'error', text: 'Failed to test database connection' });
    } finally {
      setTestingDatabase(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure your system settings and integrations</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'error' 
            ? 'border-red-200 bg-red-50 text-red-800' 
            : 'border-green-200 bg-green-50 text-green-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {message.type === 'error' ? '❌' : '✅'}
            </span>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📧 Email
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'database'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🗄️ Database
          </button>
          <button
            onClick={() => setActiveTab('app')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'app'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🌐 Application
          </button>
        </div>
      </div>

      {/* Email Tab */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">📧 Email Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">Configure SMTP settings for sending email notifications</p>
          </div>
          
          {/* Two-column layout: Form on left, Guide on right */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Email Form - Left side (2/3 width) */}
            <div className="lg:col-span-2 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                <input
                  type="text"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                <input
                  type="text"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                  placeholder="587"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">SMTP Username (Email)</label>
              <input
                type="email"
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                placeholder="your-email@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">SMTP Password (App Password)</label>
              <input
                type="password"
                value={emailSettings.smtpPass}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPass: e.target.value }))}
                placeholder="Your app password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500">
                For Gmail: Enable 2FA and generate an App Password
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Admin Email</label>
              <input
                type="email"
                value={emailSettings.adminEmail}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                placeholder="admin@primevacations.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500">
                Email address to receive complaint notifications
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={testEmailSettings} 
                disabled={testingEmail || !emailSettings.smtpUser || !emailSettings.smtpPass}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🧪 {testingEmail ? 'Testing...' : 'Test Email'}
              </button>
              <button 
                onClick={saveSettings} 
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
            </div>

            {/* Email Setup Guide - Right sidebar (1/3 width) */}
            <div className="lg:col-span-1 p-6 bg-gray-50 border-l">
              <div className="sticky top-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="text-xl mr-2">📖</span>
                  Setup Guide
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                      <span className="text-lg mr-2">📧</span>
                      Gmail (Recommended)
                    </h4>
                    <div className="text-xs space-y-1 text-gray-700">
                      <p><strong>Host:</strong> smtp.gmail.com</p>
                      <p><strong>Port:</strong> 587</p>
                      <p><strong>Password:</strong> App Password</p>
                    </div>
                    <details className="mt-3">
                      <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                        App Password Steps →
                      </summary>
                      <ol className="mt-2 text-xs text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Enable 2FA on Google Account</li>
                        <li>Go to Security → App passwords</li>
                        <li>Generate password for "Mail"</li>
                        <li>Use 16-char code above</li>
                      </ol>
                    </details>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center">
                      <span className="text-lg mr-2">🌐</span>
                      Other Providers
                    </h4>
                    <div className="space-y-2 text-xs text-gray-700">
                      <div>
                        <p className="font-medium">Outlook:</p>
                        <p>smtp-mail.outlook.com:587</p>
                      </div>
                      <div>
                        <p className="font-medium">Yahoo:</p>
                        <p>smtp.mail.yahoo.com:587</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-900 mb-1 text-sm">💡 Tips</h4>
                    <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
                      <li>Use App Passwords for security</li>
                      <li>Port 587 is recommended</li>
                      <li>Test settings after saving</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                    <h4 className="font-semibold text-yellow-900 mb-1 text-sm">⚠️ Issues?</h4>
                    <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                      <li>Check SMTP host/port</li>
                      <li>Verify App Password</li>
                      <li>Enable "Less secure apps" if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">🗄️ Database Configuration</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">MongoDB Connection URI</label>
              <input
                type="password"
                value={databaseSettings.mongodbUri}
                onChange={(e) => setDatabaseSettings(prev => ({ ...prev, mongodbUri: e.target.value }))}
                placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500">
                Your MongoDB Atlas connection string
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Connection Status:</span>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                databaseSettings.connectionStatus === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <span>
                  {databaseSettings.connectionStatus === 'connected' ? '✅' : '❌'}
                </span>
                {databaseSettings.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={testDatabaseConnection} 
                disabled={testingDatabase || !databaseSettings.mongodbUri}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🧪 {testingDatabase ? 'Testing...' : 'Test Connection'}
              </button>
              <button 
                onClick={saveSettings} 
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Tab */}
      {activeTab === 'app' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">🌐 Application Configuration</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Base URL</label>
              <input
                type="text"
                value={appSettings.baseUrl}
                onChange={(e) => setAppSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="http://localhost:3000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500">
                The base URL of your application (used in email links)
              </p>
            </div>

            <button 
              onClick={saveSettings} 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/auth';

interface NavigationProps {
  isAdmin?: boolean;
}

export default function Navigation({ isAdmin = false }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  // Override isAdmin based on actual user role if authenticated
  const actualIsAdmin = isAuthenticated ? user?.role === UserRole.ADMIN : isAdmin;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link href={actualIsAdmin ? "/admin" : "/"} className="text-xl font-bold text-gray-900 hover:text-gray-700">
              🧭 Compass Complaint Center
            </Link>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              actualIsAdmin 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {actualIsAdmin ? '🔐 Admin Panel' : '👤 Customer Portal'}
            </span>
            {isAuthenticated && user && (
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
            )}
          </div>
          
          <nav className="flex space-x-4 items-center">
            {actualIsAdmin ? (
              // Admin Navigation
              <>
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/admin/complaints"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/complaints' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 Manage Complaints
                </Link>
                <Link
                  href="/admin/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/settings' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ⚙️ Settings
                </Link>
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  👁️ View Site
                </Link>
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-900 border border-red-300 hover:border-red-500"
                  >
                    🚪 Logout
                  </button>
                )}
              </>
            ) : (
              // User Navigation
              <>
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🏠 Home
                </Link>
                <Link
                  href="/complaints"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/complaints' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 View Complaints
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/submit-complaint"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === '/submit-complaint' 
                          ? 'bg-green-100 text-green-700' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      ✍️ Submit Complaint
                    </Link>
                    <Link
                      href="/my-complaints"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === '/my-complaints' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📄 My Complaints
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-900 border border-red-300 hover:border-red-500"
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      🔑 Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                      📝 Register
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}

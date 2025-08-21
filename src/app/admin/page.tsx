'use client';

import { useState, useEffect } from 'react';
import { ComplaintData, ComplaintFilters } from '@/types';
import { ComplaintAPI, handleApiError } from '@/utils/api';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * Dashboard statistics interface for admin overview
 */
interface DashboardStats {
  total: number;
  byStatus: {
    Pending: number;
    'In Progress': number;
    Resolved: number;
  };
  byPriority: {
    Low: number;
    Medium: number;
    High: number;
  };
  byCategory: {
    Product: number;
    Service: number;
    Support: number;
  };
  recentComplaints: number;
}

/**
 * Admin Dashboard Component
 * 
 * Displays comprehensive statistics and recent complaints for admin users.
 * Includes complaint counts by status, priority, category, and a list of
 * recent submissions for quick review.
 * 
 * @returns JSX.Element - The admin dashboard interface
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch statistics
      const statsResult = await ComplaintAPI.getStats();
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      } else {
        setError('Failed to load statistics: ' + handleApiError(statsResult));
      }

      // Fetch recent complaints (last 10)
      const complaintsResult = await ComplaintAPI.getComplaints({
        sortBy: 'dateSubmitted',
        sortOrder: 'desc',
      });
      
      if (complaintsResult.success && complaintsResult.data && Array.isArray(complaintsResult.data.complaints)) {
        setRecentComplaints(complaintsResult.data.complaints.slice(0, 10));
      } else {
        setRecentComplaints([]); // Ensure it's always an array
        if (!statsResult.success) {
          setError('Failed to load dashboard data: ' + handleApiError(complaintsResult));
        }
      }

    } catch (err) {
      setStats(null);
      setRecentComplaints([]);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = 'blue',
    subtitle 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color?: string;
    subtitle?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
        <p className="text-red-700 mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage and monitor all complaints</p>
        
        <div className="flex gap-4 mt-4">
          <a
            href="/admin/complaints"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Complaints
          </a>
          {process.env.NODE_ENV === 'development' && (
            <a
              href="/admin/email-test"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Test Email System
            </a>
          )}
          <a
            href="/"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Complaints"
            value={stats?.total || 0}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          
          <StatCard
            title="Pending"
            value={stats?.byStatus.Pending || 0}
            color="yellow"
            subtitle="Requires attention"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
          <StatCard
            title="In Progress"
            value={stats?.byStatus['In Progress'] || 0}
            color="blue"
            subtitle="Being resolved"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          
          <StatCard
            title="Resolved"
            value={stats?.byStatus.Resolved || 0}
            color="green"
            subtitle="Completed"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Priority and Category Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Priority Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">By Priority</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  High Priority
                </span>
                <span className="font-semibold">{stats?.byPriority.High || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  Medium Priority
                </span>
                <span className="font-semibold">{stats?.byPriority.Medium || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Low Priority
                </span>
                <span className="font-semibold">{stats?.byPriority.Low || 0}</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">By Category</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Product
                </span>
                <span className="font-semibold">{stats?.byCategory.Product || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  Service
                </span>
                <span className="font-semibold">{stats?.byCategory.Service || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                  Support
                </span>
                <span className="font-semibold">{stats?.byCategory.Support || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Recent Complaints</h2>
          <a
            href="/admin/complaints"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {recentComplaints.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No complaints found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complaint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentComplaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {complaint.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {complaint.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {complaint.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={complaint.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(complaint.dateSubmitted)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ComplaintData, ComplaintFilters, ComplaintStatus } from '@/types';
import { ComplaintAPI, handleApiError } from '@/utils/api';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import BulkActions from '@/components/BulkActions';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<ComplaintFilters>({});
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [complaints, filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await ComplaintAPI.getComplaints({
        sortBy: 'dateSubmitted',
        sortOrder: 'desc',
      });

      if (result.success && result.data && Array.isArray(result.data.complaints)) {
        setComplaints(result.data.complaints); // Access the nested complaints array
      } else {
        setComplaints([]); // Ensure it's always an array
        setError(handleApiError(result) || 'No complaints data received');
      }
    } catch (err) {
      setComplaints([]); // Ensure it's always an array
      setError('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!Array.isArray(complaints)) {
      setFilteredComplaints([]);
      return;
    }
    
    let filtered = [...complaints];

    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(c => c.priority === filters.priority);
    }

    if (filters.category) {
      filtered = filtered.filter(c => c.category === filters.category);
    }

    setFilteredComplaints(filtered);
  };

  const handleFilterChange = (key: keyof ComplaintFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleSelectComplaint = (complaintId: string) => {
    setSelectedComplaints(prev => 
      prev.includes(complaintId)
        ? prev.filter(id => id !== complaintId)
        : [...prev, complaintId]
    );
  };

  const handleSelectAll = () => {
    if (selectedComplaints.length === filteredComplaints.length) {
      setSelectedComplaints([]);
    } else {
      setSelectedComplaints(filteredComplaints.map(c => c._id));
    }
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: ComplaintStatus) => {
    setIsUpdating(true);

    try {
      const result = await ComplaintAPI.updateComplaint(complaintId, { status: newStatus });

      if (result.success) {
        // Update the complaint in our local state
        setComplaints(prev => 
          prev.map(complaint => 
            complaint._id === complaintId 
              ? { ...complaint, status: newStatus }
              : complaint
          )
        );

        // Update selected complaint if it's the one being updated
        if (selectedComplaint?._id === complaintId) {
          setSelectedComplaint(prev => prev ? { ...prev, status: newStatus } : null);
        }
      } else {
        alert(`Failed to update status: ${handleApiError(result)}`);
      }
    } catch (err) {
      alert('Failed to update complaint status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (complaintId: string) => {
    if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(complaintId);

    try {
      const result = await ComplaintAPI.deleteComplaint(complaintId);

      if (result.success) {
        // Remove from local state
        setComplaints(prev => prev.filter(c => c._id !== complaintId));
        
        // Close modal if this complaint was selected
        if (selectedComplaint?._id === complaintId) {
          setSelectedComplaint(null);
        }
      } else {
        alert(`Failed to delete complaint: ${handleApiError(result)}`);
      }
    } catch (err) {
      alert('Failed to delete complaint');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const ComplaintModal = ({ complaint, onClose }: { complaint: ComplaintData; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">Complaint Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <p className="text-gray-900 font-semibold">{complaint.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-900">{complaint.category}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <PriorityBadge priority={complaint.priority} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                <StatusBadge status={complaint.status} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Submitted</label>
                <p className="text-gray-900">{formatDate(complaint.dateSubmitted)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
              <div className="flex gap-2">
                {(['Pending', 'In Progress', 'Resolved'] as ComplaintStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(complaint._id, status)}
                    disabled={isUpdating || complaint.status === status}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-colors
                      ${complaint.status === status 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }
                      ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {isUpdating ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={() => handleDelete(complaint._id)}
                disabled={isDeleting === complaint._id}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting === complaint._id ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Complaint'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading complaints...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Complaints</h1>
            <p className="text-gray-600">View, update, and manage all customer complaints</p>
          </div>
          
          <div className="flex gap-2">
            <a
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filter Complaints</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Product">Product</option>
              <option value="Service">Service</option>
              <option value="Support">Support</option>
            </select>
          </div>

          <div className="flex items-end">
            {(filters.status || filters.priority || filters.category) && (
              <button
                onClick={() => setFilters({})}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchComplaints}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      <BulkActions
        selectedComplaints={selectedComplaints}
        complaints={complaints}
        onActionComplete={fetchComplaints}
        onClearSelection={() => setSelectedComplaints([])}
      />

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {complaints.length === 0 ? (
              <>
                <p className="text-lg">No complaints yet</p>
                <p className="text-sm mt-1 text-gray-400">When users submit complaints, they'll appear here</p>
              </>
            ) : (
              <>
                <p className="text-lg">No complaints match your filters</p>
                <p className="text-sm mt-1 text-gray-400">Try adjusting your filters to see more results</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedComplaints.length === filteredComplaints.length && filteredComplaints.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedComplaints.includes(complaint._id)}
                        onChange={() => handleSelectComplaint(complaint._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {complaint.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => handleDelete(complaint._id)}
                        disabled={isDeleting === complaint._id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {isDeleting === complaint._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
}

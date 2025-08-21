'use client';

import { useState } from 'react';
import { ComplaintData, ComplaintStatus } from '@/types';
import { ComplaintAPI, handleApiError } from '@/utils/api';
import LoadingSpinner from './LoadingSpinner';

interface BulkActionsProps {
  selectedComplaints: string[];
  complaints: ComplaintData[];
  onActionComplete: () => void;
  onClearSelection: () => void;
}

export default function BulkActions({
  selectedComplaints,
  complaints,
  onActionComplete,
  onClearSelection,
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');

  if (selectedComplaints.length === 0) {
    return null;
  }

  const handleBulkStatusUpdate = async (newStatus: ComplaintStatus) => {
    if (!confirm(`Are you sure you want to update ${selectedComplaints.length} complaints to "${newStatus}"?`)) {
      return;
    }

    setIsProcessing(true);
    setCurrentAction(`Updating to ${newStatus}`);

    try {
      const updates = selectedComplaints.map(id => 
        ComplaintAPI.updateComplaint(id, { status: newStatus })
      );

      const results = await Promise.allSettled(updates);
      
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;

      const failed = results.length - successful;

      if (failed === 0) {
        alert(`Successfully updated ${successful} complaints to "${newStatus}"`);
      } else {
        alert(`Updated ${successful} complaints successfully. ${failed} failed to update.`);
      }

      onActionComplete();
      onClearSelection();
    } catch (error) {
      alert('Failed to update complaints');
    } finally {
      setIsProcessing(false);
      setCurrentAction('');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedComplaints.length} complaints? This action cannot be undone.`)) {
      return;
    }

    setIsProcessing(true);
    setCurrentAction('Deleting complaints');

    try {
      const deletions = selectedComplaints.map(id => 
        ComplaintAPI.deleteComplaint(id)
      );

      const results = await Promise.allSettled(deletions);
      
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;

      const failed = results.length - successful;

      if (failed === 0) {
        alert(`Successfully deleted ${successful} complaints`);
      } else {
        alert(`Deleted ${successful} complaints successfully. ${failed} failed to delete.`);
      }

      onActionComplete();
      onClearSelection();
    } catch (error) {
      alert('Failed to delete complaints');
    } finally {
      setIsProcessing(false);
      setCurrentAction('');
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800 font-medium">
              {selectedComplaints.length} complaint{selectedComplaints.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          {isProcessing && (
            <div className="flex items-center text-blue-700">
              <LoadingSpinner size="sm" className="mr-2" />
              <span className="text-sm">{currentAction}...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onClearSelection}
            disabled={isProcessing}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
          >
            Clear Selection
          </button>

          <div className="h-4 border-l border-blue-300"></div>

          {/* Status Update Buttons */}
          <button
            onClick={() => handleBulkStatusUpdate('Pending')}
            disabled={isProcessing}
            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark Pending
          </button>

          <button
            onClick={() => handleBulkStatusUpdate('In Progress')}
            disabled={isProcessing}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark In Progress
          </button>

          <button
            onClick={() => handleBulkStatusUpdate('Resolved')}
            disabled={isProcessing}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark Resolved
          </button>

          <div className="h-4 border-l border-blue-300"></div>

          <button
            onClick={handleBulkDelete}
            disabled={isProcessing}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Selected
          </button>
        </div>
      </div>
    </div>
  );
}

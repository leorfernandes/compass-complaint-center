'use client';

import { ComplaintData } from '@/types';
import { StatusBadge, PriorityBadge } from './StatusBadge';

interface ComplaintListProps {
  complaints: ComplaintData[];
  onComplaintClick?: (complaint: ComplaintData) => void;
  className?: string;
}

export default function ComplaintList({ 
  complaints, 
  onComplaintClick,
  className = '' 
}: ComplaintListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (complaints.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">No complaints found</p>
        <p className="text-gray-400 text-sm mt-1">Complaints will appear here when submitted</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {complaints.map((complaint) => (
        <div
          key={complaint._id}
          className={`
            bg-white border border-gray-200 rounded-lg p-4 shadow-sm
            ${onComplaintClick ? 'cursor-pointer hover:shadow-md hover:border-blue-300 transition-all' : ''}
          `}
          onClick={() => onComplaintClick?.(complaint)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {complaint.title}
              </h3>
              
              <p className="text-gray-600 mb-3">
                {truncateText(complaint.description, 150)}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(complaint.dateSubmitted)}
                </span>
                
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {complaint.category}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2 ml-4">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

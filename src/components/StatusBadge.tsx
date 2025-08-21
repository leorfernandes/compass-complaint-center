import { ComplaintStatus, ComplaintPriority } from '@/types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusStyles = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${getStatusStyles(status)} ${className}
    `}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const getPriorityStyles = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${getPriorityStyles(priority)} ${className}
    `}>
      {priority}
    </span>
  );
}

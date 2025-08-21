// Types for our complaint system

export type ComplaintCategory = 'Product' | 'Service' | 'Support';
export type ComplaintPriority = 'Low' | 'Medium' | 'High';
export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface ComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
}

export interface ComplaintData extends ComplaintFormData {
  _id: string;
  status: ComplaintStatus;
  dateSubmitted: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Filter types for admin dashboard
export interface ComplaintFilters {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  category?: ComplaintCategory;
}

// Pagination information
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Response structure for complaints list
export interface ComplaintsResponse {
  complaints: ComplaintData[];
  pagination: PaginationInfo;
}

// Email notification types
export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  type: 'new_complaint' | 'status_update';
}

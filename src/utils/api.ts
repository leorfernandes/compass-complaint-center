import { ComplaintFormData, ComplaintData, ApiResponse, ComplaintFilters, ComplaintsResponse } from '@/types';

const BASE_URL = typeof window !== 'undefined' 
  ? '' // Use relative URLs in browser
  : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * API client for complaint operations
 * Provides methods for CRUD operations on complaints with proper error handling
 */
export class ComplaintAPI {
  
  /**
   * Helper method for making HTTP requests with error handling
   * @param url - The API endpoint URL (relative path)
   * @param options - Fetch options including method, headers, body
   * @returns Promise resolving to standardized API response
   */
  private static async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  /**
   * Create a new complaint
   * @param data - Complaint form data including title, description, category, priority
   * @returns Promise resolving to API response with created complaint data
   */
  static async createComplaint(data: ComplaintFormData): Promise<ApiResponse<ComplaintData>> {
    return this.makeRequest<ComplaintData>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all complaints with optional filtering and sorting
   * @param filters - Optional filters for status, priority, category, and sorting
   * @returns Promise resolving to API response with complaints array and pagination
   */
  static async getComplaints(filters?: ComplaintFilters & {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<ComplaintsResponse>> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = `/api/complaints${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<ComplaintsResponse>(url);
  }

  // Get a specific complaint by ID
  static async getComplaint(id: string): Promise<ApiResponse<ComplaintData>> {
    return this.makeRequest<ComplaintData>(`/api/complaints/${id}`);
  }

  // Update a complaint (mainly for status updates)
  static async updateComplaint(
    id: string, 
    updates: Partial<ComplaintData>
  ): Promise<ApiResponse<ComplaintData>> {
    return this.makeRequest<ComplaintData>(`/api/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Delete a complaint
  static async deleteComplaint(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/complaints/${id}`, {
      method: 'DELETE',
    });
  }

  // Get complaint statistics
  static async getStats(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/complaints/stats');
  }
}

// Helper function for error handling
export const handleApiError = (error: any): string => {
  if (error?.error) {
    return error.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

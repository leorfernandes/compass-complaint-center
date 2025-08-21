import { z } from 'zod';

// Schema for complaint form validation
export const complaintSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description cannot exceed 1000 characters')
    .trim(),
  category: z.enum(['service', 'product', 'billing', 'technical', 'other'], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Please select a valid priority' })
  }),
  customerName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  customerEmail: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters')
    .toLowerCase()
    .trim(),
  customerPhone: z.string()
    .regex(/^[\+]?[(]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

// Schema for status update validation
export const statusUpdateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }),
  adminNotes: z.string()
    .max(500, 'Admin notes cannot exceed 500 characters')
    .optional(),
});

// Schema for query parameters
export const queryParamsSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  category: z.enum(['service', 'product', 'billing', 'technical', 'other']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  search: z.string().max(100).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type ComplaintInput = z.infer<typeof complaintSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
export type QueryParams = z.infer<typeof queryParamsSchema>;

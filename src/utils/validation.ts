import { ComplaintFormData, ComplaintCategory, ComplaintPriority } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateComplaintData = (data: Partial<ComplaintFormData>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate title
  if (!data.title || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (data.title.length > 100) {
    errors.push({ field: 'title', message: 'Title cannot exceed 100 characters' });
  }

  // Validate description
  if (!data.description || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (data.description.length > 1000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters' });
  }

  // Validate category
  const validCategories: ComplaintCategory[] = ['Product', 'Service', 'Support'];
  if (!data.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else if (!validCategories.includes(data.category)) {
    errors.push({ field: 'category', message: 'Invalid category selected' });
  }

  // Validate priority
  const validPriorities: ComplaintPriority[] = ['Low', 'Medium', 'High'];
  if (!data.priority) {
    errors.push({ field: 'priority', message: 'Priority is required' });
  } else if (!validPriorities.includes(data.priority)) {
    errors.push({ field: 'priority', message: 'Invalid priority selected' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

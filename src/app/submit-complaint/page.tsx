'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ComplaintFormData, ComplaintCategory, ComplaintPriority } from '@/types';
import { ComplaintAPI, handleApiError } from '@/utils/api';
import { validateComplaintData } from '@/utils/validation';

export default function SubmitComplaint() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ComplaintFormData>({
    title: '',
    description: '',
    category: 'Service',
    priority: 'Medium',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories: ComplaintCategory[] = ['Product', 'Service', 'Support'];
  const priorities: ComplaintPriority[] = ['Low', 'Medium', 'High'];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate form data
    const validation = validateComplaintData(formData);
    
    if (!validation.isValid) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.forEach(error => {
        fieldErrors[error.field] = error.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit complaint
      const result = await ComplaintAPI.createComplaint(formData);

      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
          title: '',
          description: '',
          category: 'Service',
          priority: 'Medium',
        });
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrors({ general: handleApiError(result) });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Complaint Submitted Successfully!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Thank you for your feedback. We have received your complaint and will review it promptly. You should receive a confirmation email shortly.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setSubmitSuccess(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Another Complaint
            </button>
            <div className="mt-4">
              <a href="/" className="text-blue-600 hover:text-blue-800 underline">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation isAdmin={false} />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Submit a Complaint</h1>
            <p className="text-blue-100 mt-2">
              We're here to help resolve your concerns
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Complaint Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Please provide as much detail as possible to help us address your concern effectively.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Complaint Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Complaint Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief summary of your complaint"
              maxLength={100}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            <p className="mt-1 text-sm text-gray-500">{formData.title.length}/100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Please provide detailed information about your complaint..."
              maxLength={1000}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-sm text-gray-500">{formData.description.length}/1000 characters</p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>Product:</strong> Issues with hotel amenities, room facilities, or physical items</p>
              <p><strong>Service:</strong> Problems with staff service, housekeeping, or customer care</p>
              <p><strong>Support:</strong> Issues with booking, billing, or customer support</p>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority Level *
            </label>
            <div className="space-y-2">
              {priorities.map(priority => (
                <label key={priority} className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={handleInputChange}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`font-medium ${getPriorityColor(priority)}`}>
                    {priority}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    {priority === 'Low' && '- Minor issue, can wait for resolution'}
                    {priority === 'Medium' && '- Moderate issue, needs attention'}
                    {priority === 'High' && '- Urgent issue, requires immediate attention'}
                  </span>
                </label>
              ))}
            </div>
            {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Complaint'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}

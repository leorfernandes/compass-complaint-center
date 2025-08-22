import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { validateComplaintData, sanitizeInput } from '@/utils/validation';
import { ComplaintCategory, ComplaintPriority } from '@/types';
import { ComplaintFormData, ApiResponse, ComplaintFilters } from '@/types';
import { EmailService } from '@/lib/emailService';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { complaintSchema, queryParamsSchema } from '@/lib/validation';
import { isDatabaseAvailable, filterMockComplaints } from '@/lib/mockData';

// Force Node.js runtime
export const runtime = 'nodejs';

// GET /api/complaints - Retrieve all complaints (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const isDbAvailable = await isDatabaseAvailable();
    
    if (!isDbAvailable) {
      // Use mock data when database is not available
      const { searchParams } = new URL(request.url);
      
      const filters: any = {};
      if (searchParams.get('status')) {
        filters.status = searchParams.get('status');
      }
      if (searchParams.get('priority')) {
        filters.priority = searchParams.get('priority');
      }
      if (searchParams.get('category')) {
        filters.category = searchParams.get('category');
      }

      const sortBy = searchParams.get('sortBy') || 'dateSubmitted';
      const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

      const complaints = filterMockComplaints(filters, sortBy, sortOrder);

      const response: ApiResponse = {
        success: true,
        data: complaints,
        message: `Found ${complaints.length} complaints (using mock data)`,
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Database is available, use real data
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Build filter object from query parameters
    const filters: any = {};
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status');
    }
    
    if (searchParams.get('priority')) {
      filters.priority = searchParams.get('priority');
    }
    
    if (searchParams.get('category')) {
      filters.category = searchParams.get('category');
    }

    // Add user email filter for user-specific complaints
    if (searchParams.get('userEmail')) {
      filters.userEmail = searchParams.get('userEmail');
    }

    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Get sorting parameters
    const sortBy = searchParams.get('sortBy') || 'dateSubmitted';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Execute query with filters, sorting, and pagination
    const complaints = await Complaint.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance when we don't need mongoose document methods

    // Get total count for pagination
    const total = await Complaint.countDocuments(filters);

    const response: ApiResponse = {
      success: true,
      data: {
        complaints,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      },
      message: `Found ${complaints.length} complaints`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch complaints',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/complaints - Create a new complaint
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 submissions per 15 minutes per IP
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
    });

    const clientIP = getClientIP(request);
    const rateLimitResult = limiter(clientIP);

    if (!rateLimitResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Too many requests. Please try again later.',
      };
      
      return NextResponse.json(response, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        }
      });
    }

    const isDbAvailable = await isDatabaseAvailable();
    
    if (!isDbAvailable) {
      const response: ApiResponse = {
        success: false,
        error: 'Database service is currently unavailable. Please try again later.',
      };
      
      return NextResponse.json(response, { status: 503 });
    }

    await connectDB();

    const body: ComplaintFormData = await request.json();

    // Get user info from JWT headers (added by middleware)
    const userEmail = request.headers.get('x-user-email');
    const userId = request.headers.get('x-user-id');

    // Sanitize input data
    const sanitizedData = {
      title: sanitizeInput(body.title || ''),
      description: sanitizeInput(body.description || ''),
      category: sanitizeInput(body.category || '') as ComplaintCategory,
      priority: sanitizeInput(body.priority || '') as ComplaintPriority,
      userEmail: userEmail || 'anonymous@example.com', // Use JWT email or fallback
      userId: userId || null, // Store user ID if available
    };

    // Validate the data
    const validation = validateComplaintData(sanitizedData);
    
    if (!validation.isValid) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        data: validation.errors,
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Create new complaint
    const complaint = new Complaint({
      ...sanitizedData,
      status: 'Pending', // Default status for new complaints
    });

    const savedComplaint = await complaint.save();

    // Send email notification to admin
    try {
      await EmailService.sendNewComplaintNotification(savedComplaint);
      console.log('New complaint email notification sent successfully');
    } catch (emailError) {
      console.error('Failed to send new complaint email notification:', emailError);
      // Don't fail the API call if email fails - just log the error
    }

    const response: ApiResponse = {
      success: true,
      data: savedComplaint,
      message: 'Complaint submitted successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create complaint',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

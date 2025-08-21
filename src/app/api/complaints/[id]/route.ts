import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { ApiResponse, ComplaintStatus } from '@/types';
import { EmailService } from '@/lib/emailService';
import mongoose from 'mongoose';

// GET /api/complaints/[id] - Get a specific complaint by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid complaint ID format',
      };

      return NextResponse.json(response, { status: 400 });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      const response: ApiResponse = {
        success: false,
        error: 'Complaint not found',
      };

      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: complaint,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch complaint',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH /api/complaints/[id] - Update a complaint (mainly for status updates by admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const updates = await request.json();

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid complaint ID format',
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Validate status if provided
    if (updates.status) {
      const validStatuses: ComplaintStatus[] = ['Pending', 'In Progress', 'Resolved'];
      if (!validStatuses.includes(updates.status)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid status value',
        };

        return NextResponse.json(response, { status: 400 });
      }
    }

    // Get the current complaint to check for status changes
    const currentComplaint = await Complaint.findById(id);
    if (!currentComplaint) {
      const response: ApiResponse = {
        success: false,
        error: 'Complaint not found',
      };

      return NextResponse.json(response, { status: 404 });
    }

    const oldStatus = currentComplaint.status;

    // Find and update the complaint
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        ...updates,
        updatedAt: new Date(),
      },
      { 
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      }
    );

    if (!complaint) {
      const response: ApiResponse = {
        success: false,
        error: 'Complaint not found',
      };

      return NextResponse.json(response, { status: 404 });
    }

    // Send email notification if status was updated
    if (updates.status && updates.status !== oldStatus) {
      try {
        await EmailService.sendStatusUpdateNotification(complaint, oldStatus);
        console.log(`Status update email notification sent for complaint ${id}`);
      } catch (emailError) {
        console.error('Failed to send status update email notification:', emailError);
        // Don't fail the API call if email fails - just log the error
      }
    }

    const response: ApiResponse = {
      success: true,
      data: complaint,
      message: 'Complaint updated successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error updating complaint:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to update complaint',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/complaints/[id] - Delete a complaint by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid complaint ID format',
      };

      return NextResponse.json(response, { status: 400 });
    }

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      const response: ApiResponse = {
        success: false,
        error: 'Complaint not found',
      };

      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: { deletedId: id },
      message: 'Complaint deleted successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete complaint',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

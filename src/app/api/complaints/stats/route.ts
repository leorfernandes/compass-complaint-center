import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { ApiResponse } from '@/types';
import { isDatabaseAvailable, mockComplaints } from '@/lib/mockData';

// GET /api/complaints/stats - Get complaint statistics for admin dashboard
export async function GET() {
  try {
    const isDbAvailable = await isDatabaseAvailable();
    
    if (!isDbAvailable) {
      // Calculate stats from mock data
      const total = mockComplaints.length;
      
      const byStatus = {
        Pending: mockComplaints.filter(c => c.status === 'Pending').length,
        'In Progress': mockComplaints.filter(c => c.status === 'In Progress').length,
        Resolved: mockComplaints.filter(c => c.status === 'Resolved').length,
      };

      const byPriority = {
        Low: mockComplaints.filter(c => c.priority === 'Low').length,
        Medium: mockComplaints.filter(c => c.priority === 'Medium').length,
        High: mockComplaints.filter(c => c.priority === 'High').length,
      };

      const byCategory = {
        Product: mockComplaints.filter(c => c.category === 'Product').length,
        Service: mockComplaints.filter(c => c.category === 'Service').length,
        Support: mockComplaints.filter(c => c.category === 'Support').length,
      };

      // Calculate recent complaints (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentComplaints = mockComplaints.filter(c => 
        new Date(c.dateSubmitted) >= sevenDaysAgo
      ).length;

      const response: ApiResponse = {
        success: true,
        data: {
          total,
          byStatus,
          byPriority,
          byCategory,
          recentComplaints,
        },
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Database is available, use real data
    await connectDB();

    // Get total count
    const totalComplaints = await Complaint.countDocuments();

    // Get counts by status
    const statusStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get counts by priority
    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get counts by category
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent complaints (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentComplaints = await Complaint.countDocuments({
      dateSubmitted: { $gte: sevenDaysAgo },
    });

    // Format the data for easy consumption
    const formatStats = (stats: any[]) => {
      return stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
    };

    const response: ApiResponse = {
      success: true,
      data: {
        total: totalComplaints,
        byStatus: {
          Pending: 0,
          'In Progress': 0,
          Resolved: 0,
          ...formatStats(statusStats),
        },
        byPriority: {
          Low: 0,
          Medium: 0,
          High: 0,
          ...formatStats(priorityStats),
        },
        byCategory: {
          Product: 0,
          Service: 0,
          Support: 0,
          ...formatStats(categoryStats),
        },
        recentComplaints,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching complaint statistics:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch complaint statistics',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/utils/seedDatabase';
import { ApiResponse } from '@/types';

// POST /api/seed - Seed the database with sample data (development only)
export async function POST() {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    const response: ApiResponse = {
      success: false,
      error: 'Seeding is only available in development mode',
    };

    return NextResponse.json(response, { status: 403 });
  }

  try {
    const complaints = await seedDatabase();

    const response: ApiResponse = {
      success: true,
      data: complaints,
      message: `Database seeded with ${complaints.length} sample complaints`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error seeding database:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to seed database',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

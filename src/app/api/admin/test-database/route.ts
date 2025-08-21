import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const { mongodbUri } = await request.json();

    if (!mongodbUri) {
      return NextResponse.json(
        { error: 'MongoDB URI is required' },
        { status: 400 }
      );
    }

    // Test connection with the provided URI
    const connection = await mongoose.createConnection(mongodbUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000,
    });

    // Test basic operations
    if (!connection.db) {
      throw new Error('Database connection failed');
    }
    await connection.db.admin().ping();
    
    // Get database info
    const dbStats = await connection.db.stats();
    
    // Close test connection
    await connection.close();

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful!',
      info: {
        dbName: connection.db?.databaseName || 'unknown',
        collections: dbStats.collections || 0,
        dataSize: dbStats.dataSize || 0,
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    
    let errorMessage = 'Failed to connect to database';
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication failed')) {
        errorMessage = 'Authentication failed. Please check your username and password.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Database server not found. Please check your connection string.';
      } else if (error.message.includes('MongoNetworkTimeoutError')) {
        errorMessage = 'Connection timeout. Please check your network and database accessibility.';
      } else if (error.message.includes('MongoServerSelectionError')) {
        errorMessage = 'Unable to connect to MongoDB server. Please verify your connection string and network access.';
      } else {
        errorMessage = `Database error: ${error.message}`;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

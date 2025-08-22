import { ComplaintData, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@/types';

// Mock data for development when MongoDB is not available
export const mockComplaints: ComplaintData[] = [
  {
    _id: '1',
    title: 'Wi-Fi Connection Issues in Villa',
    description: 'The Wi-Fi in my villa has been intermittent throughout my stay. I am unable to work properly and this is affecting my vacation experience.',
    category: 'Service' as ComplaintCategory,
    priority: 'High' as ComplaintPriority,
    status: 'Pending' as ComplaintStatus,
    dateSubmitted: new Date('2025-08-19T10:30:00Z').toISOString(),
    createdAt: new Date('2025-08-19T10:30:00Z').toISOString(),
    updatedAt: new Date('2025-08-19T10:30:00Z').toISOString()
  },
  {
    _id: '2',
    title: 'Room Service Delay',
    description: 'Ordered room service 2 hours ago and still haven\'t received my meal. This is unacceptable for a premium resort.',
    category: 'Service' as ComplaintCategory,
    priority: 'Medium' as ComplaintPriority,
    status: 'In Progress' as ComplaintStatus,
    dateSubmitted: new Date('2025-08-19T14:15:00Z').toISOString(),
    createdAt: new Date('2025-08-19T14:15:00Z').toISOString(),
    updatedAt: new Date('2025-08-19T14:15:00Z').toISOString()
  },
  {
    _id: '3',
    title: 'Air Conditioning Not Working',
    description: 'The AC unit in room 205 is not cooling properly. The temperature is very uncomfortable especially during the day.',
    category: 'Product' as ComplaintCategory,
    priority: 'High' as ComplaintPriority,
    status: 'Resolved' as ComplaintStatus,
    dateSubmitted: new Date('2025-08-18T16:45:00Z').toISOString(),
    createdAt: new Date('2025-08-18T16:45:00Z').toISOString(),
    updatedAt: new Date('2025-08-18T16:45:00Z').toISOString()
  },
  {
    _id: '4',
    title: 'Billing Error on Invoice',
    description: 'There are charges on my bill for services I did not use. Please review and correct the billing statement.',
    category: 'Support' as ComplaintCategory,
    priority: 'Medium' as ComplaintPriority,
    status: 'Pending' as ComplaintStatus,
    dateSubmitted: new Date('2025-08-18T09:20:00Z').toISOString(),
    createdAt: new Date('2025-08-18T09:20:00Z').toISOString(),
    updatedAt: new Date('2025-08-18T09:20:00Z').toISOString()
  },
  {
    _id: '5',
    title: 'Pool Area Maintenance Issues',
    description: 'The pool area has several broken tiles and the water seems cloudy. Safety concern for guests.',
    category: 'Product' as ComplaintCategory,
    priority: 'High' as ComplaintPriority,
    status: 'In Progress' as ComplaintStatus,
    dateSubmitted: new Date('2025-08-17T11:30:00Z').toISOString(),
    createdAt: new Date('2025-08-17T11:30:00Z').toISOString(),
    updatedAt: new Date('2025-08-17T11:30:00Z').toISOString()
  },
  {
    _id: '6',
    title: 'Restaurant Reservation System Down',
    description: 'Unable to make reservations at any of the resort restaurants. The online system appears to be malfunctioning.',
    category: 'Support' as ComplaintCategory,
    priority: 'Low' as ComplaintPriority,
    status: 'Resolved' as ComplaintStatus,
    dateSubmitted: new Date('2025-08-17T08:10:00Z').toISOString(),
    createdAt: new Date('2025-08-17T08:10:00Z').toISOString(),
    updatedAt: new Date('2025-08-17T08:10:00Z').toISOString()
  },
  {
    _id: '7',
    title: 'Housekeeping Schedule Conflict',
    description: 'Housekeeping entered my room while I was sleeping despite the "Do Not Disturb" sign being displayed.',
    category: 'Service' as ComplaintCategory,
    priority: 'Medium' as ComplaintPriority,
    status: 'Resolved' as ComplaintStatus,
    dateSubmitted: new Date('2025-08-16T07:45:00Z').toISOString(),
    createdAt: new Date('2025-08-16T07:45:00Z').toISOString(),
    updatedAt: new Date('2025-08-16T07:45:00Z').toISOString()
  },
  {
    _id: '8',
    title: 'Spa Appointment Cancellation Issue',
    description: 'My spa appointment was cancelled without notice and I cannot reschedule for my preferred time.',
    category: 'Service' as ComplaintCategory,
    priority: 'Low' as ComplaintPriority,
    status: 'Pending' as ComplaintStatus,
    dateSubmitted: new Date('2025-08-20T12:00:00Z').toISOString(),
    createdAt: new Date('2025-08-20T12:00:00Z').toISOString(),
    updatedAt: new Date('2025-08-20T12:00:00Z').toISOString()
  }
];

// Helper function to filter mock data
export function filterMockComplaints(filters: any = {}, sortBy: string = 'dateSubmitted', sortOrder: number = -1): ComplaintData[] {
  let filtered = [...mockComplaints];

  // Apply filters
  if (filters.status) {
    filtered = filtered.filter(complaint => complaint.status === filters.status);
  }
  
  if (filters.priority) {
    filtered = filtered.filter(complaint => complaint.priority === filters.priority);
  }
  
  if (filters.category) {
    filtered = filtered.filter(complaint => complaint.category === filters.category);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any = a[sortBy as keyof ComplaintData];
    let bValue: any = b[sortBy as keyof ComplaintData];

    // Handle date sorting
    if (sortBy === 'dateSubmitted') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 1 ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    // Handle number/date sorting
    if (sortOrder === 1) {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  return filtered;
}

// Check if MongoDB is available
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    // Try to connect to MongoDB
    const connectDB = (await import('@/lib/mongodb')).default;
    await connectDB();
    console.log('MongoDB connection successful');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    console.warn('MongoDB not available, using mock data');
    return false;
  }
}

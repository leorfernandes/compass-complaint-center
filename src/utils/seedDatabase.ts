import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';

const sampleComplaints = [
  {
    title: 'Room service was extremely slow',
    description: 'I ordered room service at 7 PM and it arrived at 10 PM. The food was cold and the service was unprofessional.',
    category: 'Service',
    priority: 'High',
    status: 'Pending',
  },
  {
    title: 'Defective room key card',
    description: 'The key card for room 205 stopped working multiple times during my stay. Had to go to reception 4 times.',
    category: 'Product',
    priority: 'Medium',
    status: 'In Progress',
  },
  {
    title: 'Unhelpful customer support',
    description: 'Called customer support regarding billing issues and the representative was rude and unhelpful.',
    category: 'Support',
    priority: 'High',
    status: 'Resolved',
  },
  {
    title: 'Broken air conditioning',
    description: 'The AC in room 312 was not working properly. Room was too hot for comfortable sleep.',
    category: 'Product',
    priority: 'Medium',
    status: 'Pending',
  },
];

export async function seedDatabase() {
  try {
    await connectDB();
    
    // Clear existing complaints (only for development)
    await Complaint.deleteMany({});
    
    // Insert sample complaints
    const createdComplaints = await Complaint.insertMany(sampleComplaints);
    
    console.log(`✅ Database seeded with ${createdComplaints.length} complaints`);
    return createdComplaints;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Export for use in API routes or scripts
export default seedDatabase;

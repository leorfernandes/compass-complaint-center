import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for our Complaint document
export interface IComplaint extends Document {
  title: string;
  description: string;
  category: 'Product' | 'Service' | 'Support';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved';
  dateSubmitted: Date;
  userEmail?: string; // Email of the user who submitted the complaint
  userId?: string; // User ID if authenticated
  createdAt: Date;
  updatedAt: Date;
}

// Create the Complaint schema
const ComplaintSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a complaint title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a complaint description'],
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ['Product', 'Service', 'Support'],
        message: 'Category must be either Product, Service, or Support',
      },
    },
    priority: {
      type: String,
      required: [true, 'Please select a priority level'],
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High',
      },
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Pending', 'In Progress', 'Resolved'],
        message: 'Status must be Pending, In Progress, or Resolved',
      },
      default: 'Pending',
    },
    dateSubmitted: {
      type: Date,
      default: Date.now,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    userId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt fields automatically
  }
);

// Add indexes for better query performance
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ priority: 1 });
ComplaintSchema.index({ category: 1 });
ComplaintSchema.index({ dateSubmitted: -1 });
ComplaintSchema.index({ userEmail: 1 }); // Index for user-specific queries
ComplaintSchema.index({ userId: 1 }); // Index for user ID queries

// Export the model
export default mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);

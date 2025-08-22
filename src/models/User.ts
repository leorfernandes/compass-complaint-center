import mongoose, { Document, Model, Schema } from 'mongoose';
import { UserRole } from '@/lib/auth';

// User interface for MongoDB
export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  toSafeObject(): any;
}

// Static methods interface
export interface IUserModel extends Model<IUser> {
  // Keep interface simple for now
}

// User schema
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        // Remove password and MongoDB-specific fields from JSON output
        const { password, _id, __v, ...safeRet } = ret;
        return {
          ...safeRet,
          id: _id
        };
      },
    },
  }
);

// Indexes for performance
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Instance methods
UserSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  const { password, ...safeObject } = userObject;
  return safeObject;
};

// Create and export the model
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

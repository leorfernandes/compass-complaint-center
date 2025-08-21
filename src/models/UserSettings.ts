import mongoose from 'mongoose';

export interface IUserSettings extends mongoose.Document {
  userId: string;
  userEmail: string;
  emailConfig: {
    notificationEmail?: string;
    receiveNewComplaints: boolean;
    receiveStatusUpdates: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    itemsPerPage: number;
    defaultComplaintSort: 'dateSubmitted' | 'priority' | 'status' | 'category';
    defaultSortOrder: 'asc' | 'desc';
  };
  lastUpdated: Date;
}

export interface IUserSettingsModel extends mongoose.Model<IUserSettings> {
  getOrCreateForUser(userId: string, userEmail: string): Promise<IUserSettings>;
  cleanDemoUserSettings(): Promise<void>;
}

/**
 * User-specific settings schema
 * Each user has their own email configuration and preferences
 */
const userSettingsSchema = new mongoose.Schema<IUserSettings>({
  // User reference
  userId: {
    type: String,
    required: true,
    unique: true
  },
  
  // User email (from User model for reference)
  userEmail: {
    type: String,
    required: true
  },
  
  // Personal notification email configuration
  emailConfig: {
    // Personal email to receive notifications
    notificationEmail: {
      type: String,
      required: false,
      validate: {
        validator: function(v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    
    // Whether to receive new complaint notifications
    receiveNewComplaints: {
      type: Boolean,
      default: true
    },
    
    // Whether to receive status update notifications
    receiveStatusUpdates: {
      type: Boolean,
      default: true
    }
  },
  
  // UI Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    
    itemsPerPage: {
      type: Number,
      default: 10,
      min: 5,
      max: 100
    },
    
    defaultComplaintSort: {
      type: String,
      enum: ['dateSubmitted', 'priority', 'status', 'category'],
      default: 'dateSubmitted'
    },
    
    defaultSortOrder: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'desc'
    }
  },
  
  // Timestamps
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'user_settings'
});

// Indexes
userSettingsSchema.index({ userId: 1 }, { unique: true });
userSettingsSchema.index({ userEmail: 1 });

// Pre-save middleware to update timestamp
userSettingsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get or create user settings
userSettingsSchema.statics.getOrCreateForUser = async function(userId: string, userEmail: string): Promise<IUserSettings> {
  let settings = await this.findOne({ userId });
  
  if (!settings) {
    settings = new this({
      userId,
      userEmail,
      emailConfig: {
        notificationEmail: '', // Will be empty initially
        receiveNewComplaints: true,
        receiveStatusUpdates: true
      }
    });
    await settings.save();
  }
  
  return settings;
};

// Static method to clean demo user settings
userSettingsSchema.statics.cleanDemoUserSettings = async function(): Promise<void> {
  const demoUserId = 'demo'; // Based on current demo user setup
  
  await this.findOneAndUpdate(
    { userId: demoUserId },
    {
      $set: {
        'emailConfig.notificationEmail': '',
        'emailConfig.receiveNewComplaints': true,
        'emailConfig.receiveStatusUpdates': true,
        lastUpdated: new Date()
      }
    },
    { upsert: true }
  );
  
  console.log('Demo user email settings cleaned');
};

// Export the model
const UserSettings = (mongoose.models.UserSettings || mongoose.model<IUserSettings, IUserSettingsModel>('UserSettings', userSettingsSchema)) as IUserSettingsModel;

export default UserSettings;
export type { mongoose };

import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Email Configuration
  emailConfig: {
    smtpHost: {
      type: String,
      default: 'smtp.gmail.com'
    },
    smtpPort: {
      type: Number,
      default: 587
    },
    smtpUser: {
      type: String,
      required: false
    },
    smtpPass: {
      type: String,
      required: false
    },
    adminEmail: {
      type: String,
      required: false
    },
    isConfigured: {
      type: Boolean,
      default: false
    }
  },
  
  // Application Settings
  appConfig: {
    baseUrl: {
      type: String,
      default: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    },
    systemName: {
      type: String,
      default: 'Compass Complaint Center'
    }
  },
  
  // Timestamps
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Singleton pattern - only one settings document
  _id: {
    type: String,
    default: 'system_settings'
  }
}, {
  timestamps: true,
  collection: 'settings'
});

// Ensure only one settings document exists
settingsSchema.index({ _id: 1 }, { unique: true });

// Pre-save middleware to update timestamp
settingsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Export the model
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export default Settings;
export type { mongoose };

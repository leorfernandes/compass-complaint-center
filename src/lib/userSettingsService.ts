import UserSettings from '@/models/UserSettings';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export interface UserEmailConfig {
  notificationEmail: string;
  receiveNewComplaints: boolean;
  receiveStatusUpdates: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  itemsPerPage: number;
  defaultComplaintSort: 'dateSubmitted' | 'priority' | 'status' | 'category';
  defaultSortOrder: 'asc' | 'desc';
}

export interface UserSettingsData {
  userId: string;
  userEmail: string;
  emailConfig: UserEmailConfig;
  preferences: UserPreferences;
  lastUpdated: Date;
}

/**
 * Service for managing user-specific settings
 * Each user has their own email configuration and preferences
 */
export class UserSettingsService {
  
  /**
   * Get user settings, create defaults if none exist
   */
  static async getUserSettings(userId: string): Promise<UserSettingsData> {
    try {
      await connectDB();
      
      // Handle demo user specially (not in database)
      let userEmail: string;
      if (userId === 'demo') {
        userEmail = 'example@compass.com';
      } else {
        // Get user email for reference
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        userEmail = user.email;
      }
      
      // Get or create user settings
      const settings = await UserSettings.getOrCreateForUser(userId, userEmail);
      
      return {
        userId: settings.userId,
        userEmail: settings.userEmail,
        emailConfig: {
          notificationEmail: settings.emailConfig.notificationEmail || settings.userEmail,
          receiveNewComplaints: settings.emailConfig.receiveNewComplaints,
          receiveStatusUpdates: settings.emailConfig.receiveStatusUpdates
        },
        preferences: settings.preferences,
        lastUpdated: settings.lastUpdated
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw new Error('Failed to retrieve user settings');
    }
  }
  
  /**
   * Update user email configuration
   */
  static async updateUserEmailConfig(userId: string, emailConfig: Partial<UserEmailConfig>): Promise<UserSettingsData> {
    try {
      await connectDB();
      
      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        {
          $set: {
            'emailConfig.notificationEmail': emailConfig.notificationEmail,
            'emailConfig.receiveNewComplaints': emailConfig.receiveNewComplaints ?? true,
            'emailConfig.receiveStatusUpdates': emailConfig.receiveStatusUpdates ?? true,
            lastUpdated: new Date()
          }
        },
        { new: true, upsert: true }
      );
      
      return {
        userId: settings.userId,
        userEmail: settings.userEmail,
        emailConfig: {
          notificationEmail: settings.emailConfig.notificationEmail || settings.userEmail,
          receiveNewComplaints: settings.emailConfig.receiveNewComplaints,
          receiveStatusUpdates: settings.emailConfig.receiveStatusUpdates
        },
        preferences: settings.preferences,
        lastUpdated: settings.lastUpdated
      };
    } catch (error) {
      console.error('Error updating user email config:', error);
      throw new Error('Failed to update user email configuration');
    }
  }
  
  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserSettingsData> {
    try {
      await connectDB();
      
      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        {
          $set: {
            'preferences.theme': preferences.theme,
            'preferences.itemsPerPage': preferences.itemsPerPage,
            'preferences.defaultComplaintSort': preferences.defaultComplaintSort,
            'preferences.defaultSortOrder': preferences.defaultSortOrder,
            lastUpdated: new Date()
          }
        },
        { new: true, upsert: true }
      );
      
      return {
        userId: settings.userId,
        userEmail: settings.userEmail,
        emailConfig: {
          notificationEmail: settings.emailConfig.notificationEmail || settings.userEmail,
          receiveNewComplaints: settings.emailConfig.receiveNewComplaints,
          receiveStatusUpdates: settings.emailConfig.receiveStatusUpdates
        },
        preferences: settings.preferences,
        lastUpdated: settings.lastUpdated
      };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw new Error('Failed to update user preferences');
    }
  }
  
  /**
   * Get notification email for user (fallback to user email if not set)
   */
  static async getNotificationEmail(userId: string): Promise<string | null> {
    try {
      const settings = await this.getUserSettings(userId);
      
      // Return personal notification email if set, otherwise user's main email
      return settings.emailConfig.notificationEmail || settings.userEmail;
    } catch (error) {
      console.error('Error getting notification email:', error);
      return null;
    }
  }
  
  /**
   * Get all admin users who should receive notifications
   */
  static async getNotificationRecipients(notificationType: 'new_complaint' | 'status_update'): Promise<string[]> {
    try {
      await connectDB();
      
      // Get all admin users
      const adminUsers = await User.find({ role: 'admin', isActive: true });
      const recipients: string[] = [];
      
      for (const user of adminUsers) {
        try {
          const userId = user.id || (user as any)._id.toString();
          const settings = await this.getUserSettings(userId);
          
          // Check if user wants this type of notification
          const shouldReceive = notificationType === 'new_complaint' 
            ? settings.emailConfig.receiveNewComplaints 
            : settings.emailConfig.receiveStatusUpdates;
          
          if (shouldReceive) {
            const email = settings.emailConfig.notificationEmail || settings.userEmail;
            if (email) {
              recipients.push(email);
            }
          }
        } catch (error) {
          console.error(`Error getting settings for user ${user._id}:`, error);
          // Fallback to user's main email
          if (user.email) {
            recipients.push(user.email);
          }
        }
      }
      
      return recipients;
    } catch (error) {
      console.error('Error getting notification recipients:', error);
      return [];
    }
  }
  
  /**
   * Clean demo user settings (called on demo login)
   */
  static async cleanDemoUserSettings(): Promise<void> {
    try {
      await connectDB();
      await UserSettings.cleanDemoUserSettings();
    } catch (error) {
      console.error('Error cleaning demo user settings:', error);
    }
  }
  
  /**
   * Check if user is demo user
   */
  static isDemoUser(userId: string): boolean {
    return userId === 'demo' || userId === 'example@compass.com';
  }
}

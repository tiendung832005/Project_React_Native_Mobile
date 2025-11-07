import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UpdateProfileData } from './authService';

const PROFILE_STORAGE_KEY = 'user_profile';
const PROFILE_CHANGES_KEY = 'profile_changes';

/**
 * Local Profile Storage Service
 * Manages user profile data locally when API is not available
 */

/**
 * Save profile data locally
 */
export const saveProfileLocally = async (profileData: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
    console.log('Profile saved locally:', profileData.username);
  } catch (error) {
    console.error('Error saving profile locally:', error);
  }
};

/**
 * Get profile data from local storage
 */
export const getProfileLocally = async (): Promise<User | null> => {
  try {
    const profileData = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (profileData) {
      return JSON.parse(profileData);
    }
    return null;
  } catch (error) {
    console.error('Error getting profile locally:', error);
    return null;
  }
};

/**
 * Update profile locally (when API fails)
 */
export const updateProfileLocally = async (updates: UpdateProfileData): Promise<User> => {
  try {
    // Get current profile
    let currentProfile = await getProfileLocally();
    
    // If no local profile, create default one
    if (!currentProfile) {
      currentProfile = {
        id: 'local_user',
        username: 'user',
        email: 'user@example.com',
        bio: '',
        avatar: 'https://i.imgur.com/2nCt3Sb.jpg',
      };
    }

    // Apply updates - map avatarUrl to avatar
    const updatedProfile: User = {
      ...currentProfile,
      ...updates,
      // Map avatarUrl to avatar if provided
      avatar: updates.avatarUrl || currentProfile.avatar,
    };
    
    // Remove avatarUrl from updatedProfile as User interface uses 'avatar'
    delete (updatedProfile as any).avatarUrl;

    // Save updated profile
    await saveProfileLocally(updatedProfile);
    
    // Also save the changes separately for sync later
    await saveProfileChanges(updates);
    
    return updatedProfile;
  } catch (error) {
    console.error('Error updating profile locally:', error);
    throw error;
  }
};

/**
 * Save profile changes for future sync with API
 */
export const saveProfileChanges = async (changes: UpdateProfileData): Promise<void> => {
  try {
    const existingChanges = await AsyncStorage.getItem(PROFILE_CHANGES_KEY);
    const currentChanges = existingChanges ? JSON.parse(existingChanges) : {};
    
    const updatedChanges = {
      ...currentChanges,
      ...changes,
      lastUpdated: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(PROFILE_CHANGES_KEY, JSON.stringify(updatedChanges));
    console.log('Profile changes saved for sync:', updatedChanges);
  } catch (error) {
    console.error('Error saving profile changes:', error);
  }
};

/**
 * Get pending profile changes
 */
export const getPendingProfileChanges = async (): Promise<UpdateProfileData | null> => {
  try {
    const changes = await AsyncStorage.getItem(PROFILE_CHANGES_KEY);
    return changes ? JSON.parse(changes) : null;
  } catch (error) {
    console.error('Error getting pending changes:', error);
    return null;
  }
};

/**
 * Clear pending profile changes (after successful sync)
 */
export const clearProfileChanges = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_CHANGES_KEY);
    console.log('Profile changes cleared');
  } catch (error) {
    console.error('Error clearing profile changes:', error);
  }
};

/**
 * Sync local profile changes with API (when connection is restored)
 */
export const syncProfileWithAPI = async (): Promise<boolean> => {
  try {
    const { updateProfile } = await import('./authService');
    const pendingChanges = await getPendingProfileChanges();
    
    if (pendingChanges) {
      console.log('Syncing pending changes with API:', pendingChanges);
      await updateProfile(pendingChanges);
      await clearProfileChanges();
      console.log('Profile sync successful');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Profile sync failed:', error);
    return false;
  }
};

/**
 * Get user profile - try API first, fallback to local
 */
export const getUserProfile = async (): Promise<User> => {
  try {
    // Try to get from API first
    const { getCurrentUser } = await import('./authService');
    const apiProfile = await getCurrentUser();
    
    // Save to local storage for offline access
    await saveProfileLocally(apiProfile);
    
    return apiProfile;
  } catch (error: any) {
    console.log('API failed, using local profile data:', error.message);
    
    // Check if it's a "User not found" error (404) or any 404
    if (error.response?.status === 404) {
      console.log('🔧 API returned 404 - User may not exist in database');
      console.log('💡 This might happen if:');
      console.log('   1. User was deleted from database');
      console.log('   2. Token contains wrong email/userId');
      console.log('   3. Database connection issue');
      
      // Try to extract user info from token
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const token = await AsyncStorage.default.getItem('token');
        
        if (token) {
          const parts = token.split('.');
          if (parts.length !== 3) {
            throw new Error('Invalid token format');
          }
          
          const payload = JSON.parse(atob(parts[1]));
          console.log('📋 Token payload:', {
            userId: payload.userId,
            sub: payload.sub,
            email: payload.email,
            username: payload.username,
          });
          
          // Safely extract userId - can be string (email), number (ID), or null
          const userId = payload.userId ?? payload.sub ?? null;
          
          // Extract email - userId might be email (string) or ID (number)
          let email: string;
          if (typeof userId === 'string' && userId.includes('@')) {
            email = userId;
          } else if (payload.email) {
            email = payload.email;
          } else if (payload.sub && typeof payload.sub === 'string' && payload.sub.includes('@')) {
            email = payload.sub;
          } else {
            email = 'user@example.com';
          }
          
          // Extract username
          let username = payload.username;
          if (!username) {
            if (typeof userId === 'string' && userId.includes('@')) {
              username = userId.split('@')[0];
            } else if (email && email !== 'user@example.com') {
              username = email.split('@')[0];
            } else {
              username = 'user';
            }
          }
          
          const profileFromToken: User = {
            id: String(userId || email),
            username: username,
            email: email,
            bio: 'Profile created from login token',
            avatar: 'https://i.imgur.com/2nCt3Sb.jpg',
            name: payload.username || username,
          };
          
          console.log('✅ Created profile from token:', profileFromToken);
          await saveProfileLocally(profileFromToken);
          return profileFromToken;
        } else {
          console.log('❌ No token found in AsyncStorage');
        }
      } catch (tokenError: any) {
        console.log('❌ Could not extract user from token:', tokenError.message || tokenError);
        console.log('Error details:', tokenError);
      }
    }
    
    // Fallback to local storage
    const localProfile = await getProfileLocally();
    
    if (localProfile) {
      return localProfile;
    }
    
    // Last resort: return default profile
    return {
      id: 'local_user',
      username: 'user',
      email: 'user@example.com',
      bio: 'Offline mode - changes will sync when connected',
      avatar: 'https://i.imgur.com/2nCt3Sb.jpg',
    };
  }
};
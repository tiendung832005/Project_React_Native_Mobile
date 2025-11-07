// API Service for React Native Frontend
// Save this as: apiService.js or api.js

// ⚙️ Configuration
const API_BASE_URL = 'http://localhost:8080/api';
// For production, change to: 'https://your-domain.com/api'
// For Android emulator, use: 'http://10.0.2.2:8080/api'
// For iOS simulator, use: 'http://localhost:8080/api'

// 🔐 Authentication APIs

/**
 * Register a new user
 */
export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    return await response.json();
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

/**
 * Login user and get JWT token
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// 👤 User APIs

/**
 * Get current user profile
 */
export const getCurrentUser = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * Update user profile (avatarUrl and bio)
 */
export const updateUserProfile = async (token, avatarUrl, bio) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatarUrl, bio }),
    });
    return await response.json();
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Search user by phone number
 */
export const searchUserByPhone = async (token, phone) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/search?phone=${phone}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Search user error:', error);
    throw error;
  }
};

// 👥 Friend Management APIs

/**
 * Send friend request
 */
export const sendFriendRequest = async (token, receiverId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/friends/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ receiverId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Send friend request error:', error);
    throw error;
  }
};

/**
 * Accept friend request
 */
export const acceptFriendRequest = async (token, requestId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/friends/accept/${requestId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Accept friend request error:', error);
    throw error;
  }
};

/**
 * Reject friend request
 */
export const rejectFriendRequest = async (token, requestId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/friends/reject/${requestId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Reject friend request error:', error);
    throw error;
  }
};

/**
 * Get all friend requests
 */
export const getFriendRequests = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/friends/requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Get friend requests error:', error);
    throw error;
  }
};

/**
 * Get friends list
 */
export const getFriends = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/friends`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Get friends error:', error);
    throw error;
  }
};

/**
 * Unfriend a user
 */
export const unfriend = async (token, friendId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/friends/${friendId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Unfriend error:', error);
    throw error;
  }
};

/**
 * Block a user
 */
export const blockUser = async (token, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/friends/block/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Block user error:', error);
    throw error;
  }
};

/**
 * Unblock a user
 */
export const unblockUser = async (token, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/friends/unblock/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Unblock user error:', error);
    throw error;
  }
};

// 📌 Usage Example in React Native Component:
/*

import { login, getCurrentUser, updateUserProfile } from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Login
const handleLogin = async () => {
  try {
    const result = await login('user@example.com', 'password123');
    if (result.token) {
      // Save token
      await AsyncStorage.setItem('token', result.token);
      console.log('Login successful:', result.user);
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// 2. Get user profile
const loadUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const user = await getCurrentUser(token);
    console.log('User profile:', user);
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
};

// 3. Update profile
const updateProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const result = await updateUserProfile(
      token,
      'https://example.com/new-avatar.jpg',
      'Updated bio text'
    );
    console.log('Profile updated:', result);
  } catch (error) {
    console.error('Failed to update profile:', error);
  }
};

*/

export default {
  // Auth
  register,
  login,

  // User
  getCurrentUser,
  updateUserProfile,
  searchUserByPhone,

  // Friends
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  unfriend,
  blockUser,
  unblockUser,
};


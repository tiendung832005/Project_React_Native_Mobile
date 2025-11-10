import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeImageUrl } from '../utils/imageUrlUtils';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  message?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  name?: string;
  website?: string;
  phone?: string;
  gender?: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  name?: string;
  website?: string;
  phone?: string;
  gender?: string;
}

// Register user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', {
    username: data.username,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
  });
  return response.data;
};

// Login user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', {
    email: data.email,
    password: data.password,
  });
  
  // Save token to AsyncStorage
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Get current user info
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<any>('/users/me');
  // Map backend response (avatarUrl) to frontend format (avatar)
  // Normalize avatar URL to use current IP from config
  const avatarUrl = response.data.avatarUrl || response.data.avatar;
  const normalizedAvatar = normalizeImageUrl(avatarUrl);
  
  return {
    id: String(response.data.id),
    username: response.data.username,
    email: response.data.email,
    bio: response.data.bio,
    avatar: normalizedAvatar,
    name: response.data.name,
    website: response.data.website,
    phone: response.data.phone,
    gender: response.data.gender,
  };
};

// Logout - clear token
export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem('token');
  return !!token;
};

// Get stored token
export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('token');
};

// Update user profile
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  // Backend expects only avatarUrl and bio
  const payload: { avatarUrl?: string; bio?: string } = {};
  if (data.avatarUrl) {
    payload.avatarUrl = data.avatarUrl;
  }
  if (data.bio !== undefined) {
    payload.bio = data.bio;
  }
  
  const response = await api.put<any>('/users/update', payload);
  // Map backend response (avatarUrl) to frontend format (avatar)
  // Normalize avatar URL to use current IP from config
  const avatarUrl = response.data.avatarUrl || response.data.avatar;
  const normalizedAvatar = normalizeImageUrl(avatarUrl);
  
  return {
    id: String(response.data.id),
    username: response.data.username,
    email: response.data.email,
    bio: response.data.bio,
    avatar: normalizedAvatar,
    name: response.data.name,
    website: response.data.website,
    phone: response.data.phone,
    gender: response.data.gender,
  };
};


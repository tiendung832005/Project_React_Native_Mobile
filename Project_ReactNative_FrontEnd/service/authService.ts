import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const response = await api.get<User>('/users/me');
  return response.data;
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
  const response = await api.put<User>('/users/me', data);
  return response.data;
};


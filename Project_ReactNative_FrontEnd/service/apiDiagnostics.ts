import { Alert } from 'react-native';
import api from './api';
import { API_BASE_URL } from '../constants/config';

/**
 * Test API Connection
 * Function để test kết nối với backend API
 */
export const testAPIConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    
    // Test basic connection
    const response = await api.get('/health', {
      timeout: 5000, // 5 seconds timeout
    });
    
    console.log('API Response:', response.status, response.data);
    return true;
    
  } catch (error: any) {
    console.error('API Connection Test Failed:');
    console.error('URL:', API_BASE_URL);
    console.error('Error:', error.message);
    
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.error('Network Error - Check if:');
      console.error('1. Backend server is running on port 8080');
      console.error('2. IP address in config.ts is correct');
      console.error('3. Firewall is not blocking the connection');
    }
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    
    return false;
  }
};

/**
 * Test Authentication Endpoints
 */
export const testAuthEndpoints = async (): Promise<void> => {
  try {
    console.log('Testing auth endpoints...');
    
    // Test login endpoint (without credentials)
    try {
      await api.post('/auth/login', {});
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Login endpoint exists (returns 400 for empty body)');
      } else {
        console.log('❌ Login endpoint issue:', error.response?.status);
      }
    }
    
    // Test register endpoint (without credentials)  
    try {
      await api.post('/auth/register', {});
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Register endpoint exists (returns 400 for empty body)');
      } else {
        console.log('❌ Register endpoint issue:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.error('Auth endpoints test failed:', error);
  }
};

/**
 * Test User Endpoints
 */
export const testUserEndpoints = async (): Promise<void> => {
  try {
    console.log('Testing user endpoints...');
    
    // Test current user endpoint (should return 401 without token)
    try {
      await api.get('/users/me');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ /users/me endpoint exists (returns 401 without token)');
      } else if (error.response?.status === 404) {
        console.log('❌ /users/me endpoint not found (404)');
      } else {
        console.log('❌ /users/me endpoint issue:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.error('User endpoints test failed:', error);
  }
};

/**
 * Show API Connection Dialog
 */
export const showAPIConnectionDialog = async (): Promise<void> => {
  const isConnected = await testAPIConnection();
  
  if (isConnected) {
    Alert.alert(
      'API Connection Success ✅',
      `Connected to: ${API_BASE_URL}`,
      [{ text: 'OK' }]
    );
  } else {
    Alert.alert(
      'API Connection Failed ❌',
      `Cannot connect to: ${API_BASE_URL}\n\nCheck:\n• Backend server running on port 8080\n• IP address correct\n• Firewall settings`,
      [
        { text: 'Cancel' },
        { 
          text: 'Test Again', 
          onPress: () => showAPIConnectionDialog() 
        }
      ]
    );
  }
};

/**
 * Run Full API Diagnostics
 */
export const runAPIdiagnostics = async (): Promise<void> => {
  console.log('🔍 Running API Diagnostics...');
  console.log('='.repeat(50));
  
  const isConnected = await testAPIConnection();
  
  if (isConnected) {
    await testAuthEndpoints();
    await testUserEndpoints();
  }
  
  console.log('='.repeat(50));
  console.log('✅ API Diagnostics Complete');
};
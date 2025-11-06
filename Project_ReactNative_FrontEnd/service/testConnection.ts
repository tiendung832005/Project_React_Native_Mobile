import { API_BASE_URL } from '../constants/config';
import api from './api';

/**
 * Test function to check if backend is reachable
 * Call this from your app to verify connection
 */
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing connection to:', API_BASE_URL);
    
    // Try a simple GET request (you can replace with a health check endpoint)
    // For now, we'll just check if the base URL is reachable
    const response = await api.get('/users/me', {
      validateStatus: (status) => status < 500, // Accept 401/403 as "connection successful"
    });
    
    console.log('✅ Backend connection successful!');
    console.log('Response status:', response.status);
    return true;
  } catch (error: any) {
    console.error('❌ Backend connection failed!');
    console.error('Error:', error.message);
    console.error('URL tried:', API_BASE_URL);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure your Spring Boot backend is running on port 8080');
      console.error('💡 Check if backend URL is correct in constants/config.ts');
    }
    
    return false;
  }
};


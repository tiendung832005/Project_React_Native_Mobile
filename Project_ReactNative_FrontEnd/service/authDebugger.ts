import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from './authService';

/**
 * Debug utility để check authentication state
 */
export class AuthDebugger {
  
  /**
   * Kiểm tra token hiện tại
   */
  static async checkToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('token');
      
      console.log('🔍 Auth Debug Info:');
      console.log('📱 Token exists:', !!token);
      
      if (token) {
        console.log('🔑 Token length:', token.length);
        console.log('🔑 Token preview:', `${token.substring(0, 20)}...`);
        
        // Decode JWT token để xem thông tin
        try {
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.log('❌ Invalid token format - should have 3 parts');
            return;
          }
          
          const payload = JSON.parse(atob(parts[1]));
          console.log('📋 Token payload:', {
            userId: payload.userId || payload.sub || payload.id,
            username: payload.username,
            email: payload.email,
            sub: payload.sub,
            exp: payload.exp ? new Date(payload.exp * 1000) : 'No expiry',
            iat: payload.iat ? new Date(payload.iat * 1000) : 'No issued time',
          });
          
          // Check if token is expired
          if (payload.exp) {
            const now = Date.now() / 1000;
            const isExpired = payload.exp < now;
            console.log('⏰ Token expired:', isExpired);
            
            if (isExpired) {
              console.log('❌ Token is expired! Need to re-login');
            } else {
              console.log('✅ Token is valid');
            }
          }
        } catch (decodeError) {
          console.log('❌ Failed to decode token:', decodeError);
        }
      } else {
        console.log('❌ No token found in AsyncStorage');
      }
      
    } catch (error) {
      console.error('❌ Error checking token:', error);
    }
  }

  /**
   * Kiểm tra tất cả dữ liệu trong AsyncStorage
   */
  static async checkAllStorageData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      
      console.log('📱 All AsyncStorage Data:');
      stores.forEach(([key, value]) => {
        if (key === 'token' && value) {
          console.log(`${key}: ${value.substring(0, 20)}...`);
        } else {
          console.log(`${key}: ${value}`);
        }
      });
    } catch (error) {
      console.error('❌ Error reading AsyncStorage:', error);
    }
  }

  /**
   * Clear tất cả auth data
   */
  static async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('token');
      console.log('🧹 Cleared auth data');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
    }
  }

  /**
   * Test API connection
   */
  static async testAPIConnection(): Promise<void> {
    try {
      const { API_BASE_URL } = require('../constants/config');
      console.log('🌐 Testing API connection...');
      console.log('🔗 API Base URL:', API_BASE_URL);
      
      // Extract base URL without /api for basic connectivity test
      const baseUrl = API_BASE_URL.replace('/api', '');
      
      // Test a simple endpoint that doesn't require auth
      const response = await fetch(`${API_BASE_URL}/auth/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 API Connection Test:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.text();
        console.log('📄 Response:', data);
      } else {
        console.log('ℹ️  Testing basic connectivity...');
        // Fallback: just test if server is reachable
        const basicTest = await fetch(`${baseUrl}/`, {
          method: 'GET',
        });
        console.log('🔌 Server reachable:', basicTest.ok);
      }
      
    } catch (error) {
      console.error('❌ API Connection Error:', error);
      console.log('💡 Possible issues:');
      console.log('  - Backend server not running');
      console.log('  - Wrong IP address in config.ts');
      console.log('  - Network connectivity issue');
      console.log('  - Firewall blocking connection');
      console.log('  - Check constants/config.ts and update LOCAL_IP');
    }
  }

  /**
   * Test authenticated endpoint
   */
  static async testAuthenticatedEndpoint(): Promise<void> {
    try {
      const token = await getToken();
      
      if (!token) {
        console.log('❌ No token available for authenticated test');
        return;
      }

      console.log('🔐 Testing authenticated endpoint...');
      
      const { API_BASE_URL } = require('../constants/config');
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('📡 Authenticated Request:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('👤 User data:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        
        if (response.status === 401) {
          console.log('💡 401 Error suggests:');
          console.log('  - Token is invalid/expired');
          console.log('  - Token format is wrong');
          console.log('  - Backend auth middleware issue');
          console.log('  - Token not being sent properly');
        } else if (response.status === 404) {
          console.log('💡 404 "User not found" suggests:');
          console.log('  - User ID in token không match với database');
          console.log('  - Token có userId: "dung123@gmail.com" (email)');
          console.log('  - Backend tìm user by ID thay vì email');
          console.log('  - Database chưa có user này');
          console.log('  🔧 FIX: Backend should find user by email hoặc lưu đúng userId');
        }
      }
      
    } catch (error) {
      console.error('❌ Authenticated request error:', error);
    }
  }

  /**
   * Full debug check
   */
  static async fullDebugCheck(): Promise<void> {
    console.log('🚀 Starting full auth debug check...');
    console.log('='.repeat(50));
    
    await this.checkToken();
    console.log('-'.repeat(30));
    
    await this.checkAllStorageData();
    console.log('-'.repeat(30));
    
    await this.testAPIConnection();
    console.log('-'.repeat(30));
    
    await this.testAuthenticatedEndpoint();
    console.log('='.repeat(50));
  }
}
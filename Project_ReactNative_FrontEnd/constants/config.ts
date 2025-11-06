import { Platform } from 'react-native';

// Get your local IP address
// On Windows: ipconfig
// On Mac/Linux: ifconfig
// Look for IPv4 address (usually 192.168.x.x)

// Option 1: Use your local IP address (for physical device/Expo Go)
// const LOCAL_IP = '192.168.1.100'; // Replace with your actual IP

// Option 2: Use localhost variants based on platform
const getBaseURL = () => {
  // For web development
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }

  // For Android emulator
  if (Platform.OS === 'android') {
    // Use 10.0.2.2 to access localhost from Android emulator
    return 'http://10.0.2.2:8080/api';
  }

  // For iOS simulator
  if (Platform.OS === 'ios') {
    return 'http://localhost:8080/api';
  }

  // Default fallback
  return 'http://localhost:8080/api';
};

// For physical device or Expo Go, set your computer's IP:
const LOCAL_IP = '192.168.1.90';
export const API_BASE_URL = `http://${LOCAL_IP}:8080/api`;

// 192.168.1.237 rikkei
// 192.168.1.90
// Alternative: Use environment variable (if using expo-constants)
// import Constants from 'expo-constants';
// export const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8080/api';


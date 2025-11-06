/**
 * Navigation Utilities
 * Các utility functions để quản lý navigation state và behavior
 */

import { router } from 'expo-router';
import { logout as authLogout } from '../service/authService';

/**
 * NavigationActions - Tập hợp các actions navigation chính
 */
export class NavigationActions {
  /**
   * Reset navigation về auth flow
   * Sử dụng khi logout hoặc token hết hạn
   */
  static resetToAuth() {
    router.replace('/auth/login');
  }

  /**
   * Reset navigation về main app flow
   * Sử dụng khi login thành công
   */
  static resetToMain() {
    router.replace('/(tabs)');
  }

  /**
   * Navigate đến home tab
   * Sử dụng khi cần về trang chủ từ bất kỳ đâu
   */
  static goToHome() {
    router.replace('/(tabs)');
  }

  /**
   * Handle logout với proper navigation reset
   * Xóa token và reset về auth flow
   */
  static async handleLogout() {
    try {
      await authLogout();
      this.resetToAuth();
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn reset về auth dù có lỗi
      this.resetToAuth();
    }
  }

  /**
   * Navigate an toàn - kiểm tra trước khi navigate
   * Tránh navigate đến routes không tồn tại
   */
  static safePush(href: string) {
    try {
      router.push(href as any);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback về home nếu có lỗi
      this.goToHome();
    }
  }

  /**
   * Back an toàn - xử lý back button
   */
  static safeBack() {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        // Không thể back được -> về home
        this.goToHome();
      }
    } catch (error) {
      console.error('Back navigation error:', error);
      this.goToHome();
    }
  }
}

/**
 * Navigation Guards - Kiểm tra điều kiện trước khi navigate
 */
export class NavigationGuards {
  /**
   * Kiểm tra xem có thể navigate đến auth routes không
   * (chỉ khi chưa đăng nhập)
   */
  static canNavigateToAuth(): boolean {
    // Logic kiểm tra auth state ở đây
    return true; // Placeholder
  }

  /**
   * Kiểm tra xem có thể navigate đến main routes không  
   * (chỉ khi đã đăng nhập)
   */
  static canNavigateToMain(): boolean {
    // Logic kiểm tra auth state ở đây
    return true; // Placeholder
  }
}

/**
 * Navigation Constants - Định nghĩa các routes chính
 */
export const ROUTES = {
  // Auth routes
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  
  // Main routes
  MAIN_TABS: '/(tabs)',
  HOME: '/(tabs)',
  SEARCH: '/(tabs)/search',
  POST: '/(tabs)/post',
  LIKES: '/(tabs)/like',
  PROFILE: '/(tabs)/profile',
  
  // Standalone routes
  IGTV: '/igtv',
  STORY: '/story',
  PICTURE_SHOT: '/pictureShot',
  ADD_IMAGE: '/addImage',
  SHOW: '/show',
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RouteValues = typeof ROUTES[RouteKeys];
import api from './api';

export interface NotificationCounts {
  friendRequestCount: number;
  unreadMessageCount: number;
}

interface BackendNotificationCountDTO {
  friendRequestCount: number;
  unreadMessageCount: number;
}

interface BackendApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

/**
 * Notification Service
 * API service cho notifications (friend requests và messages)
 */
export class NotificationService {
  /**
   * Lấy số lượng notifications (friend requests và unread messages)
   */
  static async getNotificationCounts(): Promise<NotificationCounts> {
    try {
      const response = await api.get<BackendApiResponse<BackendNotificationCountDTO>>('/notifications/counts');
      return {
        friendRequestCount: response.data.data.friendRequestCount || 0,
        unreadMessageCount: response.data.data.unreadMessageCount || 0,
      };
    } catch (error: any) {
      console.error('Error getting notification counts:', error);
      // Log detailed error information
      if (error.response) {
        console.error('Response error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Request error:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      // Return default values on error
      return {
        friendRequestCount: 0,
        unreadMessageCount: 0,
      };
    }
  }
}


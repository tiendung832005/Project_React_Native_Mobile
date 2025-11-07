import api from './api';

// Types cho Friend/Follow system
export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  isVerified?: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
}

export interface FollowRequest {
  id: string;
  fromUser: User;
  toUser: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Friend {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  friendsSince: string;
}

export interface SearchResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

// Backend DTOs
interface BackendUserBasicDTO {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
}

interface BackendFriendRequestDTO {
  id: number;
  sender: BackendUserBasicDTO;
  receiver: BackendUserBasicDTO;
  status: string;
  createdAt: string;
}

interface BackendFriendDTO {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  friendsSince: string;
}

interface BackendApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// Mappers
const mapBackendUserToUser = (dto: BackendUserBasicDTO): User => ({
  id: String(dto.id),
  username: dto.username,
  email: dto.email,
  phone: dto.phone,
  avatar: dto.avatarUrl,
  bio: dto.bio,
});

const mapBackendFriendRequestToFollowRequest = (dto: BackendFriendRequestDTO): FollowRequest => ({
  id: String(dto.id),
  fromUser: mapBackendUserToUser(dto.sender),
  toUser: mapBackendUserToUser(dto.receiver),
  status: dto.status.toLowerCase() as 'pending' | 'accepted' | 'rejected',
  createdAt: dto.createdAt,
});

const mapBackendFriendToFriend = (dto: BackendFriendDTO): Friend => ({
  id: String(dto.id),
  username: dto.username,
  email: dto.email,
  phone: dto.phone,
  avatar: dto.avatarUrl,
  bio: dto.bio,
  friendsSince: dto.friendsSince,
});

/**
 * Friend/Follow Service
 * API service cho tất cả chức năng liên quan đến follow/friend
 */
export class FriendService {
  
  /**
   * Tìm kiếm user theo số điện thoại
   */
  static async searchUserByPhone(phone: string): Promise<User> {
    try {
      const response = await api.get<BackendApiResponse<BackendUserBasicDTO>>('/users/search', {
        params: { phone }
      });
      return mapBackendUserToUser(response.data.data);
    } catch (error: any) {
      console.error('Error searching user by phone:', error);
      throw new Error(error.response?.data?.message || 'Failed to search user by phone');
    }
  }

  /**
   * Gửi lời mời kết bạn (follow request)
   */
  static async sendFollowRequest(userId: string): Promise<FollowRequest> {
    try {
      const response = await api.post<BackendApiResponse<BackendFriendRequestDTO>>('/friends/request', {
        receiverId: Number(userId)
      });
      return mapBackendFriendRequestToFollowRequest(response.data.data);
    } catch (error: any) {
      console.error('Error sending follow request:', error);
      throw new Error(error.response?.data?.message || 'Failed to send follow request');
    }
  }

  /**
   * Chấp nhận lời mời kết bạn
   */
  static async acceptFollowRequest(requestId: string): Promise<void> {
    try {
      await api.post(`/friends/accept/${requestId}`);
    } catch (error: any) {
      console.error('Error accepting follow request:', error);
      throw new Error(error.response?.data?.message || 'Failed to accept follow request');
    }
  }

  /**
   * Từ chối lời mời kết bạn
   */
  static async rejectFollowRequest(requestId: string): Promise<void> {
    try {
      await api.post(`/friends/reject/${requestId}`);
    } catch (error: any) {
      console.error('Error rejecting follow request:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject follow request');
    }
  }

  /**
   * Hủy lời mời kết bạn đã gửi (cancel request)
   */
  static async cancelFollowRequest(userId: string): Promise<void> {
    try {
      await api.delete(`/friends/request/${userId}`);
    } catch (error: any) {
      console.error('Error canceling follow request:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel follow request');
    }
  }

  /**
   * Unfollow user (hủy kết bạn)
   */
  static async unfollowUser(userId: string): Promise<void> {
    try {
      await api.delete(`/friends/${userId}`);
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      throw new Error(error.response?.data?.message || 'Failed to unfollow user');
    }
  }

  /**
   * Lấy danh sách follow requests đến (người muốn follow tôi)
   */
  static async getPendingFollowRequests(): Promise<FollowRequest[]> {
    try {
      const response = await api.get<{ requests: BackendFriendRequestDTO[] }>('/friends/follow-requests/pending');
      return (response.data.requests || []).map(mapBackendFriendRequestToFollowRequest);
    } catch (error: any) {
      console.error('Error getting pending follow requests:', error);
      throw new Error(error.response?.data?.message || 'Failed to get follow requests');
    }
  }

  /**
   * Lấy danh sách bạn bè (following/friends)
   */
  static async getFriends(): Promise<Friend[]> {
    try {
      const response = await api.get<BackendApiResponse<BackendFriendDTO[]>>('/friends');
      return (response.data.data || []).map(mapBackendFriendToFriend);
    } catch (error: any) {
      console.error('Error getting friends:', error);
      throw new Error(error.response?.data?.message || 'Failed to get friends list');
    }
  }

  /**
   * Tìm kiếm user theo email (không có trong backend, giả lập)
   */
  static async searchUsersByEmail(email: string, page = 1, limit = 20): Promise<SearchResult> {
    console.warn('Search by email is not implemented. Use searchUserByPhone instead.');
    return {
      users: [],
      total: 0,
      page: 1,
      limit: 20,
    };
  }

  /**
   * Tìm kiếm user theo username (không có trong backend, giả lập)
   */
  static async searchUsers(query: string, page = 1, limit = 20): Promise<SearchResult> {
    console.warn('Search by username is not implemented. Use searchUserByPhone instead.');
    return {
      users: [],
      total: 0,
      page: 1,
      limit: 20,
    };
  }

  /**
   * Lấy suggested users (không có trong backend, trả về empty)
   */
  static async getSuggestedUsers(limit = 10): Promise<User[]> {
    console.warn('Get suggested users is not implemented.');
    return [];
  }

  /**
   * Kiểm tra relationship status với user (không có trong backend, trả về default)
   */
  static async getRelationshipStatus(userId: string): Promise<{
    isFollowing: boolean;
    isFollower: boolean;
    hasPendingRequest: boolean;
    hasReceivedRequest: boolean;
  }> {
    // Try to get from friends list and pending requests
    try {
      const [friends, pendingRequests] = await Promise.all([
        FriendService.getFriends().catch(() => []),
        FriendService.getPendingFollowRequests().catch(() => []),
      ]);

      const isFollowing = friends.some(f => f.id === userId);
      const hasReceivedRequest = pendingRequests.some(r => r.fromUser.id === userId);
      
      // Check if we sent a request (this would need a separate endpoint)
      const hasPendingRequest = false; // Cannot check without backend support

      return {
        isFollowing,
        isFollower: false, // Cannot check without backend support
        hasPendingRequest,
        hasReceivedRequest,
      };
    } catch (error) {
      console.error('Error getting relationship status:', error);
      return {
        isFollowing: false,
        isFollower: false,
        hasPendingRequest: false,
        hasReceivedRequest: false,
      };
    }
  }

  /**
   * Lấy danh sách following (alias của getFriends)
   */
  static async getFollowing(userId?: string, page = 1, limit = 20): Promise<SearchResult> {
    try {
      const friends = await FriendService.getFriends();
      return {
        users: friends.map(f => ({
          id: f.id,
          username: f.username,
          email: f.email,
          avatar: f.avatar,
          bio: f.bio,
        })),
        total: friends.length,
        page: 1,
        limit: friends.length,
      };
    } catch (error: any) {
      console.error('Error getting following:', error);
      throw new Error(error.response?.data?.message || 'Failed to get following list');
    }
  }

  /**
   * Lấy danh sách followers (không có trong backend, trả về empty)
   */
  static async getFollowers(userId?: string, page = 1, limit = 20): Promise<SearchResult> {
    console.warn('Get followers is not implemented.');
    return {
      users: [],
      total: 0,
      page: 1,
      limit: 20,
    };
  }
}

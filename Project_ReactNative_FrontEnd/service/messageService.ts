import api from './api';
import { API_BASE_URL } from '../constants/config';
import { normalizeImageUrl } from '../utils/imageUrlUtils';

// Types
export interface Message {
  id: string;
  sender: MessageUser;
  receiver: MessageUser;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  isRead: boolean;
  createdAt: string;
  reactions: MessageReaction[];
}

export interface MessageUser {
  id: string;
  username: string;
  avatarUrl?: string;
}

export interface MessageReaction {
  id: string;
  user: MessageUser;
  reactionType: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';
  createdAt: string;
}

export interface Conversation {
  userId: string;
  username: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime: string;
  hasUnread: boolean;
}

export interface SendMessageRequest {
  receiverId: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO';
}

export interface ReactToMessageRequest {
  reactionType: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';
}

// Backend DTOs
interface BackendMessageDTO {
  id: number;
  sender: BackendUserBasicDTO;
  receiver: BackendUserBasicDTO;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  type: string;
  read: boolean;
  createdAt: string;
  reactions: BackendMessageReactionDTO[];
}

interface BackendUserBasicDTO {
  id: number;
  username: string;
  avatarUrl?: string;
}

interface BackendMessageReactionDTO {
  id: number;
  user: BackendUserBasicDTO;
  reactionType: string;
  createdAt: string;
}

interface BackendConversationDTO {
  userId: number;
  username: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime: string;
  hasUnread: boolean;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Map backend DTOs to frontend types
function mapBackendMessageToMessage(backend: BackendMessageDTO): Message {
  // Normalize avatar URLs and media URLs to use current IP from config
  const normalizedSenderAvatar = normalizeImageUrl(backend.sender.avatarUrl);
  const normalizedReceiverAvatar = normalizeImageUrl(backend.receiver.avatarUrl);
  
  // Normalize image/video URLs - if it's relative, convert to full URL with current IP
  let normalizedImageUrl: string | undefined;
  if (backend.imageUrl) {
    if (backend.imageUrl.startsWith('http')) {
      normalizedImageUrl = normalizeImageUrl(backend.imageUrl);
    } else {
      normalizedImageUrl = normalizeImageUrl(`${API_BASE_URL.replace('/api', '')}${backend.imageUrl}`);
    }
  }
  
  let normalizedVideoUrl: string | undefined;
  if (backend.videoUrl) {
    if (backend.videoUrl.startsWith('http')) {
      normalizedVideoUrl = normalizeImageUrl(backend.videoUrl);
    } else {
      normalizedVideoUrl = normalizeImageUrl(`${API_BASE_URL.replace('/api', '')}${backend.videoUrl}`);
    }
  }
  
  return {
    id: String(backend.id),
    sender: {
      id: String(backend.sender.id),
      username: backend.sender.username,
      avatarUrl: normalizedSenderAvatar,
    },
    receiver: {
      id: String(backend.receiver.id),
      username: backend.receiver.username,
      avatarUrl: normalizedReceiverAvatar,
    },
    content: backend.content,
    imageUrl: normalizedImageUrl,
    videoUrl: normalizedVideoUrl,
    type: backend.type as 'TEXT' | 'IMAGE' | 'VIDEO',
    isRead: backend.read,
    createdAt: backend.createdAt,
    reactions: backend.reactions.map(mapBackendReactionToReaction),
  };
}

function mapBackendReactionToReaction(backend: BackendMessageReactionDTO): MessageReaction {
  // Normalize avatar URL to use current IP from config
  const normalizedAvatarUrl = normalizeImageUrl(backend.user.avatarUrl);
  
  return {
    id: String(backend.id),
    user: {
      id: String(backend.user.id),
      username: backend.user.username,
      avatarUrl: normalizedAvatarUrl,
    },
    reactionType: backend.reactionType as MessageReaction['reactionType'],
    createdAt: backend.createdAt,
  };
}

function mapBackendConversationToConversation(backend: BackendConversationDTO): Conversation {
  // Normalize avatar URL to use current IP from config
  const normalizedAvatarUrl = normalizeImageUrl(backend.avatarUrl);
  
  return {
    userId: String(backend.userId),
    username: backend.username,
    avatarUrl: normalizedAvatarUrl,
    lastMessage: backend.lastMessage,
    lastMessageTime: backend.lastMessageTime,
    hasUnread: backend.hasUnread,
  };
}

export class MessageService {
  /**
   * Send a message
   */
  static async sendMessage(request: SendMessageRequest): Promise<Message> {
    try {
      const response = await api.post<ApiResponse<BackendMessageDTO>>('/messages', request);
      return mapBackendMessageToMessage(response.data.data);
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }

  /**
   * Upload image/video for message
   */
  static async uploadMessageMedia(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();
      const fileName = imageUri.split('/').pop() || `media_${Date.now()}.jpg`;
      const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : 'jpg';
      const mimeType = extension === 'png' ? 'image/png' : extension === 'mp4' ? 'video/mp4' : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        name: fileName.includes('.') ? fileName : `${fileName}.${extension}`,
        type: mimeType,
      } as any);

      const response = await api.post<ApiResponse<{ imageUrl: string }>>(
        '/messages/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Upload response:', response.data);
      
      // Backend returns { data: { imageUrl: "/uploads/..." } }
      const imageUrl = response.data?.data?.imageUrl;
      if (!imageUrl) {
        console.error('Upload response structure:', response.data);
        throw new Error('Upload failed: media URL missing in response');
      }
      
      // Convert relative URL to full URL
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      } else {
        // Use imported API_BASE_URL
        const baseUrl = API_BASE_URL.replace('/api', ''); // Remove /api to get base URL
        const fullUrl = `${baseUrl}${imageUrl}`;
        console.log('Converted URL:', fullUrl);
        return fullUrl;
      }
    } catch (error: any) {
      console.error('Error uploading message media:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload media');
    }
  }

  /**
   * Get messages between current user and another user
   */
  static async getMessages(userId: string): Promise<Message[]> {
    try {
      const response = await api.get<ApiResponse<BackendMessageDTO[]>>(`/messages/${userId}`);
      return response.data.data.map(mapBackendMessageToMessage);
    } catch (error: any) {
      console.error('Error getting messages:', error);
      throw new Error(error.response?.data?.message || 'Failed to get messages');
    }
  }

  /**
   * Get all conversations for current user
   */
  static async getConversations(): Promise<Conversation[]> {
    try {
      const response = await api.get<ApiResponse<BackendConversationDTO[]>>('/messages/conversations');
      return response.data.data.map(mapBackendConversationToConversation);
    } catch (error: any) {
      console.error('Error getting conversations:', error);
      throw new Error(error.response?.data?.message || 'Failed to get conversations');
    }
  }

  /**
   * React to a message
   */
  static async reactToMessage(messageId: string, reactionType: MessageReaction['reactionType']): Promise<MessageReaction | null> {
    try {
      const response = await api.post<ApiResponse<BackendMessageReactionDTO | null>>(
        `/messages/${messageId}/react`,
        { reactionType }
      );
      if (response.data.data === null) {
        return null; // Reaction was removed
      }
      return mapBackendReactionToReaction(response.data.data);
    } catch (error: any) {
      console.error('Error reacting to message:', error);
      throw new Error(error.response?.data?.message || 'Failed to react to message');
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(userId: string): Promise<void> {
    try {
      await api.put(`/messages/${userId}/read`);
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark messages as read');
    }
  }
}


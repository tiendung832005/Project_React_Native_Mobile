import api from './api';

export interface User {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  author: User;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  privacy?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author: User;
  postId: string;
  parentId?: string; // For replies (not supported by backend yet)
  likesCount: number;
  isLiked: boolean;
  replies?: Comment[];
}

export interface CreatePostData {
  caption?: string;
  content?: string;
  imageUrl?: string;
  privacy?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
}

export interface CreateCommentData {
  content: string;
  postId: string;
  parentId?: string;
}

export interface PostsResponse {
  posts: Post[];
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

export interface CommentsResponse {
  comments: Comment[];
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface BackendPostResponse {
  id: number;
  userId: number;
  username: string;
  userAvatarUrl?: string;
  imageUrl?: string;
  caption?: string;
  privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendCommentResponse {
  id: number;
  postId: number;
  userId: number;
  username: string;
  userAvatarUrl?: string;
  content: string;
  createdAt: string;
}

const mapBackendPostToPost = (data: BackendPostResponse): Post => {
  // Handle LocalDateTime from backend - convert to ISO string if needed
  const createdAt = typeof data.createdAt === 'string' 
    ? data.createdAt 
    : (data.createdAt as any)?.toString() || new Date().toISOString();
  const updatedAt = typeof data.updatedAt === 'string' 
    ? data.updatedAt 
    : (data.updatedAt as any)?.toString() || new Date().toISOString();

  return {
    id: String(data.id),
    content: data.caption ?? '',
    imageUrl: data.imageUrl ?? undefined,
    createdAt,
    updatedAt,
    author: {
      id: String(data.userId),
      username: data.username || 'Unknown',
      avatar: data.userAvatarUrl ?? undefined,
    },
    likesCount: data.likesCount ?? 0,
    commentsCount: data.commentsCount ?? 0,
    isLiked: data.likedByCurrentUser ?? false,
    isBookmarked: false,
    privacy: (data.privacy as 'PUBLIC' | 'FRIENDS' | 'PRIVATE') ?? 'PUBLIC',
  };
};

const mapBackendCommentToComment = (data: BackendCommentResponse): Comment => ({
  id: String(data.id),
  postId: String(data.postId),
  content: data.content,
  createdAt: data.createdAt,
  author: {
    id: String(data.userId),
    username: data.username,
    avatar: data.userAvatarUrl ?? undefined,
  },
  likesCount: 0,
  isLiked: false,
});

export class PostService {
  /**
   * Tạo bài viết mới
   */
  static async createPost(postData: CreatePostData): Promise<Post> {
    try {
      const payload = {
        caption: postData.caption ?? postData.content ?? '',
        imageUrl: postData.imageUrl ?? null,
        privacy: (postData.privacy ?? 'PUBLIC').toUpperCase(),
      };

      console.log('Creating post with payload:', payload);
      const response = await api.post<BackendPostResponse>('/posts', payload);
      console.log('Post creation response:', response.data);
      
      const mappedPost = mapBackendPostToPost(response.data);
      console.log('Mapped post:', mappedPost);
      
      return mappedPost;
    } catch (error: any) {
      console.error('Error creating post:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to create post');
    }
  }

  /**
   * Lấy danh sách bài viết cho newsfeed
   */
  static async getPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    try {
      // Backend có 2 endpoint: /posts và /posts/feed - cả hai đều trả về posts của bạn bè
      // Thử /posts trước, nếu fail thì thử /posts/feed
      let response;
      try {
        response = await api.get<BackendPostResponse[]>('/posts', {
          params: { page, limit }
        });
      } catch (err: any) {
        // Nếu /posts fail, thử /posts/feed
        if (err.response?.status === 404) {
          console.log('Endpoint /posts not found, trying /posts/feed...');
          response = await api.get<BackendPostResponse[]>('/posts/feed');
        } else {
          throw err;
        }
      }

      const posts = Array.isArray(response.data) 
        ? response.data.map(mapBackendPostToPost)
        : [];

      return {
        posts,
        totalPages: 1,
        currentPage: 1,
        hasNext: false,
      };
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);
      
      // Nếu là 404, có thể là chưa có dữ liệu hoặc endpoint không tồn tại
      if (error.response?.status === 404) {
        throw new Error('Endpoint not found. Please check if backend is running and endpoint exists.');
      }
      
      // Nếu là 401, có thể là chưa đăng nhập
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch posts');
    }
  }

  /**
   * Lấy chi tiết một bài viết
   * (Backend hiện chưa cung cấp API riêng, tạm thời lấy từ feed)
   */
  static async getPostById(postId: string): Promise<Post> {
    try {
      console.log('Fetching post by ID:', postId);
      const response = await api.get<BackendPostResponse>(`/posts/${postId}`);
      console.log('Post detail response:', response.data);
      const mappedPost = mapBackendPostToPost(response.data);
      console.log('Mapped post detail:', mappedPost);
      return mappedPost;
    } catch (error: any) {
      console.error('Error fetching post:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch post');
    }
  }

  /**
   * Lấy bài viết của user (lọc từ feed hiện tại)
   */
  static async getUserPosts(userId?: string, page: number = 1, limit: number = 12): Promise<PostsResponse> {
    try {
      const isCurrentUser = !userId || userId === 'me';
      const endpoint = isCurrentUser ? '/posts/me' : `/posts/user/${userId}`;

      console.log('Fetching user posts from endpoint:', endpoint);
      const response = await api.get<BackendPostResponse[]>(endpoint, {
        params: { page, limit }
      });

      console.log('User posts response:', response.data);
      const posts = Array.isArray(response.data)
        ? response.data.map((postData) => {
            console.log('Mapping post:', postData);
            return mapBackendPostToPost(postData);
          })
        : [];

      console.log('Mapped posts:', posts.length);
      return {
        posts,
        totalPages: 1,
        currentPage: 1,
        hasNext: false,
      };
    } catch (error: any) {
      console.error('Error fetching user posts:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }

  /**
   * Like/Unlike bài viết
   */
  static async toggleLikePost(postId: string, shouldLike: boolean): Promise<{ isLiked: boolean }> {
    try {
      if (shouldLike) {
        await api.post(`/posts/${postId}/like`);
      } else {
        await api.delete(`/posts/${postId}/like`);
      }

      return { isLiked: shouldLike };
    } catch (error: any) {
      console.error('Error toggling like:', error);
      throw new Error(error.response?.data?.message || 'Failed to toggle like');
    }
  }

  /**
   * Bookmark/Unbookmark bài viết (chưa có backend, giả lập phản hồi)
   */
  static async toggleBookmarkPost(postId: string, shouldBookmark: boolean): Promise<{ isBookmarked: boolean }> {
    console.warn('Bookmark API is not implemented on backend. Returning mocked response.');
    return Promise.resolve({ isBookmarked: shouldBookmark });
  }

  /**
   * Xóa bài viết (chưa có API backend)
   */
  static async deletePost(postId: string): Promise<void> {
    console.warn('Delete post API is not implemented on backend.');
  }

  /**
   * Lấy danh sách comments của bài viết
   */
  static async getPostComments(postId: string, page: number = 1, limit: number = 20): Promise<CommentsResponse> {
    try {
      const response = await api.get<BackendCommentResponse[]>(`/posts/${postId}/comments`);
      const comments = response.data.map(mapBackendCommentToComment);

      return {
        comments,
        totalPages: 1,
        currentPage: 1,
        hasNext: false,
      };
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch comments');
    }
  }

  /**
   * Tạo comment mới
   */
  static async createComment(commentData: CreateCommentData): Promise<Comment> {
    try {
      const response = await api.post<BackendCommentResponse>(
        `/posts/${commentData.postId}/comments`,
        { content: commentData.content }
      );

      return mapBackendCommentToComment(response.data);
    } catch (error: any) {
      console.error('Error creating comment:', error);
      throw new Error(error.response?.data?.message || 'Failed to create comment');
    }
  }

  /**
   * Like/Unlike comment (backend chưa hỗ trợ)
   */
  static async toggleLikeComment(commentId: string, shouldLike: boolean): Promise<{ isLiked: boolean }> {
    console.warn('Comment like API is not implemented on backend. Returning mocked response.');
    return Promise.resolve({ isLiked: shouldLike });
  }

  /**
   * Xóa comment (backend chưa hỗ trợ)
   */
  static async deleteComment(commentId: string): Promise<void> {
    console.warn('Delete comment API is not implemented on backend.');
  }

  /**
   * Upload hình ảnh cho bài viết (backend chưa hỗ trợ)
   */
  static async uploadImage(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();
      const fileName = imageUri.split('/').pop() || `photo_${Date.now()}.jpg`;
      const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : 'jpg';
      const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        name: fileName.includes('.') ? fileName : `${fileName}.${extension}`,
        type: mimeType,
      } as any);

      const response = await api.post<ApiResponse<{ imageUrl: string }>>(
        '/posts/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const imageUrl = response.data?.data?.imageUrl;

      if (!imageUrl) {
        throw new Error('Upload failed: image URL missing in response');
      }

      return imageUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  }

  /**
   * Upload video cho bài viết (backend chưa hỗ trợ)
   */
  static async uploadVideo(videoUri: string): Promise<string> {
    console.warn('Upload video API is not implemented on backend. Returning mocked URL.');
    return Promise.resolve(videoUri);
  }
}
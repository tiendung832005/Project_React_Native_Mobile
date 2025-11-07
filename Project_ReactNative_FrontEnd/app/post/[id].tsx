import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PostService, Post, Comment } from "../../service/postService";
import { UserAvatar } from "../../components/instagram";
import { InstagramColors, Spacing } from "../../constants/theme";

/**
 * Post Detail Screen - Giao diện chi tiết bài viết
 */
export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load post details
  const loadPostDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const postData = await PostService.getPostById(id);
      setPost(postData);
    } catch (error: any) {
      console.error("Error loading post:", error);
      Alert.alert("Error", "Failed to load post");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  // Load comments
  const loadComments = useCallback(async () => {
    if (!id) return;

    try {
      setCommentsLoading(true);
      const response = await PostService.getPostComments(id, 1, 20);
      setComments(response.comments);
    } catch (error: any) {
      console.error("Error loading comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  const handleSubmitComment = useCallback(async () => {
    if (!post || !commentText.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const newComment = await PostService.createComment({
        content: commentText.trim(),
        postId: post.id,
      });

      setComments((prev) => [newComment, ...prev]);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: prev.commentsCount + 1,
            }
          : prev
      );
      setCommentText("");
      setShowAllComments(true);
    } catch (error: any) {
      console.error("Error creating comment:", error);
      Alert.alert("Error", error.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  }, [commentText, post, submittingComment]);

  useEffect(() => {
    loadPostDetails();
    loadComments();
  }, [loadPostDetails, loadComments]);

  // Handle like post
  const handleLike = async () => {
    if (!post) return;

    const shouldLike = !post.isLiked;

    try {
      // Optimistic update
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: shouldLike,
              likesCount: shouldLike
                ? prev.likesCount + 1
                : Math.max(prev.likesCount - 1, 0),
            }
          : null
      );

      await PostService.toggleLikePost(post.id, shouldLike);
    } catch (error: any) {
      console.error("Error toggling like:", error);
      // Revert optimistic update
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !shouldLike,
              likesCount: !shouldLike
                ? prev.likesCount + 1
                : Math.max(prev.likesCount - 1, 0),
            }
          : null
      );
    }
  };

  // Handle bookmark post
  const handleBookmark = async () => {
    if (!post) return;

    const shouldBookmark = !post.isBookmarked;

    try {
      setPost((prev) =>
        prev ? { ...prev, isBookmarked: shouldBookmark } : null
      );
      await PostService.toggleBookmarkPost(post.id, shouldBookmark);
    } catch (error: any) {
      console.error("Error toggling bookmark:", error);
      setPost((prev) =>
        prev ? { ...prev, isBookmarked: !shouldBookmark } : null
      );
    }
  };

  // Handle like comment
  const handleCommentLike = async (commentId: string) => {
    const targetComment = comments.find((item) => item.id === commentId);
    const shouldLike = targetComment ? !targetComment.isLiked : true;

    try {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: shouldLike,
                likesCount: shouldLike
                  ? comment.likesCount + 1
                  : Math.max(comment.likesCount - 1, 0),
              }
            : comment
        )
      );

      await PostService.toggleLikeComment(commentId, shouldLike);
    } catch (error: any) {
      console.error("Error toggling comment like:", error);
      // Revert optimistic update
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !shouldLike,
                likesCount: !shouldLike
                  ? comment.likesCount + 1
                  : Math.max(comment.likesCount - 1, 0),
              }
            : comment
        )
      );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    return "now";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={InstagramColors.info} />
      </View>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={InstagramColors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={InstagramColors.textSecondary} />
          <Text style={styles.errorText}>Post not found</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadPostDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);

  // Debug log
  console.log('Rendering post detail:', {
    postId: post.id,
    hasImage: !!post.imageUrl,
    imageUrl: post.imageUrl,
    hasContent: !!post.content,
    content: post.content,
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={InstagramColors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity>
          <Ionicons
            name="share-outline"
            size={24}
            color={InstagramColors.black}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.lg }}
      >
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity style={styles.userInfo}>
            <UserAvatar
              uri={post.author.avatar || "https://i.imgur.com/2nCt3Sb.jpg"}
              size="md"
              hasStory={false}
            />
            <View style={styles.userDetails}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>{post.author.username}</Text>
                {post.author.isVerified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={InstagramColors.info}
                  />
                )}
              </View>
              {post.location && (
                <Text style={styles.location}>{post.location}</Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={24}
              color={InstagramColors.black}
            />
          </TouchableOpacity>
        </View>

        {/* Post Image/Video */}
        {post.imageUrl ? (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
            onError={(error) => {
              console.error("Error loading post image:", error);
            }}
          />
        ) : post.videoUrl ? (
          <View style={styles.postImage}>
            <Text>Video not supported yet</Text>
          </View>
        ) : (
          <View style={[styles.postImage, { backgroundColor: InstagramColors.background, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="image-outline" size={48} color={InstagramColors.textSecondary} />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <Ionicons
                name={post.isLiked ? "heart" : "heart-outline"}
                size={24}
                color={
                  post.isLiked ? InstagramColors.primary : InstagramColors.black
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/post/comments" as any)}
            >
              <Ionicons
                name="chatbubble-outline"
                size={24}
                color={InstagramColors.black}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name="share-outline"
                size={24}
                color={InstagramColors.black}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleBookmark}>
            <Ionicons
              name={post.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={InstagramColors.black}
            />
          </TouchableOpacity>
        </View>

        {/* Like Count */}
        <View style={styles.likesSection}>
          <Text style={styles.likesText}>
            {post.likesCount.toLocaleString()} likes
          </Text>
        </View>

        {/* Caption */}
        {post.content && (
          <View style={styles.captionSection}>
            <Text style={styles.captionText}>
              <Text style={styles.username}>{post.author.username} </Text>
              {post.content}
            </Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.createdAt)}</Text>
          </View>
        )}

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          {post.commentsCount > 0 && (
            <TouchableOpacity
              style={styles.viewAllComments}
              onPress={() => setShowAllComments((prev) => !prev)}
            >
              <Text style={styles.viewAllCommentsText}>
                {showAllComments
                  ? "Hide comments"
                  : `View all ${post.commentsCount} comments`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Display Comments */}
          {commentsLoading ? (
            <ActivityIndicator size="small" color={InstagramColors.info} />
          ) : (
            displayedComments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text style={styles.commentText}>
                  <Text style={styles.commentUsername}>
                    {comment.author.username}{" "}
                  </Text>
                  {comment.content}
                </Text>

                <View style={styles.commentMeta}>
                  <Text style={styles.commentTime}>
                    {formatTimeAgo(comment.createdAt)}
                  </Text>
                  {comment.likesCount > 0 && (
                    <Text style={styles.commentLikes}>
                      {comment.likesCount} likes
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => handleCommentLike(comment.id)}
                  >
                    <Ionicons
                      name={comment.isLiked ? "heart" : "heart-outline"}
                      size={12}
                      color={
                        comment.isLiked
                          ? InstagramColors.primary
                          : InstagramColors.darkGray
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {comments.length > 3 && !showAllComments && (
            <TouchableOpacity onPress={() => setShowAllComments(true)}>
              <Text style={styles.showMoreComments}>Show more comments</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Add Comment */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View style={styles.addCommentContainer}>
          <UserAvatar
            uri="https://i.imgur.com/2nCt3Sb.jpg"
            size="sm"
            hasStory={false}
          />
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor={InstagramColors.textSecondary}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!commentText.trim() || submittingComment) && styles.sendButtonDisabled]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submittingComment}
          >
            {submittingComment ? (
              <ActivityIndicator size="small" color={InstagramColors.white} />
            ) : (
              <Text style={styles.sendButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: InstagramColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: InstagramColors.darkGray,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: InstagramColors.info,
    borderRadius: 8,
  },
  retryButtonText: {
    color: InstagramColors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: InstagramColors.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: InstagramColors.black,
  },
  content: {
    flex: 1,
  },

  // Post Header
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userDetails: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: InstagramColors.black,
    marginRight: 4,
  },
  location: {
    fontSize: 12,
    color: InstagramColors.darkGray,
    marginTop: 2,
  },

  // Post Content
  postImage: {
    width: "100%",
    aspectRatio: 1,
  },

  // Actions
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginRight: Spacing.md,
  },

  // Likes
  likesSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  likesText: {
    fontSize: 14,
    fontWeight: "600",
    color: InstagramColors.black,
  },

  // Caption
  captionSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  captionText: {
    fontSize: 14,
    color: InstagramColors.black,
    lineHeight: 18,
  },
  timeAgo: {
    fontSize: 12,
    color: InstagramColors.darkGray,
    marginTop: Spacing.xs,
  },

  // Comments
  commentsSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  viewAllComments: {
    marginBottom: Spacing.sm,
  },
  viewAllCommentsText: {
    fontSize: 14,
    color: InstagramColors.darkGray,
  },
  commentItem: {
    marginBottom: Spacing.sm,
  },
  commentText: {
    fontSize: 14,
    color: InstagramColors.black,
    lineHeight: 18,
  },
  commentUsername: {
    fontWeight: "600",
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  commentTime: {
    fontSize: 12,
    color: InstagramColors.darkGray,
  },
  commentLikes: {
    fontSize: 12,
    color: InstagramColors.darkGray,
  },
  showMoreComments: {
    fontSize: 14,
    color: InstagramColors.darkGray,
    marginTop: Spacing.xs,
  },

  // Add Comment
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: InstagramColors.lightGray,
    backgroundColor: InstagramColors.white,
  },
  commentInput: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    maxHeight: 100,
    fontSize: 14,
    color: InstagramColors.textPrimary,
  },
  sendButton: {
    backgroundColor: InstagramColors.info,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: InstagramColors.textSecondary,
    opacity: 0.5,
  },
  sendButtonText: {
    color: InstagramColors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

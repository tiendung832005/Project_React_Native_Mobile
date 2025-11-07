import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  PostService,
  Comment,
  CreateCommentData,
} from "../../service/postService";
import { UserAvatar } from "../../components/instagram";
import { InstagramColors, Spacing } from "../../constants/theme";

/**
 * Comments Screen - Giao diện danh sách bình luận
 */
export default function CommentsScreen() {
  const router = useRouter();
  const { id: postId } = useLocalSearchParams<{ id: string }>();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load comments
  const loadComments = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      if (!postId) return;

      try {
        if (pageNum === 1 && !isRefresh) {
          setLoading(true);
        }

        const response = await PostService.getPostComments(postId, pageNum, 20);

        if (isRefresh || pageNum === 1) {
          setComments(response.comments);
        } else {
          setComments((prev) => [...prev, ...response.comments]);
        }

        setHasMore(response.hasNext);
        setPage(pageNum);
      } catch (error: any) {
        console.error("Error loading comments:", error);
        Alert.alert("Error", "Failed to load comments");
      } finally {
        setLoading(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Handle send comment
  const handleSendComment = async () => {
    if (!newComment.trim() || !postId || sending) return;

    const commentData: CreateCommentData = {
      content: newComment.trim(),
      postId,
      parentId: replyingTo || undefined,
    };

    setSending(true);

    try {
      const comment = await PostService.createComment(commentData);

      // Add comment to list
      if (replyingTo) {
        // Handle reply - add to parent comment's replies
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo
              ? { ...c, replies: [...(c.replies || []), comment] }
              : c
          )
        );
      } else {
        // Add new top-level comment
        setComments((prev) => [comment, ...prev]);
      }

      setNewComment("");
      setReplyingTo(null);
    } catch (error: any) {
      console.error("Error sending comment:", error);
      Alert.alert("Error", "Failed to send comment");
    } finally {
      setSending(false);
    }
  };

  // Handle like comment
  const handleCommentLike = async (
    commentId: string,
    isReply: boolean = false,
    parentId?: string
  ) => {
    try {
      if (isReply && parentId) {
        // Handle reply like
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: comment.replies?.map((reply) =>
                    reply.id === commentId
                      ? {
                          ...reply,
                          isLiked: !reply.isLiked,
                          likesCount: reply.isLiked
                            ? reply.likesCount - 1
                            : reply.likesCount + 1,
                        }
                      : reply
                  ),
                }
              : comment
          )
        );
      } else {
        // Handle main comment like
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likesCount: comment.isLiked
                    ? comment.likesCount - 1
                    : comment.likesCount + 1,
                }
              : comment
          )
        );
      }

      await PostService.toggleLikeComment(commentId);
    } catch (error: any) {
      console.error("Error toggling comment like:", error);
      // Revert optimistic update if needed
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMinutes > 0) return `${diffMinutes}m`;
    return "now";
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadComments(page + 1);
    }
  };

  const renderReply = (reply: Comment, parentId: string) => (
    <View key={reply.id} style={styles.replyItem}>
      <UserAvatar
        uri={reply.author.avatar || "https://i.imgur.com/2nCt3Sb.jpg"}
        size="sm"
        hasStory={false}
      />

      <View style={styles.replyContent}>
        <Text style={styles.commentText}>
          <Text style={styles.commentUsername}>{reply.author.username} </Text>
          {reply.content}
        </Text>

        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>
            {formatTimeAgo(reply.createdAt)}
          </Text>
          {reply.likesCount > 0 && (
            <Text style={styles.commentLikes}>{reply.likesCount} likes</Text>
          )}
          <TouchableOpacity onPress={() => setReplyingTo(parentId)}>
            <Text style={styles.replyButton}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleCommentLike(reply.id, true, parentId)}
        style={styles.likeButton}
      >
        <Ionicons
          name={reply.isLiked ? "heart" : "heart-outline"}
          size={12}
          color={
            reply.isLiked ? InstagramColors.primary : InstagramColors.darkGray
          }
        />
      </TouchableOpacity>
    </View>
  );

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <UserAvatar
        uri={item.author.avatar || "https://i.imgur.com/2nCt3Sb.jpg"}
        size="md"
        hasStory={false}
      />

      <View style={styles.commentContent}>
        <Text style={styles.commentText}>
          <Text style={styles.commentUsername}>{item.author.username} </Text>
          {item.content}
        </Text>

        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>
            {formatTimeAgo(item.createdAt)}
          </Text>
          {item.likesCount > 0 && (
            <Text style={styles.commentLikes}>{item.likesCount} likes</Text>
          )}
          <TouchableOpacity onPress={() => setReplyingTo(item.id)}>
            <Text style={styles.replyButton}>Reply</Text>
          </TouchableOpacity>
        </View>

        {/* Replies */}
        {item.replies && item.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {item.replies.map((reply) => renderReply(reply, item.id))}
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={() => handleCommentLike(item.id)}
        style={styles.likeButton}
      >
        <Ionicons
          name={item.isLiked ? "heart" : "heart-outline"}
          size={14}
          color={
            item.isLiked ? InstagramColors.primary : InstagramColors.darkGray
          }
        />
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={InstagramColors.info} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={InstagramColors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
        <TouchableOpacity>
          <Ionicons
            name="share-outline"
            size={24}
            color={InstagramColors.black}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Comments List */}
        {loading && comments.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={InstagramColors.info} />
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
          />
        )}

        {/* Comment Input */}
        <View style={styles.commentInput}>
          {replyingTo && (
            <View style={styles.replyingToContainer}>
              <Text style={styles.replyingToText}>
                Replying to{" "}
                {comments.find((c) => c.id === replyingTo)?.author.username}
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons
                  name="close"
                  size={16}
                  color={InstagramColors.darkGray}
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <UserAvatar
              uri="https://i.imgur.com/2nCt3Sb.jpg"
              size="sm"
              hasStory={false}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Add a comment..."
              placeholderTextColor={InstagramColors.darkGray}
              multiline
              value={newComment}
              onChangeText={setNewComment}
              maxLength={1000}
            />

            <TouchableOpacity
              onPress={handleSendComment}
              disabled={!newComment.trim() || sending}
              style={[
                styles.sendButton,
                (!newComment.trim() || sending) && styles.sendButtonDisabled,
              ]}
            >
              {sending ? (
                <ActivityIndicator size="small" color={InstagramColors.info} />
              ) : (
                <Text style={styles.sendButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Comments List
  commentsList: {
    paddingVertical: Spacing.sm,
  },
  commentItem: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: "flex-start",
  },
  commentContent: {
    flex: 1,
    marginLeft: Spacing.sm,
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
    gap: Spacing.md,
  },
  commentTime: {
    fontSize: 12,
    color: InstagramColors.darkGray,
  },
  commentLikes: {
    fontSize: 12,
    color: InstagramColors.darkGray,
  },
  replyButton: {
    fontSize: 12,
    color: InstagramColors.darkGray,
    fontWeight: "600",
  },
  likeButton: {
    padding: Spacing.xs,
  },

  // Replies
  repliesContainer: {
    marginTop: Spacing.sm,
    paddingLeft: Spacing.lg,
  },
  replyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  replyContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },

  // Comment Input
  commentInput: {
    borderTopWidth: 1,
    borderTopColor: InstagramColors.lightGray,
    backgroundColor: InstagramColors.white,
  },
  replyingToContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: InstagramColors.lightGray,
  },
  replyingToText: {
    fontSize: 12,
    color: InstagramColors.darkGray,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: InstagramColors.black,
    maxHeight: 100,
    paddingVertical: Spacing.xs,
  },
  sendButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: InstagramColors.info,
  },

  // Loading Footer
  loadingFooter: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
});

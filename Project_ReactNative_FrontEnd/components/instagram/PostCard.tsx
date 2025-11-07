import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import UserAvatar from "./UserAvatar";
import { InstagramColors, Typography, Spacing } from "../../constants/theme";

const { width: screenWidth } = Dimensions.get("window");

interface PostProps {
  post: {
    id: string;
    user: {
      username: string;
      avatar: string;
      isVerified?: boolean;
    };
    location?: string;
    image: string;
    likes: number;
    caption: string;
    timeAgo: string;
    isLiked?: boolean;
    isSaved?: boolean;
  };
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onUserPress?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * Instagram-style Post Component
 */
export default function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onUserPress,
  onPress,
  style,
}: PostProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={onUserPress}
          activeOpacity={0.8}
        >
          <UserAvatar
            uri={post.user.avatar}
            size="sm"
            hasStory={Math.random() > 0.5} // Random story for demo
          />
          <View style={styles.userDetails}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{post.user.username}</Text>
              {post.user.isVerified && (
                <FontAwesome
                  name="check-circle"
                  size={12}
                  color={InstagramColors.info}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            {post.location && (
              <Text style={styles.location}>{post.location}</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Feather
            name="more-horizontal"
            size={20}
            color={InstagramColors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: post.image }} style={styles.postImage} />
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            onPress={onLike}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <FontAwesome
              name={post.isLiked ? "heart" : "heart-o"}
              size={24}
              color={
                post.isLiked
                  ? InstagramColors.error
                  : InstagramColors.textPrimary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onComment}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <Feather
              name="message-circle"
              size={24}
              color={InstagramColors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShare}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <Feather
              name="send"
              size={24}
              color={InstagramColors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onSave} activeOpacity={0.8}>
          <Feather
            name={post.isSaved ? "bookmark" : "bookmark"}
            size={24}
            color={
              post.isSaved
                ? InstagramColors.textPrimary
                : InstagramColors.textPrimary
            }
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Likes */}
        <TouchableOpacity>
          <Text style={styles.likes}>{post.likes.toLocaleString()} likes</Text>
        </TouchableOpacity>

        {/* Caption */}
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            <Text style={styles.username}>{post.user.username}</Text>
            <Text style={styles.captionText}> {post.caption}</Text>
          </Text>
        </View>

        {/* Time */}
        <Text style={styles.timeAgo}>{post.timeAgo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: InstagramColors.white,
    marginBottom: Spacing.xs,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  userDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },

  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  username: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
  },

  verifiedIcon: {
    marginLeft: Spacing.xs,
  },

  location: {
    fontSize: Typography.size.sm,
    color: InstagramColors.textSecondary,
    marginTop: 2,
  },

  moreButton: {
    padding: Spacing.xs,
  },

  postImage: {
    width: screenWidth,
    height: screenWidth, // Square aspect ratio
    backgroundColor: InstagramColors.background,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionButton: {
    marginRight: Spacing.lg,
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  likes: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
    marginBottom: Spacing.xs,
  },

  captionContainer: {
    marginBottom: Spacing.xs,
  },

  caption: {
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * Typography.lineHeight.normal,
    color: InstagramColors.textPrimary,
  },

  captionText: {
    fontWeight: Typography.weight.normal,
  },

  timeAgo: {
    fontSize: Typography.size.sm,
    color: InstagramColors.textSecondary,
    marginTop: Spacing.xs,
  },
});

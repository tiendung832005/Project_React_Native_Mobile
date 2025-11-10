import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { PostCard, StoriesRow } from "../../components/instagram";
import { PostService, Post } from "../../service/postService";
import {
  InstagramColors,
  Typography,
  Spacing,
  Shadows,
} from "../../constants/theme";
import { useNotifications } from "../../context/NotificationContext";

const storiesData = [
  {
    id: "1",
    username: "Your Story",
    avatar: "https://i.imgur.com/2nCt3Sb.jpg",
    isViewed: false,
  },
  {
    id: "2",
    username: "karenne",
    avatar: "https://i.imgur.com/8Km9tLL.jpg",
    isViewed: false,
  },
  {
    id: "3",
    username: "zackjohn",
    avatar: "https://i.imgur.com/6VBx3io.jpg",
    isViewed: true,
  },
  {
    id: "4",
    username: "kieron_d",
    avatar: "https://i.imgur.com/jNNT4LE.jpg",
    isViewed: false,
  },
  {
    id: "5",
    username: "sarah_k",
    avatar: "https://i.imgur.com/2nCt3Sb.jpg",
    isViewed: false,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { counts: { unreadMessageCount } } = useNotifications();

  // Load posts từ API
  const loadPosts = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      try {
        if (pageNum === 1 && !isRefresh) {
          setLoading(true);
        }

        const response = await PostService.getPosts(pageNum, 10);

        if (isRefresh || pageNum === 1) {
          setPosts(response.posts);
        } else {
          setPosts((prev) => [...prev, ...response.posts]);
        }

        setHasMore(response.hasNext);
        setPage(pageNum);
      } catch (error: any) {
        console.error("Error loading posts:", error);
        Alert.alert("Error", "Failed to load posts");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      loadPosts(page + 1);
    }
  };

  const handleLike = async (postId: string) => {
    const targetPost = posts.find((item) => item.id === postId);
    if (!targetPost) return;

    const shouldLike = !targetPost.isLiked;

    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: shouldLike,
                likesCount: shouldLike
                  ? post.likesCount + 1
                  : Math.max(post.likesCount - 1, 0),
              }
            : post
        )
      );

      // API call
      await PostService.toggleLikePost(postId, shouldLike);
    } catch (error: any) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !shouldLike,
                likesCount: !shouldLike
                  ? post.likesCount + 1
                  : Math.max(post.likesCount - 1, 0),
              }
            : post
        )
      );
    }
  };

  const handleBookmark = async (postId: string) => {
    const targetPost = posts.find((item) => item.id === postId);
    if (!targetPost) return;

    const shouldBookmark = !targetPost.isBookmarked;

    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isBookmarked: shouldBookmark }
            : post
        )
      );

      // API call (mocked)
      await PostService.toggleBookmarkPost(postId, shouldBookmark);
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      // Revert optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isBookmarked: !shouldBookmark }
            : post
        )
      );
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={{
        id: item.id,
        user: {
          username: item.author.username,
          avatar: item.author.avatar || "https://i.imgur.com/2nCt3Sb.jpg",
          isVerified: item.author.isVerified || false,
        },
        location: item.location,
        image:
          item.imageUrl || item.videoUrl || "https://picsum.photos/400/400",
        likes: item.likesCount,
        caption: item.content,
        timeAgo: new Date(item.createdAt).toLocaleDateString(),
        isLiked: item.isLiked,
        isSaved: item.isBookmarked,
      }}
      onLike={() => handleLike(item.id)}
      onSave={() => handleBookmark(item.id)}
      onComment={() => router.push(`/post/${item.id}`)}
      onShare={() => console.log("Share post:", item.id)}
      onUserPress={() => console.log("User pressed:", item.author.username)}
      onPress={() => router.push(`/post/${item.id}`)}
    />
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor={InstagramColors.white}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Feather
            name="camera"
            size={24}
            color={InstagramColors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.logo}>Instagram</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => console.log("IGTV pressed")}
          >
            <Ionicons
              name="tv-outline"
              size={24}
              color={InstagramColors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/(tabs)/messages")}
          >
            <View style={styles.messageButtonContainer}>
              <Feather
                name="send"
                size={24}
                color={InstagramColors.textPrimary}
              />
              {unreadMessageCount > 0 && (
                <View style={styles.messageBadge}>
                  <Text style={styles.messageBadgeText}>
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={InstagramColors.info} />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[InstagramColors.info]}
              tintColor={InstagramColors.info}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListHeaderComponent={
            <StoriesRow
              stories={storiesData}
              onStoryPress={(story) =>
                console.log("Story pressed:", story.username)
              }
            />
          }
          contentContainerStyle={styles.feedContent}
        />
      )}
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: InstagramColors.white,
    borderBottomWidth: 1,
    borderBottomColor: InstagramColors.divider,
    ...Shadows.small,
  },

  headerButton: {
    padding: Spacing.xs,
  },

  messageButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  messageBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF3040',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  messageBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  logo: {
    fontSize: Typography.size["4xl"],
    fontWeight: Typography.weight.bold,
    color: InstagramColors.textPrimary,
    fontFamily: "Billabong", // Instagram's custom font
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  feedContent: {
    flexGrow: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },

  loadingText: {
    fontSize: Typography.size.base,
    color: InstagramColors.textSecondary,
    marginTop: Spacing.md,
  },

  loadingFooter: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});

import { Ionicons, Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { User } from "../../../service/authService";
import { NavigationActions } from "../../../navigation";
import ProfileMenu from "../../../components/ProfileMenu";
import { getUserProfile } from "../../../service/profileStorage";
import { UserAvatar } from "../../../components/instagram";
import { PostService, Post } from "../../../service/postService";
import {
  InstagramColors,
  Typography,
  Spacing,
  InstagramSizes,
  Shadows,
} from "../../../constants/theme";

const { width: screenWidth } = Dimensions.get("window");

// Separate component for post grid item to handle state
const PostGridItem = ({ post, onPress }: { post: Post; onPress: () => void }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={onPress}
    >
      {post.imageUrl && !imageError ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.postImage}
          resizeMode="cover"
          onError={() => {
            console.warn("Error loading post image:", post.imageUrl);
            setImageError(true);
          }}
        />
      ) : (
        <View style={[styles.postImage, { backgroundColor: InstagramColors.background, justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="image-outline" size={24} color={InstagramColors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function TabsProfileScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"grid" | "tagged">("grid");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const fetchUserPosts = useCallback(async (targetUserId?: string) => {
    try {
      setLoadingPosts(true);
      console.log('Fetching user posts for userId:', targetUserId);
      const response = await PostService.getUserPosts(targetUserId);
      console.log('Fetched posts:', response.posts.length, 'posts');
      setPosts(response.posts);
    } catch (error: any) {
      console.error("Error loading user posts:", error);
      console.error("Error details:", error.message || error);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();
      setUser(userData);
      await fetchUserPosts();
    } catch (error: any) {
      console.warn("Error loading user profile:", error.message);
      setUser({
        id: "error_user",
        username: "error_loading",
        email: "error@example.com",
        bio: "Error loading profile data",
        avatar: "https://i.imgur.com/2nCt3Sb.jpg",
        name: "Error User",
      });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [fetchUserPosts]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await NavigationActions.handleLogout();
        },
      },
    ]);
  };

  const highlights = [
    {
      id: 1,
      title: "New",
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
    {
      id: 2,
      title: "Friends",
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
    {
      id: 3,
      title: "Sport",
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
    {
      id: 4,
      title: "Design",
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={InstagramColors.info} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="lock" size={20} color={InstagramColors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerUsername}>{user?.username || "Profile"}</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setMenuVisible(true)}
        >
          <Feather name="menu" size={24} color={InstagramColors.textPrimary} />
        </TouchableOpacity>
      </View>


      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          {/* Profile Header with Avatar & Stats */}
          <View style={styles.profileHeader}>
            <UserAvatar
              key={user?.avatar} // Force reload when avatar changes
              uri={user?.avatar || "https://i.imgur.com/2nCt3Sb.jpg"}
              size="2xl"
              hasStory={false}
            />

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{posts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>834</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>162</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>
              {user?.name || user?.username || "User"}
            </Text>
            {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
            {user?.email && <Text style={styles.website}>{user.email}</Text>}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                try {
                  router.push("/(tabs)/profile/edit");
                } catch (error) {
                  router.push("./edit");
                }
              }}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactButton}>
              <Feather
                name="user-plus"
                size={16}
                color={InstagramColors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Story Highlights */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.highlightsContainer}
            contentContainerStyle={styles.highlightsContent}
          >
            {highlights.map((item) => (
              <TouchableOpacity key={item.id} style={styles.highlightItem}>
                <View style={styles.highlightImageContainer}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.highlightImage}
                  />
                </View>
                <Text style={styles.highlightText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "grid" && styles.activeTab]}
            onPress={() => setSelectedTab("grid")}
          >
            <Ionicons
              name="grid-outline"
              size={24}
              color={
                selectedTab === "grid"
                  ? InstagramColors.textPrimary
                  : InstagramColors.textSecondary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === "tagged" && styles.activeTab]}
            onPress={() => setSelectedTab("tagged")}
          >
            <Ionicons
              name="person-outline"
              size={24}
              color={
                selectedTab === "tagged"
                  ? InstagramColors.textPrimary
                  : InstagramColors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsSection}>
          {loadingPosts ? (
            <View style={styles.postsLoadingContainer}>
              <ActivityIndicator size="large" color={InstagramColors.info} />
            </View>
          ) : posts.length > 0 ? (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <PostGridItem post={item} onPress={() => router.push(`/post/${item.id}`)} />
              )}
              ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
              columnWrapperStyle={styles.postRow}
            />
          ) : (
            <View style={styles.emptyPostsContainer}>
              <Ionicons name="images-outline" size={48} color={InstagramColors.textSecondary} />
              <Text style={styles.emptyPostsTitle}>No posts yet</Text>
              <Text style={styles.emptyPostsSubtitle}>
                Share photos and videos to see them here.
              </Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <ProfileMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
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

  headerUsername: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
  },

  scrollView: {
    flex: 1,
  },

  profileSection: {
    backgroundColor: InstagramColors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },

  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginLeft: Spacing.xl,
  },

  statItem: {
    alignItems: "center",
  },

  statNumber: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: InstagramColors.textPrimary,
  },

  statLabel: {
    fontSize: Typography.size.sm,
    color: InstagramColors.textSecondary,
    marginTop: 2,
  },

  userInfo: {
    marginBottom: Spacing.lg,
  },

  displayName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
    marginBottom: Spacing.xs,
  },

  bio: {
    fontSize: Typography.size.base,
    color: InstagramColors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.size.base * 1.3,
  },

  website: {
    fontSize: Typography.size.base,
    color: InstagramColors.info,
    marginBottom: Spacing.sm,
  },

  actionButtons: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },

  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: InstagramColors.border,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: InstagramColors.white,
  },

  editButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
  },

  shareButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: InstagramColors.border,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: InstagramColors.white,
  },

  shareButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
  },

  contactButton: {
    borderWidth: 1,
    borderColor: InstagramColors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: InstagramColors.white,
  },

  highlightsContainer: {
    marginBottom: Spacing.lg,
  },

  highlightsContent: {
    paddingVertical: Spacing.md,
  },

  highlightItem: {
    alignItems: "center",
    marginRight: Spacing.lg,
    width: 64,
  },

  highlightImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: InstagramColors.border,
    padding: 2,
    marginBottom: Spacing.xs,
  },

  highlightImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  highlightText: {
    fontSize: Typography.size.xs,
    color: InstagramColors.textPrimary,
    textAlign: "center",
    maxWidth: 64,
  },

  tabsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: InstagramColors.divider,
    backgroundColor: InstagramColors.white,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },

  activeTab: {
    borderBottomColor: InstagramColors.textPrimary,
  },

  postContainer: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
  },

  postImage: {
    width: "100%",
    height: "100%",
  },

  postSeparator: {
    height: 2,
  },

  postRow: {
    justifyContent: "space-between",
    marginBottom: 2,
  },

  logoutButton: {
    margin: Spacing.xl,
    borderWidth: 1,
    borderColor: InstagramColors.error,
    paddingVertical: Spacing.md,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: InstagramColors.white,
  },

  logoutButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.error,
  },

  postsSection: {
    minHeight: 200,
  },

  postsLoadingContainer: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyPostsContainer: {
    paddingVertical: Spacing["4xl"],
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  emptyPostsTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
  },

  emptyPostsSubtitle: {
    fontSize: Typography.size.base,
    color: InstagramColors.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },

  // Debug styles
  debugButton: {
    backgroundColor: InstagramColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: 8,
  },

});

import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { UserAvatar } from "../../components/instagram";
import { FriendService, User } from "../../service/friendService";
import {
  InstagramColors,
  Typography,
  Spacing,
  Shadows,
} from "../../constants/theme";

type TabType = "followers" | "following";

/**
 * Friends List Screen
 * Màn hình hiển thị danh sách Following/Followers với tab navigation
 */
export default function FriendsListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse params
  const initialTab = (params.tab as TabType) || "followers";
  const userId = params.userId as string; // Nếu xem của user khác
  const username = (params.username as string) || "User";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followStates, setFollowStates] = useState<
    Record<
      string,
      {
        isFollowing: boolean;
        hasPendingRequest: boolean;
        loading: boolean;
      }
    >
  >({});

  const loadRelationshipStates = useCallback(
    async (users: User[]) => {
      // Skip nếu đang xem profile của chính mình
      if (userId) return;

      const states: Record<string, any> = {};

      await Promise.all(
        users.map(async (user) => {
          try {
            const status = await FriendService.getRelationshipStatus(user.id);
            states[user.id] = {
              isFollowing: status.isFollowing,
              hasPendingRequest: status.hasPendingRequest,
              loading: false,
            };
          } catch {
            states[user.id] = {
              isFollowing: false,
              hasPendingRequest: false,
              loading: false,
            };
          }
        })
      );

      setFollowStates(states);
    },
    [userId]
  );

  const loadFollowers = useCallback(async () => {
    try {
      const result = await FriendService.getFollowers(userId);
      setFollowers(result.users);
      await loadRelationshipStates(result.users);
    } catch (error: any) {
      console.error("Error loading followers:", error);
      Alert.alert("Error", "Failed to load followers");
    }
  }, [userId, loadRelationshipStates]);

  const loadFollowing = useCallback(async () => {
    try {
      const result = await FriendService.getFollowing(userId);
      setFollowing(result.users);
      await loadRelationshipStates(result.users);
    } catch (error: any) {
      console.error("Error loading following:", error);
      Alert.alert("Error", "Failed to load following");
    }
  }, [userId, loadRelationshipStates]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "followers") {
        await loadFollowers();
      } else {
        await loadFollowing();
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadFollowers, loadFollowing]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleFollowToggle = async (user: User) => {
    const currentState = followStates[user.id];

    if (currentState?.loading) return;

    setFollowStates((prev) => ({
      ...prev,
      [user.id]: { ...currentState, loading: true },
    }));

    try {
      if (currentState?.isFollowing) {
        await FriendService.unfollowUser(user.id);
        setFollowStates((prev) => ({
          ...prev,
          [user.id]: {
            isFollowing: false,
            hasPendingRequest: false,
            loading: false,
          },
        }));
      } else if (currentState?.hasPendingRequest) {
        await FriendService.cancelFollowRequest(user.id);
        setFollowStates((prev) => ({
          ...prev,
          [user.id]: {
            isFollowing: false,
            hasPendingRequest: false,
            loading: false,
          },
        }));
      } else {
        await FriendService.sendFollowRequest(user.id);
        setFollowStates((prev) => ({
          ...prev,
          [user.id]: {
            isFollowing: false,
            hasPendingRequest: true,
            loading: false,
          },
        }));
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
      setFollowStates((prev) => ({
        ...prev,
        [user.id]: { ...currentState, loading: false },
      }));
    }
  };

  const getFollowButtonConfig = (user: User) => {
    const state = followStates[user.id];

    if (state?.isFollowing) {
      return {
        style: styles.followingButton,
        text: "Following",
        textStyle: styles.followingButtonText,
      };
    } else if (state?.hasPendingRequest) {
      return {
        style: styles.pendingButton,
        text: "Requested",
        textStyle: styles.pendingButtonText,
      };
    } else {
      return {
        style: styles.followButton,
        text: "Follow",
        textStyle: styles.followButtonText,
      };
    }
  };

  const renderUserItem = ({ item: user }: { item: User }) => {
    const buttonConfig = getFollowButtonConfig(user);
    const state = followStates[user.id];
    const showFollowButton = !userId; // Chỉ hiện button khi xem của chính mình

    return (
      <View style={styles.userItem}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => console.log("Navigate to profile:", user.id)}
        >
          <UserAvatar
            uri={user.avatar || "https://i.imgur.com/2nCt3Sb.jpg"}
            size="md"
            hasStory={Math.random() > 0.7} // Random story for demo
          />
          <View style={styles.userDetails}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{user.username}</Text>
              {user.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={InstagramColors.info}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            {user.name && <Text style={styles.fullName}>{user.name}</Text>}
            {user.followersCount !== undefined && (
              <Text style={styles.followersCount}>
                {user.followersCount.toLocaleString()} followers
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {showFollowButton && (
          <TouchableOpacity
            style={buttonConfig.style}
            onPress={() => handleFollowToggle(user)}
            disabled={state?.loading}
          >
            {state?.loading ? (
              <ActivityIndicator size="small" color={InstagramColors.white} />
            ) : (
              <Text style={buttonConfig.textStyle}>{buttonConfig.text}</Text>
            )}
          </TouchableOpacity>
        )}

        {!showFollowButton && (
          <TouchableOpacity style={styles.moreButton}>
            <Feather
              name="more-horizontal"
              size={20}
              color={InstagramColors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Feather
        name={activeTab === "followers" ? "users" : "user-check"}
        size={48}
        color={InstagramColors.textSecondary}
      />
      <Text style={styles.emptyText}>
        {activeTab === "followers"
          ? userId
            ? `${username} has no followers yet`
            : "No followers yet"
          : userId
          ? `${username} isn't following anyone yet`
          : "Not following anyone yet"}
      </Text>
      <Text style={styles.emptySubtext}>
        {activeTab === "followers"
          ? "When people follow this account, you will see them here."
          : "When this account follows people, you will see them here."}
      </Text>
    </View>
  );

  const currentData = activeTab === "followers" ? followers : following;
  const followersCount = followers.length;
  const followingCount = following.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={InstagramColors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{username}</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Feather
            name="search"
            size={24}
            color={InstagramColors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "followers" && styles.activeTab]}
          onPress={() => handleTabChange("followers")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "followers" && styles.activeTabText,
            ]}
          >
            {followersCount} followers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "following" && styles.activeTab]}
          onPress={() => handleTabChange("following")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "following" && styles.activeTabText,
            ]}
          >
            {followingCount} following
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={InstagramColors.info} />
          <Text style={styles.loadingText}>Loading {activeTab}...</Text>
        </View>
      ) : (
        <FlatList
          data={currentData}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            currentData.length === 0 ? styles.emptyListContainer : undefined
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[InstagramColors.info]}
              tintColor={InstagramColors.info}
            />
          }
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
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: InstagramColors.white,
    borderBottomWidth: 1,
    borderBottomColor: InstagramColors.divider,
    ...Shadows.small,
  },

  backButton: {
    padding: Spacing.xs,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
  },

  searchButton: {
    padding: Spacing.xs,
  },

  tabsContainer: {
    flexDirection: "row",
    backgroundColor: InstagramColors.white,
    borderBottomWidth: 1,
    borderBottomColor: InstagramColors.divider,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  activeTab: {
    borderBottomColor: InstagramColors.textPrimary,
  },

  tabText: {
    fontSize: Typography.size.base,
    color: InstagramColors.textSecondary,
    fontWeight: Typography.weight.medium,
  },

  activeTabText: {
    color: InstagramColors.textPrimary,
    fontWeight: Typography.weight.semibold,
  },

  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: InstagramColors.white,
  },

  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  userDetails: {
    flex: 1,
    marginLeft: Spacing.md,
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

  fullName: {
    fontSize: Typography.size.sm,
    color: InstagramColors.textSecondary,
    marginTop: 2,
  },

  followersCount: {
    fontSize: Typography.size.sm,
    color: InstagramColors.textSecondary,
    marginTop: 2,
  },

  followButton: {
    backgroundColor: InstagramColors.info,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },

  followButtonText: {
    color: InstagramColors.white,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },

  followingButton: {
    backgroundColor: InstagramColors.white,
    borderWidth: 1,
    borderColor: InstagramColors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },

  followingButtonText: {
    color: InstagramColors.textPrimary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },

  pendingButton: {
    backgroundColor: InstagramColors.background,
    borderWidth: 1,
    borderColor: InstagramColors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },

  pendingButtonText: {
    color: InstagramColors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },

  moreButton: {
    padding: Spacing.sm,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },

  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.base,
    color: InstagramColors.textSecondary,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["4xl"],
  },

  emptyListContainer: {
    flexGrow: 1,
  },

  emptyText: {
    fontSize: Typography.size.lg,
    color: InstagramColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontWeight: Typography.weight.medium,
  },

  emptySubtext: {
    fontSize: Typography.size.base,
    color: InstagramColors.textTertiary,
    textAlign: "center",
    lineHeight: Typography.size.base * 1.4,
  },
});

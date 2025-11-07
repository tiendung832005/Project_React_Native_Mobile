import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { UserAvatar } from "../../components/instagram";
import { FriendService, User } from "../../service/friendService";
import {
  InstagramColors,
  Typography,
  Spacing,
  Shadows,
} from "../../constants/theme";

/**
 * Search Friends Screen
 * Màn hình tìm kiếm bạn bè theo số điện thoại
 */
export default function SearchFriendsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [followState, setFollowState] = useState<{
    isFollowing: boolean;
    hasPendingRequest: boolean;
    loading: boolean;
  }>({
    isFollowing: false,
    hasPendingRequest: false,
    loading: false,
  });

  // Load relationship status when search result changes
  useEffect(() => {
    if (searchResult) {
      loadRelationshipStatus(searchResult.id);
    }
  }, [searchResult]);

  const loadRelationshipStatus = async (userId: string) => {
    try {
      const status = await FriendService.getRelationshipStatus(userId);
      setFollowState({
        isFollowing: status.isFollowing,
        hasPendingRequest: status.hasPendingRequest || status.hasReceivedRequest,
        loading: false,
      });
    } catch (error) {
      console.error("Error loading relationship status:", error);
      setFollowState({
        isFollowing: false,
        hasPendingRequest: false,
        loading: false,
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }

    // Validate phone number format (basic check)
    const phoneRegex = /^[0-9]{10,15}$/;
    const cleanPhone = searchQuery.trim().replace(/[\s\-\(\)]/g, '');

    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid phone number (10-15 digits)"
      );
      return;
    }

    setLoading(true);
    try {
      const user = await FriendService.searchUserByPhone(cleanPhone);
      setSearchResult(user);
    } catch (error: any) {
      Alert.alert("Not Found", error.message || "User not found with this phone number");
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!searchResult || followState.loading) return;

    setFollowState((prev) => ({ ...prev, loading: true }));

    try {
      if (followState.isFollowing) {
        // Unfollow
        await FriendService.unfollowUser(searchResult.id);
        setFollowState({
          isFollowing: false,
          hasPendingRequest: false,
          loading: false,
        });
        Alert.alert("Success", "Unfollowed successfully");
      } else if (followState.hasPendingRequest) {
        // Cancel follow request
        await FriendService.cancelFollowRequest(searchResult.id);
        setFollowState({
          isFollowing: false,
          hasPendingRequest: false,
          loading: false,
        });
        Alert.alert("Success", "Request canceled");
      } else {
        // Send follow request
        await FriendService.sendFollowRequest(searchResult.id);
        setFollowState({
          isFollowing: false,
          hasPendingRequest: true,
          loading: false,
        });
        Alert.alert("Success", "Follow request sent");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update follow status");
      setFollowState((prev) => ({ ...prev, loading: false }));
    }
  };

  const getFollowButtonConfig = () => {
    if (followState.isFollowing) {
      return {
        style: styles.followingButton,
        text: "Following",
        textStyle: styles.followingButtonText,
      };
    } else if (followState.hasPendingRequest) {
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        <Text style={styles.headerTitle}>Find Friends</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather
              name="search"
              size={20}
              color={InstagramColors.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by phone number..."
              placeholderTextColor={InstagramColors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="phone-pad"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchResult(null);
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={InstagramColors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color={InstagramColors.white} />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Result */}
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={InstagramColors.info} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : searchResult ? (
            <View style={styles.userCard}>
              <View style={styles.userInfo}>
                <UserAvatar
                  uri={searchResult.avatar || "https://i.imgur.com/2nCt3Sb.jpg"}
                  size="xl"
                  hasStory={false}
                />
                <View style={styles.userDetails}>
                  <View style={styles.usernameRow}>
                    <Text style={styles.username}>{searchResult.username}</Text>
                    {searchResult.isVerified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={InstagramColors.info}
                        style={styles.verifiedIcon}
                      />
                    )}
                  </View>
                  {searchResult.name && (
                    <Text style={styles.fullName}>{searchResult.name}</Text>
                  )}
                  {searchResult.bio && (
                    <Text style={styles.bio}>{searchResult.bio}</Text>
                  )}
                  {searchResult.email && (
                    <Text style={styles.email}>{searchResult.email}</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={getFollowButtonConfig().style}
                onPress={handleFollowToggle}
                disabled={followState.loading}
              >
                {followState.loading ? (
                  <ActivityIndicator
                    size="small"
                    color={InstagramColors.white}
                  />
                ) : (
                  <Text style={getFollowButtonConfig().textStyle}>
                    {getFollowButtonConfig().text}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : searchQuery.trim() ? (
            <View style={styles.emptyContainer}>
              <Feather
                name="search"
                size={48}
                color={InstagramColors.textSecondary}
              />
              <Text style={styles.emptyText}>No user found</Text>
              <Text style={styles.emptySubtext}>
                Try searching with a valid phone number
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Feather
                name="phone"
                size={48}
                color={InstagramColors.textSecondary}
              />
              <Text style={styles.emptyText}>Search for friends</Text>
              <Text style={styles.emptySubtext}>
                Enter a phone number to find friends on Instagram
              </Text>
            </View>
          )}
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

  headerSpacer: {
    width: 24 + Spacing.xs * 2, // Match back button width
  },

  content: {
    flex: 1,
  },

  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: InstagramColors.white,
    borderBottomWidth: 1,
    borderBottomColor: InstagramColors.divider,
    gap: Spacing.sm,
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: InstagramColors.background,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: Typography.size.base,
    color: InstagramColors.textPrimary,
  },

  searchButton: {
    backgroundColor: InstagramColors.info,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },

  searchButtonText: {
    color: InstagramColors.white,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },

  resultsContainer: {
    flex: 1,
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

  userCard: {
    padding: Spacing.lg,
    backgroundColor: InstagramColors.white,
    borderBottomWidth: 1,
    borderBottomColor: InstagramColors.divider,
  },

  userInfo: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },

  userDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },

  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },

  username: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
  },

  verifiedIcon: {
    marginLeft: Spacing.xs,
  },

  fullName: {
    fontSize: Typography.size.base,
    color: InstagramColors.textSecondary,
    marginBottom: Spacing.xs,
  },

  bio: {
    fontSize: Typography.size.sm,
    color: InstagramColors.textSecondary,
    marginBottom: Spacing.xs,
  },

  email: {
    fontSize: Typography.size.sm,
    color: InstagramColors.textTertiary,
  },

  followButton: {
    backgroundColor: InstagramColors.info,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 6,
    alignItems: "center",
  },

  followButtonText: {
    color: InstagramColors.white,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },

  followingButton: {
    backgroundColor: InstagramColors.white,
    borderWidth: 1,
    borderColor: InstagramColors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 6,
    alignItems: "center",
  },

  followingButtonText: {
    color: InstagramColors.textPrimary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },

  pendingButton: {
    backgroundColor: InstagramColors.background,
    borderWidth: 1,
    borderColor: InstagramColors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 6,
    alignItems: "center",
  },

  pendingButtonText: {
    color: InstagramColors.textSecondary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["4xl"],
  },

  emptyText: {
    fontSize: Typography.size.lg,
    color: InstagramColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  emptySubtext: {
    fontSize: Typography.size.base,
    color: InstagramColors.textTertiary,
    textAlign: "center",
    lineHeight: Typography.size.base * 1.4,
  },
});

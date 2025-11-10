import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { UserAvatar } from "../../../components/instagram";
import { FriendService, Friend } from "../../../service/friendService";
import { InstagramColors, Typography, Spacing } from "../../../constants/theme";

/**
 * Following Screen - Danh sách bạn bè (following)
 */
export default function FollowingScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFriends = useCallback(async () => {
    try {
      const friendsList = await FriendService.getFriends();
      setFriends(friendsList);
    } catch (error: any) {
      console.error("Error loading friends:", error);
      Alert.alert("Error", error.message || "Failed to load friends");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFriends();
  };

  const handleUnfriend = async (friend: Friend) => {
    Alert.alert(
      "Unfriend",
      `Are you sure you want to unfriend ${friend.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unfriend",
          style: "destructive",
          onPress: async () => {
            try {
              await FriendService.unfollowUser(friend.id);
              setFriends((prev) => prev.filter((f) => f.id !== friend.id));
              Alert.alert("Success", "Unfriended successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to unfriend");
            }
          },
        },
      ]
    );
  };

  const handleMessagePress = (friend: Friend) => {
    router.push(`/messages/chat/${friend.id}`);
  };

  const renderFriendItem = ({ item: friend }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <TouchableOpacity
        style={styles.friendInfo}
        onPress={() => handleMessagePress(friend)}
        activeOpacity={0.7}
      >
        <UserAvatar
          uri={friend.avatar || "https://i.imgur.com/2nCt3Sb.jpg"}
          size="md"
          hasStory={false}
        />
        <View style={styles.friendDetails}>
          <Text style={styles.username}>{friend.username}</Text>
          {friend.bio && <Text style={styles.bio}>{friend.bio}</Text>}
          <Text style={styles.friendsSince}>
            Friends since {new Date(friend.friendsSince).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => handleMessagePress(friend)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={InstagramColors.info} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.unfriendButton}
          onPress={() => handleUnfriend(friend)}
        >
          <Text style={styles.unfriendText}>Unfriend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="people-outline"
        size={64}
        color={InstagramColors.textSecondary}
      />
      <Text style={styles.emptyText}>No friends yet</Text>
      <Text style={styles.emptySubtext}>
        Start following people to see them here
      </Text>
    </View>
  );

  if (loading && friends.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={InstagramColors.info} />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[InstagramColors.info]}
            tintColor={InstagramColors.info}
          />
        }
        contentContainerStyle={
          friends.length === 0 ? styles.emptyListContainer : undefined
        }
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
    backgroundColor: InstagramColors.white,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.base,
    color: InstagramColors.textSecondary,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: InstagramColors.white,
    borderBottomWidth: 1,
    borderBottomColor: InstagramColors.divider,
  },
  friendInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  friendDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  username: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  bio: {
    fontSize: Typography.size.sm,
    color: InstagramColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  friendsSince: {
    fontSize: Typography.size.xs,
    color: InstagramColors.textTertiary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  messageButton: {
    padding: Spacing.sm,
    borderRadius: 20,
    backgroundColor: InstagramColors.background,
  },
  unfriendButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: InstagramColors.border,
  },
  unfriendText: {
    fontSize: Typography.size.sm,
    color: InstagramColors.textPrimary,
    fontWeight: Typography.weight.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["4xl"],
    paddingVertical: Spacing["4xl"],
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.size.base,
    color: InstagramColors.textSecondary,
    textAlign: "center",
    lineHeight: Typography.size.base * 1.4,
  },
});

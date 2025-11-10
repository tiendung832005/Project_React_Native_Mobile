import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserAvatar } from "../../../components/instagram";
import { FriendService, FollowRequest } from "../../../service/friendService";
import { InstagramColors, Spacing, Typography } from "../../../constants/theme";
import { useNotifications } from "../../../context/NotificationContext";

/**
 * Tabs Like Index - "You" tab trong like section
 * Hiển thị follow requests và activities
 */
export default function TabsLikeYouScreen() {
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRequests, setProcessingRequests] = useState<
    Record<string, boolean>
  >({});
  const { refreshCounts } = useNotifications();

  const loadFollowRequests = useCallback(async () => {
    try {
      const requests = await FriendService.getPendingFollowRequests();
      setFollowRequests(requests);
    } catch (error: any) {
      console.error("Error loading follow requests:", error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await loadFollowRequests();
    setLoading(false);
  }, [loadFollowRequests]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAcceptRequest = async (request: FollowRequest) => {
    if (processingRequests[request.id]) return;

    setProcessingRequests((prev) => ({ ...prev, [request.id]: true }));

    try {
      await FriendService.acceptFollowRequest(request.id);
      // Remove request from list
      setFollowRequests((prev) => prev.filter((r) => r.id !== request.id));
      // Refresh notification counts
      await refreshCounts();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setProcessingRequests((prev) => ({ ...prev, [request.id]: false }));
    }
  };

  const handleRejectRequest = async (request: FollowRequest) => {
    if (processingRequests[request.id]) return;

    setProcessingRequests((prev) => ({ ...prev, [request.id]: true }));

    try {
      await FriendService.rejectFollowRequest(request.id);
      // Remove request from list
      setFollowRequests((prev) => prev.filter((r) => r.id !== request.id));
      // Refresh notification counts
      await refreshCounts();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setProcessingRequests((prev) => ({ ...prev, [request.id]: false }));
    }
  };

  const renderFollowRequest = (request: FollowRequest) => {
    const isProcessing = processingRequests[request.id];

    return (
      <View key={request.id} style={styles.followRequestItem}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() =>
            console.log("Navigate to profile:", request.fromUser.id)
          }
        >
          <UserAvatar
            uri={request.fromUser.avatar || "https://i.imgur.com/2nCt3Sb.jpg"}
            size="md"
            hasStory={false}
          />
          <View style={styles.textContainer}>
            <Text style={styles.mainText}>
              <Text style={styles.username}>{request.fromUser.username}</Text>
              {request.fromUser.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={InstagramColors.info}
                  style={styles.verifiedIcon}
                />
              )}
              <Text> wants to follow you.</Text>
            </Text>
            {request.fromUser.name && (
              <Text style={styles.fullName}>{request.fromUser.name}</Text>
            )}
            <Text style={styles.timeText}>
              {new Date(request.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.acceptButton, isProcessing && styles.disabledButton]}
            onPress={() => handleAcceptRequest(request)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={InstagramColors.white} />
            ) : (
              <Text style={styles.acceptText}>Accept</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rejectButton, isProcessing && styles.disabledButton]}
            onPress={() => handleRejectRequest(request)}
            disabled={isProcessing}
          >
            <Text style={styles.rejectText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyRequests = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="mail-outline"
        size={64}
        color={InstagramColors.textSecondary}
      />
      <Text style={styles.emptyText}>No follow requests</Text>
      <Text style={styles.emptySubtext}>
        When someone wants to follow you, you'll see it here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={InstagramColors.info} />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[InstagramColors.info]}
            tintColor={InstagramColors.info}
          />
        }
      >
        {/* Follow Requests Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Follow Requests</Text>
          {followRequests.length > 0 && (
            <Text style={styles.requestCount}>{followRequests.length}</Text>
          )}
        </View>

        {followRequests.length > 0 ? (
          <>
            {followRequests.map(renderFollowRequest)}
            <View style={styles.divider} />
          </>
        ) : (
          renderEmptyRequests()
        )}

        {/* Other Activities - Mock data for now */}
        <Text style={styles.sectionTitle}>Earlier</Text>

        <View style={styles.item}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <Text style={styles.mainText}>
              <Text style={styles.username}>karenne </Text>liked your photo.
            </Text>
            <Text style={styles.timeText}>1h</Text>
          </View>
          <Image
            source={{ uri: "https://picsum.photos/100/100?1" }}
            style={styles.thumbnail}
          />
        </View>

        <View style={styles.item}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <Text style={styles.mainText}>
              <Text style={styles.username}>kiero_d, zackjohn </Text>and 26
              others liked your photo.
            </Text>
            <Text style={styles.timeText}>3h</Text>
          </View>
          <Image
            source={{ uri: "https://picsum.photos/100/100?2" }}
            style={styles.thumbnail}
          />
        </View>

        <View style={styles.item}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <Text style={styles.mainText}>
              <Text style={styles.username}>craig_love </Text>mentioned you in a
              comment: <Text style={styles.tag}>@jacob_w </Text>exactly..
            </Text>
            <Text style={styles.timeText}>2d</Text>
          </View>
          <Image
            source={{ uri: "https://picsum.photos/100/100?3" }}
            style={styles.thumbnail}
          />
        </View>
      </ScrollView>
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
    fontSize: 14,
    color: InstagramColors.darkGray,
    marginTop: Spacing.md,
  },
  scrollContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },

  // Follow Requests Section
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: InstagramColors.black,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.md,
  },
  requestCount: {
    fontSize: 12,
    color: InstagramColors.info,
    backgroundColor: InstagramColors.lightGray,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 20,
    textAlign: "center",
  },

  // Follow Request Item
  followRequestItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: InstagramColors.white,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  username: {
    fontWeight: "600",
    color: InstagramColors.black,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  fullName: {
    fontSize: 12,
    color: InstagramColors.darkGray,
    marginTop: 2,
  },
  mainText: {
    fontSize: 14,
    color: InstagramColors.black,
    lineHeight: 18,
  },
  timeText: {
    fontSize: 12,
    color: InstagramColors.darkGray,
    marginTop: 2,
  },

  // Request Actions
  requestActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  acceptButton: {
    backgroundColor: InstagramColors.info,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    minWidth: 70,
    alignItems: "center",
  },
  acceptText: {
    fontSize: 14,
    color: InstagramColors.white,
    fontWeight: "600",
  },
  rejectButton: {
    backgroundColor: InstagramColors.lightGray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    minWidth: 70,
    alignItems: "center",
  },
  rejectText: {
    fontSize: 14,
    color: InstagramColors.black,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: InstagramColors.lightGray,
    marginVertical: Spacing.md,
  },

  // Legacy styles for existing activities
  followRequest: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  followRequestText: {
    fontSize: 16,
    fontWeight: "600",
    color: InstagramColors.black,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  tag: {
    color: InstagramColors.info,
  },
  emptyContainer: {
    paddingVertical: Spacing["4xl"],
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
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
  messageButton: {
    backgroundColor: InstagramColors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  messageText: {
    fontSize: 14,
    fontWeight: "600",
    color: InstagramColors.black,
  },
  followButton: {
    backgroundColor: InstagramColors.info,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  followText: {
    fontSize: 14,
    fontWeight: "600",
    color: InstagramColors.white,
  },
});

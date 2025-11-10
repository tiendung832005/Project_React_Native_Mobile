import { Stack, useRouter, useSegments } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Platform,
} from "react-native";
import { useNotifications } from "../../../context/NotificationContext";

/**
 * Tabs Like Layout - Like section trong main tabs
 * Có SafeAreaView để tránh bị che bởi status bar/notch
 */
export default function TabsLikeLayout() {
  const router = useRouter();
  const segments = useSegments();
  const currentSegment = String(segments[segments.length - 1]);
  const current = currentSegment === "(tabs)" ? "like" : currentSegment;
  const { counts } = useNotifications();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header với tab navigation */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      {/* Tab bar cho Following/You */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, current === "following" && styles.activeTab]}
          onPress={() => router.push("/(tabs)/like/following")}
        >
          <Text
            style={
              current === "following"
                ? styles.tabTextActive
                : styles.tabTextInactive
            }
          >
            Following
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            (current === "index" || current === "like") && styles.activeTab,
          ]}
          onPress={() => router.push("/(tabs)/like")}
        >
          <View style={styles.tabContent}>
            <Text
              style={
                current === "index" || current === "like"
                  ? styles.tabTextActive
                  : styles.tabTextInactive
              }
            >
              You
            </Text>
            {counts.friendRequestCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {counts.friendRequestCount > 99 ? '99+' : counts.friendRequestCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Content area */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#f8f8f8",
    backgroundColor: "#fff",
    // Thêm padding top cho iOS để tránh notch
    paddingTop: Platform.OS === "ios" ? 5 : 10,
  },
  tab: {
    paddingVertical: 12,
    width: "50%",
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tabTextActive: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 16,
  },
  tabTextInactive: {
    fontSize: 16,
    color: "#888",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    backgroundColor: "#FF3040",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

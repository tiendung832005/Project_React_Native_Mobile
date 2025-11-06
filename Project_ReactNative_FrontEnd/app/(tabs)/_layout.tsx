import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, BackHandler } from "react-native";

/**
 * Main Tabs Layout - Bottom Navigation Bar
 * Chứa các tab chính của app: Home, Search, Post, Likes, Profile
 *
 * Tính năng:
 * - Back button trong tabs không thoát app mà chuyển về tab đầu tiên
 * - Custom back handler để prevent app exit
 * - Tab bar styling theo design Instagram
 * - Ẩn một số màn hình khỏi tab bar nhưng vẫn accessible
 */
export default function TabsLayout() {
  const router = useRouter();

  // Custom back handler cho Android để prevent app exit
  useEffect(() => {
    if (Platform.OS === "android") {
      const backAction = () => {
        // Trong tabs, back button không thoát app
        // Thay vào đó chuyển về home tab
        router.replace("/(tabs)");
        return true; // Prevent default behavior (exit app)
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }
  }, [router]);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#8e8e8e",
        tabBarHideOnKeyboard: true,
        // Tab bar styling để giống Instagram
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 60,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 34 : 8,
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#E5E5E5",
          elevation: 0,
          shadowOpacity: 0,
          zIndex: 1,
        },
        tabBarItemStyle: {
          height: 50,
        },
      }}
    >
      {/* Home Tab - Tab chính, entry point của main app */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />

      {/* Search Tab */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />

      {/* Post Tab - Nổi bật hơn một chút */}
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="add-circle-outline"
              size={(size ?? 24) + 6}
              color={color}
            />
          ),
        }}
      />

      {/* Likes Tab - Có sub-navigation */}
      <Tabs.Screen
        name="like"
        options={{
          title: "Likes",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />

      {/* Profile Tab - Có stack navigation con */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />

      {/* Màn hình ẩn - Không hiển thị trong tab bar */}
      <Tabs.Screen
        name="live"
        options={{
          href: null, // Ẩn khỏi tab bar
          title: "Live",
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: null, // Ẩn khỏi tab bar
          title: "Messages",
        }}
      />
      <Tabs.Screen
        name="myLive"
        options={{
          href: null, // Ẩn khỏi tab bar
          title: "My Live",
        }}
      />
    </Tabs>
  );
}

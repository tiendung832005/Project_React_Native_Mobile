import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

/**
 * Main Tabs - Bottom Navigation Bar cho các tab chính
 * Bao gồm: Home, Search, Post, Likes, Profile
 *
 * Tính năng:
 * - Back button trong tabs không thoát app
 * - Gesture navigation tắt để không conflict với app logic
 * - Tab bar tùy chỉnh theo design Instagram
 */
export default function MainTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#8e8e8e",
        tabBarHideOnKeyboard: true,
        // Tab bar styling
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
      {/* Home Tab - Tab chính, luôn là entry point */}
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

      {/* Post Tab - Lớn hơn một chút để nổi bật */}
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

      {/* Likes Tab - Sử dụng stack navigation nội bộ */}
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

      {/* Profile Tab - Có stack navigation con (profile, edit) */}
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

      {/* Các màn hình ẩn - Không hiển thị trong tab bar nhưng accessible */}
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

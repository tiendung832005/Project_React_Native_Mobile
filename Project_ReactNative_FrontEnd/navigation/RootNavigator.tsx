import React from "react";
import { Stack } from "expo-router";

/**
 * Root Navigator - Navigator chính của toàn bộ app
 * Quản lý navigation giữa Auth Stack và Main Tabs
 *
 * Cấu trúc:
 * - index.tsx: Auth Guard (kiểm tra token và redirect)
 * - auth/*: Auth Stack (Login, Register)
 * - (tabs)/*: Main Tabs (Home, Search, Post, Likes, Profile)
 * - Các màn hình độc lập khác
 *
 * Tính năng:
 * - Chỉ có một NavigationContainer (tự động bởi Expo Router)
 * - Reset stack khi login/logout
 * - Quản lý gesture navigation và back behavior
 */
export default function RootNavigator() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* 
        Auth Guard - Entry point của app
        Kiểm tra token và redirect đến đúng flow
      */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          gestureEnabled: false, // Không cho phép swipe back
        }}
      />

      {/* 
        Auth Stack - Chỉ accessible khi chưa đăng nhập
        Bao gồm: login, register, forgot-password
      */}
      <Stack.Screen
        name="auth/login"
        options={{
          headerShown: false,
          gestureEnabled: false, // Không cho phép swipe back từ login
          // Ẩn hoàn toàn khỏi stack history khi navigate away
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="auth/register"
        options={{
          headerShown: false,
          gestureEnabled: true, // Cho phép back từ register về login
        }}
      />

      {/* 
        Main Tabs - Chỉ accessible khi đã đăng nhập
        Bao gồm: Home, Search, Post, Likes, Profile
      */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          gestureEnabled: false, // Không cho phép swipe back về auth
          // Animation đặc biệt khi vào tabs
          animation: "fade",
        }}
      />

      {/* 
        Các màn hình độc lập - Có thể navigate từ bất kỳ đâu
        Những màn hình này có thể được access từ nhiều nơi khác nhau
      */}
      <Stack.Screen
        name="igtv"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="pictureShot"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="addImage"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="show"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="story"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />

      {/* 
        DEPRECATED: Các routes này đã được tích hợp vào tabs
        Giữ lại để tương thích với deep links hoặc navigation từ nơi khác
        Nhưng nên redirect về tabs thay vì hiển thị trực tiếp
      */}
      <Stack.Screen
        name="like"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}

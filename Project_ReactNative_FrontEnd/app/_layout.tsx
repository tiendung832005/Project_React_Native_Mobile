import { Stack } from "expo-router";
import React from "react";

/**
 * Root Layout - Quản lý toàn bộ navigation của app
 * Expo Router tự động quản lý NavigationContainer
 *
 * Cấu trúc:
 * - index.tsx: Auth guard - kiểm tra token và redirect
 * - auth/*: Auth stack (login, register)
 * - (tabs)/*: Main tabs (home, search, post, like, profile)
 * - Các màn hình độc lập khác
 *
 * QUAN TRỌNG:
 * - Chỉ có một NavigationContainer (tự động bởi Expo Router)
 * - Sử dụng router.replace() để reset stack khi login/logout
 * - Gesture navigation được điều khiển theo từng màn hình
 */
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth guard - kiểm tra token và redirect */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          gestureEnabled: false, // Không cho phép swipe back
        }}
      />

      {/* Auth stack - Chỉ accessible khi chưa đăng nhập */}
      <Stack.Screen
        name="auth/login"
        options={{
          headerShown: false,
          gestureEnabled: false, // Không cho phép swipe back từ login
        }}
      />
      <Stack.Screen
        name="auth/register"
        options={{
          headerShown: false,
          gestureEnabled: true, // Cho phép back từ register về login
        }}
      />

      {/* Main tabs - Chỉ accessible khi đã đăng nhập */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          gestureEnabled: false, // Không cho phép swipe back về auth
        }}
      />

      {/* Các màn hình độc lập - Có thể navigate từ bất kỳ đâu */}
      <Stack.Screen name="igtv" options={{ headerShown: false }} />
      <Stack.Screen name="pictureShot" options={{ headerShown: false }} />
      <Stack.Screen name="addImage" options={{ headerShown: false }} />
      <Stack.Screen name="show" options={{ headerShown: false }} />
      <Stack.Screen name="story" options={{ headerShown: false }} />

      {/* 
        DEPRECATED/COMPATIBILITY ROUTES:
        Các routes này đã được tích hợp vào tabs nhưng giữ lại để:
        1. Deep links compatibility
        2. Redirect về tabs thay vì hiển thị trực tiếp
        3. Tránh navigation errors
      */}
      <Stack.Screen
        name="like"
        options={{
          headerShown: false,
          // Route này sẽ redirect về tabs/like
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
          // Route này sẽ redirect về tabs/profile
        }}
      />
    </Stack>
  );
}

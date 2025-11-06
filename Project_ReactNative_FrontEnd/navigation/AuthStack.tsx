import React from "react";
import { Stack } from "expo-router";

/**
 * Auth Stack - Quản lý navigation cho các màn hình authentication
 * Bao gồm: Login, Register, Forgot Password
 *
 * Tính năng:
 * - Không cho phép gesture back (swipe)
 * - Reset stack khi login thành công
 * - Ẩn header để có UI tùy chỉnh
 */
export default function AuthStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Không cho phép swipe back
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          // Không cho phép back gesture vì đây là entry point của auth
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Register",
          // Cho phép back từ register về login
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Forgot Password",
          // Cho phép back từ forgot password về login
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}

import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { isAuthenticated } from "../service/authService";
import { NavigationActions } from "../navigation";

/**
 * Root Index - Auth Guard
 * Kiểm tra trạng thái đăng nhập và redirect đến đúng màn hình
 * - Nếu đã đăng nhập: redirect đến (tabs)
 * - Nếu chưa đăng nhập: redirect đến /auth/login
 *
 * Sử dụng router.replace() để reset stack và không cho phép back
 *
 * Flow:
 * 1. App khởi động -> index.tsx
 * 2. Kiểm tra token
 * 3. Redirect đến đúng flow (auth hoặc main)
 * 4. Component này sẽ unmount sau khi redirect
 */
export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const authenticated = await isAuthenticated();

      if (authenticated) {
        // Đã đăng nhập - reset stack và vào main app
        console.log("User authenticated, redirecting to main app");
        NavigationActions.resetToMain();
      } else {
        // Chưa đăng nhập - reset stack và vào auth flow
        console.log("User not authenticated, redirecting to login");
        NavigationActions.resetToAuth();
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Lỗi - mặc định redirect đến login để an toàn
      NavigationActions.resetToAuth();
    } finally {
      setLoading(false);
    }
  };

  // Loading screen trong khi kiểm tra auth
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3797EF" />
      </View>
    );
  }

  // Component này sẽ unmount sau khi redirect
  // Trả về null để tránh flash content
  return null;
}

const styles = {
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
  },
};

import { Stack } from "expo-router";
import React from "react";

/**
 * Tabs Profile Layout
 * Stack navigation cho profile section trong tabs
 */
export default function TabsProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Profile",
          headerShown: false,
          presentation: "modal", // Hiển thị như modal
        }}
      />
    </Stack>
  );
}

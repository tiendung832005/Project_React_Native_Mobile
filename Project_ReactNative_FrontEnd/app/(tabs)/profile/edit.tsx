import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { updateProfile, UpdateProfileData } from "../../../service/authService";
import {
  getUserProfile,
  updateProfileLocally,
} from "../../../service/profileStorage";

type Profile = {
  name: string;
  username: string;
  website: string;
  bio: string;
  email: string;
  phone: string;
  gender: string;
  avatar?: string;
};

export default function TabsEditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    username: "",
    website: "",
    bio: "",
    email: "",
    phone: "",
    gender: "",
    avatar: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Use getUserProfile which handles API fallback
      const userData = await getUserProfile();
      setProfile({
        name: userData.name || "",
        username: userData.username || "",
        website: userData.website || "",
        bio: userData.bio || "",
        email: userData.email || "",
        phone: userData.phone || "",
        gender: userData.gender || "",
        avatar: userData.avatar || "https://i.imgur.com/2nCt3Sb.jpg",
      });
    } catch (error: any) {
      console.warn("Error loading user data:", error.message);

      // Final fallback
      setProfile({
        name: "User",
        username: "user",
        website: "",
        bio: "",
        email: "user@example.com",
        phone: "",
        gender: "",
        avatar: "https://i.imgur.com/2nCt3Sb.jpg",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData: UpdateProfileData = {
        name: profile.name,
        username: profile.username,
        website: profile.website,
        bio: profile.bio,
        email: profile.email,
        phone: profile.phone,
        gender: profile.gender,
      };

      try {
        // Try API first
        await updateProfile(updateData);
        Alert.alert("Success", "Profile updated successfully", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } catch (apiError) {
        // API failed, save locally
        console.log("API failed, saving locally:", apiError);
        await updateProfileLocally(updateData);

        Alert.alert(
          "Saved Offline",
          "Profile updated locally. Changes will sync when connected to internet.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3797EF" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 15,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} disabled={saving}>
          <Text style={{ color: "#0095f6", fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Edit Profile</Text>

        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#0095f6" />
          ) : (
            <Text style={{ color: "#0095f6", fontSize: 16 }}>Done</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <Image
          source={{ uri: profile.avatar || "https://i.imgur.com/2nCt3Sb.jpg" }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
        <TouchableOpacity>
          <Text style={{ color: "#0095f6", marginTop: 8 }}>
            Change Profile Photo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Fields */}
      <View style={{ marginTop: 20 }}>
        {(
          [
            { label: "Name", key: "name" },
            { label: "Username", key: "username" },
            { label: "Website", key: "website" },
            { label: "Bio", key: "bio", multiline: true },
          ] as { label: string; key: keyof Profile; multiline?: boolean }[]
        ).map((item) => (
          <View
            key={item.key}
            style={{
              flexDirection: "row",
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
          >
            <Text style={{ width: 90, fontSize: 16 }}>{item.label}</Text>
            <TextInput
              value={profile[item.key]}
              onChangeText={(text) => handleChange(item.key, text)}
              style={{
                flex: 1,
                borderBottomWidth: 0.5,
                borderColor: "#ddd",
                paddingVertical: 2,
                fontSize: 16,
              }}
              multiline={item.multiline}
              placeholder={item.label}
            />
          </View>
        ))}
      </View>

      {/* Switch to Pro */}
      <TouchableOpacity style={{ padding: 20 }}>
        <Text style={{ color: "#0095f6" }}>Switch to Professional Account</Text>
      </TouchableOpacity>

      {/* Private Information */}
      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
          Private Information
        </Text>

        {(
          [
            { label: "Email", key: "email" },
            { label: "Phone", key: "phone" },
            { label: "Gender", key: "gender" },
          ] as { label: string; key: keyof Profile }[]
        ).map((item) => (
          <View
            key={item.key}
            style={{ flexDirection: "row", paddingVertical: 10 }}
          >
            <Text style={{ width: 90, fontSize: 16 }}>{item.label}</Text>
            <TextInput
              value={profile[item.key]}
              onChangeText={(text) => handleChange(item.key, text)}
              style={{
                flex: 1,
                borderBottomWidth: 0.5,
                borderColor: "#ddd",
                paddingVertical: 2,
                fontSize: 16,
              }}
              placeholder={item.label}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

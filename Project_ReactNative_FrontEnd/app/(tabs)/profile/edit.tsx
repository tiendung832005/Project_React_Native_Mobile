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
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { updateProfile, UpdateProfileData } from "../../../service/authService";
import {
  getUserProfile,
  updateProfileLocally,
} from "../../../service/profileStorage";
import { PostService } from "../../../service/postService";

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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

  const handleChangeAvatar = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need access to your photos to change your profile picture."
        );
        return;
      }

      // Show options
      Alert.alert(
        "Change Profile Photo",
        "Choose an option",
        [
          {
            text: "Camera",
            onPress: async () => {
              const { status: cameraStatus } =
                await ImagePicker.requestCameraPermissionsAsync();
              if (cameraStatus === "granted") {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                  await uploadAvatar(result.assets[0].uri);
                }
              }
            },
          },
          {
            text: "Photo Library",
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                await uploadAvatar(result.assets[0].uri);
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    try {
      setUploadingAvatar(true);
      
      // Upload image first
      const uploadedUrl = await PostService.uploadImage(imageUri);
      
      // Update profile with new avatar URL
      setProfile((prev) => ({ ...prev, avatar: uploadedUrl }));
      
      // Save immediately
      const updateData: UpdateProfileData = {
        avatarUrl: uploadedUrl,
        bio: profile.bio,
      };

      try {
        const response = await updateProfile(updateData);
        // Update local storage with correct format
        await updateProfileLocally({
          avatarUrl: uploadedUrl,
          bio: profile.bio,
        });
        
        // Also update the profile state immediately
        setProfile((prev) => ({ ...prev, avatar: uploadedUrl }));
        
        Alert.alert("Success", "Profile photo updated successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Force refresh profile screen when going back
              router.back();
            },
          },
        ]);
      } catch (apiError) {
        // API failed, save locally
        await updateProfileLocally({
          avatarUrl: uploadedUrl,
          bio: profile.bio,
        });
        
        // Update the profile state immediately
        setProfile((prev) => ({ ...prev, avatar: uploadedUrl }));
        
        Alert.alert(
          "Saved Offline",
          "Profile photo updated locally. Changes will sync when connected to internet.",
          [
            {
              text: "OK",
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      Alert.alert("Error", error.message || "Failed to upload profile photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData: UpdateProfileData = {
        name: profile.name,
        username: profile.username,
        website: profile.website,
        bio: profile.bio,
        avatarUrl: profile.avatar,
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
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: profile.avatar || "https://i.imgur.com/2nCt3Sb.jpg" }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
          {uploadingAvatar && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 50,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={handleChangeAvatar}
          disabled={uploadingAvatar}
          style={{ marginTop: 8 }}
        >
          <Text
            style={{
              color: uploadingAvatar ? "#999" : "#0095f6",
              fontSize: 16,
            }}
          >
            {uploadingAvatar ? "Uploading..." : "Change Profile Photo"}
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

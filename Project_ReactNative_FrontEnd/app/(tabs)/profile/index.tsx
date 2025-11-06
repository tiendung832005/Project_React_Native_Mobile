import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { User } from "../../../service/authService";
import { NavigationActions } from "../../../navigation";
import ProfileMenu from "../../../components/ProfileMenu";
import { getUserProfile } from "../../../service/profileStorage";

export default function TabsProfileScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      // Use new getUserProfile which handles API fallback to local storage
      const userData = await getUserProfile();
      setUser(userData);
    } catch (error: any) {
      // This should rarely happen now since getUserProfile has fallbacks
      console.warn("Error loading user profile:", error.message);

      // Final fallback
      setUser({
        id: "error_user",
        username: "error_loading",
        email: "error@example.com",
        bio: "Error loading profile data",
        avatar: "https://i.imgur.com/2nCt3Sb.jpg",
        name: "Error User",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Reload data when screen is focused (e.g., after editing profile)
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // Sử dụng NavigationActions để handle logout properly
          await NavigationActions.handleLogout();
        },
      },
    ]);
  };

  const posts = [
    {
      id: 1,
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
    {
      id: 2,
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
    {
      id: 3,
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
    {
      id: 4,
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
    {
      id: 5,
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
    {
      id: 6,
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
  ];

  const highlights = [
    {
      id: 1,
      title: "New",
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
    {
      id: 2,
      title: "Friends",
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
    {
      id: 3,
      title: "Sport",
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
    {
      id: 4,
      title: "Design",
      uri: "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3797EF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderText}>{user?.username || "Profile"}</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: user?.avatar || "https://i.imgur.com/2nCt3Sb.jpg",
            }}
            style={styles.avatar}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>54</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>834</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>162</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>{user?.username || "User"}</Text>
          {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
          <Text style={styles.email}>{user?.email || ""}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              console.log("Attempting to navigate to edit profile...");
              try {
                console.log("Trying route: /(tabs)/profile/edit");
                router.push("/(tabs)/profile/edit");
              } catch (error) {
                console.warn(
                  "Navigation error, trying alternative route:",
                  error
                );
                console.log("Trying fallback route: ./edit");
                router.push("./edit");
              }
            }}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Highlights */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.highlightsContainer}
        >
          {highlights.map((item) => (
            <View key={item.id} style={styles.highlightItem}>
              <Image source={{ uri: item.uri }} style={styles.highlightImage} />
              <Text style={styles.highlightText}>{item.title}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Ionicons name="grid-outline" size={28} color="#000" />
          <Ionicons name="person-outline" size={28} color="#999" />
        </View>

        {/* Grid Posts */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.uri }}
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
        />
      </ScrollView>

      <ProfileMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  topHeaderText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#000",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  userInfo: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  displayName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  editButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#ff4444",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff4444",
  },
  highlightsContainer: {
    marginVertical: 20,
    paddingLeft: 20,
  },
  highlightItem: {
    alignItems: "center",
    marginRight: 15,
  },
  highlightImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  highlightText: {
    fontSize: 12,
    marginTop: 4,
    color: "#000",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 0.5,
    borderColor: "#ddd",
    paddingVertical: 10,
  },
  postImage: {
    width: "33.33%",
    aspectRatio: 1,
  },
});

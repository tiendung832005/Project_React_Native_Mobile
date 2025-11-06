import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  showAPIConnectionDialog,
  runAPIdiagnostics,
} from "../service/apiDiagnostics";

const { width } = Dimensions.get("window");

/**
 * ProfileMenu Component
 * Sidebar menu cho profile với animation slide-in
 * Moved from app/profile/profileMenu.tsx to components/
 */
export default function ProfileMenu({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const slideAnim = React.useRef(new Animated.Value(width)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.menuContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.username}>s.khasanov_</Text>
          </View>

          <View style={styles.menu}>
            {[
              { icon: "time-outline" as const, label: "Archive" },
              { icon: "analytics-outline" as const, label: "Your Activity" },
              { icon: "qr-code-outline" as const, label: "Nametag" },
              { icon: "bookmark-outline" as const, label: "Saved" },
              { icon: "people-outline" as const, label: "Close Friends" },
              { icon: "person-add-outline" as const, label: "Discover People" },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem}>
                <Ionicons name={item.icon} size={22} color="#000" />
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.menuItem}>
              <FontAwesome name="facebook-square" size={22} color="#1877F2" />
              <Text style={styles.menuText}>Open Facebook</Text>
            </TouchableOpacity>

            {/* Debug API Connection */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={showAPIConnectionDialog}
            >
              <Ionicons name="bug-outline" size={22} color="#ff6b6b" />
              <Text style={styles.menuText}>Test API Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={runAPIdiagnostics}
            >
              <Ionicons name="pulse-outline" size={22} color="#ff6b6b" />
              <Text style={styles.menuText}>Run API Diagnostics</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.menuItem, styles.setting]}>
            <Ionicons name="settings-outline" size={22} color="#000" />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#fff",
    width: width * 0.7,
    height: "100%",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
  },
  menu: {
    flexGrow: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },
  setting: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 15,
    marginTop: 20,
  },
});

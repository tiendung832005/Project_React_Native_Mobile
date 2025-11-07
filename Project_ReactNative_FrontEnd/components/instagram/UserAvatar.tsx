import React from "react";
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { InstagramColors, InstagramSizes } from "../../constants/theme";

interface UserAvatarProps {
  uri: string;
  size?: keyof typeof InstagramSizes.avatarSizes;
  hasStory?: boolean;
  style?: ViewStyle;
}

/**
 * Instagram-style User Avatar với story border
 */
export default function UserAvatar({
  uri,
  size = "md",
  hasStory = false,
  style,
}: UserAvatarProps) {
  const avatarSize = InstagramSizes.avatarSizes[size];
  const borderWidth = hasStory ? 2 : 0;

  const avatarStyle: ImageStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
  };

  if (hasStory) {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={InstagramColors.storyGradient as any}
          style={[
            styles.storyBorder,
            {
              width: avatarSize + borderWidth * 4,
              height: avatarSize + borderWidth * 4,
              borderRadius: (avatarSize + borderWidth * 4) / 2,
            },
          ]}
        >
          <View
            style={[
              styles.innerBorder,
              {
                width: avatarSize + borderWidth,
                height: avatarSize + borderWidth,
                borderRadius: (avatarSize + borderWidth) / 2,
              },
            ]}
          >
            <Image source={{ uri }} style={avatarStyle} />
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image source={{ uri }} style={avatarStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  storyBorder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  innerBorder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: InstagramColors.white,
    padding: 2,
  },
});

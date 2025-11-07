import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import UserAvatar from "./UserAvatar";
import { InstagramColors, Typography, Spacing } from "../../constants/theme";

interface Story {
  id: string;
  username: string;
  avatar: string;
  isViewed?: boolean;
}

interface StoriesRowProps {
  stories: Story[];
  onStoryPress?: (story: Story) => void;
  style?: ViewStyle;
}

/**
 * Instagram-style Stories Row
 */
export default function StoriesRow({
  stories,
  onStoryPress,
  style,
}: StoriesRowProps) {
  const renderStory = (story: Story, index: number) => (
    <TouchableOpacity
      key={story.id}
      style={[styles.storyContainer, index === 0 && styles.firstStory]}
      onPress={() => onStoryPress?.(story)}
      activeOpacity={0.8}
    >
      <UserAvatar uri={story.avatar} size="lg" hasStory={!story.isViewed} />
      <Text style={styles.storyUsername} numberOfLines={1}>
        {index === 0 ? "Your story" : story.username}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stories.map(renderStory)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: InstagramColors.white,
    borderBottomWidth: 1,
    borderBottomColor: InstagramColors.divider,
  },

  scrollContent: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.lg,
  },

  storyContainer: {
    alignItems: "center",
    marginRight: Spacing.lg,
    width: 70,
  },

  firstStory: {
    marginLeft: Spacing.sm,
  },

  storyUsername: {
    fontSize: Typography.size.sm,
    color: InstagramColors.textPrimary,
    marginTop: Spacing.xs,
    textAlign: "center",
    maxWidth: 70,
  },
});

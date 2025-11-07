import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { PostService, CreatePostData } from "../../service/postService";
import { InstagramColors, Spacing, Typography } from "../../constants/theme";

const { width } = Dimensions.get("window");

type Step = "select" | "share";

interface MediaItem {
  uri: string;
  type: "image" | "video";
  width?: number;
  height?: number;
}

const PRIVACY_OPTIONS: Array<"PUBLIC" | "FRIENDS" | "PRIVATE"> = [
  "PUBLIC",
  "FRIENDS",
  "PRIVATE",
];

export default function CreatePostScreen() {
  const router = useRouter();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "FRIENDS" | "PRIVATE">(
    "PUBLIC"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("select");

  const hasSelectedMedia = useMemo(() => !!selectedMedia, [selectedMedia]);

  const ensureLibraryPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need access to your photo library to select images."
      );
      return false;
    }
    return true;
  }, []);

  const ensureCameraPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need camera access to take photos."
      );
      return false;
    }
    return true;
  }, []);

  const handlePickFromLibrary = useCallback(async () => {
    const granted = await ensureLibraryPermission();
    if (!granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setSelectedMedia({
        uri: asset.uri,
        type: "image",
        width: asset.width,
        height: asset.height,
      });
      setCurrentStep("share");
    }
  }, [ensureLibraryPermission]);

  const handleTakePhoto = useCallback(async () => {
    const granted = await ensureCameraPermission();
    if (!granted) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setSelectedMedia({
        uri: asset.uri,
        type: "image",
        width: asset.width,
        height: asset.height,
      });
      setCurrentStep("share");
    }
  }, [ensureCameraPermission]);

  const resetForm = useCallback(() => {
    setSelectedMedia(null);
    setCaption("");
    setLocation("");
    setPrivacy("PUBLIC");
    setCurrentStep("select");
  }, []);

  const handlePost = useCallback(async () => {
    if (!selectedMedia) {
      Alert.alert("Error", "Please select an image to post");
      return;
    }

    setIsUploading(true);

    try {
      const uploadedUrl = await PostService.uploadImage(selectedMedia.uri);

      const postData: CreatePostData = {
        caption: caption.trim(),
        content: caption.trim(),
        imageUrl: uploadedUrl,
        privacy,
      };

      const newPost = await PostService.createPost(postData);
      console.log("Post created successfully:", newPost);

      Alert.alert("Success", "Your post has been shared!", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            // Navigate về home tab - profile sẽ tự refresh khi focus
            router.replace("/(tabs)");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error creating post:", error);
      Alert.alert("Error", error.message || "Failed to create post");
    } finally {
      setIsUploading(false);
    }
  }, [caption, privacy, router, selectedMedia, resetForm]);

  const renderSelectStep = () => (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            resetForm();
            router.back();
          }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity
          onPress={() => setCurrentStep("share")}
          disabled={!hasSelectedMedia}
        >
          <Text
            style={[styles.nextText, !hasSelectedMedia && styles.disabledText]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.selectionContent}>
        <View style={styles.previewContainer}>
          {selectedMedia ? (
            <Image
              source={{ uri: selectedMedia.uri }}
              style={styles.previewImage}
            />
          ) : (
            <View style={styles.emptyPreview}>
              <Ionicons
                name="image"
                size={48}
                color={InstagramColors.textSecondary}
              />
              <Text style={styles.emptyPreviewTitle}>Select a photo</Text>
              <Text style={styles.emptyPreviewSubtitle}>
                Choose an image from your library or take a new photo.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTakePhoto}
          >
            <Ionicons name="camera" size={22} color={InstagramColors.white} />
            <Text style={styles.primaryButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePickFromLibrary}
          >
            <Ionicons
              name="images-outline"
              size={22}
              color={InstagramColors.textPrimary}
            />
            <Text style={styles.secondaryButtonText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderShareStep = () => (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentStep("select")}>
          <Ionicons name="arrow-back" size={24} color={InstagramColors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={isUploading || !selectedMedia}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={InstagramColors.info} />
          ) : (
            <Text style={styles.shareText}>Share</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView style={styles.shareContainer}>
        <View style={styles.postPreview}>
          <Image
            source={{ uri: selectedMedia?.uri || "" }}
            style={styles.previewThumbnail}
          />

          <View style={styles.captionContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              placeholderTextColor={InstagramColors.textSecondary}
              multiline
              value={caption}
              onChangeText={setCaption}
              maxLength={2200}
            />
            <Text style={styles.characterCount}>{caption.length}/2200</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.changePhotoButton}
          onPress={() => setCurrentStep("select")}
        >
          <Ionicons name="repeat" size={18} color={InstagramColors.info} />
          <Text style={styles.changePhotoText}>Change photo</Text>
        </TouchableOpacity>

        <View style={styles.inputCard}>
          <Text style={styles.cardTitle}>Location</Text>
          <TextInput
            style={styles.locationInput}
            placeholder="Add location"
            placeholderTextColor={InstagramColors.textSecondary}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.cardTitle}>Privacy</Text>
          <View style={styles.privacyOptions}>
            {PRIVACY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.privacyOption,
                  privacy === option && styles.privacyOptionActive,
                ]}
                onPress={() => setPrivacy(option)}
              >
                <Text
                  style={[
                    styles.privacyOptionText,
                    privacy === option && styles.privacyOptionTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  return currentStep === "select" ? renderSelectStep() : renderShareStep();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: InstagramColors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: InstagramColors.lightGray,
  },
  headerTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
  },
  cancelText: {
    fontSize: Typography.size.base,
    color: InstagramColors.textPrimary,
  },
  nextText: {
    fontSize: Typography.size.base,
    color: InstagramColors.info,
    fontWeight: Typography.weight.semibold,
  },
  disabledText: {
    color: InstagramColors.textSecondary,
    opacity: 0.5,
  },
  shareText: {
    fontSize: Typography.size.base,
    color: InstagramColors.info,
    fontWeight: Typography.weight.semibold,
  },
  selectionContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  previewContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: InstagramColors.background,
    marginBottom: Spacing.lg,
  },
  previewImage: {
    width: "100%",
    height: width * 0.9,
  },
  emptyPreview: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
    paddingHorizontal: Spacing.lg,
  },
  emptyPreviewTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
    marginTop: Spacing.md,
  },
  emptyPreviewSubtitle: {
    fontSize: Typography.size.base,
    color: InstagramColors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: InstagramColors.info,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  primaryButtonText: {
    color: InstagramColors.white,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: InstagramColors.border,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  secondaryButtonText: {
    color: InstagramColors.textPrimary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  shareContainer: {
    flex: 1,
    paddingBottom: Spacing["4xl"],
  },
  postPreview: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: InstagramColors.divider,
    gap: Spacing.md,
  },
  previewThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  captionContainer: {
    flex: 1,
  },
  captionInput: {
    fontSize: Typography.size.base,
    color: InstagramColors.textPrimary,
    minHeight: 80,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: Typography.size.sm,
    color: InstagramColors.textSecondary,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  changePhotoButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
  },
  changePhotoText: {
    color: InstagramColors.info,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  inputCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: InstagramColors.divider,
    backgroundColor: InstagramColors.white,
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
  },
  locationInput: {
    fontSize: Typography.size.base,
    color: InstagramColors.textPrimary,
    paddingVertical: Spacing.xs,
  },
  privacyOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  privacyOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: InstagramColors.border,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    marginHorizontal: Spacing.xs,
  },
  privacyOptionActive: {
    backgroundColor: InstagramColors.info,
    borderColor: InstagramColors.info,
  },
  privacyOptionText: {
    fontSize: Typography.size.base,
    color: InstagramColors.textPrimary,
    fontWeight: Typography.weight.semibold,
  },
  privacyOptionTextActive: {
    color: InstagramColors.white,
  },
});

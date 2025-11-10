import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MessageService, Message, MessageReaction } from '../../../service/messageService';
import { getCurrentUser } from '../../../service/authService';
import UserAvatar from '../../../components/instagram/UserAvatar';
import { InstagramColors, Typography, Spacing } from '../../../constants/theme';
import { useNotifications } from '../../../context/NotificationContext';

const REACTION_EMOJIS: Record<MessageReaction['reactionType'], string> = {
  LIKE: '👍',
  LOVE: '❤️',
  HAHA: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😠',
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return date.toLocaleDateString();
}

export default function ChatScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { refreshCounts } = useNotifications();

  useEffect(() => {
    // Get current user ID
    getCurrentUser()
      .then((user) => setCurrentUserId(user.id))
      .catch((error) => console.error('Error getting current user:', error));
  }, []);

  const loadMessages = useCallback(async (showLoading: boolean = false) => {
    if (!userId) return;
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await MessageService.getMessages(userId);
      setMessages(data);
      // Mark messages as read (only on initial load and after sending)
      if (showLoading) {
        await MessageService.markMessagesAsRead(userId);
        // Refresh notification counts after marking as read
        await refreshCounts();
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      if (showLoading) {
        Alert.alert('Error', error.message || 'Failed to load messages');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [userId, refreshCounts]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadMessages(true);
    }
  }, [userId]);

  // Poll for new messages every 15 seconds (silent refresh)
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      loadMessages(false); // Silent refresh without loading indicator
    }, 15000); // Increased to 15 seconds
    return () => clearInterval(interval);
  }, [userId, loadMessages]);

  const handleSendMessage = useCallback(async () => {
    if (!userId || !messageText.trim() || sending) return;

    try {
      setSending(true);
      const newMessage = await MessageService.sendMessage({
        receiverId: userId,
        content: messageText.trim(),
        type: 'TEXT',
      });
      setMessages((prev) => [...prev, newMessage]);
      setMessageText('');
      // Mark as read after sending
      await MessageService.markMessagesAsRead(userId);
      await refreshCounts();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [userId, messageText, sending, refreshCounts]);

  const handlePickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleSendMedia(result.assets[0].uri, 'IMAGE');
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  }, [userId]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleSendMedia(result.assets[0].uri, 'IMAGE');
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  }, [userId]);

  const handleSendMedia = useCallback(async (uri: string, type: 'IMAGE' | 'VIDEO') => {
    if (!userId) return;

    try {
      setUploading(true);
      console.log('Uploading media:', uri, type);
      const mediaUrl = await MessageService.uploadMessageMedia(uri);
      console.log('Media uploaded, URL:', mediaUrl);
      
      const newMessage = await MessageService.sendMessage({
        receiverId: userId,
        [type === 'IMAGE' ? 'imageUrl' : 'videoUrl']: mediaUrl,
        type,
      });
      console.log('Message sent with media:', newMessage);
      setMessages((prev) => [...prev, newMessage]);
      // Mark as read after sending
      await MessageService.markMessagesAsRead(userId);
      await refreshCounts();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Error sending media:', error);
      Alert.alert('Error', error.message || 'Failed to send media');
    } finally {
      setUploading(false);
    }
  }, [userId, refreshCounts]);

  const handleReactToMessage = useCallback(async (message: Message, reactionType: MessageReaction['reactionType']) => {
    try {
      const result = await MessageService.reactToMessage(message.id, reactionType);
      // Update message in list
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === message.id) {
            if (result === null) {
              // Reaction removed
              return {
                ...m,
                reactions: m.reactions.filter((r) => r.user.id !== message.sender.id),
              };
            } else {
              // Reaction added
              return {
                ...m,
                reactions: [...m.reactions.filter((r) => r.user.id !== result.user.id), result],
              };
            }
          }
          return m;
        })
      );
      setShowReactions(false);
      setSelectedMessage(null);
    } catch (error: any) {
      console.error('Error reacting to message:', error);
      Alert.alert('Error', error.message || 'Failed to react to message');
    }
  }, []);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = currentUserId !== null && item.sender.id === currentUserId;
    const hasReactions = item.reactions && item.reactions.length > 0;

    return (
      <View style={[
        styles.messageWrapper,
        isMyMessage ? styles.myMessageWrapper : styles.otherMessageWrapper
      ]}>
        {!isMyMessage && (
          <UserAvatar
            uri={item.sender.avatarUrl || "https://i.imgur.com/2nCt3Sb.jpg"}
            size="sm"
            hasStory={false}
            style={styles.messageAvatar}
          />
        )}
        <View style={styles.messageContentContainer}>
          <TouchableOpacity
            style={[
              styles.messageBubble,
              isMyMessage && styles.myMessageBubble,
              // If message only has image (no text), remove background and padding
              item.imageUrl && !item.content && styles.imageOnlyBubble,
            ]}
            onLongPress={() => {
              setSelectedMessage(item);
              setShowReactions(true);
            }}
          >
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={[
                  styles.messageImage,
                  // If message only has image, make it full width of bubble
                  !item.content && styles.imageOnly,
                ]}
                resizeMode="cover"
                onError={(error) => {
                  console.error('Error loading message image:', item.imageUrl, error);
                }}
                onLoad={() => {
                  console.log('Message image loaded successfully:', item.imageUrl);
                }}
              />
            )}
            {item.videoUrl && (
              <View style={styles.messageVideo}>
                <Ionicons name="play-circle" size={48} color={InstagramColors.white} />
                <Text style={styles.videoText}>Video</Text>
              </View>
            )}
            {item.content && (
              <Text style={[styles.messageText, isMyMessage && styles.myMessageText, item.imageUrl && styles.textWithImage]}>
                {item.content}
              </Text>
            )}
            {hasReactions && (
              <View style={styles.reactionsContainer}>
                {item.reactions.map((reaction) => (
                  <Text key={reaction.id} style={styles.reactionEmoji}>
                    {REACTION_EMOJIS[reaction.reactionType]}
                  </Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
          <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={InstagramColors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={InstagramColors.info} />
        </View>
      </SafeAreaView>
    );
  }

  // Get other user info - the one we're chatting with
  const otherUser = currentUserId && messages.length > 0
    ? (messages[0].sender.id === currentUserId ? messages[0].receiver : messages[0].sender)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={InstagramColors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerUserInfo}>
          <UserAvatar
            uri={otherUser?.avatarUrl || "https://i.imgur.com/2nCt3Sb.jpg"}
            size="sm"
            hasStory={false}
          />
          <Text style={styles.headerTitle}>{otherUser?.username || 'User'}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="call-outline" size={24} color={InstagramColors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={() => {
              Alert.alert(
                'Select Media',
                'Choose an option',
                [
                  { text: 'Camera', onPress: handleTakePhoto },
                  { text: 'Photo Library', onPress: handlePickImage },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={InstagramColors.info} />
            ) : (
              <Ionicons name="camera-outline" size={24} color={InstagramColors.textPrimary} />
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Message..."
            placeholderTextColor={InstagramColors.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={InstagramColors.white} />
            ) : (
              <Ionicons name="send" size={20} color={InstagramColors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Reaction Modal */}
      <Modal
        visible={showReactions}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowReactions(false);
          setSelectedMessage(null);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowReactions(false);
            setSelectedMessage(null);
          }}
        >
          <View style={styles.reactionsModal}>
            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
              <TouchableOpacity
                key={type}
                style={styles.reactionButton}
                onPress={() => selectedMessage && handleReactToMessage(selectedMessage, type as MessageReaction['reactionType'])}
              >
                <Text style={styles.reactionEmojiLarge}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: InstagramColors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: InstagramColors.border,
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: InstagramColors.textPrimary,
    marginLeft: Spacing.sm,
  },
  messagesList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  messageWrapper: {
    width: '100%',
    marginVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: Spacing.xs,
    marginBottom: 2,
  },
  messageContentContainer: {
    maxWidth: '75%',
    flexDirection: 'column',
  },
  messageBubble: {
    backgroundColor: InstagramColors.background,
    borderRadius: 18,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  myMessageBubble: {
    backgroundColor: InstagramColors.info,
    alignSelf: 'flex-end',
  },
  imageOnlyBubble: {
    // Remove all padding and background when message only has image
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  messageText: {
    fontSize: Typography.size.base,
    color: InstagramColors.textPrimary,
  },
  myMessageText: {
    color: InstagramColors.white,
  },
  textWithImage: {
    marginTop: Spacing.xs,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 18, // Match bubble border radius
    marginBottom: 0,
  },
  imageOnly: {
    // When message only has image, make it fill the bubble completely
    width: '100%',
    maxWidth: 250,
    aspectRatio: 1,
    borderRadius: 18,
  },
  messageVideo: {
    width: 200,
    height: 200,
    borderRadius: 18, // Match bubble border radius
    backgroundColor: InstagramColors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  videoText: {
    color: InstagramColors.white,
    marginTop: Spacing.xs,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  messageTime: {
    fontSize: Typography.size.xs,
    color: InstagramColors.textSecondary,
    marginTop: 2,
    marginLeft: Spacing.xs,
    alignSelf: 'flex-start',
  },
  myMessageTime: {
    alignSelf: 'flex-end',
    marginRight: Spacing.xs,
    marginLeft: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: InstagramColors.border,
    backgroundColor: InstagramColors.white,
  },
  mediaButton: {
    padding: Spacing.sm,
    marginRight: Spacing.xs,
  },
  textInput: {
    flex: 1,
    backgroundColor: InstagramColors.background,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.size.base,
    color: InstagramColors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: InstagramColors.info,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionsModal: {
    flexDirection: 'row',
    backgroundColor: InstagramColors.white,
    borderRadius: 30,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reactionButton: {
    padding: Spacing.sm,
  },
  reactionEmojiLarge: {
    fontSize: 32,
  },
});


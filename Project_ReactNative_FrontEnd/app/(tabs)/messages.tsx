import React, { useState, useEffect, useCallback } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MessageService, Conversation } from '../../service/messageService';
import UserAvatar from '../../components/instagram/UserAvatar';
import { InstagramColors, Typography, Spacing } from '../../constants/theme';
import { useNotifications } from '../../context/NotificationContext';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  return date.toLocaleDateString();
}

export default function Messages() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { refreshCounts } = useNotifications();

  const loadConversations = useCallback(async () => {
    try {
      const data = await MessageService.getConversations();
      setConversations(data);
      // Refresh notification counts after loading conversations
      await refreshCounts();
    } catch (error: any) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshCounts]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  const filteredConversations = conversations.filter((conv) =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => router.push(`/messages/chat/${item.userId}`)}
    >
      <UserAvatar
        uri={item.avatarUrl || "https://i.imgur.com/2nCt3Sb.jpg"}
        size="md"
        hasStory={false}
      />
      <View style={styles.messageInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.username}</Text>
          {item.hasUnread && <View style={styles.unreadDot} />}
        </View>
        <Text style={[styles.message, item.hasUnread && styles.unreadMessage]} numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
      <Text style={styles.time}>{formatTimeAgo(item.lastMessageTime)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.username}>Messages</Text>
          <TouchableOpacity>
            <Text style={styles.plusIcon}>＋</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={InstagramColors.info} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.username}>Messages</Text>
        <TouchableOpacity>
          <Text style={styles.plusIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Messages List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.userId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: InstagramColors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: InstagramColors.border,
  },
  backArrow: {
    fontSize: 24,
    color: InstagramColors.textPrimary,
    fontWeight: 'bold',
  },
  username: {
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.lg,
    color: InstagramColors.textPrimary,
  },
  plusIcon: {
    fontSize: 24,
    color: InstagramColors.textPrimary,
  },

  searchContainer: {
    backgroundColor: InstagramColors.background,
    marginHorizontal: Spacing.lg,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  searchInput: {
    color: InstagramColors.textPrimary,
    fontSize: Typography.size.base,
  },

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: InstagramColors.border,
  },
  messageInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.base,
    color: InstagramColors.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: InstagramColors.info,
    marginLeft: Spacing.xs,
  },
  message: {
    color: InstagramColors.textSecondary,
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  unreadMessage: {
    fontWeight: Typography.weight.semibold,
    color: InstagramColors.textPrimary,
  },
  time: {
    color: InstagramColors.textSecondary,
    fontSize: Typography.size.xs,
    marginLeft: Spacing.sm,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: InstagramColors.textSecondary,
    fontSize: Typography.size.base,
  },
});


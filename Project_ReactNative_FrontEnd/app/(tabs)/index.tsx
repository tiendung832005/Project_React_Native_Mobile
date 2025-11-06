import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const stories = [
  { id: '1', name: 'Your Story', image: 'https://i.imgur.com/2nCt3Sb.jpg' },
  { id: '2', name: 'karenne', image: 'https://i.imgur.com/8Km9tLL.jpg' },
  { id: '3', name: 'zackjohn', image: 'https://i.imgur.com/6VBx3io.jpg' },
  { id: '4', name: 'kieron_d', image: 'https://i.imgur.com/jNNT4LE.jpg' },
];

const posts = [
  {
    id: '1',
    user: 'joshua_l',
    location: 'Tokyo, Japan',
    image: 'https://i.imgur.com/6L89SxQ.jpg',
    likes: 44686,
    caption:
      'The game in Japan was amazing and I want to share some photos',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const renderStory = ({ item }: any) => (
    <View style={styles.storyItem}>
      <View style={styles.storyBorder}>
        <Image source={{ uri: item.image }} style={styles.storyImage} />
      </View>
      <Text style={styles.storyName}>{item.name}</Text>
    </View>
  );

  const renderPost = ({ item }: any) => (
    <View style={styles.postContainer}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.postUser}>
          <Image
            source={{ uri: 'https://i.imgur.com/2nCt3Sb.jpg' }}
            style={styles.userAvatar}
          />
          <View>
            <Text style={styles.username}>{item.user}</Text>
            <Text style={styles.location}>{item.location}</Text>
          </View>
        </View>
        <Feather name="more-vertical" size={20} />
      </View>

      {/* Hình ảnh bài đăng */}
      <Image source={{ uri: item.image }} style={styles.postImage} />

      {/* Action icons */}
      <View style={styles.actionRow}>
        <View style={styles.leftActions}>
          <FontAwesome name="heart-o" size={24} style={styles.icon} />
          <Feather name="message-circle" size={24} style={styles.icon} />
          <Feather name="send" size={24} />
        </View>
        <Feather name="bookmark" size={24} />
      </View>

      {/* Likes */}
      <Text style={styles.likes}>
        Liked by <Text style={styles.bold}>craig_love</Text> and{' '}
        <Text style={styles.bold}>{item.likes} others</Text>
      </Text>

      {/* Caption */}
      <Text style={styles.caption}>
        <Text style={styles.bold}>{item.user}</Text> {item.caption}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="camera" size={24} style={styles.headerLeft} />
        </TouchableOpacity>
        <Text style={styles.logo}>Instagram</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => router.push('/igtv')}
          >
            <Ionicons name="tv-outline" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <Feather name="send" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories */}
      <View style={styles.storiesContainer}>
        <FlatList
          horizontal
          data={stories}
          renderItem={renderStory}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Posts */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 5,
  },
  headerLeft: { marginRight: 8 },
  logo: {
    fontSize: 28,
    fontFamily: 'Billabong',
  },
  headerRight: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 4,
    marginLeft: 12,
  },
  headerIcon: { marginRight: 14 },
  storiesContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  storyItem: { alignItems: 'center', marginHorizontal: 8 },
  storyBorder: {
    borderWidth: 2,
    borderColor: '#FF0066',
    borderRadius: 45,
    padding: 3,
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  storyName: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
  },
  postContainer: {
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  postUser: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 35, height: 35, borderRadius: 18, marginRight: 10 },
  username: { fontWeight: 'bold', fontSize: 14 },
  location: { fontSize: 12, color: '#666' },
  postImage: {
    width: '100%',
    height: 400,
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftActions: { flexDirection: 'row' },
  icon: { marginRight: 12 },
  likes: { paddingHorizontal: 12, fontWeight: '500', marginBottom: 5 },
  caption: { paddingHorizontal: 12, marginBottom: 10 },
  bold: { fontWeight: 'bold' },
});



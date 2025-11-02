import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import styles from '@/styles/home.styles.js';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';
import { formatPublishDate } from '../../lib/utils.js';

import BASE_URL from "../../lib/config.js";
type User = {
  username: string;
  profileImage: string;
};

type Book = {
  _id: string;
  title: string;
  caption: string;
  rating: number;
  image: string;
  createdAt: string;
  user: User;
};

export default function Home() {
  const { token } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      const response = await fetch(
        `${BASE_URL}/api/books?page=${pageNum}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch books');

      // Merge new books with existing, remove duplicates
      const combinedBooks = refresh || pageNum === 1 ? data.books : [...books, ...data.books];
      const uniqueBooksMap = new Map<string, Book>();
      combinedBooks.forEach((book: Book) => {
        uniqueBooksMap.set(book._id, book);
      });

      setBooks(Array.from(uniqueBooksMap.values()));
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      if (refresh) setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#f4b400' : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const renderItem = ({ item }: { item: Book }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
<Image source={{ uri: item.user.profileImage }} style={styles.avatar} />


          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>
      <View style={styles.bookImageContainer}>
        <Image source={{ uri: item.image }} style={styles.bookImage} resizeMode="cover" />
      </View>
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={() => hasMore && fetchBooks(page + 1)}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={() => fetchBooks(1, true)}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>BookWorm 📚</Text>
              <Text style={styles.headerSubtitle}>
                Discover great reads from the community
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={60} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No recommendation yet</Text>
              <Text style={styles.emptySubtext}>Be the first to share a book!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

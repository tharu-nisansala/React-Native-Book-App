import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import styles from '@/styles/profile.styles';
import ProfileHeader from '@/components/ProfileHeader';
import LogoutButton from '@/components/LogoutButton';
import COLORS from '@/constants/colors';
import { formatPublishDate } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';

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

export default function Profile() {
  const { token } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/books/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch user books');
      setBooks(data.books || data); // ensure array
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load Profile data. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  const confirmDelete = (bookId: string) => {
    Alert.alert('Delete Book', 'Are you sure you want to delete this book?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteBook(bookId),
      },
    ]);
  };

  const deleteBook = async (bookId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/books/${bookId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete book');

      setBooks((prev) => prev.filter((b) => b._id !== bookId));
    } catch (error) {
      console.error('Error deleting book:', error);
      Alert.alert('Error', 'Failed to delete book.');
    }
  };

  const renderItem = ({ item }: { item: Book }) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.image }} style={styles.bookImage} resizeMode="cover" />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        {renderRatingStars(item.rating)}
        <Text style={styles.bookCaption}>{item.caption}</Text>
        <Text style={styles.bookDate}>Shared on {formatPublishDate(item.createdAt)}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item._id)}>
        <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ProfileHeader />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      <View style={styles.booksHeader}>
        <Text style={styles.bookTitle}>Your Recommendations</Text>
        <Text style={styles.booksCount}>{books.length} books</Text>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchData();
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <Text style={styles.emptyContainer}>Share your favorite books!</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

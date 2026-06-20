import { View, Text, Image } from 'react-native';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import styles from '@/styles/profile.styles';
import { formatMemberSince } from '@/lib/utils';

export default function ProfileHeader() {
  const { user } = useAuthStore();

  // Check if user is null before rendering
  if (!user) {
    return (
      <View style={styles.profileHeader}>
        <Text style={{ fontSize: 16, color: 'gray' }}>
          User not logged in
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.profileHeader}>
      {/* Show profile image only if available */}
      {user.profileImage && (
        <Image
          source={{ uri: user.profileImage }}
          style={styles.profileImage}
        />
      )}

      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.memberSince}>
        Joined {formatMemberSince(user.createdAt || user.created_at)}
      </Text>

      </View>
    </View>
  );
}

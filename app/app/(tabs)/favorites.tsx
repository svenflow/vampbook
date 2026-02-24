import { StyleSheet, FlatList, Pressable, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Colors, { Spacing, Radius } from '@/constants/Colors';
import { sampleSongs, Song } from '@/data/sampleSongs';
import { useState, useCallback } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const colors = Colors.dark;

// For now, use a mock favorites list (first 5 songs)
// In production, this will be backed by SQLite
const mockFavorites = sampleSongs.slice(0, 5).map(s => s.id);

// Favorite card with swipe-to-remove (simplified)
function FavoriteCard({ song, onPress, onRemove }: { song: Song; onPress: () => void; onRemove: () => void }) {
  return (
    <View style={styles.cardContainer}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.favoriteCard,
          pressed && styles.favoriteCardPressed,
        ]}>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteTitle} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={styles.favoriteComposer} numberOfLines={1}>
            {song.composer}
          </Text>
        </View>
        <View style={styles.favoriteMeta}>
          {song.key && (
            <View style={styles.keyBadge}>
              <Text style={styles.keyText}>{song.key}</Text>
            </View>
          )}
          <Pressable onPress={onRemove} style={styles.removeButton}>
            <FontAwesome name="heart" size={18} color={colors.error} />
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<string[]>(mockFavorites);

  const favoriteSongs = sampleSongs.filter(s => favorites.includes(s.id));

  const handleSongPress = useCallback((song: Song) => {
    router.push(`/song/${song.id}`);
  }, [router]);

  const handleRemove = useCallback((songId: string) => {
    setFavorites(prev => prev.filter(id => id !== songId));
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with count */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Favorites</Text>
        <Text style={styles.headerCount}>
          {favoriteSongs.length} {favoriteSongs.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>

      {favoriteSongs.length > 0 ? (
        <FlatList
          data={favoriteSongs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FavoriteCard
              song={item}
              onPress={() => handleSongPress(item)}
              onRemove={() => handleRemove(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="heart-o" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyHint}>
            Tap the heart icon on any song to add it to your favorites
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: Spacing.xs,
  },
  headerCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  cardContainer: {
    backgroundColor: colors.background,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: colors.background,
  },
  favoriteCardPressed: {
    backgroundColor: colors.surface,
  },
  favoriteInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  favoriteTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  favoriteComposer: {
    fontSize: 14,
    color: colors.textMuted,
  },
  favoriteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  keyBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: Spacing.md,
  },
  emptyHint: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});

import { StyleSheet, FlatList, TextInput, Pressable, View, Text, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import Colors, { Spacing, Radius } from '@/constants/Colors';
import { searchSongs, Song } from '@/data/sampleSongs';
import { useState, useMemo, useCallback } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const colors = Colors.dark;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useMemo(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Search result card
function SearchResultCard({ song, query, onPress }: { song: Song; query: string; onPress: () => void }) {
  // Highlight matching text
  const highlightText = (text: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <Text key={i} style={styles.highlight}>
          {part}
        </Text>
      ) : (
        part
      )
    );
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.resultCard,
        pressed && styles.resultCardPressed,
      ]}>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {highlightText(song.title)}
        </Text>
        <Text style={styles.resultComposer} numberOfLines={1}>
          {highlightText(song.composer)}
        </Text>
        {song.tags && song.tags.length > 0 && (
          <View style={styles.tagRow}>
            {song.tags.slice(0, 3).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={styles.resultMeta}>
        {song.key && (
          <View style={styles.keyBadge}>
            <Text style={styles.keyText}>{song.key}</Text>
          </View>
        )}
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 150);

  const results = useMemo(() => {
    return searchSongs(debouncedQuery);
  }, [debouncedQuery]);

  const handleSongPress = useCallback((song: Song) => {
    Keyboard.dismiss();
    router.push(`/song/${song.id}`);
  }, [router]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <View style={styles.container}>
      {/* Search input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <FontAwesome name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, composers, keys..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={handleClear} style={styles.clearButton}>
              <FontAwesome name="times-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {results.length} {results.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>

      {/* Results list */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SearchResultCard
            song={item}
            query={debouncedQuery}
            onPress={() => handleSongPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="search" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No songs found</Text>
            <Text style={styles.emptyHint}>Try a different search term</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  resultsHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: colors.background,
  },
  resultsCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: colors.background,
  },
  resultCardPressed: {
    backgroundColor: colors.surface,
  },
  resultInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  resultComposer: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  tagText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '500',
  },
  highlight: {
    color: colors.tint,
    fontWeight: 'bold',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: '300',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptyHint: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

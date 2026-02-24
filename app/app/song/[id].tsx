import { StyleSheet, ScrollView, Image, Pressable, View, Text, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import Colors, { Spacing, Radius } from '@/constants/Colors';
import { sampleSongs, Song } from '@/data/sampleSongs';
import { useState, useMemo } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const colors = Colors.dark;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sample sheet music image (placeholder)
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x800/1a1a2e/fbbf24/png?text=Sheet+Music';

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  const song = useMemo(() => {
    return sampleSongs.find(s => s.id === id);
  }, [id]);

  if (!song) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Song not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: song.title,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.tint,
          headerTitleStyle: { color: colors.text, fontWeight: '600' },
          headerRight: () => (
            <Pressable onPress={toggleFavorite} style={styles.headerButton}>
              <FontAwesome
                name={isFavorite ? 'heart' : 'heart-o'}
                size={22}
                color={isFavorite ? colors.error : colors.text}
              />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Song metadata card */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Composer</Text>
            <Text style={styles.metaValue}>{song.composer}</Text>
          </View>

          {song.key && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Key</Text>
              <View style={styles.keyBadgeLarge}>
                <Text style={styles.keyTextLarge}>{song.key}</Text>
              </View>
            </View>
          )}

          {song.tempo && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Tempo</Text>
              <Text style={styles.metaValue}>{song.tempo}</Text>
            </View>
          )}

          {song.tags && song.tags.length > 0 && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Tags</Text>
              <View style={styles.tagRow}>
                {song.tags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Sheet music image */}
        <View style={styles.sheetContainer}>
          <Text style={styles.sectionTitle}>Lead Sheet</Text>
          <Image
            source={{ uri: PLACEHOLDER_IMAGE }}
            style={styles.sheetImage}
            resizeMode="contain"
          />
          <Text style={styles.zoomHint}>Pinch to zoom</Text>
        </View>

        {/* Related songs (placeholder) */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Songs</Text>
          <View style={styles.relatedGrid}>
            {sampleSongs.slice(0, 4).filter(s => s.id !== id).slice(0, 3).map(related => (
              <Pressable
                key={related.id}
                style={({ pressed }) => [
                  styles.relatedCard,
                  pressed && styles.relatedCardPressed,
                ]}
                onPress={() => router.push(`/song/${related.id}`)}>
                <Text style={styles.relatedTitle} numberOfLines={1}>
                  {related.title}
                </Text>
                <Text style={styles.relatedComposer} numberOfLines={1}>
                  {related.composer}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  errorText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  backButton: {
    backgroundColor: colors.tint,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  backButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
  headerButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  metaCard: {
    margin: Spacing.md,
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  keyBadgeLarge: {
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyTextLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.tint,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flex: 1,
    marginLeft: Spacing.md,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  tagText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  sheetContainer: {
    margin: Spacing.md,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: Spacing.md,
  },
  sheetImage: {
    width: SCREEN_WIDTH - Spacing.md * 2,
    height: (SCREEN_WIDTH - Spacing.md * 2) * 1.33,
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
  },
  zoomHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  relatedSection: {
    margin: Spacing.md,
    marginTop: Spacing.lg,
  },
  relatedGrid: {
    gap: Spacing.sm,
  },
  relatedCard: {
    backgroundColor: colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  relatedCardPressed: {
    backgroundColor: colors.border,
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  relatedComposer: {
    fontSize: 13,
    color: colors.textMuted,
  },
});

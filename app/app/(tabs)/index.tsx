import { StyleSheet, SectionList, Pressable, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Colors, { Spacing, Radius } from '@/constants/Colors';
import { sampleSongs, getSongsByLetter, Song } from '@/data/sampleSongs';
import { useMemo } from 'react';

const colors = Colors.dark;

// SongCard component
function SongCard({ song, onPress }: { song: Song; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.songCard,
        pressed && styles.songCardPressed,
      ]}>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.songComposer} numberOfLines={1}>
          {song.composer}
        </Text>
      </View>
      <View style={styles.songMeta}>
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

// Section header
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function BrowseScreen() {
  const router = useRouter();

  // Group songs by first letter
  const sections = useMemo(() => {
    const grouped = getSongsByLetter();
    const letters = Array.from(grouped.keys()).sort();

    return letters.map(letter => ({
      title: letter,
      data: grouped.get(letter) || [],
    }));
  }, []);

  const handleSongPress = (song: Song) => {
    router.push(`/song/${song.id}`);
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongCard song={item} onPress={() => handleSongPress(item)} />
        )}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} />
        )}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick letter navigation */}
      <View style={styles.letterNav}>
        {sections.map(section => (
          <Text key={section.title} style={styles.letterNavItem}>
            {section.title}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.tint,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: colors.background,
  },
  songCardPressed: {
    backgroundColor: colors.surface,
  },
  songInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  songTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  songComposer: {
    fontSize: 14,
    color: colors.textMuted,
  },
  songMeta: {
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
  letterNav: {
    position: 'absolute',
    right: 4,
    top: 100,
    bottom: 100,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  letterNavItem: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.tint,
    padding: 2,
  },
});

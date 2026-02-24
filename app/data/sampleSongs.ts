/**
 * Sample song data for development
 * In production, this will be loaded from search_index.json
 */

export interface Song {
  id: string;
  title: string;
  composer: string;
  key?: string;
  tempo?: string;
  tags?: string[];
}

export const sampleSongs: Song[] = [
  { id: 'all-the-things-you-are', title: 'All The Things You Are', composer: 'Jerome Kern', key: 'Ab', tempo: 'Medium', tags: ['standard', 'ballad'] },
  { id: 'autumn-leaves', title: 'Autumn Leaves', composer: 'Joseph Kosma', key: 'Gm', tempo: 'Medium', tags: ['standard', 'ballad'] },
  { id: 'blue-bossa', title: 'Blue Bossa', composer: 'Kenny Dorham', key: 'Cm', tempo: 'Medium Bossa', tags: ['bossa', 'latin'] },
  { id: 'blue-monk', title: 'Blue Monk', composer: 'Thelonious Monk', key: 'Bb', tempo: 'Medium', tags: ['blues', 'bebop'] },
  { id: 'body-and-soul', title: 'Body and Soul', composer: 'Johnny Green', key: 'Db', tempo: 'Ballad', tags: ['standard', 'ballad'] },
  { id: 'cherokee', title: 'Cherokee', composer: 'Ray Noble', key: 'Bb', tempo: 'Fast', tags: ['bebop', 'uptempo'] },
  { id: 'confirmation', title: 'Confirmation', composer: 'Charlie Parker', key: 'F', tempo: 'Fast', tags: ['bebop', 'uptempo'] },
  { id: 'donna-lee', title: 'Donna Lee', composer: 'Charlie Parker', key: 'Ab', tempo: 'Fast', tags: ['bebop', 'uptempo'] },
  { id: 'fly-me-to-the-moon', title: 'Fly Me To The Moon', composer: 'Bart Howard', key: 'C', tempo: 'Medium', tags: ['standard', 'swing'] },
  { id: 'four', title: 'Four', composer: 'Miles Davis', key: 'Eb', tempo: 'Medium Up', tags: ['bebop', 'hard-bop'] },
  { id: 'giant-steps', title: 'Giant Steps', composer: 'John Coltrane', key: 'B', tempo: 'Fast', tags: ['coltrane', 'hard-bop'] },
  { id: 'girl-from-ipanema', title: 'The Girl From Ipanema', composer: 'Antonio Carlos Jobim', key: 'F', tempo: 'Bossa', tags: ['bossa', 'latin'] },
  { id: 'have-you-met-miss-jones', title: 'Have You Met Miss Jones?', composer: 'Richard Rodgers', key: 'F', tempo: 'Medium', tags: ['standard', 'swing'] },
  { id: 'how-high-the-moon', title: 'How High The Moon', composer: 'Morgan Lewis', key: 'G', tempo: 'Medium Up', tags: ['standard', 'bebop'] },
  { id: 'i-got-rhythm', title: "I Got Rhythm", composer: 'George Gershwin', key: 'Bb', tempo: 'Fast', tags: ['standard', 'rhythm-changes'] },
  { id: 'impressions', title: 'Impressions', composer: 'John Coltrane', key: 'Dm', tempo: 'Fast', tags: ['modal', 'hard-bop'] },
  { id: 'just-friends', title: 'Just Friends', composer: 'John Klenner', key: 'G', tempo: 'Medium', tags: ['standard', 'swing'] },
  { id: 'misty', title: 'Misty', composer: 'Erroll Garner', key: 'Eb', tempo: 'Ballad', tags: ['ballad', 'standard'] },
  { id: 'my-favorite-things', title: 'My Favorite Things', composer: 'Richard Rodgers', key: 'Em', tempo: 'Medium Waltz', tags: ['waltz', 'modal'] },
  { id: 'night-in-tunisia', title: 'A Night In Tunisia', composer: 'Dizzy Gillespie', key: 'Dm', tempo: 'Fast', tags: ['bebop', 'latin'] },
  { id: 'ornithology', title: 'Ornithology', composer: 'Charlie Parker', key: 'G', tempo: 'Fast', tags: ['bebop', 'uptempo'] },
  { id: 'round-midnight', title: "'Round Midnight", composer: 'Thelonious Monk', key: 'Eb', tempo: 'Ballad', tags: ['ballad', 'bebop'] },
  { id: 'satin-doll', title: 'Satin Doll', composer: 'Duke Ellington', key: 'C', tempo: 'Medium', tags: ['standard', 'swing'] },
  { id: 'so-what', title: 'So What', composer: 'Miles Davis', key: 'Dm', tempo: 'Medium', tags: ['modal', 'cool'] },
  { id: 'solar', title: 'Solar', composer: 'Miles Davis', key: 'Cm', tempo: 'Medium', tags: ['bebop', 'hard-bop'] },
  { id: 'stella-by-starlight', title: 'Stella By Starlight', composer: 'Victor Young', key: 'Bb', tempo: 'Ballad', tags: ['ballad', 'standard'] },
  { id: 'take-five', title: 'Take Five', composer: 'Paul Desmond', key: 'Ebm', tempo: 'Medium (5/4)', tags: ['cool', 'odd-meter'] },
  { id: 'take-the-a-train', title: 'Take The A Train', composer: 'Billy Strayhorn', key: 'C', tempo: 'Medium', tags: ['swing', 'standard'] },
  { id: 'there-will-never-be-another-you', title: 'There Will Never Be Another You', composer: 'Harry Warren', key: 'Eb', tempo: 'Medium', tags: ['standard', 'swing'] },
  { id: 'tune-up', title: 'Tune Up', composer: 'Miles Davis', key: 'D', tempo: 'Medium Up', tags: ['bebop', 'hard-bop'] },
];

// Group songs by first letter (skipping leading punctuation)
export function getSongsByLetter(): Map<string, Song[]> {
  const grouped = new Map<string, Song[]>();

  for (const song of sampleSongs) {
    // Find first alphabetic character
    const firstAlpha = song.title.match(/[A-Za-z]/);
    const letter = firstAlpha ? firstAlpha[0].toUpperCase() : '#';
    const existing = grouped.get(letter) || [];
    existing.push(song);
    grouped.set(letter, existing);
  }

  // Sort each group by title
  for (const [letter, songs] of grouped) {
    songs.sort((a, b) => a.title.localeCompare(b.title));
  }

  return grouped;
}

// Search songs
export function searchSongs(query: string): Song[] {
  if (!query.trim()) return sampleSongs;

  const q = query.toLowerCase();
  return sampleSongs.filter(
    song =>
      song.title.toLowerCase().includes(q) ||
      song.composer.toLowerCase().includes(q) ||
      song.key?.toLowerCase().includes(q) ||
      song.tags?.some(tag => tag.includes(q))
  );
}

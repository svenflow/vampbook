# VampBook 🎺

A mobile app for browsing jazz fake book sheet music with full-text search. Built with Expo/React Native.

## Features

- **Search**: Fast full-text search across song titles, composers, keys, tempo, form, tags
- **Browse**: Alphabetical, by composer, by decade
- **View**: High-quality PNG renders of cropped sheet music
- **Offline**: All data stored locally in SQLite

## Platforms

- iOS (primary)
- Web (Expo Web)
- ~~Android~~ (not a requirement)

## Architecture

```
vampbook/
├── app/                    # Expo app (React Native)
│   ├── (tabs)/            # Tab navigation
│   ├── song/[id].tsx      # Song detail view
│   └── _layout.tsx        # Root layout
├── cli/                    # CLI tools
│   └── vampbook           # Main CLI: vampbook add book.pdf
├── data/                   # Generated data
│   ├── songs/             # Cropped PNGs by song_id
│   └── metadata/          # JSON metadata files
├── docs/                   # Documentation
│   ├── PLAN.md            # Implementation plan (v8)
│   └── ARCHITECTURE.md    # Technical decisions
└── prototypes/            # Validation prototypes
    ├── sqlite-web/        # P1: expo-sqlite on web
    ├── claude-enrich/     # P2: Claude subprocess enrichment
    ├── extraction/        # P3: Gemini vision extraction
    ├── image-format/      # P4: PNG vs WebP comparison
    └── ios-simulator/     # P5: iOS simulator validation
```

## Prototype Results

All 5 prototypes validated:

| # | Test | Result | Notes |
|---|------|--------|-------|
| P1 | SQLite Web | ✅ Pass | 3.4ms write, 0.2ms read, IndexedDB persistence |
| P2 | Claude Enrichment | ✅ Pass | 100% success, 8.6s avg per song |
| P3 | Gemini Extraction | ✅ Pass | 100% crop accuracy |
| P4 | Image Format | ✅ Pass | PNG wins (smaller for line art) |
| P5 | iOS Simulator | ✅ Pass | expo-sqlite + PNG loading verified |

## Pipeline

```
vampbook add book.pdf
    │
    ├── 1. PDF → Pages (pdf2image)
    │
    ├── 2. Claude subprocess (`claude -p --dangerously-skip-permissions`)
    │   └── Claude uses Gemini Vision for:
    │       - Song boundary detection
    │       - Metadata extraction (title, composer, key, etc.)
    │       - Crop coordinates
    │
    ├── 3. Crop & render PNGs
    │
    └── 4. Write metadata JSON + search index
```

## Data Model

```typescript
// search_index.json (lightweight, loaded at startup)
interface SearchEntry {
  id: string;
  title: string;
  composer: string;
  search_text: string;  // Pre-built search string
}

// metadata/{id}.json (lazy-loaded on song view)
interface SongMetadata {
  id: string;
  title: string;
  composer: string;
  key: string;
  tempo: string;
  form: string;
  year: number | null;
  page_in_book: number;
  source_book: string;
  description: string;      // AI-generated
  related_songs: string[];  // AI-generated
  tags: string[];           // AI-generated
}
```

## Tech Stack

- **Mobile**: Expo 54 + React Native 0.81
- **Storage**: expo-sqlite (iOS & Web via sql.js)
- **Search**: Client-side with pre-built search text
- **CLI**: Python + uv for dependency management
- **AI**: Claude (enrichment) + Gemini (vision)

## Development

```bash
# Install dependencies
cd app && npm install

# Run on iOS Simulator
npm run ios

# Run on Web
npm run web

# Add a fake book
./cli/vampbook add path/to/fakebook.pdf
```

## Status

🚧 **Phase 1 in progress** - Building CLI pipeline

---

Built by [Sven](https://github.com/svenflow) with help from Claude.

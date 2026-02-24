# VampBook Implementation Plan v8

Last updated: 2025-02-23

## Prototype Validation (Complete)

| # | Prototype | Status | Key Results |
|---|-----------|--------|-------------|
| P1 | SQLite Web | ✅ Pass | 3.4ms write/100, 0.2ms read, IndexedDB persistence works |
| P2 | Claude Enrichment | ✅ Pass | 100% success rate, 8.6s avg, subprocess reliable |
| P3 | Gemini Extraction | ✅ Pass | 100% crop accuracy on test pages |
| P4 | Image Format | ✅ Pass | PNG wins - smaller for line art (~100KB/song) |
| P5 | iOS Simulator | ✅ Pass | expo-sqlite + PNG loading verified on iPhone 17 Pro |

## Phase 1: CLI Pipeline

**Goal**: `vampbook add book.pdf` processes a fake book end-to-end

### 1.1 PDF Processing
- [ ] Accept PDF path as input
- [ ] Convert pages to images (pdf2image or similar)
- [ ] Output to temp directory

### 1.2 Claude Subprocess Integration
- [ ] Spawn `claude -p --dangerously-skip-permissions`
- [ ] Pass prompt with page image paths
- [ ] Claude calls Gemini for vision tasks
- [ ] Hard fail on any error (no degraded fallbacks)

### 1.3 Song Extraction (via Claude+Gemini)
- [ ] Detect song boundaries (multi-song pages)
- [ ] Extract metadata: title, composer, key, tempo, form
- [ ] Get crop coordinates for each song
- [ ] Validate coordinates before cropping

### 1.4 Enrichment (via Claude)
- [ ] Generate `description` (1-2 sentences about the song)
- [ ] Generate `related_songs` (similar tunes)
- [ ] Generate `tags` (genre, era, style)
- [ ] NO `notable_recordings` (removed per user request)

### 1.5 Output Generation
- [ ] Crop and render PNGs (one per song)
- [ ] Generate metadata JSON per song
- [ ] Build/update search_index.json
- [ ] Store in data/ directory

## Phase 2: Mobile App Foundation

### 2.1 Project Setup
- [ ] Create Expo app with TypeScript
- [ ] Configure expo-sqlite
- [ ] Set up tab navigation (Browse, Search, Favorites)
- [ ] Configure iOS bundle ID for TestFlight

### 2.2 Data Loading
- [ ] Load search_index.json at startup
- [ ] Initialize SQLite for favorites/history
- [ ] Lazy load song metadata on demand

### 2.3 Browse Tab
- [ ] Alphabetical list (A-Z sections)
- [ ] Song card component
- [ ] Tap to view song detail

### 2.4 Search Tab
- [ ] Search input with debounce
- [ ] Filter by: title, composer, key
- [ ] Results list with highlighting

### 2.5 Song Detail View
- [ ] Full-screen PNG viewer
- [ ] Pinch-to-zoom
- [ ] Metadata display
- [ ] Add to favorites

## Phase 3: Polish & Ship

### 3.1 Favorites
- [ ] SQLite-backed favorites list
- [ ] Favorites tab
- [ ] Remove from favorites

### 3.2 Testing
- [ ] Test on iOS Simulator
- [ ] Screenshot each screen
- [ ] Gemini Vision review of each screen
- [ ] Fix any issues

### 3.3 TestFlight
- [ ] Configure App Store Connect
- [ ] Build and archive
- [ ] Submit to TestFlight
- [ ] Add testers (Sven + 1 other)

## Key Decisions

### Hard Fail Policy
If any step fails (Gemini vision, Claude enrichment, crop validation), the pipeline stops with an error. No degraded fallbacks - we'd rather fail loudly than produce bad data.

### PNG over WebP
PNG is actually smaller for line art / sheet music (~100KB vs ~150KB for WebP). Plus universal browser support.

### Split Index
- `search_index.json`: Lightweight (~50KB for 500 songs), loaded at startup
- `metadata/{id}.json`: Full details, lazy loaded on song view

This avoids parsing 2MB+ JSON at startup.

### Unified CLI
One command does everything:
```bash
vampbook add book.pdf
```
Internally spawns Claude subprocess which handles all the intelligence.

## File Structure

```
vampbook/
├── cli/
│   └── vampbook              # Main CLI script (Python + uv)
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx         # Browse tab
│   │   ├── search.tsx        # Search tab
│   │   └── favorites.tsx     # Favorites tab
│   ├── song/
│   │   └── [id].tsx          # Song detail view
│   └── components/
│       ├── SongCard.tsx
│       └── SongViewer.tsx
├── data/
│   ├── search_index.json     # Fast startup index
│   ├── songs/                # Cropped PNGs
│   │   └── {id}.png
│   └── metadata/             # Full song metadata
│       └── {id}.json
└── docs/
    └── PLAN.md               # This file
```

## Success Criteria

Phase 1 is complete when:
- [ ] Can run `vampbook add fakebook.pdf`
- [ ] Outputs cropped PNGs for all songs
- [ ] Generates valid metadata JSON
- [ ] Search index is usable

Phase 2 is complete when:
- [ ] App runs on iOS Simulator
- [ ] Can browse all songs alphabetically
- [ ] Can search and find songs
- [ ] Can view song detail with sheet music

Phase 3 is complete when:
- [ ] App is on TestFlight
- [ ] Both testers can install and use
- [ ] No crashes or major bugs

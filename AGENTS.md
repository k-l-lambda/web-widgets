# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@k-l-lambda/music-widgets` is a music utility library that provides tools for MIDI processing, music notation, and playback. The package supports both Node.js and browser environments with different entry points.

## Build and Development Commands

```bash
# Build the library for browser (UMD format)
npm run build

# Build is automatically run before publishing
npm run prepublishOnly

# Development with TypeScript debugging
npm run ts-dev:inspect -- <script.ts>

# Watch mode: automatically rebuild when source files change
npm run watch
# or with yarn:
yarn watch
```

### Watch Mode

The `yarn watch` command uses **Vue CLI Service's built-in watch mode** (webpack watch) to automatically rebuild the package when source files change:

- Watches all source files, dependencies, and entry points
- Hot rebuilds with webpack's incremental compilation
- Shows build progress and errors in real-time

**Usage**:
```bash
# Start watch mode
yarn watch

# Edit source files - webpack will automatically rebuild!
```

**Note about ENOSPC warnings**: On systems with many files, you may see `Watchpack Error (watcher): Error: ENOSPC: System limit for number of file watchers reached` warnings. These are **non-fatal** - the watch mode continues to work. If you want to eliminate these warnings, increase your system's file watcher limit:

```bash
# Temporary (until reboot)
sudo sysctl fs.inotify.max_user_watches=524288

# Permanent
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Why use vue-cli-service --watch?**
- ✅ Built-in, no custom code or dependencies
- ✅ Uses webpack's proven watch implementation
- ✅ Incremental compilation (faster rebuilds)
- ✅ Already configured in your project

## Architecture

### Module Structure

The package exports five main modules through two entry points:

**Node.js Entry (`index.js`):**
- MIDI: MIDI file parsing and encoding
- MusicNotation: MIDI to music notation conversion
- MidiPlayer: Playback engine with timing control
- Matcher: Note matching/alignment between MIDI sequences
- MidiUtils: MIDI processing utilities

**Browser Entry (`index.browser.js`):**
- All Node.js modules plus MidiAudio for web audio playback

### Source Organization

- `source/inc/`: Core modules
  - `MIDI/`: MIDI file parsing (`midifile.js`) and encoding (`midifileEx.js`)
  - `MusicNotation.js`: Converts MIDI to notation with bars, pedals, key ranges
  - `MidiPlayer.js`: Real-time playback with event caching and cursor control
  - `Matcher/`: Sequence alignment using `Node` (match nodes) and `Navigator` (path finding)
  - `MidiSequence.js`: MIDI event sequence processing, overlap fixing
  - `MidiUtils.js`: General MIDI utilities
- `source/MidiAudio/`: Web Audio API integration for browser playback
- `source/components/` and `source/views/`: Vue components for MIDI visualization

### Key Concepts

**MusicNotation Module:**
- Parses MIDI data into structured notation with notes, bars, pedals, tempos
- `fixOverlap` option removes overlapping notes on same pitch
- Tracks channel status, pedal states (sustain, portamento, sostenuto, soft)
- Normalizes ticks and provides time/tick conversion methods

**MidiPlayer:**
- Event-based playback with configurable cache span
- Callbacks: `onMidi` (note events), `onPlayFinish`, `onTurnCursor`
- Supports seeking via `progressTime` and `progressTicks` properties
- Uses animation frames for smooth playback by default

**Matcher Module:**
- Aligns sample MIDI sequence to criterion (reference) sequence
- Uses "soft index" for fuzzy timing matching (configurable via `softIndexFactor`)
- `Navigator` tracks best match path through potential alignments
- `Node` represents match hypothesis between two notes

**MidiAudio:**
- Browser-only module for Web Audio playback
- Requires soundfont loading via plugin system
- See test apps in `tests/midi-visualizer/` for usage examples

### Test Applications

The `tests/` directory contains three Vue.js demo applications:
- `midi-visualizer/`: Full player with audio playback
- `midi-chart/`: Piano roll visualization
- `midi-matcher/`: MIDI alignment demonstration

Each test app is a standalone Vue CLI project with its own `package.json`.

## Code Style

- **Indentation**: Tabs (enforced via ESLint)
- **Quotes**: Double quotes preferred
- **Semicolons**: Required
- **Brace style**: Stroustrup (else/catch on new line)
- **Curly braces**: Multi-or-nest style
- **Vue templates**: Tab indentation with baseIndent: 1

## TypeScript

- The project includes TypeScript definitions (`.d.ts` files) alongside JavaScript
- `tsconfig.json` targets ES6/ES2017 with CommonJS output
- `declaration: true` generates type definitions in `lib/` directory
- Development debugging available via `ts-node-dev`

## Publishing

- Published to GitHub Package Registry (`https://npm.pkg.github.com`)
- Build automatically runs before publish via `prepublishOnly`
- Main exports: `index.js` (Node), browser bundle: `dist/musicWidgetsBrowser.umd.js`


## Meta-Instructions

**Important constraints to remember**:
1. Learn the development history from `agentlog.md` firstly.
1. Update `agentlog.md` when a mini-milestone is accomplished.
1. Use tabs for indentation for all code file formats.
1. Following further instuctions in `AGENTS.local.md` if present.

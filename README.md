# Odd One Out

A daily word puzzle game built with React + Vite. Pick the word that doesn't belong!

## Features

✨ **Three Difficulty Levels**
- **Easy**: Straightforward category differences (e.g., 3 planets + 1 candy bar)
- **Medium**: Tricky misdirects and double meanings
- **Hard**: Requires lateral thinking and creative connections

🎮 **Daily Puzzles**
- One new puzzle per day for each difficulty
- All players get the same puzzle on the same day
- Puzzle locks after completion (per difficulty)

📊 **Statistics**
- Track played games, win percentage, current streak, and best streak
- Stats persist for 1 year via cookies
- Daily results tracked separately

📋 **Share Results**
- Copy emoji squares to clipboard
- Share format hides your answer
- Color-coded by difficulty (🟩 easy, 🟨 medium, 🟥 hard)

🎨 **Beautiful Design**
- Dark theme with near-black background
- Bold Bebas Neue font for titles and words
- Responsive design, mobile-first approach
- Large, tappable tiles with clear feedback

## Getting Started

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to play!

### Build

```bash
npm run build
```

### Deploy

```bash
npm run deploy
```

## Game Structure

### Puzzle Format

Puzzles are stored in `src/data/puzzles.json` organized by difficulty:

```json
{
  "easy": {
    "2026-05-28": {
      "words": ["Violin", "Cello", "Trumpet", "Harp"],
      "oddOne": 2,
      "category": "Strings vs Brass",
      "explanation": "Trumpet is a brass instrument, while the others are string instruments."
    }
  }
}
```

### How to Add Puzzles

1. Open `src/data/puzzles.json`
2. Add a new entry for the date (format: `YYYY-MM-DD`)
3. Include 4 words, the index of the odd one, category, and explanation
4. Add the same date to all three difficulty levels

### Components

- **App.jsx** - Main game controller
- **Header.jsx** - Title, difficulty tabs, stats button
- **GameBoard.jsx** - Word tiles grid
- **WordTile.jsx** - Individual tile with feedback states
- **ResultScreen.jsx** - Win/lose screen with sharing
- **StatsScreen.jsx** - Statistics modal
- **HowToPlay.jsx** - Tutorial modal

### Hooks

- **useGameState.js** - Game logic, puzzle loading, answer validation
- **useStats.js** - Statistics tracking with cookies

## Technologies

- React 19
- Vite 5.0
- CSS Modules
- js-cookie (statistics persistence)
- Bebas Neue & DM Sans fonts

## License

Part of Noodle Games

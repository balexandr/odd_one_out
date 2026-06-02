import { useState, useCallback, useEffect } from 'react';
import puzzles from '../data/puzzles.json';

const STORAGE_KEY = 'odd-one-out-game-state';
const SHARE_RESULTS_KEY = 'odd-one-out-share-results';
const EPOCH = '2026-05-28';
const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

const DIFFICULTY_EMOJI = {
  easy: '🟩',
  medium: '🟨',
  hard: '🟥',
};

function getTodayKey() {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadState(dateKey) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved.dateKey !== dateKey) return null;
    return saved;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable
  }
}

function loadShareResults() {
  try {
    const raw = localStorage.getItem(SHARE_RESULTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveShareResults(value) {
  try {
    localStorage.setItem(SHARE_RESULTS_KEY, JSON.stringify(value));
  } catch {
    // localStorage unavailable
  }
}

function formatDifficultyLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildShareEntry({ difficulty, gameStatus, guesses, words, puzzleNumber }) {
  const difficultyLabel = formatDifficultyLabel(difficulty);
  const statusIcon = gameStatus === 'won' ? '✅' : gameStatus === 'lost' ? '❌' : '⏳';
  const summaryLine = `${DIFFICULTY_EMOJI[difficulty]} ${difficultyLabel} ${statusIcon}`;

  return {
    difficulty,
    difficultyLabel,
    statusIcon,
    summaryLine,
    text: `Odd One Out #${puzzleNumber}\n${summaryLine}`,
  };
}

export function useGameState() {
  const dateKey = getTodayKey();
  const epochMs = new Date(`${EPOCH}T00:00:00Z`).getTime();
  const todayMs = new Date(`${dateKey}T00:00:00Z`).getTime();
  const puzzleNumber = Math.floor((todayMs - epochMs) / 86400000) + 1;
  const [difficulty, setDifficulty] = useState('easy'); // 'easy' | 'medium' | 'hard'
  const [puzzle, setPuzzle] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | null
  const [showFeedback, setShowFeedback] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [words, setWords] = useState([]);

  // Initialize state
  useEffect(() => {
    const puzzleData = puzzles[difficulty][dateKey];
    if (!puzzleData) {
      setInitialized(true);
      return;
    }

    const saved = loadState(dateKey);
    if (saved && saved.difficulty === difficulty) {
      setWords(saved.words);
      setGuesses(saved.guesses);
      setGameStatus(saved.gameStatus);
      setFeedback(saved.feedback);
      setShowFeedback(saved.gameStatus !== 'playing');
      setPuzzle(puzzleData);
    } else {
      // Initialize fresh game
      setWords(puzzleData.words);
      setGuesses([]);
      setGameStatus('playing');
      setFeedback(null);
      setShowFeedback(false);
      setPuzzle(puzzleData);
    }
    setInitialized(true);
  }, [difficulty, dateKey]);

  // Persist state changes
  useEffect(() => {
    if (!initialized || !puzzle) return;
    saveState({
      dateKey,
      difficulty,
      words,
      guesses,
      gameStatus,
      feedback,
    });
  }, [words, guesses, gameStatus, feedback, initialized, difficulty, dateKey, puzzle]);

  useEffect(() => {
    if (!initialized || !puzzle || gameStatus === 'playing') return;

    const entry = buildShareEntry({
      difficulty,
      gameStatus,
      guesses,
      words,
      puzzleNumber,
    });

    const shareResults = loadShareResults();
    const todayResults = shareResults[dateKey] && typeof shareResults[dateKey] === 'object'
      ? shareResults[dateKey]
      : {};

    shareResults[dateKey] = {
      ...todayResults,
      [difficulty]: entry,
    };

    saveShareResults(shareResults);
  }, [initialized, puzzle, gameStatus, difficulty, guesses, words, puzzleNumber, dateKey]);

  const selectWord = useCallback(
    (index) => {
      if (gameStatus !== 'playing') return;

      const isCorrect = index === puzzle.oddOne;
      const newGuess = {
        index,
        isCorrect,
        word: words[index],
      };

      setGuesses([...guesses, newGuess]);
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      setShowFeedback(true);

      if (isCorrect) {
        setGameStatus('won');
      } else {
        // One attempt per difficulty
        setGameStatus('lost');
      }
    },
    [gameStatus, puzzle, words, guesses]
  );

  const changeDifficulty = useCallback((newDifficulty) => {
    setDifficulty(newDifficulty);
  }, []);

  const generateShareText = useCallback(() => {
    return buildShareEntry({
      difficulty,
      gameStatus,
      guesses,
      words,
      puzzleNumber,
    }).text;
  }, [difficulty, gameStatus, guesses, words, puzzleNumber]);

  const generateCombinedShareText = useCallback((completedDifficulties = []) => {
    const currentEntry = buildShareEntry({
      difficulty,
      gameStatus,
      guesses,
      words,
      puzzleNumber,
    });

    const shareResults = loadShareResults();
    const todayResults = shareResults[dateKey] && typeof shareResults[dateKey] === 'object'
      ? shareResults[dateKey]
      : {};

    const uniqueCompleted = Array.from(new Set(completedDifficulties));
    const orderedCompleted = DIFFICULTY_ORDER.filter((d) => uniqueCompleted.includes(d));
    const targetDifficulties = orderedCompleted.length > 0 ? orderedCompleted : [difficulty];

    const entries = targetDifficulties
      .map((d) => {
        if (d === difficulty) return currentEntry;
        return todayResults[d] || null;
      })
      .filter(Boolean);

    if (entries.length <= 1) {
      return currentEntry.text;
    }

    const combinedLines = entries.map((entry) => entry.summaryLine).join('\n');

    return `Odd One Out #${puzzleNumber}\n${combinedLines}`;
  }, [difficulty, gameStatus, guesses, words, puzzleNumber, dateKey]);

  return {
    puzzle,
    words,
    guesses,
    gameStatus,
    feedback,
    showFeedback,
    initialized,
    dateKey,
    puzzleNumber,
    difficulty,
    selectWord,
    changeDifficulty,
    generateShareText,
    generateCombinedShareText,
  };
}

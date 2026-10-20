import { useState, useCallback, useEffect, useRef } from 'react';
import puzzles from '../data/puzzles.json';
import { recordTodayShare } from '../utils/shareAll';

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
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
}

function loadDifficultyState(dateKey, difficulty) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved.dateKey !== dateKey) return null;
    return saved.difficulties?.[difficulty] ?? null;
  } catch {
    return null;
  }
}

// Reads all 3 difficulties' results for today in one call, for the
// combined "submit to every board you qualify for" leaderboard check
// (App.jsx) that only runs once all 3 are done - that check needs
// every difficulty's outcome and elapsed time at once, not just
// whichever one is currently active in the hook above.
export function getAllDifficultyResults(dateKey) {
  const results = {};
  for (const difficulty of DIFFICULTY_ORDER) {
    const saved = loadDifficultyState(dateKey, difficulty);
    results[difficulty] = saved && saved.gameStatus !== 'playing'
      ? { gameStatus: saved.gameStatus, elapsedMs: saved.elapsedMs ?? null }
      : null;
  }
  return results;
}

function saveDifficultyState(dateKey, difficulty, state) {
  try {
    let stored = { dateKey, difficulties: {} };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.dateKey === dateKey) {
        stored = { dateKey, difficulties: { ...(parsed.difficulties || {}) } };
      }
    }
    stored.difficulties[difficulty] = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
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
  // Response-time leaderboard: a stopwatch started the moment this
  // difficulty's words are actually on screen to pick from, read back
  // at the instant of the click that decides the game. Not persisted
  // across reloads — if the page reloads mid-decision the stopwatch
  // just restarts, which is fine for a single-click game with no
  // meaningful "paused" state to preserve.
  const startTimeRef = useRef(null);
  const [elapsedMs, setElapsedMs] = useState(null);

  // Initialize state
  useEffect(() => {
    const puzzleData = puzzles[difficulty][dateKey];
    if (!puzzleData) {
      setInitialized(true);
      return;
    }

    const saved = loadDifficultyState(dateKey, difficulty);
    if (saved) {
      setWords(saved.words);
      setGuesses(saved.guesses);
      setGameStatus(saved.gameStatus);
      setFeedback(saved.feedback);
      setShowFeedback(saved.gameStatus !== 'playing');
      setPuzzle(puzzleData);
      // Restore a finished difficulty's elapsed time too, not just null
      // it out - needed so a score from earlier today (e.g. Easy, done
      // before Medium/Hard) is still known once all 3 are complete and
      // the combined leaderboard check runs (see getAllDifficultyResults
      // below), even after switching away from this difficulty's tab.
      setElapsedMs(saved.gameStatus !== 'playing' ? (saved.elapsedMs ?? null) : null);
      if (saved.gameStatus === 'playing') startTimeRef.current = performance.now();
    } else {
      // Initialize fresh game
      setWords(puzzleData.words);
      setGuesses([]);
      setGameStatus('playing');
      setFeedback(null);
      setShowFeedback(false);
      setPuzzle(puzzleData);
      setElapsedMs(null);
      startTimeRef.current = performance.now();
    }
    setInitialized(true);
  }, [difficulty, dateKey]);

  // Persist state changes per difficulty
  useEffect(() => {
    if (!initialized || !puzzle) return;
    saveDifficultyState(dateKey, difficulty, { words, guesses, gameStatus, feedback, elapsedMs });
  }, [words, guesses, gameStatus, feedback, elapsedMs, initialized, difficulty, dateKey, puzzle]);

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

    // Only counts toward the cross-game "Share all completed" tally
    // once all 3 difficulties have a result, not after just one - this
    // game is the only one in the suite with more than one puzzle per
    // day, and finishing a single difficulty isn't "done for the day"
    // the way finishing the one puzzle in every other game is.
    const completed = DIFFICULTY_ORDER.filter((d) => shareResults[dateKey][d]);
    if (completed.length < DIFFICULTY_ORDER.length) return;
    const combinedLines = completed.map((d) => shareResults[dateKey][d].summaryLine).join('\n');
    recordTodayShare('oddoneout', dateKey, `Odd One Out #${puzzleNumber}\n${combinedLines}`);
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
        setElapsedMs(startTimeRef.current ? performance.now() - startTimeRef.current : null);
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
    elapsedMs,
    selectWord,
    changeDifficulty,
    generateShareText,
    generateCombinedShareText,
  };
}

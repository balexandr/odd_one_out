import { useState, useEffect, useCallback } from 'react';

const STATS_STORAGE_KEY = 'odd-one-out-stats';
const PLAYED_BY_DATE_STORAGE_KEY = 'odd-one-out-played-by-date';

// Legacy cookie keys (for one-time migration, no writes)
const LEGACY_STATS_COOKIE = 'odd-one-out-stats';
const LEGACY_PLAYED_TODAY_COOKIE = 'odd-one-out-played-today';

function safeParseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getLegacyPlayedCookieKey(today) {
  return `${today}-played`;
}

function loadStatsFromLocalStorage() {
  try {
    return safeParseJson(localStorage.getItem(STATS_STORAGE_KEY), null);
  } catch {
    return null;
  }
}

function loadPlayedByDateFromLocalStorage() {
  try {
    return safeParseJson(localStorage.getItem(PLAYED_BY_DATE_STORAGE_KEY), {});
  } catch {
    return {};
  }
}

function saveStatsToLocalStorage(stats) {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // localStorage unavailable
  }
}

function savePlayedByDateToLocalStorage(playedByDate) {
  try {
    localStorage.setItem(PLAYED_BY_DATE_STORAGE_KEY, JSON.stringify(playedByDate));
  } catch {
    // localStorage unavailable
  }
}

export function useStats() {
  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [playedToday, setPlayedToday] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const today = getTodayKey();

    try {
      // 1) Load stats from localStorage (primary)
      const localStats = loadStatsFromLocalStorage();
      if (localStats) {
        setStats(localStats);
      } else {
        // 2) Migrate legacy cookie stats if present
        const legacyStatsRaw = readCookie(LEGACY_STATS_COOKIE);
        const legacyStats = safeParseJson(legacyStatsRaw, null);
        if (legacyStats) {
          setStats(legacyStats);
          saveStatsToLocalStorage(legacyStats);
        }
      }

      // 1) Load played difficulties by date from localStorage (primary)
      const playedByDate = loadPlayedByDateFromLocalStorage();
      if (Array.isArray(playedByDate[today])) {
        setPlayedToday(playedByDate[today]);
      } else {
        // 2) Migrate legacy date cookie format if present
        const legacyPlayedRaw = readCookie(getLegacyPlayedCookieKey(today));
        const legacyPlayedFromDateCookie = safeParseJson(legacyPlayedRaw, null);

        // 3) Fallback for older fixed-key cookie format
        const legacyPlayedTodayRaw = readCookie(LEGACY_PLAYED_TODAY_COOKIE);
        const legacyPlayedFromFixedCookie = safeParseJson(legacyPlayedTodayRaw, null);

        const migratedPlayed = Array.isArray(legacyPlayedFromDateCookie)
          ? legacyPlayedFromDateCookie
          : Array.isArray(legacyPlayedFromFixedCookie)
            ? legacyPlayedFromFixedCookie
            : [];

        if (migratedPlayed.length > 0) {
          setPlayedToday(migratedPlayed);
          const migratedByDate = { ...playedByDate, [today]: migratedPlayed };
          savePlayedByDateToLocalStorage(migratedByDate);
        }
      }
    } catch {
      // Storage read/migration failed
    }

    setInitialized(true);
  }, []);

  const recordGame = useCallback((won, difficulty) => {
    const today = getTodayKey();

    const playedByDate = loadPlayedByDateFromLocalStorage();
    const alreadyRecordedToday = Array.isArray(playedByDate[today])
      && playedByDate[today].includes(difficulty);

    if (alreadyRecordedToday) {
      setPlayedToday((prev) => (prev.includes(difficulty) ? prev : [...prev, difficulty]));
      return;
    }

    setStats((prev) => {
      const newStats = {
        played: prev.played + 1,
        wins: won ? prev.wins + 1 : prev.wins,
        currentStreak: won ? prev.currentStreak + 1 : 0,
        bestStreak: won
          ? Math.max(prev.currentStreak + 1, prev.bestStreak)
          : prev.bestStreak,
      };
      saveStatsToLocalStorage(newStats);
      return newStats;
    });

    // Track which difficulty was played today
    setPlayedToday((prev) => {
      const updated = Array.from(new Set([...prev, difficulty]));

      const latestPlayedByDate = loadPlayedByDateFromLocalStorage();
      latestPlayedByDate[today] = updated;
      savePlayedByDateToLocalStorage(latestPlayedByDate);

      return updated;
    });
  }, []);

  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  const hasPlayedDifficulty = (difficulty) => {
    return playedToday.includes(difficulty);
  };

  const getAvailableDifficulties = () => {
    return ['easy', 'medium', 'hard'].filter((d) => !playedToday.includes(d));
  };

  const allCompleted = playedToday.length === 3;

  return {
    stats,
    playedToday,
    winPct,
    recordGame,
    initialized,
    hasPlayedDifficulty,
    getAvailableDifficulties,
    allCompleted,
  };
}

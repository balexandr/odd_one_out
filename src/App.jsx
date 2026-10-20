import { useState, useEffect, useCallback } from 'react';
import { useGameState, getAllDifficultyResults } from './hooks/useGameState';
import { useStats } from './hooks/useStats';
import Header from './components/Header';
import GameBoard from './components/GameBoard';
import ResultScreen from './components/ResultScreen';
import HowToPlay from './components/HowToPlay';
import StatsScreen from './components/StatsScreen';
import AllLeaderboardsPanel from './components/AllLeaderboardsPanel';
import styles from './App.module.css';
import { NoodleLogoIcon } from './components/NoodleLogo';
import { IconCheckmark, IconShare } from './components/Icons';
import { getCompletedTodayCount, buildShareAllText, copyToClipboard, TOTAL_GAMES } from './utils/shareAll';
import { toLeaderboardScore, leaderboardGameId } from './utils/leaderboardScore';
import { fetchTodayBoard, findMyRow, wouldQualify } from './utils/leaderboard';

const HOW_TO_PLAY_KEY = 'odd-one-out-how-to-play-seen';
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function App() {
  const gameState = useGameState();
  const statsHook = useStats();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [resultDismissed, setResultDismissed] = useState(false);
  const [shareAllCount, setShareAllCount] = useState(0);
  const [shareAllCopied, setShareAllCopied] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setShareAllCount(getCompletedTodayCount(gameState.dateKey));
  }, [gameState.gameStatus, gameState.dateKey]);

  // Auto-opens the combined leaderboard (initials prompt included) a
  // beat after finishing all 3 difficulties for the day, instead of
  // making the player click "today's leaderboard" to find out they
  // made the cut. Gated on allCompleted, not just a single win — this
  // game has 3 separate leaderboard tracks (one per difficulty), and
  // finishing just one used to be enough to get a submission chance
  // on ITS board; now all 3 have to be done first, and whichever of
  // them were wins get checked together in one combined step (see
  // AllLeaderboardsPanel), since the per-difficulty tabs lock once
  // played and there's no way back to submit one individually later.
  useEffect(() => {
    if (!statsHook.allCompleted) return;
    const dateKey = gameState.dateKey;
    const t = setTimeout(() => {
      const results = getAllDifficultyResults(dateKey);
      const checks = DIFFICULTIES.map(async (d) => {
        const result = results[d];
        if (!result || result.gameStatus !== 'won' || result.elapsedMs == null) return false;
        const gameId = leaderboardGameId(d);
        const board = await fetchTodayBoard(gameId, dateKey);
        if (!board.config || findMyRow(gameId, board.rows)) return false;
        const pending = toLeaderboardScore(result.elapsedMs);
        return wouldQualify(pending.score, board.rows, board.config);
      });
      Promise.all(checks).then((qualifies) => {
        if (qualifies.some(Boolean)) setShowLeaderboard(true);
      });
    }, 2000);
    return () => clearTimeout(t);
  }, [statsHook.allCompleted, gameState.dateKey]);

  const handleShareAll = async () => {
    const text = buildShareAllText(gameState.dateKey);
    if (!text) return;
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch {}
    }
    await copyToClipboard(text);
    setShareAllCopied(true);
    setTimeout(() => setShareAllCopied(false), 2500);
  };

  const footer = (
    <footer className={styles.footer}>
      <a href="https://noodlegames.co" target="_blank" rel="noopener noreferrer" className={styles.footerLogo}>
        <NoodleLogoIcon size={18} /> NoodleGames
      </a>
      {shareAllCount > 0 && (
        <button
          className={`${styles.footerShareAll} ${shareAllCopied ? styles.copied : ''}`}
          onClick={handleShareAll}
        >
          {shareAllCopied
            ? <><IconCheckmark size={13} /> Copied</>
            : <><IconShare size={13} /> Share all completed ({shareAllCount}/{TOTAL_GAMES})</>}
        </button>
      )}
      <a href="https://noodlegames.co/privacy" target="_blank" rel="noopener noreferrer" className={styles.footerPrivacy}>Privacy Policy</a>
      <span className={styles.footerCopy}>© {currentYear} NoodleGames.co</span>
    </footer>
  );

  useEffect(() => {
    try {
      if (!localStorage.getItem(HOW_TO_PLAY_KEY)) {
        setShowHowToPlay(true);
      }
    } catch {}
  }, []);

  const dismissHowToPlay = () => {
    setShowHowToPlay(false);
    try {
      localStorage.setItem(HOW_TO_PLAY_KEY, '1');
    } catch {}
  };

  const handlePlayAgain = () => {
    // Switch to next available difficulty
    const available = statsHook.getAvailableDifficulties();
    if (available.length > 0) {
      gameState.changeDifficulty(available[0]);
    }
  };

  const handleRecordStats = useCallback((won) => {
    statsHook.recordGame(won, gameState.difficulty);
  }, [statsHook.recordGame, gameState.difficulty]);

  if (!gameState.initialized || !statsHook.initialized) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!gameState.puzzle) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          No puzzle for today. Check back tomorrow!
        </div>
        {footer}
      </div>
    );
  }

  const diffColor = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }[gameState.difficulty];

  return (
    <div className={styles.container} style={{ '--diff-color': diffColor }}>
      <Header
        onStatsClick={() => setShowStats(true)}
        onHowToPlayClick={() => setShowHowToPlay(true)}
        onLeaderboardClick={() => { if (statsHook.allCompleted) setShowLeaderboard(true); }}
        leaderboardLocked={!statsHook.allCompleted}
        difficulty={gameState.difficulty}
        puzzleNumber={gameState.puzzleNumber}
        onDifficultyChange={gameState.changeDifficulty}
        playedToday={statsHook.playedToday}
      />

      {gameState.gameStatus === 'playing' || resultDismissed ? (
        <>
          <GameBoard
            key={gameState.difficulty}
            words={gameState.words}
            onSelectWord={gameState.selectWord}
            guesses={gameState.guesses}
            oddOne={gameState.puzzle.oddOne}
            category={gameState.puzzle.category}
          />
        </>
      ) : (
        <ResultScreen
          won={gameState.gameStatus === 'won'}
          guesses={gameState.guesses}
          puzzle={gameState.puzzle}
          words={gameState.words}
          shareText={gameState.generateShareText()}
          allShareText={gameState.generateCombinedShareText(statsHook.playedToday)}
          completedCount={statsHook.playedToday.length}
          onPlayAgain={handlePlayAgain}
          onRecordStats={handleRecordStats}
          availableDifficulties={statsHook.getAvailableDifficulties()}
          allCompleted={statsHook.allCompleted}
          onDismiss={() => setResultDismissed(true)}
          onViewLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {showHowToPlay && <HowToPlay onClose={dismissHowToPlay} />}
      {showStats && (
        <StatsScreen
          stats={statsHook.stats}
          winPct={statsHook.winPct}
          onClose={() => setShowStats(false)}
        />
      )}
      {showLeaderboard && (
        <AllLeaderboardsPanel
          dateKey={gameState.dateKey}
          resultsByDifficulty={getAllDifficultyResults(gameState.dateKey)}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {footer}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { useStats } from './hooks/useStats';
import Header from './components/Header';
import GameBoard from './components/GameBoard';
import ResultScreen from './components/ResultScreen';
import HowToPlay from './components/HowToPlay';
import StatsScreen from './components/StatsScreen';
import styles from './App.module.css';
import { NoodleLogoIcon } from './components/NoodleLogo';
import { getCompletedTodayCount, buildShareAllText, TOTAL_GAMES } from './utils/shareAll';

const HOW_TO_PLAY_KEY = 'odd-one-out-how-to-play-seen';

export default function App() {
  const gameState = useGameState();
  const statsHook = useStats();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [resultDismissed, setResultDismissed] = useState(false);
  const [shareAllCount, setShareAllCount] = useState(0);
  const [shareAllCopied, setShareAllCopied] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setShareAllCount(getCompletedTodayCount(gameState.dateKey));
  }, [gameState.gameStatus, gameState.dateKey]);

  const handleShareAll = async () => {
    const text = buildShareAllText(gameState.dateKey);
    if (!text) return;
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
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
          {shareAllCopied ? '✓ Copied' : `⬆ Share all completed (${shareAllCount}/${TOTAL_GAMES})`}
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
        />
      )}

      {showHowToPlay && <HowToPlay onDismiss={dismissHowToPlay} />}
      {showStats && (
        <StatsScreen
          stats={statsHook.stats}
          winPct={statsHook.winPct}
          onClose={() => setShowStats(false)}
        />
      )}

      {footer}
    </div>
  );
}

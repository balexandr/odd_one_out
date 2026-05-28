import { useState, useEffect, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { useStats } from './hooks/useStats';
import Header from './components/Header';
import GameBoard from './components/GameBoard';
import ResultScreen from './components/ResultScreen';
import HowToPlay from './components/HowToPlay';
import StatsScreen from './components/StatsScreen';
import styles from './App.module.css';

const HOW_TO_PLAY_KEY = 'odd-one-out-how-to-play-seen';

export default function App() {
  const gameState = useGameState();
  const statsHook = useStats();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const currentYear = new Date().getFullYear();

  const footer = (
    <footer className={styles.footer}>
      <span>© {currentYear} NoodleGames.co</span>
      <span className={styles.footerDot}>•</span>
      <a href="https://noodlegames.co" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
        noodlegames.co
      </a>
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

  return (
    <div className={styles.container}>
      <Header
        onStatsClick={() => setShowStats(true)}
        onHowToPlayClick={() => setShowHowToPlay(true)}
        difficulty={gameState.difficulty}
        puzzleNumber={gameState.puzzleNumber}
        onDifficultyChange={gameState.changeDifficulty}
        playedToday={statsHook.playedToday}
      />

      {gameState.gameStatus === 'playing' ? (
        <GameBoard
          words={gameState.words}
          onSelectWord={gameState.selectWord}
          guesses={gameState.guesses}
          oddOne={gameState.puzzle.oddOne}
        />
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

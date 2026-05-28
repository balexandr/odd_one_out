import styles from './Header.module.css';

export default function Header({
  onStatsClick,
  onHowToPlayClick,
  difficulty,
  puzzleNumber,
  onDifficultyChange,
  playedToday,
}) {
  const isPlayedToday = (diff) => playedToday.includes(diff);

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>ODD ONE OUT</h1>
          {puzzleNumber ? <span className={styles.puzzleNumber}>#{puzzleNumber}</span> : null}
        </div>
        <div className={styles.actions}>
          <button
            className={styles.iconButton}
            onClick={onStatsClick}
            title="View statistics"
            aria-label="Statistics"
          >
            <svg
              className={styles.statsIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M4 20H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="6" y="11" width="2.8" height="7" rx="1" fill="currentColor" />
              <rect x="10.6" y="7" width="2.8" height="11" rx="1" fill="currentColor" opacity="0.9" />
              <rect x="15.2" y="4" width="2.8" height="14" rx="1" fill="currentColor" opacity="0.8" />
            </svg>
          </button>
          <button
            className={styles.iconButton}
            onClick={onHowToPlayClick}
            title="How to play"
            aria-label="How to play"
          >
            ?
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        {['easy', 'medium', 'hard'].map((diff) => (
          <button
            key={diff}
            className={`${styles.tab} ${
              difficulty === diff ? styles.active : ''
            } ${isPlayedToday(diff) ? styles.played : ''}`}
            onClick={() => onDifficultyChange(diff)}
            disabled={isPlayedToday(diff) && difficulty !== diff}
            title={isPlayedToday(diff) ? 'Completed today' : ''}
          >
            {diff === 'easy' && '🟩'}
            {diff === 'medium' && '🟨'}
            {diff === 'hard' && '🟥'}
            {' '}
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>
    </header>
  );
}

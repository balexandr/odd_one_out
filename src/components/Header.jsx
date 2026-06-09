import styles from './Header.module.css';

const DIFF_META = {
  easy:   { emoji: '🟩', label: 'Easy' },
  medium: { emoji: '🟨', label: 'Medium' },
  hard:   { emoji: '🟥', label: 'Hard' },
};

export default function Header({
  onStatsClick,
  onHowToPlayClick,
  difficulty,
  puzzleNumber,
  onDifficultyChange,
  playedToday,
}) {
  const isPlayed = (d) => playedToday.includes(d);

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>
            ODD <span>
              <span className={styles.accentO}>O</span>
              <span className={styles.accentN}>N</span>
              <span className={styles.accentE}>E</span>
            </span> OUT
          </h1>
          {puzzleNumber && <span className={styles.puzzleNumber}>#{puzzleNumber}</span>}
        </div>
        <div className={styles.actions}>
          <button className={styles.iconButton} onClick={onStatsClick} aria-label="Statistics">
            <svg className={styles.statsIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 20H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="6" y="11" width="2.8" height="7" rx="1" fill="currentColor" />
              <rect x="10.6" y="7" width="2.8" height="11" rx="1" fill="currentColor" opacity="0.9" />
              <rect x="15.2" y="4" width="2.8" height="14" rx="1" fill="currentColor" opacity="0.8" />
            </svg>
          </button>
          <button className={styles.iconButton} onClick={onHowToPlayClick} aria-label="How to play">?</button>
        </div>
      </div>

      <div className={styles.tabs}>
        {['easy', 'medium', 'hard'].map((d) => {
          const { emoji, label } = DIFF_META[d];
          const played = isPlayed(d);
          return (
            <button
              key={d}
              className={`${styles.tab} ${difficulty === d ? styles.active : ''} ${played ? styles.played : ''}`}
              onClick={() => onDifficultyChange(d)}
              disabled={played && difficulty !== d}
            >
              <span className={styles.tabEmoji}>{emoji}</span>
              <span className={styles.tabLabel}>{label}</span>
              {played && <span className={styles.tabCheck}>✓</span>}
            </button>
          );
        })}
      </div>
    </header>
  );
}

import styles from './StatsScreen.module.css';

export default function StatsScreen({ stats, winPct, onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Statistics</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.played}</div>
            <div className={styles.statLabel}>Played</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{winPct}%</div>
            <div className={styles.statLabel}>Win %</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.currentStreak}</div>
            <div className={styles.statLabel}>Current</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.bestStreak}</div>
            <div className={styles.statLabel}>Best</div>
          </div>
        </div>
      </div>
    </div>
  );
}

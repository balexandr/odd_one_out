import styles from './WordTile.module.css';

export default function WordTile({ word, index, onClick, state, disabled }) {
  let className = styles.tile;
  if (state === 'correct')   className += ` ${styles.correct}`;
  if (state === 'incorrect') className += ` ${styles.incorrect}`;
  if (disabled && !state)    className += ` ${styles.disabled}`;

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled && !state}
      aria-label={word}
    >
      <span className={styles.num}>{index + 1}</span>
      <span className={styles.word}>{word}</span>
      {state === 'correct'   && <span className={styles.feedback}>✓</span>}
      {state === 'incorrect' && <span className={styles.feedback}>✗</span>}
    </button>
  );
}

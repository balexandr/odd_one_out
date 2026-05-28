import styles from './WordTile.module.css';

export default function WordTile({
  word,
  index,
  onClick,
  state,
  disabled,
  isOddOne,
}) {
  const getClassName = () => {
    let className = styles.tile;
    if (state === 'correct') className += ` ${styles.correct}`;
    if (state === 'incorrect') className += ` ${styles.incorrect}`;
    if (disabled && state !== 'correct' && state !== 'incorrect') {
      className += ` ${styles.disabled}`;
    }
    return className;
  };

  return (
    <button
      className={getClassName()}
      onClick={onClick}
      disabled={disabled && state === null}
      aria-label={word}
    >
      {state === 'correct' && <span className={styles.check}>✓</span>}
      {state === 'incorrect' && <span className={styles.cross}>✗</span>}
      <span className={styles.word}>{word}</span>
    </button>
  );
}

import { useEffect, useState } from 'react';
import WordTile from './WordTile';
import { getSoftHint } from '../utils/hint';
import styles from './GameBoard.module.css';

export default function GameBoard({
  words,
  onSelectWord,
  guesses,
  oddOne,
  category,
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(t);
  }, []);

  const getGuessState = (index) => {
    const guess = guesses.find((g) => g.index === index);
    if (!guess) return null;
    return guess.isCorrect ? 'correct' : 'incorrect';
  };

  const hint = getSoftHint(category);

  return (
    <div className={styles.container} style={ready ? undefined : { pointerEvents: 'none' }}>
      <div className={styles.question}>Pick the odd one out</div>
      <div className={styles.questionBar} />

      {guesses.length === 0 && hint && (
        <div className={styles.hint}>
          <svg className={styles.hintIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.36.8.95.8 1.6h5.4c0-.65.3-1.24.8-1.6A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <span>{hint}<span className={styles.hintEllipsis}>&hellip;</span></span>
        </div>
      )}

      <div className={styles.grid}>
        {words.map((word, index) => (
          <WordTile
            key={index}
            word={word}
            index={index}
            onClick={() => onSelectWord(index)}
            state={getGuessState(index)}
            disabled={guesses.length > 0}
            isOddOne={oddOne === index}
          />
        ))}
      </div>
    </div>
  );
}

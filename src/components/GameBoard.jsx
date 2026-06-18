import { useEffect, useState } from 'react';
import WordTile from './WordTile';
import styles from './GameBoard.module.css';

export default function GameBoard({
  words,
  onSelectWord,
  guesses,
  oddOne,
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

  return (
    <div className={styles.container} style={ready ? undefined : { pointerEvents: 'none' }}>
      <div className={styles.question}>Pick the odd one out</div>
      <div className={styles.questionBar} />
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

      {guesses.length === 0 && (
        <div className={styles.attemptsRemaining}>
          1 attempt remaining
        </div>
      )}
    </div>
  );
}

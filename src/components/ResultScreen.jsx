import { useEffect, useState } from 'react';
import styles from './ResultScreen.module.css';

export default function ResultScreen({
  won,
  guesses,
  puzzle,
  words,
  shareText,
  onPlayAgain,
  onRecordStats,
  availableDifficulties,
  allCompleted,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    onRecordStats(won);
  }, [won, onRecordStats]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        // User cancelled or share failed; fall through to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {won ? (
          <>
            <div className={styles.result}>🎉 Correct!</div>
            <p className={styles.message}>You found the odd one out!</p>
          </>
        ) : (
          <>
            <div className={styles.result}>❌ Game Over</div>
            <p className={styles.message}>Better luck next time!</p>
          </>
        )}

        <div className={styles.explanation}>
          <div className={styles.oddOneWord}>{words[puzzle.oddOne]}</div>
          <p className={styles.category}>Category: {puzzle.category}</p>
          <p className={styles.explanationText}>{puzzle.explanation}</p>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.shareButton} ${copied ? styles.copied : ''}`}
            onClick={handleShare}
          >
            {copied ? '✓ Copied to clipboard' : 'Share your result'}
          </button>
          {!allCompleted && availableDifficulties.length > 0 ? (
            <button className={styles.playButton} onClick={onPlayAgain}>
              Play {availableDifficulties[0].charAt(0).toUpperCase() +
                availableDifficulties[0].slice(1)}
            </button>
          ) : (
            <div className={styles.completedMessage}>
              ✨ You've completed all difficulties today!
              <br />
              Come back tomorrow for new puzzles.
            </div>
          )}
        </div>

        <div className={styles.sharePreview}>
          <pre className={styles.previewText}>{shareText}</pre>
        </div>
      </div>
    </div>
  );
}

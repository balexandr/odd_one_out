import { useEffect, useRef, useState } from 'react';
import styles from './ResultScreen.module.css';

export default function ResultScreen({
  won,
  guesses,
  puzzle,
  words,
  shareText,
  allShareText,
  completedCount,
  onPlayAgain,
  onRecordStats,
  availableDifficulties,
  allCompleted,
}) {
  const [copiedLabel, setCopiedLabel] = useState('');
  const [previewMode, setPreviewMode] = useState('single');
  const didRecordRef = useRef(false);

  useEffect(() => {
    if (!didRecordRef.current) {
      onRecordStats(won);
      didRecordRef.current = true;
    }
  }, [won, onRecordStats]);

  useEffect(() => {
    if (completedCount > 1 && allShareText && allShareText !== shareText) {
      setPreviewMode('all');
    } else {
      setPreviewMode('single');
    }
  }, [completedCount, allShareText, shareText]);

  const canShareAll = completedCount > 1 && Boolean(allShareText) && allShareText !== shareText;
  const previewText = previewMode === 'all' && canShareAll ? allShareText : shareText;

  const shareToDevice = async (text, copiedMessage) => {
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // User cancelled or share failed; fall through to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopiedLabel(copiedMessage);
    setTimeout(() => setCopiedLabel(''), 2500);
  };

  const handleShareSingle = async () => {
    setPreviewMode('single');
    await shareToDevice(shareText, '✓ Copied this difficulty');
  };

  const handleShareAll = async () => {
    setPreviewMode('all');
    await shareToDevice(allShareText, '✓ Copied all completed');
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
            className={`${styles.shareButton} ${copiedLabel === '✓ Copied this difficulty' ? styles.copied : ''}`}
            onClick={handleShareSingle}
          >
            {copiedLabel === '✓ Copied this difficulty' ? copiedLabel : 'Share this difficulty'}
          </button>
          {canShareAll && (
            <button
              className={`${styles.shareAllButton} ${copiedLabel === '✓ Copied all completed' ? styles.copied : ''}`}
              onClick={handleShareAll}
            >
              {copiedLabel === '✓ Copied all completed'
                ? copiedLabel
                : `Share all completed (${completedCount})`}
            </button>
          )}
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
          <div className={styles.previewLabel}>
            Preview: {previewMode === 'all' && completedCount > 1 ? 'All completed' : 'This difficulty'}
          </div>
          <pre className={styles.previewText}>{previewText}</pre>
        </div>
      </div>
    </div>
  );
}

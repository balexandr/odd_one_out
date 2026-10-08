import { useEffect, useRef, useState } from 'react';
import { IconClose, IconCheckCircle, IconXCircle, IconCheckmark, IconSparkle } from './Icons';
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
  onDismiss,
}) {
  const [copiedKind, setCopiedKind] = useState('');
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

  const shareToDevice = async (text, kind) => {
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

    setCopiedKind(kind);
    setTimeout(() => setCopiedKind(''), 2500);
  };

  const handleShareSingle = async () => {
    setPreviewMode('single');
    await shareToDevice(shareText, 'single');
  };

  const handleShareAll = async () => {
    setPreviewMode('all');
    await shareToDevice(allShareText, 'all');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <button className={styles.closeBtn} onClick={onDismiss} aria-label="Close"><IconClose /></button>
        {won ? (
          <>
            <div className={styles.result}><IconCheckCircle /> Correct!</div>
            <p className={styles.message}>You found the odd one out!</p>
          </>
        ) : (
          <>
            <div className={styles.result}><IconXCircle /> Game Over</div>
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
            className={`${styles.shareButton} ${copiedKind === 'single' ? styles.copied : ''}`}
            onClick={handleShareSingle}
          >
            {copiedKind === 'single' ? <><IconCheckmark size={14} /> Copied this difficulty</> : 'Share this difficulty'}
          </button>
          {canShareAll && (
            <button
              className={`${styles.shareAllButton} ${copiedKind === 'all' ? styles.copied : ''}`}
              onClick={handleShareAll}
            >
              {copiedKind === 'all'
                ? <><IconCheckmark size={14} /> Copied all completed</>
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
              <IconSparkle size={16} /> You've completed all difficulties today!
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

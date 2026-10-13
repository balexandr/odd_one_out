import { useState, useEffect, useCallback } from 'react';
import { fetchTodayBoard, submitScore, wouldQualify, findMyRow, LEADERBOARD_SIZE, getSavedInitials, saveInitials } from '../utils/leaderboard';
import { leaderboardGameId } from '../utils/leaderboardScore';
import { IconClose, IconSparkle } from './Icons';
import styles from './LeaderboardPanel.module.css';

// Each difficulty is its own leaderboard track (see leaderboardScore.js),
// so gameId is a prop here instead of a module-level constant like the
// other games' copies of this panel.
export default function LeaderboardPanel({ difficulty, dateKey, pendingScore, onClose }) {
  const gameId = leaderboardGameId(difficulty);
  const [board, setBoard] = useState(null);
  const [initials, setInitials] = useState(() => getSavedInitials());
  const [savedInitials, setSavedInitials] = useState(() => getSavedInitials());
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState(null); // null | 'accepted' | 'missed'

  const reload = useCallback(() => {
    fetchTodayBoard(gameId, dateKey).then(setBoard);
  }, [gameId, dateKey]);

  useEffect(() => { reload(); }, [reload]);

  const myRow = board && findMyRow(gameId, board.rows);

  const qualifies = board && pendingScore && !outcome && !myRow
    && wouldQualify(pendingScore.score, board.rows, board.config);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (initials.length !== 3 || submitting) return;
    setSubmitting(true);
    const result = await submitScore(gameId, { ...pendingScore, initials });
    setSubmitting(false);
    setOutcome(result.accepted ? 'accepted' : 'missed');
    if (result.accepted) {
      saveInitials(initials);
      setSavedInitials(initials);
      reload();
    }
  };

  // Not tied to a score submission — just changes what prefills next
  // time, so a player who's already on the board (or never qualifies
  // again) still has a way to fix a mistyped set of initials.
  const handleEditSave = (e) => {
    e.preventDefault();
    if (initials.length !== 3) return;
    saveInitials(initials);
    setSavedInitials(initials);
    setEditing(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Today's Leaderboard — {difficulty}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        {editing && (
          <form className={styles.initialsForm} onSubmit={handleEditSave}>
            <p className={styles.prompt}>Change your initials:</p>
            <input
              className={styles.initialsInput}
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))}
              maxLength={3}
              autoFocus
              aria-label="Your initials"
            />
            <div className={styles.editActions}>
              <button type="submit" className={styles.submitBtn} disabled={initials.length !== 3}>Save</button>
              <button type="button" className={styles.cancelBtn} onClick={() => { setInitials(savedInitials); setEditing(false); }}>Cancel</button>
            </div>
          </form>
        )}

        {!editing && qualifies && (
          <form className={styles.initialsForm} onSubmit={handleSubmit}>
            <p className={styles.prompt}><IconSparkle size={14} /> Top {LEADERBOARD_SIZE}! Enter your initials:</p>
            <input
              className={styles.initialsInput}
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))}
              maxLength={3}
              autoFocus
              aria-label="Your initials"
            />
            <button type="submit" className={styles.submitBtn} disabled={initials.length !== 3 || submitting}>
              {submitting ? 'Saving…' : 'Submit'}
            </button>
          </form>
        )}

        {!editing && !qualifies && savedInitials && (
          <div className={styles.playingAs}>
            <span>Playing as <strong>{savedInitials}</strong></span>
            <button type="button" className={styles.editLink} onClick={() => setEditing(true)}>edit</button>
          </div>
        )}

        {outcome === 'missed' && (
          <p className={styles.outcomeMissed}>Someone beat you to that spot just now, so close.</p>
        )}

        {!board && <p className={styles.loading}>Loading…</p>}

        {board && (
          <ol className={styles.list}>
            {board.rows.length === 0 && <li className={styles.empty}>No scores yet today. Be the first.</li>}
            {board.rows.map((row, i) => (
              <li key={`${row.initials}-${i}`} className={`${styles.row} ${row === myRow ? styles.rowMine : ''}`}>
                <span className={styles.rank}>{i + 1}</span>
                <span className={styles.initials}>{row.initials}</span>
                <span className={styles.score}>{row.score_display}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

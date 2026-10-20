import { useState, useEffect, useCallback } from 'react';
import { fetchTodayBoard, submitScore, wouldQualify, findMyRow, LEADERBOARD_SIZE, getSavedInitials, saveInitials } from '../utils/leaderboard';
import { leaderboardGameId, toLeaderboardScore } from '../utils/leaderboardScore';
import { IconClose, IconSparkle } from './Icons';
import styles from './AllLeaderboardsPanel.module.css';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DIFF_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

// Only reachable once all 3 difficulties are done for the day (see
// App.jsx - the header button and the auto-popup effect are both
// gated on statsHook.allCompleted). Unlike every other game's
// LeaderboardPanel, this one covers all 3 of this game's separate
// leaderboard tracks at once with a single initials entry, since the
// player can't switch back to an already-played difficulty's tab to
// revisit it individually (see Header.jsx's tab lock).
export default function AllLeaderboardsPanel({ dateKey, resultsByDifficulty, onClose }) {
  const [boards, setBoards] = useState({});
  const [initials, setInitials] = useState(() => getSavedInitials());
  const [savedInitials, setSavedInitials] = useState(() => getSavedInitials());
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outcomes, setOutcomes] = useState({}); // { [difficulty]: 'accepted' | 'missed' | 'error' }

  const reload = useCallback(() => {
    DIFFICULTIES.forEach((d) => {
      fetchTodayBoard(leaderboardGameId(d), dateKey).then((board) => {
        setBoards((prev) => ({ ...prev, [d]: board }));
      });
    });
  }, [dateKey]);

  useEffect(() => { reload(); }, [reload]);

  const pendingFor = (d) => {
    const result = resultsByDifficulty[d];
    if (!result || result.gameStatus !== 'won' || result.elapsedMs == null) return null;
    return toLeaderboardScore(result.elapsedMs);
  };

  const myRowFor = (d) => {
    const board = boards[d];
    return board ? findMyRow(leaderboardGameId(d), board.rows) : null;
  };

  const qualifiesFor = (d) => {
    const board = boards[d];
    const pending = pendingFor(d);
    if (!board || !board.config || !pending || outcomes[d] || myRowFor(d)) return false;
    return wouldQualify(pending.score, board.rows, board.config);
  };

  const qualifying = DIFFICULTIES.filter(qualifiesFor);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (initials.length < 2 || submitting) return;
    setSubmitting(true);
    const nextOutcomes = {};
    for (const d of qualifying) {
      const result = await submitScore(leaderboardGameId(d), { ...pendingFor(d), initials });
      if (result.error) {
        console.error(`submitScore failed for ${d}:`, result.error);
        nextOutcomes[d] = 'error';
      } else {
        nextOutcomes[d] = result.accepted ? 'accepted' : 'missed';
      }
    }
    setOutcomes((prev) => ({ ...prev, ...nextOutcomes }));
    setSubmitting(false);
    saveInitials(initials);
    setSavedInitials(initials);
    reload();
  };

  // Not tied to a score submission — just changes what prefills next
  // time, same as every other game's panel.
  const handleEditSave = (e) => {
    e.preventDefault();
    if (initials.length < 2) return;
    saveInitials(initials);
    setSavedInitials(initials);
    setEditing(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Today's Leaderboards</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        {editing && (
          <form className={styles.initialsForm} onSubmit={handleEditSave}>
            <p className={styles.prompt}>Change your initials (2-3 letters):</p>
            <input
              className={styles.initialsInput}
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))}
              maxLength={3}
              autoFocus
              aria-label="Your initials"
            />
            <div className={styles.editActions}>
              <button type="submit" className={styles.submitBtn} disabled={initials.length < 2}>Save</button>
              <button type="button" className={styles.cancelBtn} onClick={() => { setInitials(savedInitials); setEditing(false); }}>Cancel</button>
            </div>
          </form>
        )}

        {!editing && qualifying.length > 0 && (
          <form className={styles.initialsForm} onSubmit={handleSubmit}>
            <p className={styles.prompt}>
              <IconSparkle size={14} /> Top {LEADERBOARD_SIZE} in {qualifying.map((d) => DIFF_LABEL[d]).join(' & ')}! Enter your initials (2-3 letters):
            </p>
            <input
              className={styles.initialsInput}
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))}
              maxLength={3}
              autoFocus
              aria-label="Your initials"
            />
            <button type="submit" className={styles.submitBtn} disabled={initials.length < 2 || submitting}>
              {submitting ? 'Saving…' : 'Submit'}
            </button>
          </form>
        )}

        {!editing && qualifying.length === 0 && savedInitials && (
          <div className={styles.playingAs}>
            <span>Playing as <strong>{savedInitials}</strong></span>
            <button type="button" className={styles.editLink} onClick={() => setEditing(true)}>edit</button>
          </div>
        )}

        {DIFFICULTIES.map((d) => {
          const board = boards[d];
          const myRow = myRowFor(d);
          const outcome = outcomes[d];
          return (
            <div key={d} className={styles.diffSection}>
              <p className={styles.diffSectionTitle}>{DIFF_LABEL[d]}</p>

              {outcome === 'missed' && (
                <p className={styles.outcomeMissed}>Someone beat you to that spot just now, so close.</p>
              )}
              {outcome === 'error' && (
                <p className={styles.outcomeMissed}>Couldn't save your score — try again in a bit.</p>
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
          );
        })}
      </div>
    </div>
  );
}

import styles from './HowToPlay.module.css';

export default function HowToPlay({ onDismiss }) {
  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>How to Play</h2>
          <button className={styles.closeButton} onClick={onDismiss}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <section>
            <h3>Objective</h3>
            <p>
              Pick the word that doesn't belong with the other three. You get one guess
              per difficulty — choose carefully!
            </p>
          </section>

          <section>
            <h3>Difficulty Levels</h3>
            <p>
              <strong>Easy:</strong> Straightforward category differences (e.g. 3 planets + 1
              candy bar)
            </p>
            <p>
              <strong>Medium:</strong> Tricky misdirects and double meanings
            </p>
            <p>
              <strong>Hard:</strong> Requires lateral thinking and creative connections
            </p>
          </section>

          <section>
            <h3>Daily Puzzle</h3>
            <p>
              A new puzzle is available each day for each difficulty level. All players get the
              same puzzle for each day.
            </p>
          </section>

          <section>
            <h3>Share</h3>
            <p>
              After completing a puzzle, you can share your result as emoji squares with friends.
              Your answer is hidden in the share!
            </p>
          </section>
        </div>

        <button className={styles.playButton} onClick={onDismiss}>
          Got it! Let's Play
        </button>
      </div>
    </div>
  );
}

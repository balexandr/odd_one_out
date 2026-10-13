// Odd One Out's own definition of what counts as winning: response
// time from seeing the words to picking correctly, lower is better.
// This game is a single click with no existing time/attempt/point
// tracking to reuse (see noodle_games/LEADERBOARD_DESIGN.md's note on
// this game specifically) — elapsedMs is a new stopwatch added to
// useGameState.js just to give this leaderboard something to rank by.
//
// Each difficulty is its own leaderboard track (separate game_id:
// odd-one-out-easy / -medium / -hard), not one combined board —
// comparing a fast easy-mode guess against a slow hard-mode one isn't
// a fair or meaningful comparison.
export function toLeaderboardScore(elapsedMs) {
  const seconds = elapsedMs / 1000
  return { score: Number(seconds.toFixed(2)), tiebreak: null, scoreDisplay: `${seconds.toFixed(1)}s` }
}

export function leaderboardGameId(difficulty) {
  return `odd-one-out-${difficulty}`
}

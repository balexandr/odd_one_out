# Odd One Out — Daily Word Puzzle

A daily puzzle game where you pick the word that doesn't belong. Three difficulty levels, one shot each.

Part of the [NoodleGames](https://noodlegames.co) family alongside **Sequence** and **Chain Link**.

---

## How to play

You're shown four words. One doesn't belong — tap it to guess. You only get **one attempt per difficulty**, so think before you pick.

Three difficulties unlock independently each day:

| | |
|---|---|
| 🟩 **Easy** | Clear category differences |
| 🟨 **Medium** | Tricky misdirects and double meanings |
| 🟥 **Hard** | Lateral thinking required |

Resets daily at **midnight EST**.

---

## Sharing

After completing a difficulty you can share your result. The share text shows which difficulties you completed and whether you got them right — without revealing the answer. Once you've finished at least one NoodleGame today, a **Share all completed** button appears in the footer, letting you share every game you've solved today in one message.

---

## Stack

React + Vite · CSS Modules · localStorage · GitHub Pages

---

## Puzzles

Puzzles run from **May 12, 2026** onward (234 days per difficulty, through December 2026), stored in `src/data/puzzles.json` organised by difficulty then date. Each entry contains four words, the index of the odd one out, a category label, and an explanation shown after guessing.

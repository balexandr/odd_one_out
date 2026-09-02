// Turns a puzzle's full category string into a softer nudge by cutting off
// the part that names (or strongly implies) the odd one out.
//
// e.g. "Weekdays vs. a Weekend Day" -> "Weekdays"
//      "True Botanical Berries, Except One" -> "True Botanical Berries"
//      "Zodiac Constellations" (no split point) -> unchanged
//
// This still requires the player to know the theme AND spot which word
// breaks it — it doesn't point at a tile.
export function getSoftHint(category) {
  if (!category) return '';
  const match = category.match(/^(.*?)(,|\svs\.?\s)/i);
  return (match ? match[1] : category).trim();
}

// Quick mechanical check: given 4 words/phrases, which ones are true
// letter-for-letter anagrams of each other (ignoring case/spaces/punct).
export function letterKey(s) {
  return s.toLowerCase().replace(/[^a-z]/g, '').split('').sort().join('');
}
export function checkAnagramSet(words) {
  const keys = words.map(letterKey);
  const counts = {};
  keys.forEach((k) => { counts[k] = (counts[k] || 0) + 1; });
  return keys.map((k, i) => ({ word: words[i], key: k, groupSize: counts[k] }));
}

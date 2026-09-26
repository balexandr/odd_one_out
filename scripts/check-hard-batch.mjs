import { checkAnagramSet } from './verify-anagram.mjs';
function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z]/g, '');
  return clean === clean.split('').reverse().join('') && clean.length > 0;
}
export function verifyAnagramPuzzle(words, oddOne) {
  const results = checkAnagramSet(words);
  const oddResult = results[oddOne];
  const others = results.filter((_, i) => i !== oddOne);
  const othersMatch = others.every(o => o.key === others[0].key);
  const oddIsDifferent = oddResult.key !== others[0].key;
  return { ok: othersMatch && oddIsDifferent, results };
}
export function verifyPalindromePuzzle(words, oddOne) {
  const flags = words.map(isPalindrome);
  const oddOk = !flags[oddOne];
  const othersOk = flags.every((f, i) => i === oddOne || f === true);
  return { ok: oddOk && othersOk, flags };
}

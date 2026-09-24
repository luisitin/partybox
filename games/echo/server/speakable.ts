// LOCAL STAND-IN for F6's `toSpeakable` (foundation §5.3), only the rules a one-word clue can
// trip: curly quotes, symbols and emoji, stretched letters, shouting, the length cap. The display
// text never changes; only what the voice receives. Swap to the SDK function when F6 lands.
const STRAIGHT = /[’‘ʼ´`]/g;
const CURLY_DOUBLE = /[“”"]/g;

export function speakable(text: string): string {
  let s = text.replace(STRAIGHT, "'").replace(CURLY_DOUBLE, '');
  s = s.replace(/&/g, ' and ').replace(/\+/g, ' plus ').replace(/@/g, ' at ');
  // Emoji and stray symbols go; letters, digits, basic punctuation and apostrophes stay.
  s = s.replace(/[^\p{L}\p{N}\s'.,!?-]/gu, ' ');
  s = s.replace(/(\p{L})\1{2,}/gu, '$1$1');
  const letters = s.replace(/[^\p{L}]/gu, '');
  const caps = s.replace(/[^\p{Lu}]/gu, '');
  if (letters.length > 1 && caps.length * 2 > letters.length) s = s.toLowerCase();
  s = s.replace(/\s+/g, ' ').trim();
  if (s.length > 140) s = s.slice(0, 140).replace(/\s+\S*$/, '');
  return s;
}

// STAND-IN for the SDK's `toSpeakable` (foundation F6, P4) until it lands on main — the subset of
// Part 00 §5.3 an Imposter line can need (short lines, one-word clues, player names), plus the
// game's overrides (§5.4, owner ruling 17: case-sensitive unless `anyCase`). The display text never
// changes; only what the voice receives does. See docs/game-pack/imposter/NOTES.md.
import type { SpeechPart } from '@partybox/game-sdk';

export type Overrides = Record<string, { say: string; ipa?: string; anyCase?: boolean }>;

const KEEP_CAPS = new Set(['NASA', 'NATO', 'UNICEF', 'FIFA', 'IKEA', 'SCUBA', 'LASER', 'RADAR']);

function clean(text: string, playerText: boolean): string {
  let s = text.replace(/[’‘ʼ´`]/g, "'").replace(/[“”"]/g, '');
  s = s.replace(/&/g, ' and ').replace(/\+/g, ' plus ').replace(/@/g, ' at ');
  s = s.replace(/(\p{L})-(\p{L})/gu, '$1 $2'); // "hang-ten" → "hang ten"
  s = s.replace(/_{2,}/g, ' blank ').replace(/[_]/g, ' ');
  s = s.replace(/\.{3}|…/g, ',');
  s = s.replace(/[^\p{L}\p{N}' ,.!?]/gu, ' '); // emoji and stray symbols
  if (playerText) {
    const letters = s.replace(/[^\p{L}]/gu, '');
    const caps = letters.replace(/[^\p{Lu}]/gu, '');
    if (letters.length > 3 && caps.length * 2 > letters.length)
      s = s.replace(/\p{L}+/gu, (w) => (KEEP_CAPS.has(w) ? w : w.toLowerCase()));
    s = s.replace(/(\p{L})\1{2,}/gu, '$1$1'); // "sooooo" → "soo"
    if (s.length > 140) s = s.slice(0, 140).replace(/\s+\S*$/, '');
  }
  s = s.replace(/\b([A-Z]{2,5})\b/g, (w) => (KEEP_CAPS.has(w) ? w : w.split('').join(' ')));
  return s.replace(/\s+/g, ' ').trim();
}

/** Text → the parts a voice reads; overrides become respellings (`say`) or phonemes (`ipa`). */
export function toSpeakable(
  text: string,
  opts: { overrides?: Overrides; playerText?: boolean } = {},
): SpeechPart[] {
  const s = clean(text, opts.playerText === true);
  const over = opts.overrides ?? {};
  // One pass over the list per line, then a lookup per word (was a scan per word).
  const anyCase = new Map<string, Overrides[string]>();
  for (const [k, v] of Object.entries(over)) if (v.anyCase) anyCase.set(k.toLowerCase(), v);
  const parts: SpeechPart[] = [];
  let buf = '';
  for (const token of s.split(/(\s+|[,.!?])/)) {
    const hit = Object.hasOwn(over, token) ? over[token] : anyCase.get(token.toLowerCase());
    if (!hit) {
      buf += token;
      continue;
    }
    if (buf) parts.push({ text: buf });
    buf = '';
    parts.push(hit.ipa ? { ipa: hit.ipa, text: hit.say } : { text: hit.say });
  }
  if (buf) parts.push({ text: buf });
  return parts;
}

/** Part 00 §5.5: a name with no vowels, or mostly digits and symbols, is not read aloud. */
export function readableName(name: string): boolean {
  const letters = name.replace(/[^\p{L}]/gu, '');
  if (letters.length < 2 || !/[aeiouyáéíóúü]/i.test(letters)) return false;
  return letters.length * 2 >= name.replace(/\s/g, '').length;
}

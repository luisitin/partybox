// A thin local stand-in for the Foundation's `toSpeakable` (P00 §5.2–5.4, F6), cut to what Tune In
// reads: player names, player-written clues and pack labels. The display text never changes; only
// what the voice receives does. Swap to `@partybox/game-sdk/speech` when F6 lands (NOTES.md).
import type { SpeechPart } from '@partybox/game-sdk';

export interface Override {
  say: string;
  ipa?: string;
  anyCase?: boolean;
}

const CAP = 140;
const SAY_AS_WORD = new Set([
  'NASA',
  'NATO',
  'UNICEF',
  'FIFA',
  'IKEA',
  'SCUBA',
  'LASER',
  'RADAR',
  'NASCAR',
]);
const SYMBOLS: [RegExp, string][] = [
  [/&/g, ' and '],
  [/\+/g, ' plus '],
  [/@/g, ' at '],
  [/%/g, ' percent'],
  [/#(?=\d)/g, 'number '],
  [/=/g, ' equals '],
];

/** Rules 1, 5, 7, 10–13 of P00 §5.3 (quotes, symbols, shouting, pacing, emoji, stretched words,
 *  the length cap); numbers stay as digits for the voice to read. */
export function speakableText(text: string, playerText: boolean): string {
  let t = text.replace(/[’‘ʼ´`]/g, "'").replace(/[“”"]/g, '');
  for (const [re, say] of SYMBOLS) t = t.replace(re, say);
  t = t
    .replace(/\.\.\.|…/g, ',')
    .replace(/\s[–—]\s/g, ', ')
    .replace(/[()]/g, ',');
  t = t.replace(/!{2,}/g, '!').replace(/\?!/g, '?');
  t = t.replace(/[^\p{L}\p{N}\s'.,!?-]/gu, ' ');
  if (playerText) {
    const letters = t.replace(/[^\p{L}]/gu, '');
    const upper = letters.replace(/[^\p{Lu}]/gu, '');
    if (letters.length > 3 && upper.length * 2 > letters.length) t = t.toLowerCase();
    t = t.replace(/(\p{L})\1{2,}/gu, '$1$1');
    // Rule 8: a run of 2–5 capitals is spelled out (FBI → F B I), except the say-as-word list.
    t = t.replace(/\b[A-Z]{2,5}\b/g, (w) => (SAY_AS_WORD.has(w) ? w : w.split('').join(' ')));
  }
  t = t.replace(/\s+/g, ' ').trim();
  if (t.length > CAP) t = t.slice(0, t.lastIndexOf(' ', CAP) > 0 ? t.lastIndexOf(' ', CAP) : CAP);
  return t;
}

/** P00 §5.5: a name with no vowels, or mostly digits and symbols, is skipped by the reader. */
export function readableName(name: string): string | null {
  // A shouted name is a name, not an acronym: BEN is read "Ben".
  const calm = name === name.toUpperCase() ? name.charAt(0) + name.slice(1).toLowerCase() : name;
  const clean = speakableText(calm.replace(/[_]+/g, ' '), true);
  const letters = clean.replace(/[^\p{L}]/gu, '');
  if (letters.length === 0 || !/[aeiouy]/i.test(letters)) return null;
  if (letters.length * 2 < clean.replace(/\s/g, '').length) return null;
  return clean;
}

/** Whole-word overrides (case-sensitive unless `anyCase`), then the text as parts. */
export function toParts(text: string, overrides: Readonly<Record<string, Override>>): SpeechPart[] {
  const parts: SpeechPart[] = [];
  let run = '';
  for (const piece of text.split(/(\s+)/)) {
    const m = /^([^\p{L}\p{N}]*)([\p{L}\p{N}'-]+)([^\p{L}\p{N}]*)$/u.exec(piece);
    const word = m?.[2] ?? '';
    const hit =
      overrides[word] ??
      Object.entries(overrides).find(
        ([k, o]) => o.anyCase && k.toLowerCase() === word.toLowerCase(),
      )?.[1];
    if (!m || !hit) {
      run += piece;
      continue;
    }
    run += m[1] ?? '';
    if (run.trim()) parts.push({ text: run });
    run = '';
    parts.push(hit.ipa ? { ipa: hit.ipa, text: hit.say } : { text: hit.say });
    run += m[3] ?? '';
  }
  if (run.trim()) parts.push({ text: run });
  return parts;
}

/** A stable short key the host accepts today (`/^[a-z0-9]{6,40}$/`): FNV-1a twice over the voice
 *  and the parts. F6 widens the regex and adds the engine version (audit #18). */
export function speechKey(voice: string, parts: readonly SpeechPart[]): string {
  const text = `${voice}|${JSON.stringify(parts)}`;
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x5bd1e995) >>> 0;
  }
  return `ti${a.toString(36)}${b.toString(36)}`;
}

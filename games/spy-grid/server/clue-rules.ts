// The clue rules (SPEC §9.8), shared by the server and the spymaster's phone so both judge a clue
// the same way while it is typed. Pure; the board words' roots come in as data (the phone gets
// them through the spymaster's view), so nothing here touches content.
import { isLegalClue, normalize } from './match';
import type { ClueReason } from './types';

export const CLUE_MAX = 20;

export interface ClueTarget {
  /** The board word, lowercase. */
  answer: string;
  family: readonly string[];
}

/** Why `word` cannot be sent against these face-down words, or null when it can. */
export function clueProblem(word: string, targets: readonly ClueTarget[]): ClueReason | null {
  const raw = word.trim();
  if (raw.length === 0 || /\s/.test(raw)) return 'one-word';
  if ([...raw].length > CLUE_MAX) return 'too-long';
  if (/\d/.test(raw)) return 'digits';
  if (normalize(raw, 'en').compact.length === 0) return 'one-word';
  for (const t of targets) {
    const r = isLegalClue(raw, t, { lang: 'en', oneWord: true, maxChars: CLUE_MAX });
    if (!r.ok) return r.reason === 'too-long' ? 'too-long' : 'board';
  }
  return null;
}

/** How a clue is shown and spoken: capitals, trimmed, inner punctuation kept ("T-REX"). */
export function clueDisplay(word: string): string {
  return word.trim().toUpperCase();
}

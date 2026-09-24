// Player-written text (town board posts, last words): one line, at most 80 characters, and
// something readable left (SPEC §10.11: text that normalises to nothing is refused).
import { TEXT_MAX } from './types';
import type { State } from './types';

/** Trimmed to one line of at most 80 characters; null when nothing readable is left. */
export function cleanText(text: string): string | null {
  const flat = text
    .replace(/[\p{Cc}\p{Cf}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cut = [...flat].slice(0, TEXT_MAX).join('').trim();
  return /[\p{L}\p{N}]/u.test(cut) ? cut : null;
}

/** Posts this player made today. */
export function postsToday(state: State, id: string): number {
  return state.board.filter((p) => p.day === state.day && p.by === id).length;
}

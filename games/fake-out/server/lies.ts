// The rules for lies (SPEC §3.7) and the one look every option shares (§3.5 "One look for every
// option"). The display form must make the truth and the lies indistinguishable: same case, no
// leading article, no trailing punctuation — spelling is left exactly as typed.
import { LIE_MAX_CHARS } from '../content/schema';
import { matchAnswer, normalize, sameAnswer } from '@partybox/game-sdk/match';
import type { FactItem, LieRejection } from './types';

/** Characters as a person counts them (code points, so an emoji is one). */
export function charCount(text: string): number {
  return [...text].length;
}

const ARTICLE = /^(a|an|the)\s+(?=\S)/i;
const TRAILING = /[\s.,!?;:…'"”’)]+$/u;

/** Trim, collapse spaces, drop one leading article, drop trailing punctuation, capitalise. Case is
 *  folded first: truths come from a lowercase pack, so a lie typed in CAPITALS must not stand out. */
export function displayForm(text: string): string {
  let t = text.trim().replace(/\s+/g, ' ').toLowerCase();
  const dropped = t.replace(ARTICLE, '');
  if (dropped.length > 0) t = dropped;
  const bare = t.replace(TRAILING, '');
  if (bare.length > 0) t = bare;
  const first = t.charAt(0);
  return first.toUpperCase() + t.slice(1);
}

/** True when `lie` is (or contains) the truth, by the two truth checks of §3.7 (F5 matcher,
 *  `fuzzy` or better). The containment check applies only to truths of 5+ letters, so "ant" never
 *  blocks "elephant". */
export function isTruth(lie: string, item: FactItem): boolean {
  const truth = { answer: item.truth.answer, accept: item.truth.accept, reject: item.truth.reject };
  if (matchAnswer(lie, truth, 'en') !== 'none') return true;
  const lieCompact = normalize(lie, 'en').compact;
  return [item.truth.answer, ...item.truth.accept].some((f) => {
    const c = normalize(f, 'en').compact;
    return c.length >= 5 && lieCompact !== c && lieCompact.includes(c);
  });
}

/** The §3.7 checks in order; null = accepted. (`sameAnswer` merges and padding matches are
 *  accepted silently — saying so would leak another player's lie.) */
export function checkLie(text: string, item: FactItem): LieRejection | null {
  const trimmed = text.trim();
  if (normalize(trimmed, 'en').compact.length === 0) return 'empty';
  if (charCount(trimmed) > LIE_MAX_CHARS) return 'too-long';
  if (isTruth(trimmed, item)) return 'truth';
  return null;
}

/** True when `candidate` is the same answer as any text in `taken`. */
export function matchesAny(candidate: string, taken: readonly string[]): boolean {
  return taken.some((t) => sameAnswer(candidate, t, 'en'));
}

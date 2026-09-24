// The rules for lies (SPEC §3.7) and the one look every option shares (§3.5 "One look for every
// option"). The display form must make the truth and the lies indistinguishable: same case, no
// leading article, no trailing punctuation — spelling is left exactly as typed.
import { LIE_MAX_CHARS } from '../content/schema';
import { atLeast, matchPrepared, normalize, prepare, prepareItem, samePrepared } from './match';
import type { Prepared, PreparedItem } from './match';
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

/** True when a prepared lie is (or contains) the prepared truth, by the two truth checks of §3.7.
 *  The containment check applies only to truths of 5+ letters, so "ant" never blocks "elephant". */
export function isTruthPrepared(lie: Prepared, truth: PreparedItem): boolean {
  if (atLeast(matchPrepared(lie, truth), 'fuzzy')) return true;
  return truth.forms.some(
    (f) => f.compact.length >= 5 && lie.compact !== f.compact && lie.compact.includes(f.compact),
  );
}

export function isTruth(lie: string, item: FactItem): boolean {
  return isTruthPrepared(prepare(lie), prepareItem(item.truth));
}

/** The §3.7 checks in order; null = accepted. (`sameAnswer` merges and padding matches are
 *  accepted silently — saying so would leak another player's lie.) */
export function checkLie(text: string, item: FactItem): LieRejection | null {
  const trimmed = text.trim();
  if (normalize(trimmed).compact.length === 0) return 'empty';
  if (charCount(trimmed) > LIE_MAX_CHARS) return 'too-long';
  if (isTruth(trimmed, item)) return 'truth';
  return null;
}

/** True when `candidate` is the same answer as any prepared text in `taken`. */
export function matchesAny(candidate: Prepared, taken: readonly Prepared[]): boolean {
  return taken.some((t) => samePrepared(candidate, t));
}

// The clue rules (spec §5.8). The server checks every clue and the psychic's phone runs the same
// check as they type; the psychic already knows the labels, so the messages leak nothing. Pure and
// content-free, so the phone chunk can import it.
import { normalize, stem } from '@partybox/game-sdk/match';

export const CLUE_MAX_CHARS = 30;

export type ClueReason = 'empty' | 'too-long' | 'number' | 'label-word' | 'position-word';
export type ClueCheck = { ok: true; text: string } | { ok: false; reason: ClueReason };

/** What the player sees for each reason (English keys; the client translates them). */
export const CLUE_MESSAGES: Record<ClueReason, string> = {
  empty: 'Type a clue.',
  'too-long': 'Keep it under 30 characters.',
  number: 'No numbers. Describe it instead.',
  'label-word': "Don't use the dial's own words.",
  'position-word': 'Describe a thing, not a spot on the dial.',
};

const POSITION_WORDS = [
  'left',
  'right',
  'middle',
  'center',
  'centre',
  'halfway',
  'midpoint',
  'percent',
  'scale',
  'spectrum',
  'dial',
];
const POSITION_STEMS = new Set(POSITION_WORDS.map((w) => stem(w, 'en')));
/** Number words past ninety-nine: the rule is "no numbers", and "a million bucks" is one. */
const BIG_NUMBERS = new Set([
  'hundred',
  'hundreds',
  'thousand',
  'thousands',
  'million',
  'millions',
  'billion',
  'billions',
  'trillion',
  'trillions',
  'dozen',
  'dozens',
]);
/** Label words too plain to be "the dial's own words" (NOTES.md): "Easy to love" bans love, not to. */
const LABEL_STOP = new Set(['the', 'and', 'for', 'with', 'you', 'your', 'not', 'are', 'from']);
/** The same for the Spanish ends ("Cosa de niños" bans niños, not de). */
const LABEL_STOP_ES = new Set([
  'con',
  'para',
  'sin',
  'que',
  'muy',
  'del',
  'una',
  'los',
  'las',
  'por',
]);
const SUFFIXES = ['er', 'est', 'ly', 'ness', 'ish', 'ing', 'ed', 'y', 'ier', 'iest', 'ily'];

/** Every inflection of a label word the rule bans: stem-equal words plus hot → hotter/hottest,
 *  nice → nicer, happy → happier (whole words only, so "hotdog" stays legal). */
function labelForms(word: string): Set<string> {
  const forms = new Set<string>([word]);
  const last = word.slice(-1);
  for (const suffix of SUFFIXES) {
    forms.add(word + suffix);
    forms.add(word + last + suffix);
    if (last === 'e') forms.add(word.slice(0, -1) + suffix);
    if (last === 'y') forms.add(`${word.slice(0, -1)}i${suffix}`);
  }
  return forms;
}

export interface LabelIndex {
  stems: Set<string>;
  forms: Set<string>;
}

/** The normalized words of a phrase (the shared matcher; the clue bank is English). */
function wordsOf(text: string, lang: 'en' | 'es' = 'en'): string[] {
  const { norm } = normalize(text, lang);
  return norm === '' ? [] : norm.split(' ');
}

/** The banned words of a spectrum's two labels (3+ letters, whole words). */
export function labelIndex(left: string, right: string): LabelIndex {
  const stems = new Set<string>();
  const forms = new Set<string>();
  for (const word of [...wordsOf(left), ...wordsOf(right)]) {
    if (word.length < 3 || LABEL_STOP.has(word)) continue;
    stems.add(stem(word, 'en'));
    for (const form of labelForms(word)) forms.add(form);
  }
  return { stems, forms };
}

/** The Spanish ends' banned stems (3+ letters, whole words, accents folded). */
function spanishStems(es: { left: string; right: string }): Set<string> {
  const stems = new Set<string>();
  for (const word of [...wordsOf(es.left, 'es'), ...wordsOf(es.right, 'es')])
    if (word.length >= 3 && !LABEL_STOP_ES.has(word)) stems.add(stem(word, 'es'));
  return stems;
}

/** Spec §5.8, in the table's order; the first failing rule is the one the player sees. `es`: the
 *  dial's Spanish ends, whose words are banned too. */
export function checkClue(
  text: string,
  left: string,
  right: string,
  es?: { left: string; right: string },
): ClueCheck {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  const words = wordsOf(trimmed);
  if (words.length === 0) return { ok: false, reason: 'empty' };
  if ([...trimmed].length > CLUE_MAX_CHARS) return { ok: false, reason: 'too-long' };
  if (words.some((w) => /\d/.test(w) || BIG_NUMBERS.has(w))) return { ok: false, reason: 'number' };
  const labels = labelIndex(left, right);
  if (words.some((w) => labels.forms.has(w) || labels.stems.has(stem(w, 'en'))))
    return { ok: false, reason: 'label-word' };
  if (es) {
    const banned = spanishStems(es);
    if (wordsOf(trimmed, 'es').some((w) => banned.has(stem(w, 'es'))))
      return { ok: false, reason: 'label-word' };
  }
  if (words.some((w) => POSITION_STEMS.has(stem(w, 'en'))))
    return { ok: false, reason: 'position-word' };
  return { ok: true, text: trimmed };
}

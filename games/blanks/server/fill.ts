// I-752 B: the card-filling text (a black card with its answers in the blanks), with no deck
// import, so the phones can render it without downloading every card of every deck.
import { BLANK, blanksIn } from '../content/blank';

export interface Segment {
  kind: 'text' | 'fill';
  text: string;
}

/**
 * The black card's text with the white cards dropped into its blanks, in order. A white card
 * loses its trailing period inside a sentence and keeps it (or its ! / ?) at the very end.
 * Blanks beyond the whites played stay as blanks; whites beyond the blanks (a question card, a
 * "make a haiku") come back in `extra` for the caller to list underneath.
 */
/** The black text right before a blank ends in an article or a possessive — "a happy little ____",
 *  '"no ____"', a hashtag "#____" — so the white card's own article would double up. */
const LEADS_WITH_ARTICLE =
  /(?:\b(?:a|an|the|my|your|his|her|their|our|little|new|sexy|favou?rite|no)\s*|#)$/i;
/**
 * I-150 A: a white card is written as its own sentence, so it opens with a capital. Dropped into
 * the middle of a black card's sentence that capital is a seam ("to Naming a goldfish", "was
 * about A whoopee cushion"). Only a first word this list recognises comes down — a gerund, or one
 * of the everyday openers — so a proper noun ("Stalin's", "Epstein"), an acronym ("FBI"), "I" and
 * anything unrecognised keep the capital they were written with.
 */
const COMMON_OPENER =
  /^(?:A|An|The|My|Your|Our|His|Her|Their|Its|That|This|These|Those|Some|Any|Every|All|No|Not|Never|Just|Too|One|Two|Three|Being|Getting|Having|Doing|Going|Trying|Making|Taking|Telling|Naming|Finding|Watching|Eating|Drinking|Crying|Dying|Waiting|Asking|Putting|Leaving|Losing|Winning|Playing|Reading|Running|Sitting|Standing|Screaming|Whispering|Accidentally|Secretly|Slowly|Quietly|Finally|Somehow|Whatever|Whoever|When|What|Why|How|Where|Whether)\b/;
/** A gerund that is not a name: "Naming", "Crashing" — but not "Kingdom" (no -ing ending). */
const GERUND = /^[A-Z][a-z]+ing\b/;

/** I-150 A: the card's first letter, lowered when the sentence is already under way. */
function lowerOpening(body: string): string {
  // Look past an opening quote or bracket the card carries of its own.
  const lead = /^["“'‘(\[]+/.exec(body)?.[0] ?? '';
  const word = body.slice(lead.length);
  if (!/^[A-Z]/.test(word)) return body;
  if (/^[A-Z]{2}/.test(word)) return body; // FBI, NASA
  if (/^I\b|^I'/.test(word)) return body; // the pronoun
  if (!COMMON_OPENER.test(word) && !GERUND.test(word)) return body;
  return `${lead}${word.charAt(0).toLowerCase()}${word.slice(1)}`;
}

/** A card that ends in an abbreviation, not in a sentence's full stop: "2 a.m.", "O.J.", "Jr.". */
const ABBREVIATION = /(?:\b[A-Za-z]\.){2}$|\b(?:Jr|Sr|St|Dr|Mr|Mrs|Ms|Inc|Ltd|vs|etc)\.$/;

export function fill(
  text: string,
  whites: readonly string[],
): { segments: Segment[]; extra: string[] } {
  const parts = text.split(BLANK);
  const segments: Segment[] = [];
  // Punctuation right after a blank is carried inside the fill ("Walmart." on one paper card,
  // never "Walmart ." with a gap); `carried` is what the next text part must drop.
  let carried = 0;
  parts.forEach((part, i) => {
    const own = part.slice(carried);
    carried = 0;
    if (own) segments.push({ kind: 'text', text: own });
    if (i === parts.length - 1) return;
    const white = whites[i];
    if (white === undefined) {
      segments.push({ kind: 'text', text: BLANK });
      return;
    }
    // Anything after the blank (a comma, the black card's own full stop) supplies the punctuation.
    const rest = parts.slice(i + 1).join('');
    const atEnd = rest.trim() === '';
    const nextPart = parts[i + 1] ?? '';
    // Closing quotes and brackets ride along too ('"Goodnight, ____."' ends inside the paper), but
    // never a letter's apostrophe: "____'s" keeps its 's in the black text (review-loop #101).
    const punctuation = /^[.,!?;:"”’')\]]+(?![A-Za-z])/.exec(nextPart)?.[0] ?? '';
    carried = punctuation.length;
    // "Dancing in the kitchen at 2 a.m." keeps the abbreviation's own period mid-sentence — it
    // came out as "2 a.m," before (review-loop #201) — but gives it up when the black card supplies
    // a full stop of its own, which would read "2 a.m..".
    const keepDot = ABBREVIATION.test(white) && !punctuation.startsWith('.');
    // An opening quote or bracket immediately before the blank joins the card too, so a quoted
    // answer reads as one piece of paper: `says "____."` becomes `says` + `"The moist part of the
    // sandwich."`, not an orphan quote against the black text (review-loop #330).
    const opener = /(?:^|[\s(])(["“'‘(\[])$/.exec(lastText(segments))?.[1] ?? '';
    if (opener) trimLastText(segments, opener.length);
    // I-150 B: a quoted card inside a quotation used to close twice ('""I'm walkin' here!""',
    // '"Most likely to Naming a goldfish "Doug.""'). Whether the quote opens right before the blank
    // or earlier in the sentence, the card's own double quotes step down to single ones, so the
    // line opens and closes exactly once. The black card's own text decides (never a white's).
    const blackBefore = parts.slice(0, i + 1).join(BLANK);
    const straightQuotes = (blackBefore.match(/"/g) ?? []).length;
    const curlyOpen =
      (blackBefore.match(/“/g) ?? []).length - (blackBefore.match(/”/g) ?? []).length;
    const nested = straightQuotes % 2 === 1 || curlyOpen > 0;
    // A card that ends inside its own quotes — 'Naming a goldfish "Doug."' — carries its full stop
    // on the inside: mid-sentence the dot goes the way a bare one does ('"Doug" is my motto.'), and
    // at the end the black card's own full stop is dropped rather than doubled — the card of the
    // night read '…meaning "soup.".' on a results screen (review-loop #391).
    const closed = /\.["”'’)\]]+$/.test(white);
    // A card that ends on a question or exclamation — 'The one relative who comments "who is
    // this?"' — has ended the sentence itself, so the black card's full stop is dropped rather
    // than stacked after the quote ('…who is this?".' — the fill sweep of loop #680).
    const asked = /[?!]["”'’)\]]*$/.test(white);
    const ownStop = (closed || asked) && punctuation.startsWith('.');
    const tail = ownStop ? punctuation.slice(1) : punctuation;
    let body =
      atEnd || keepDot || ownStop
        ? white
        : closed
          ? white.replace(/\.(["”'’)\]]+)$/, '$1')
          : white.replace(/\.$/, '');
    // The black card already put an article or a possessive before the blank ("a happy little
    // ____", "my ____", '"The ____ Murders"'): the white card's own leading article goes, so the
    // room hears "a happy little dentist who keeps the teeth", not "a happy little A dentist".
    // (The next word stays as the card has it: "dentist", or "Epstein".)
    if (
      LEADS_WITH_ARTICLE.test(lastText(segments)) &&
      /^(?:A|An|The|My|Your|Our) [a-zA-Z]/.test(body)
    )
      body = body.replace(/^(?:A|An|The|My|Your|Our) /, '');
    // I-150 A: the sentence is already under way unless the blank opens it, follows a full stop,
    // follows a colon ("Coming soon: A windmill." — the house style the fill tests pin), or opens
    // a quotation of its own ('says "A raccoon…"'): there the card's own capital is the right one.
    // This runs AFTER the article rule above, which matches on the card's own capital ("A dentist").
    if (nested) body = body.replace(/"/g, "'").replace(/“/g, '‘').replace(/”/g, '’');
    const before = lastText(segments);
    if (!opener && before.trim() !== '' && !/[.!?:]["”'’)\]]*\s*$/.test(before))
      body = lowerOpening(body);
    segments.push({ kind: 'fill', text: opener + body + tail });
  });
  return { segments, extra: whites.slice(blanksIn(text)) };
}

/** The text of the segment a fill is about to follow (empty when the blank opens the card). */
function lastText(segments: readonly Segment[]): string {
  const last = segments[segments.length - 1];
  return last?.kind === 'text' ? last.text : '';
}

/** Drops `n` characters from the end of the last text segment, removing it when nothing is left. */
function trimLastText(segments: Segment[], n: number): void {
  const last = segments[segments.length - 1];
  if (!last || last.kind !== 'text') return;
  const text = last.text.slice(0, -n);
  if (text === '') segments.pop();
  else segments[segments.length - 1] = { ...last, text };
}

/** A white card's short first word ("A", "The", "My") stays on the line with its next word: a
 *  lone "A" in a paper mark at the end of a line read as its own card (review-loop #115).
 *  Rendering only: `fillText` (labels, tests) keeps plain spaces. */
export function glue(white: string): string {
  return white.replace(/^(\S{1,3}) (?=\S)/, '$1\u00A0');
}

/** The filled sentence as plain text (a11y labels, tests, bots). */
export function fillText(text: string, whites: readonly string[]): string {
  const { segments, extra } = fill(text, whites);
  const line = segments.map((s) => s.text).join('');
  return extra.length > 0 ? `${line} ${extra.join(' / ')}` : line;
}

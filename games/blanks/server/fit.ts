// How a white card fits a black card (owner, 2026-09-18: "some answer cards only make sense with
// some question cards"). A black card asks for one SLOT — a thing (most of them), something
// someone did (`doing`: "What did the sex robot refuse to do?"), or a person (`person`: "Who…?",
// "…goes to ____") — read off its text, or set on the card (`slot` in the deck JSON). A white card
// SERVES a slot: a gerund card is a `doing`, a card about someone ("A therapist who takes notes
// with a shudder.") a `person`, the rest `thing`s — and FIT says how each reads in the others'
// blanks (a person is a fine thing; a thing is a poor doing).
// `fitScore` is the soft match dealing, bots and the fit report share; `tier` (1 filler, 2 good,
// 3 great — set on the card, default 2) is how good the card is on its own.
import type { BlackCard, WhiteCard } from '../content/schema';

export const SLOTS = ['thing', 'doing', 'person'] as const;
export type Slot = (typeof SLOTS)[number];

/** Prompts whose blank wants an action or an event. */
const DOING_PROMPT = [
  /\b(?:do|doing|done)\?["”]?$/i, // "What did the sex robot refuse to do?"
  /\bdo (?:at|in|on|to|with|for|instead|before|after|during)\b/i, // "What did Lincoln do at…"
  /\b(?:does|did|caught (?:me|him|her|them|us)|busy|instead of|after|before|while|spent (?:the \w+|\w+ years?))\s+____/i,
  /\b(?:what happened|what went wrong|walk(?:ed)? in on\?|catch \w+ doing|am I doing|are you doing|^how did)\b/i,
  /\b(?:ruined|interrupted|cancelled|canceled|delayed|caused|started|ended|followed|triggered|brought on) by ____/i,
  /\b(?:led to|ended (?:with|in)|started with|began with) ____/i,
];
/** "Renamed itself after ____", "modeled after ____": a thing, not an event after which. */
const NAMED_AFTER = /\b(?:named|renamed|modeled|modelled|patterned|fashioned)\b[^.]*after ____/i;
/** Prompts whose blank wants a person. */
const PERSON_PROMPT = [
  /^Who(?:'s|se)?\b/i,
  /\bwho\b[^.?]*\?$/i,
  /\b(?:goes to|went to|awarded to|belongs to|married|marry|dating|date with|hired|fired|elected|best man|maid of honor|godfather|babysitter|sponsored by|hosted by|played by|voiced by|replaced by|starring|cast as|roommate|in bed with|woke up next to|wake up next to|lying next to|virginity to|a threesome with|threesome with|swiped right on|matched with|proposed to|engaged to)\s+____/i,
  /\bmy (?:new )?(?:boyfriend|girlfriend|husband|wife|partner|therapist|doctor|lawyer|dealer|roommate|sponsor) is ____/i,
  /____ (?:walks|walked|is|was|got|gets) (?:into|in|arrested|elected|fired|hired|pregnant)/i,
];

/** The slot a black card's blank wants; the card's own `slot` wins over the reading. */
export function slotOf(card: Pick<BlackCard, 'text'> & { slot?: Slot }): Slot {
  if (card.slot) return card.slot;
  const t = card.text;
  if (PERSON_PROMPT.some((re) => re.test(t))) return 'person';
  if (!NAMED_AFTER.test(t) && DOING_PROMPT.some((re) => re.test(t))) return 'doing';
  return 'thing';
}

const NOT_GERUND =
  /^(thing|something|nothing|everything|anything|ring|king|wing|string|spring|bling|morning|evening|wedding|building|feeling|ceiling|pudding|stocking|clothing|sibling|darling|during)$/i;
const ADVERB =
  /^(not|quietly|slowly|loudly|secretly|aggressively|extremely|slightly|accidentally|finally|casually|barely|openly|silently|gently|violently|briefly|nearly|almost|never|always|just|still|only|really|very|too|softly|angrily|politely|deliberately|repeatedly|calmly|suddenly|passive)$/i;
const PERSON_WORD =
  /\b(?:man|woman|guy|girl|boy|kid|child|baby|mom|mother|dad|father|grandma|grandpa|grandmother|grandfather|uncle|aunt|cousin|nephew|niece|son|daughter|brother|sister|wife|husband|boyfriend|girlfriend|ex|priest|pastor|nun|rabbi|doctor|nurse|dentist|therapist|lawyer|cop|officer|teacher|coach|principal|boss|coworker|neighbor|roommate|stranger|clown|stripper|hooker|escort|dominatrix|plumber|mailman|pilot|senator|president|king|queen|prince|princess|pope|santa|jesus|god|satan|devil|ghost|robot|celebrity|star|actor|singer|rapper|influencer|streamer|twin|toddler|teen|teenager|virgin|widow|orphan|intern|barista|waiter|waitress|bartender|babysitter|landlord|dealer|pimp|nurse|surgeon|proctologist|gynecologist|monk|bishop|cardinal|soldier|marine|veteran|cowboy|farmer|trucker|biker|hitler|putin|trump|biden|obama|epstein|musk|kanye|oprah|beyonc[eé]|drake|bieber|swift|cage|keanu)s?\b/i;
/** A relative clause is about someone: "A masseuse who goes too far.", "MySpace Tom, who saw everything." */
const WHO_CLAUSE = /\bwho\b/i;
/** What may follow the person word for it to be the head of the phrase. */
const LINK_AFTER =
  /^(?:with|who|whose|that|named|called|at|in|on|from|and|of|for|without|under|behind|during|after|before|as|to|dressed|covered|wearing|holding|doing|having|being|selling|giving|getting|taking)$/i;

/** The slots a white card serves; the card's own `serves` wins over the reading. */
export function servesOf(card: Pick<WhiteCard, 'text'> & { serves?: Slot[] }): Slot[] {
  if (card.serves && card.serves.length > 0) return card.serves;
  const words = card.text.replace(/[^A-Za-z' ]/g, '').split(/\s+/);
  const gerund = (w: string | undefined): boolean =>
    w !== undefined && /ing$/i.test(w) && !NOT_GERUND.test(w);
  if (gerund(words[0]) || (ADVERB.test(words[0] ?? '') && gerund(words[1]))) return ['doing'];
  // The head noun: "A nun with a strap-on." is a nun; "Grandma's corpse in the recliner." is a
  // corpse (a possessive head names the owner, not the card); "A clown car full of dildos." is a
  // car (the person word must end the noun phrase: a link word, a comma or the full stop after it).
  const rest = card.text.replace(/^(?:A |An |The |My |Your |Our )/, '');
  const [head = '', after = ''] = rest.split(/[ ,.]/);
  const possessive = /['’]s$|s['’]$/.test(head);
  const ends = after === '' || LINK_AFTER.test(after);
  const person = (!possessive && ends && PERSON_WORD.test(head)) || WHO_CLAUSE.test(card.text);
  return person ? ['person'] : ['thing'];
}

/** How well a card of each served slot reads in a blank of each wanted slot (0–1). */
const FIT: Readonly<Record<Slot, Readonly<Record<Slot, number>>>> = {
  thing: { thing: 1, doing: 0.7, person: 0.85 },
  doing: { thing: 0.3, doing: 1, person: 0.25 },
  person: { thing: 0.5, doing: 0.3, person: 1 },
};

/** 0–1: the best reading the white card offers the black card's slot. */
export function fitScore(slot: Slot, serves: readonly Slot[]): number {
  return Math.max(0, ...serves.map((s) => FIT[slot][s] ?? 0));
}

/** True when the card is a natural answer for the slot (its best reading, not a stretch). */
export function servesSlot(slot: Slot, serves: readonly Slot[]): boolean {
  return serves.includes(slot);
}

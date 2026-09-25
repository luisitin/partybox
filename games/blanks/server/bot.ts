// The bot's taste (owner, 2026-09-18: "bots significantly better at picking funny / fitting
// cards"). A bot answers with the cards that read best in the round's blank — the fit model's
// score for the prompt's slot, the card's tier on top, and a little noise so two bots with the
// same hand do not always agree — and votes for the submission that reads best by the same
// yardstick. A Pick 2 / Pick 3 takes the best cards in hand order of fit; the czar picks the
// best-rated prompt on offer (ties at random).
import type { Rng } from '@partybox/game-sdk';
import {
  blackCard,
  blackSlots,
  blackTier,
  deckSubject,
  whiteServes,
  whiteTags,
  whiteText,
  whiteTier,
} from './content';
import { fitScore } from './fit';
import type { Slot } from './fit';
import { pairBonus, punch, topicsOf } from './topics';
import type { Topic } from './topics';
import { canVote, hasPlayed, isCzar, sitsOut } from './round';
import { RANDO } from './types';
import type { Input, State } from './types';

/** How much a tier step is worth against the fit: a great gerund in a thing blank (0.7 + 0.25)
 *  nearly matches a fair thing (1.0), never a thing in a doing blank (0.3). */
const TIER_WEIGHT = 0.2;
/** Random spread on every score: bots are not one mind. */
const NOISE = 0.2;
/** What a Pick 2's second card loses for repeating the first one's subject. */
const SAME_SUBJECT = 0.1;
/** I-445: what a person's card is worth over a bot's in a bot's vote, so a room of bots is not a
 *  jury that only likes its own taste. Tuned by simulation (capture/sim_I445.ts, 400 games a room):
 *  a full fit step (0.3) made a random person's card win 35–45 % against a fair share of 20–33 %;
 *  0.2 with B's own tastes lands on the fair share (32/33, 20/20, 33/33, 22/20 %). */
const PERSON_BONUS = 0.2;
/** I-445 B: each bot's own lean on each card, fixed for the game: bots are not one mind. */
const TASTE = 0.2;

/** I-445 B: a lean in [-TASTE, TASTE] from the bot and the cards (FNV-1a), the same every time. */
function taste(botId: string, cards: readonly string[]): number {
  let h = 0x811c9dc5;
  for (const ch of `${botId}|${cards.join(',')}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ((h % 2001) / 1000 - 1) * TASTE;
}

/** One card's appeal in the blank: fit for the slot, plus its tier, plus the pair's topic nudge
 *  (topics.ts: on the prompt's subject from another angle is a hit, echoing its word a shrug),
 *  plus the card's own punch (a twist after a comma, a specific; long cards read slower), plus
 *  noise. */
export function cardAppeal(slot: Slot, id: string, rng: Rng, blackText = ''): number {
  const text = whiteText(id);
  const fit = fitScore(slot, whiteServes(id), text, blackText || undefined);
  // The tier counts in proportion to the fit: an amazing card that does not fit the blank is
  // not amazing there (a six-word safe word, a thing where a doing is wanted).
  return (
    fit +
    TIER_WEIGHT * (whiteTier(id) - 2) * fit +
    (blackText ? pairBonus(blackText, text, whiteTags(id)) : 0) +
    punch(text) +
    (slot === 'name' ? shortness(text) : 0) +
    NOISE * rng.float()
  );
}

/** A name blank — a safe word, a nickname, last words — lands hardest on the shortest card
 *  ("Smegma." as a safe word beats a four-word one): up to +0.09 for one word, nothing at four. */
function shortness(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(0, 4 - words) * 0.03;
}

/** The cards of `hand` that read best blank by blank (one slot per blank, in blank order): each
 *  blank takes the best card left for what it wants. */
export function bestCards(
  slots: readonly Slot[],
  hand: readonly string[],
  rng: Rng,
  blackText = '',
  subject: Topic = 'sex',
): string[] {
  const left = [...hand];
  const out: string[] = [];
  for (const slot of slots) {
    // The second card of a Pick 2 steps off the first one's subject (the deck's own aside): two
    // church cards in "____ and ____" read as one joke told twice.
    const taken = new Set<Topic>(
      out.flatMap((id) => topicsOf(whiteText(id))).filter((t) => t !== subject),
    );
    const best = left
      .map((id) => ({
        id,
        score:
          cardAppeal(slot, id, rng, blackText) -
          (topicsOf(whiteText(id)).some((t) => taken.has(t)) ? SAME_SUBJECT : 0),
      }))
      .sort((a, b) => b.score - a.score)[0];
    if (best === undefined) break;
    out.push(best.id);
    left.splice(left.indexOf(best.id), 1);
  }
  return out;
}

/** A submission's appeal: the mean of its cards', each in its own blank. */
function submissionAppeal(
  slots: readonly Slot[],
  cards: readonly string[],
  rng: Rng,
  blackText: string,
): number {
  if (cards.length === 0) return 0;
  return (
    cards.reduce(
      (sum, id, i) => sum + cardAppeal(slots[i] ?? slots[0] ?? 'thing', id, rng, blackText),
      0,
    ) / cards.length
  );
}

export function botInput(state: State, playerId: string, rng: Rng): Input | null {
  if (!Object.hasOwn(state.players, playerId)) return null;
  if (state.phase.id === 'pick') {
    if (!isCzar(state, playerId) || state.blackChoices.length < 2) return null;
    if (state.blackId !== null) return null; // already chosen; the beat is running
    // The best-rated prompt on offer, ties at random: a judge who reads the room, not the deck.
    const top = Math.max(...state.blackChoices.map(blackTier));
    const best = state.blackChoices
      .map((id, i) => ({ id, i }))
      .filter((c) => blackTier(c.id) === top);
    return { type: 'choose', index: (rng.pick(best) ?? { i: 0 }).i };
  }
  if (state.phase.id === 'answer') {
    if (isCzar(state, playerId) || hasPlayed(state, playerId)) return null;
    if (sitsOut(state, playerId)) return null; // I-147 A: a bot outside the tie waits to vote
    const { pick } = blackCard(state.blackId);
    const hand = state.hands[playerId] ?? [];
    if (hand.length < pick) return null;
    const cards = bestCards(
      blackSlots(state.blackId),
      hand,
      rng,
      blackCard(state.blackId).text,
      deckSubject(state.settings.decks),
    );
    return cards.length === pick ? { type: 'play', cards } : null;
  }
  // Bots never tap Next: an untimed result stays up for the humans (the hidden fallback ends it).
  if (state.phase.id === 'judge') {
    if (Object.hasOwn(state.votes, playerId)) return null;
    const slots = blackSlots(state.blackId);
    const open = state.slots
      .map((who, index) => ({ index, cards: state.submissions[who] ?? [] }))
      .filter((s) => canVote(state, playerId, s.index));
    if (open.length === 0) return null;
    const best = open
      .map((s) => {
        // I-445 A: a person's card (not a bot's, not Rando's) counts up by one fit step
        const who = state.slots[s.index] ?? '';
        const person =
          who !== RANDO && state.players[who] !== undefined && !state.players[who]?.bot;
        return {
          index: s.index,
          score:
            submissionAppeal(slots, s.cards, rng, blackCard(state.blackId).text) +
            (person ? PERSON_BONUS : 0) +
            taste(playerId, s.cards), // I-445 B: this bot's own lean
        };
      })
      .sort((a, b) => b.score - a.score)[0];
    return best ? { type: 'vote', slot: best.index } : null;
  }
  return null;
}

// The bot's taste (owner, 2026-09-18: "bots significantly better at picking funny / fitting
// cards"). A bot answers with the cards that read best in the round's blank — the fit model's
// score for the prompt's slot, the card's tier on top, and a little noise so two bots with the
// same hand do not always agree — and votes for the submission that reads best by the same
// yardstick. A Pick 2 / Pick 3 takes the best cards in hand order of fit; the czar still picks a
// prompt at random (no hand to judge it against).
import type { Rng } from '@partybox/game-sdk';
import { blackCard, blackSlot, whiteServes, whiteTier } from './content';
import { fitScore } from './fit';
import type { Slot } from './fit';
import { canVote, hasPlayed, isCzar } from './round';
import type { Input, State } from './types';

/** How much a tier step is worth against the fit (a great card in a fair blank beats a fair card
 *  in a perfect one, just). */
const TIER_WEIGHT = 0.35;
/** Random spread on every score: bots are not one mind. */
const NOISE = 0.2;

/** One card's appeal in the blank: fit for the slot, plus its tier, plus noise. */
export function cardAppeal(slot: Slot, id: string, rng: Rng): number {
  return fitScore(slot, whiteServes(id)) + TIER_WEIGHT * (whiteTier(id) - 2) + NOISE * rng.float();
}

/** The `count` cards of `hand` that read best in the blank, best first. */
export function bestCards(slot: Slot, hand: readonly string[], count: number, rng: Rng): string[] {
  return hand
    .map((id) => ({ id, score: cardAppeal(slot, id, rng) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((c) => c.id);
}

/** A submission's appeal: the mean of its cards'. */
function submissionAppeal(slot: Slot, cards: readonly string[], rng: Rng): number {
  if (cards.length === 0) return 0;
  return cards.reduce((sum, id) => sum + cardAppeal(slot, id, rng), 0) / cards.length;
}

export function botInput(state: State, playerId: string, rng: Rng): Input | null {
  if (!Object.hasOwn(state.players, playerId)) return null;
  if (state.phase.id === 'pick') {
    if (!isCzar(state, playerId) || state.blackChoices.length < 2) return null;
    if (state.blackId !== null) return null; // already chosen; the beat is running
    return { type: 'choose', index: rng.int(0, state.blackChoices.length - 1) };
  }
  if (state.phase.id === 'answer') {
    if (isCzar(state, playerId) || hasPlayed(state, playerId)) return null;
    const { pick } = blackCard(state.blackId);
    const hand = state.hands[playerId] ?? [];
    if (hand.length < pick) return null;
    return { type: 'play', cards: bestCards(blackSlot(state.blackId), hand, pick, rng) };
  }
  // Bots never tap Next: an untimed result stays up for the humans (the hidden fallback ends it).
  if (state.phase.id === 'judge') {
    if (Object.hasOwn(state.votes, playerId)) return null;
    const slot = blackSlot(state.blackId);
    const open = state.slots
      .map((who, index) => ({ index, cards: state.submissions[who] ?? [] }))
      .filter((s) => canVote(state, playerId, s.index));
    if (open.length === 0) return null;
    const best = open
      .map((s) => ({ index: s.index, score: submissionAppeal(slot, s.cards, rng) }))
      .sort((a, b) => b.score - a.score)[0];
    return best ? { type: 'vote', slot: best.index } : null;
  }
  return null;
}

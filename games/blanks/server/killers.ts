// The owner (2026-09-22): "audit the cards' ratings and combos that people get … we want kickers like
// 'What was Hitler's favorite drink?' and 'Juice.'" A white card's `tags` name the prompts it is the
// killer answer for — hand-picked, and in the 2026-09-22 audit each verified by two independent
// readers — but a combo only happens if the card is in somebody's hand, and with ~2,800 whites that
// was luck. So when the round's prompt names a card that is still in the deck (or the discard), one
// answerer, picked by the rng, is dealt it: traded for their weakest spare under every kind floor
// (deal.ts `swapForGood`, the same trade the fit floor makes). One per round; none when an answerer
// already holds one. The player still has to see it and play it — that is the laugh.
import { nextInt } from '@partybox/game-sdk';
import { blackCard, whiteTags } from './content';
import { swapForGood } from './deal';
import { tagHit } from './topics';
import type { State } from './types';

export function dealKiller(state: State, answerers: readonly string[]): State {
  if (state.blackId === null || answerers.length === 0) return state;
  const black = blackCard(state.blackId).text;
  const killer = (id: string): boolean => tagHit(black, whiteTags(id));
  if (answerers.some((p) => (state.hands[p] ?? []).some(killer))) return state;
  if (!state.whiteDeck.some(killer) && !state.discard.some(killer)) return state;
  const [start, rng] = nextInt(state.rng, 0, answerers.length - 1);
  const next: State = { ...state, rng };
  // the rng's pick first; if their hand has no spare that keeps its floors, the next answerer
  for (let k = 0; k < answerers.length; k++) {
    const player = answerers[(start + k) % answerers.length] as string;
    const hand = next.hands[player];
    if (!hand) continue;
    const swapped = swapForGood(next, hand, killer, (id) => !killer(id));
    if (swapped === null) continue;
    const [newHand, after] = swapped;
    return { ...after, hands: { ...after.hands, [player]: newHand } };
  }
  return next;
}

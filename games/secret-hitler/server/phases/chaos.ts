// Phase "chaos" (R10): the tracker reached 3. The top policy is enacted (its power ignored), the
// tracker resets, every term limit clears, and the deck is topped up if it runs low (R13). A
// chaos policy can win the game.
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { enactOnBoard, go, headlined, patchHistory, withRound } from '../phase';
import { policyWinner, reshuffleIfLow } from '../rules';
import { REVEAL_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterChaos(state: State, now: number, after: 'fail' | 'veto'): State {
  const guarded = reshuffleIfLow(state);
  const card = guarded.deck[0] ?? 'F';
  let s = enactOnBoard({ ...guarded, deck: guarded.deck.slice(1) }, card);
  s = {
    ...s,
    chaosCount: s.chaosCount + 1,
    lastElected: { president: null, chancellor: null },
  };
  s = patchHistory(withRound(s, { chaosCard: card, chaosAfter: after }), { chaos: card });
  const won = policyWinner(s.board);
  if (won)
    s = {
      ...s,
      winner: won,
      winReason: won === 'liberals' ? 'liberalPolicies' : 'fascistPolicies',
    };
  s = headlined(s, won ? (won === 'liberals' ? 'liberalPolicies' : 'fascistPolicies') : 'chaos');
  return go(reshuffleIfLow(s), 'chaos', now, REVEAL_MS.chaos);
}

export function reduceChaos(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

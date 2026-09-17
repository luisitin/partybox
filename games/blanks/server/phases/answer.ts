// Phase "answer": every player but the judge plays `pick` white cards from their hand, in blank
// order. Exits when every connected answerer has played, on the deadline (answerSeconds + 15 s
// per extra card), or on VIP skip; whoever has not played sits the round out.
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { blackCard } from '../content';
import { hasPlayed, isCzar, playersDone } from '../round';
import { EXTRA_PICK_S } from '../types';
import type { Input, PlayInput, State } from '../types';
import type { Transition } from './intro';

export function answerMs(state: State): number {
  const { pick } = blackCard(state.blackId);
  return (state.settings.answerSeconds + EXTRA_PICK_S * (pick - 1)) * 1000;
}

export function enterAnswer(state: State, now: number): State {
  return enterPhase(state, 'answer', now, answerMs(state));
}

/** "Before half the answer time" is measured against the deadline so a pause does not cheat it. */
function isFast(state: State, now: number): boolean {
  const { deadline } = state.phase;
  return deadline !== null && now < deadline - answerMs(state) / 2;
}

function applyPlay(state: State, playerId: string, input: PlayInput, now: number): State {
  if (!hasPlayer(state, playerId) || isCzar(state, playerId) || hasPlayed(state, playerId))
    return state;
  const hand = state.hands[playerId] ?? [];
  const { pick } = blackCard(state.blackId);
  // Exactly the cards the black card asks for, all distinct, all from this hand.
  if (input.cards.length !== pick || new Set(input.cards).size !== pick) return state;
  if (!input.cards.every((id) => hand.includes(id))) return state;
  const fast = isFast(state, now) ? 1 : 0;
  return {
    ...state,
    hands: { ...state.hands, [playerId]: hand.filter((id) => !input.cards.includes(id)) },
    submissions: { ...state.submissions, [playerId]: [...input.cards] },
    stats: {
      ...state.stats,
      fastPlays: {
        ...state.stats.fastPlays,
        [playerId]: (state.stats.fastPlays[playerId] ?? 0) + fast,
      },
    },
  };
}

export function reduceAnswer(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (event.input.type !== 'play') return state;
    const after = applyPlay(state, event.playerId, event.input, event.now);
    if (after === state) return state;
    return allConnectedDone(after, playersDone(after)) ? next(after, event.now) : after;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}

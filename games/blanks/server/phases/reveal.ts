// Phase "reveal": the TV (and every phone) reads one submission at a time — the black card with
// the white cards dropped in — one phase instance per slot, timed to its length. Exits on each
// card's deadline; VIP skip jumps straight to the vote.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { flightMs, revealMs, revealSpan } from '../cards';
import { blackCard, whiteText } from '../content';
import type { Input, State } from '../types';
import type { Transition } from './intro';

/** I-157 C: the auto-advance when the reader does not tap "next". */
export const READER_FLOOR_MS = 6000;

/** Puts the flight starting at `state.slots[index]` on stage (one card in a small room — I-157). */
export function enterReveal(state: State, now: number, index: number): State {
  const span = revealSpan(state.slots.length);
  const each = state.slots.slice(index, index + span).map((submitter) => {
    const whites = state.submissions[submitter] ?? [];
    return revealMs(blackCard(state.blackId).text, whites.map(whiteText), state.slots.length);
  });
  // I-157 C: the reader's "next" paces the room; 6 s (or the flight's own time, if longer) only
  // catches a reader who forgets to tap.
  return enterPhase({ ...state, revealIndex: index }, 'reveal', now, Math.max(READER_FLOOR_MS, flightMs(each)));
}

export function reduceReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  // I-157 C: whoever is reading moves the room on the moment they have read the flight — the
  // seated reader in vote mode, the judge in czar mode. Nobody else can.
  if (event.type === 'input' && event.input.type === 'nextCard') {
    const reader = state.settings.judge === 'czar' ? state.czarId : state.readerId;
    if (reader !== null && reader === event.playerId) return next(state, event.now);
  }
  return state;
}

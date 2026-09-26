// Phase "guess": one answer on the TV, read aloud; every seated player except the author
// taps who they think wrote it; a resent guess replaces the first.
// Exits when every connected seated player has tapped (after a grace, and never before the answer
// has been read out), on the deadline, or on VIP skip.
import { allConnectedDone, enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { closeSoon, currentCard, guessedIds, isSeated, notSeated } from '../round';
import { cardReading, fixedLine, msOf } from '../speech';
import { LINE_GAP_MS, VOICE_LEAD_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterGuess(state: State, now: number, idx: number): State {
  const p = { ...state.p, idx, guesses: {}, step: 'land' as const, flip: null, points: {} };
  return enterPhase({ ...state, p }, 'guess', now, state.cfg.guessSeconds * 1000);
}

/** When the reader will have finished this card (the first card of a prompt opens with "Who said
 *  it?"): an all-done exit waits for it, so the reveal never talks over the reading. */
export function readingEndsAt(state: State): number {
  const start = state.phase.startedAt + VOICE_LEAD_MS;
  const who = state.p.idx === 0 ? msOf(state, fixedLine(state, 'who')) : undefined;
  const read = msOf(state, cardReading(state, currentCard(state)));
  const whoMs = who !== undefined && who > 0 ? who + LINE_GAP_MS : 0;
  return start + whoMs + (read !== undefined && read > 0 ? read : 0) + 300;
}

export function guessDone(state: State): boolean {
  // The owner's rule (2026-09-24): the author sits out their own card, so they count as done.
  const authors = currentCard(state)?.authors ?? [];
  return allConnectedDone(state, [...guessedIds(state), ...notSeated(state), ...authors]);
}

/** All tapped: close after the grace, or once the reading is over, whichever is later. */
export function closeGuess(state: State, now: number): State {
  const soon = closeSoon(state, now);
  const until = readingEndsAt(state);
  const { deadline } = soon.phase;
  if (deadline === null || deadline >= until || (state.phase.deadline ?? 0) <= until) return soon;
  return { ...soon, phase: { ...soon.phase, deadline: until } };
}

function apply(state: State, playerId: string, input: Input): State {
  if (input.type !== 'guess' || !isSeated(state, playerId)) return state;
  if (currentCard(state)?.authors.includes(playerId)) return state; // the author sits out
  const { target } = input;
  if (target === playerId || !isSeated(state, target)) return state;
  if (state.p.guesses[playerId] === target) return state;
  return { ...state, p: { ...state.p, guesses: { ...state.p.guesses, [playerId]: target } } };
}

export function reduceGuess(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    const after = apply(state, event.playerId, event.input);
    if (after === state) return state;
    return guessDone(after) ? closeGuess(after, event.now) : after;
  }
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

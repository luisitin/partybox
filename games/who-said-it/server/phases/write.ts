// Phase "write": everyone answers the prompt; a resent answer replaces the first (SPEC §4.8); 💡
// once per prompt. Exits when every connected seated player has answered (after a short grace so
// the last ✓ lands and a quick change still counts), on the deadline, or on VIP skip.
import { allConnectedDone, enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { answeredIds, closeSoon, isSeated, notSeated } from '../round';
import { ANSWER_KEEP_CHARS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterWrite(state: State, now: number): State {
  return enterPhase(state, 'write', now, state.cfg.writeSeconds * 1000);
}

/** Trimmed, whitespace runs collapsed, the first 60 characters kept; '' = not an answer. */
export function cleanAnswer(text: string): string {
  return [...text.replace(/\s+/g, ' ').trim()].slice(0, ANSWER_KEEP_CHARS).join('').trim();
}

export function writeDone(state: State): boolean {
  return allConnectedDone(state, [...answeredIds(state), ...notSeated(state)]);
}

function apply(state: State, playerId: string, input: Input): State {
  if (!isSeated(state, playerId)) return state;
  if (input.type === 'answer') {
    const text = cleanAnswer(input.text);
    if (text === '' || state.p.answers[playerId] === text) return state;
    return { ...state, p: { ...state.p, answers: { ...state.p.answers, [playerId]: text } } };
  }
  if (input.type === 'idea') {
    if (!state.cfg.ideas || state.p.ideaUsed.includes(playerId)) return state;
    return { ...state, p: { ...state.p, ideaUsed: [...state.p.ideaUsed, playerId] } };
  }
  return state;
}

export function reduceWrite(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    const after = apply(state, event.playerId, event.input);
    if (after === state) return state;
    return writeDone(after) ? closeSoon(after, event.now) : after;
  }
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

// Phase "answer": everyone picks a tile (or types) what they think most people will say. A resent
// answer replaces the earlier one until the phase ends. Exits on the deadline, a VIP skip, or a
// short beat after every connected player has answered (so the last ✓ lands before the reveal).
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { LANG, tilesFor } from '../content';
import { normalize } from '../match';
import { ALL_IN_MS, ANSWER_SECONDS, TYPED_MAX_CHARS } from '../types';
import type { Input, Question, State, Transition } from '../types';

export function freshQuestion(n: number): Question {
  return {
    n,
    tiles: null,
    answers: {},
    merges: [],
    groups: null,
    outcome: null,
    herd: null,
    lone: null,
    scored: [],
    sheepFrom: null,
  };
}

export function enterAnswer(state: State, now: number, n: number): State {
  const item = state.questions[n];
  let { rng } = state;
  let tiles: Question['tiles'] = null;
  if (item && state.cfg.mode === 'tiles') [tiles, rng] = tilesFor(rng, item);
  const q: Question = { ...freshQuestion(n), tiles };
  const seconds = ANSWER_SECONDS[state.cfg.pace][state.cfg.mode];
  return enterPhase({ ...state, rng, q }, 'answer', now, seconds * 1000);
}

/** Everyone connected is in: close the phase after a beat (never later than it already would). */
export function closeWhenAllIn(state: State, now: number): State {
  const answered = Object.keys(state.q.answers).filter((id) => !state.left.includes(id));
  // Never during a settings hold: the clock is stopped and must stay stopped.
  if (state.phase.id !== 'answer' || state.hold || !allConnectedDone(state, answered)) return state;
  const deadline = Math.min(state.phase.deadline ?? now + ALL_IN_MS, now + ALL_IN_MS);
  return deadline === state.phase.deadline
    ? state
    : { ...state, phase: { ...state.phase, deadline } };
}

function accept(
  state: State,
  playerId: string,
  input: Input,
): State['q']['answers'][string] | null {
  if (!hasPlayer(state, playerId) || state.left.includes(playerId)) return null;
  if (input.type === 'pick' && state.cfg.mode === 'tiles') {
    return state.q.tiles?.some((t) => t.id === input.tile) ? { tile: input.tile } : null;
  }
  if (input.type === 'type' && state.cfg.mode === 'typed') {
    const text = input.text.trim().slice(0, TYPED_MAX_CHARS);
    return normalize(text, LANG).compact === '' ? null : { text };
  }
  return null;
}

export function reduceAnswer(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input') return state;
  const answer = accept(state, event.playerId, event.input);
  if (!answer) return state;
  const prior = state.q.answers[event.playerId];
  if (prior?.tile === answer.tile && prior?.text === answer.text) return state;
  const after: State = {
    ...state,
    q: { ...state.q, answers: { ...state.q.answers, [event.playerId]: answer } },
  };
  return closeWhenAllIn(after, event.now);
}

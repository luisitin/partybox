// Phase "guess" (SPEC §9.7): the active team points. A card (or End turn) that a majority of the
// team's connected guessers points at is chosen at once; at the step deadline the single
// most-pointed target wins, a tie or silence ends the turn. The choice is left on `turn` for
// `next` (flow.ts): `turn.flip` → the flip, `turn.ended` → the turn's end.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { majority, plurality, prunePointers } from '../pointing';
import { roleOf } from '../teams';
import { REACTION_MS } from '../types';
import type { Input, Pointer, State, Transition } from '../types';

export function enterGuess(state: State, now: number): State {
  const turn = { ...state.turn, pointers: {}, firsts: {}, flip: null, ended: null };
  return enterPhase({ ...state, turn }, 'guess', now, state.settings.guessSeconds * 1000);
}

function choose(state: State, target: Pointer, now: number, next: Transition): State {
  if (target === 'end') return next({ ...state, turn: { ...state.turn, ended: 'stop' } }, now);
  const flip = {
    card: target,
    kind: state.key[target] ?? 'bystander',
    first: state.turn.firsts[String(target)] ?? null,
  };
  return next({ ...state, turn: { ...state.turn, flip } }, now);
}

/** Re-count after anything that changes who counts (a pointer, a drop, a leave). */
export function recount(state: State, now: number, next: Transition): State {
  if (state.phase.id !== 'guess' || state.phase.paused) return state;
  const pruned = prunePointers(state);
  const target = majority(pruned);
  return target === null ? pruned : choose(pruned, target, now, next);
}

function point(state: State, id: string, target: Pointer): State {
  if (target === 'end' ? state.turn.made === 0 : state.flipped[target] !== 0) return state;
  if (state.turn.pointers[id] === target) return state;
  const key = String(target);
  const firsts = Object.hasOwn(state.turn.firsts, key)
    ? state.turn.firsts
    : { ...state.turn.firsts, [key]: id };
  return {
    ...state,
    turn: { ...state.turn, pointers: { ...state.turn.pointers, [id]: target }, firsts },
  };
}

function react(state: State, id: string, card: number, emoji: string, now: number): State {
  const last = state.turn.reactions[id];
  if (!state.settings.reactions || (last && now - (last.until - REACTION_MS) < 1000)) return state;
  const reactions: State['turn']['reactions'] = {};
  for (const [pid, r] of Object.entries(state.turn.reactions))
    if (r.until > now) reactions[pid] = r;
  reactions[id] = { card, emoji, until: now + REACTION_MS };
  return { ...state, turn: { ...state.turn, reactions } };
}

export function reduceGuess(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) {
    const target = plurality(prunePointers(state));
    if (target !== null) return choose(state, target, event.now, next);
    return next({ ...state, turn: { ...state.turn, ended: 'timeout' } }, event.now);
  }
  if (event.type !== 'input' || !hasPlayer(state, event.playerId)) return state;
  const id = event.playerId;
  if (roleOf(state, id) !== 'guesser' || state.left.includes(id)) return state;
  const input = event.input;
  switch (input.type) {
    case 'point':
      return recount(point(state, id, input.target), event.now, next);
    case 'unpoint': {
      if (!Object.hasOwn(state.turn.pointers, id)) return state;
      const pointers = { ...state.turn.pointers };
      delete pointers[id];
      return { ...state, turn: { ...state.turn, pointers } };
    }
    case 'react':
      return react(state, id, input.card, input.emoji, event.now);
    default:
      return state;
  }
}

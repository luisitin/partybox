// Phase "herd": the answers land in groups on the TV, the biggest rises as the herd, lonely answers
// go to the side. Tiles mode exits after the choreography; typed mode waits for the VIP's merges
// and Score it (a skip), or TYPED_HERD_MS.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { baseGroups, regroup } from '../group';
import { herdReading, readyMs } from '../speech';
import { herdMs } from '../timing';
import { TYPED_HERD_MS } from '../types';
import type { Input, State, Transition } from '../types';

const MAX_MERGES = 32;

function cardCount(state: State): number {
  return (state.q.groups ?? []).reduce((n, g) => n + g.members.length, 0);
}

/** The voiced herd answer's length, when it is already made. */
function verdictMs(state: State): number | null {
  const herd = state.q.groups?.find((g) => g.key === state.q.herd);
  return herd ? readyMs(state, herdReading(state, herd.label)) : null;
}

/** Typed answers wait for the VIP only when there is something to merge. */
export function waitsForVip(state: State): boolean {
  return state.cfg.mode === 'typed' && (state.q.groups?.length ?? 0) >= 2;
}

export function enterHerd(state: State, now: number): State {
  const grouped = regroup(state);
  const ms = waitsForVip(grouped) ? TYPED_HERD_MS : herdMs(cardCount(grouped), verdictMs(grouped));
  return enterPhase(grouped, 'herd', now, ms);
}

/** A reading came back: a tiles verdict still ahead re-times so its voice finishes on screen. */
export function retimeHerd(state: State, now: number): State {
  if (state.phase.id !== 'herd' || waitsForVip(state) || state.phase.deadline === null)
    return state;
  const deadline = Math.max(
    now,
    state.phase.startedAt + herdMs(cardCount(state), verdictMs(state)),
  );
  return deadline > state.phase.deadline
    ? { ...state, phase: { ...state.phase, deadline } }
    : state;
}

function mergeInput(state: State, input: Input): State {
  if (input.type !== 'merge' && input.type !== 'unmerge') return state;
  const { a, b } = input;
  if (a === b) return state;
  const merges = state.q.merges;
  if (input.type === 'unmerge') {
    let at = -1;
    merges.forEach(([x, y], i) => {
      if ((x === a && y === b) || (x === b && y === a)) at = i;
    });
    if (at < 0) return state;
    return regroup({ ...state, q: { ...state.q, merges: merges.filter((_, i) => i !== at) } });
  }
  const keys = new Set(baseGroups(state).map((g) => g.key));
  if (!keys.has(a) || !keys.has(b) || merges.length >= MAX_MERGES) return state;
  const together = state.q.groups?.some(
    (g) => [g.key, ...g.merged].includes(a) && [g.key, ...g.merged].includes(b),
  );
  if (together) return state;
  return regroup({ ...state, q: { ...state.q, merges: [...merges, [a, b]] } });
}

export function reduceHerd(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  // Only the VIP merges (a VIP-stamped input, ADR-042), only typed answers, only here.
  if (event.type !== 'input' || event.vip !== true || state.cfg.mode !== 'typed') return state;
  return mergeInput(state, event.input);
}

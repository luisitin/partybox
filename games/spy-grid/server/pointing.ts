// Guessing by pointing (SPEC §9.7). Only the active team's connected guessers count; the spymaster
// never does. A target flips (or the turn stops) the moment more than half of them point at it; at
// the step deadline the single most-pointed target wins and a tie or silence ends the turn.
import { activeGuessers } from './teams';
import type { Pointer, State } from './types';

export const needed = (guessers: number): number => Math.floor(guessers / 2) + 1;

/** Pointer counts per target, from the guessers who count right now. */
export function tally(state: State): Map<Pointer, number> {
  const counts = new Map<Pointer, number>();
  for (const id of activeGuessers(state, state.turn.team)) {
    const p = state.turn.pointers[id];
    if (p !== undefined) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  return counts;
}

/** The target a majority agrees on, or null. */
export function majority(state: State): Pointer | null {
  const guessers = activeGuessers(state, state.turn.team).length;
  if (guessers === 0) return null;
  for (const [target, count] of tally(state)) if (count >= needed(guessers)) return target;
  return null;
}

/** The deadline rule: one target with more pointers than any other, else null. */
export function plurality(state: State): Pointer | null {
  let best: Pointer | null = null;
  let top = 0;
  let tied = false;
  for (const [target, count] of tally(state)) {
    if (count > top) [best, top, tied] = [target, count, false];
    else if (count === top) tied = true;
  }
  return tied ? null : best;
}

/** Drops the pointers of players who no longer count (dropped, left, or not guessers). */
export function prunePointers(state: State): State {
  const keep = new Set(activeGuessers(state, state.turn.team));
  const pointers: Record<string, Pointer> = {};
  for (const [id, p] of Object.entries(state.turn.pointers)) if (keep.has(id)) pointers[id] = p;
  if (Object.keys(pointers).length === Object.keys(state.turn.pointers).length) return state;
  return { ...state, turn: { ...state.turn, pointers } };
}

/** The target most people on the active team point at (what a following bot copies), or null. */
export function humanLead(state: State): Pointer | null {
  const counts = new Map<Pointer, number>();
  for (const id of activeGuessers(state, state.turn.team)) {
    const p = state.turn.pointers[id];
    if (p !== undefined && state.players[id]?.bot !== true) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  let best: Pointer | null = null;
  let top = 0;
  for (const [target, count] of counts) if (count > top) [best, top] = [target, count];
  return best;
}

/** True when the active team has a connected person guessing (then bots only follow). */
export function peopleGuessing(state: State): boolean {
  return activeGuessers(state, state.turn.team).some((id) => state.players[id]?.bot !== true);
}

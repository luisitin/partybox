// Test driver: a game with named players and helpers to push events through `reduce`.
import { createRng } from '@partybox/game-sdk';
import type { GameEvent, PlayerInfo, Settings } from '@partybox/game-sdk';
import { wordById } from '../server/content';
import { game } from '../server/index';
import type { Input, State } from '../server/types';

export const T0 = 1_700_000_000_000;

export function players(n: number): PlayerInfo[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name:
      [
        'Sam',
        'Ana',
        'Ben',
        'Cy',
        'Dee',
        'Eli',
        'Fay',
        'Gus',
        'Hal',
        'Ivy',
        'Jo',
        'Kai',
        'Lu',
        'Mo',
        'Ned',
        'Oz',
      ][i] ?? `P${i}`,
    avatarId: 'fox',
    connected: true,
  }));
}

export function start(n = 6, settings: Settings = {}, seed = 7, presence?: unknown): State {
  const ctx = { players: players(n), settings, seed, now: T0, ...(presence ? { presence } : {}) };
  return game.init(ctx);
}

export function input(state: State, playerId: string, inp: Input, vip = false): State {
  const ev: GameEvent<Input> = { type: 'input', now: now(state) + 10, playerId, input: inp, vip };
  return game.reduce(state, ev);
}

export function timer(state: State): State {
  const at = state.phase.deadline ?? now(state) + 1;
  return game.reduce(state, {
    type: 'timer',
    now: at,
    phaseId: state.phase.id,
    startedAt: state.phase.startedAt,
  });
}

export function vip(state: State, action: 'skip' | 'pause' | 'resume' | 'end'): State {
  return game.reduce(state, { type: 'vip', now: now(state) + 20, action });
}

export function now(state: State): number {
  return state.phase.startedAt;
}

/** Run deadlines until the phase is `id` (or give up after 200 steps). */
export function until(state: State, id: string): State {
  let s = state;
  for (let i = 0; i < 200 && s.phase.id !== id; i++) s = timer(s);
  return s;
}

/** The imposters and the crew of the current round. */
export function roles(state: State): { imps: string[]; crew: string[] } {
  const imps = state.round.imposters;
  return { imps, crew: state.seats.filter((id) => !imps.includes(id)) };
}

/** A legal crew clue for this round's word (from its bank). */
export function crewClue(state: State, i = 0): string {
  const w = state.words[state.round.w];
  return (w && bank(w.id)[i]) || 'zzz';
}

export function bank(wordId: string): string[] {
  return wordById(wordId)?.clues ?? [];
}

/** Every player casts `targets(voter)` in the vote. */
export function voteAll(state: State, targets: (voter: string) => string[]): State {
  let s = state;
  for (const id of s.seats) s = input(s, id, { type: 'vote', targets: targets(id) });
  return s;
}

export const rng = (seed = 1): ReturnType<typeof createRng> => createRng(seed);

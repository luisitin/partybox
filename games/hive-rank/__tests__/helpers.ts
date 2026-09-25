// Shared helpers for the Hive Rank unit tests: hand-built events against the real reducer.
import { game } from '../server/index';
import type { Input, State } from '../server/types';
import { controllerView, tvView } from '../server/views';
import type { HiveControllerView, HiveTvView } from '../server/views';

export const T0 = 1_000_000;

export function tv(state: State): HiveTvView {
  return tvView(state, game.manifest.id);
}

export function phone(state: State, playerId: string): HiveControllerView {
  return controllerView(state, game.manifest.id, playerId);
}

export interface TestPlayer {
  id: string;
  name: string;
  avatarId: string;
  connected: boolean;
  bot?: boolean;
}

export const PLAYERS: TestPlayer[] = [
  { id: 'a', name: 'Ana', avatarId: 'fox', connected: true },
  { id: 'b', name: 'Ben', avatarId: 'owl', connected: true },
  { id: 'c', name: 'Cleo', avatarId: 'frog', connected: true },
];

export function players(n: number): TestPlayer[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${String(i + 1).padStart(2, '0')}`,
    name: `Player ${i + 1}`,
    avatarId: 'fox',
    connected: true,
  }));
}

export function start(
  settings: Record<string, number | string | boolean> = {},
  seed = 1,
  roster: TestPlayer[] = PLAYERS,
): State {
  return game.init({
    players: roster,
    settings: { rounds: 3, rankSeconds: 30, spicy: false, reader: 'none', ...settings },
    seed,
    now: T0,
  });
}

export function input(state: State, playerId: string, value: Input, now?: number): State {
  return game.reduce(state, {
    type: 'input',
    now: now ?? state.phase.startedAt + 1000,
    playerId,
    input: value,
  });
}

/** The round's five ids, in pack order. */
export function ids(state: State): string[] {
  return state.questions[state.q.n - 1]?.items.map((i) => i.id) ?? [];
}

/** Sends `playerId`'s order, given as indexes into the pack order (default: pack order). */
export function order(state: State, playerId: string, idx = [0, 1, 2, 3, 4]): State {
  const all = ids(state);
  return input(state, playerId, { type: 'order', items: idx.map((i) => all[i] ?? '') });
}

/** Fires the current phase's own timer at its deadline. */
export function timer(state: State): State {
  return game.reduce(state, {
    type: 'timer',
    now: state.phase.deadline ?? state.phase.startedAt,
    phaseId: state.phase.id,
    startedAt: state.phase.startedAt,
  });
}

export function vip(
  state: State,
  action: 'skip' | 'pause' | 'resume' | 'end',
  now?: number,
): State {
  return game.reduce(state, { type: 'vip', now: now ?? state.phase.startedAt + 500, action });
}

export function speech(state: State, key: string, ms: number, now?: number): State {
  return game.reduce(state, { type: 'speech', now: now ?? state.phase.startedAt + 100, key, ms });
}

/** Skips out of `intro` into round 1's `rank`. */
export function toRank(state: State): State {
  return timer(state);
}

/** Runs `hive` to its end (every step's timer), landing in `score`. */
export function throughHive(state: State): State {
  let s = state;
  for (let i = 0; i < 12 && s.phase.id === 'hive'; i++) s = timer(s);
  return s;
}

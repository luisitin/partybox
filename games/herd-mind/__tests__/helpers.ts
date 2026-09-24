// Shared helpers for the Herd Mind unit tests: hand-built events against the real reducer.
import { game } from '../server/index';
import type { Input, State } from '../server/types';

export const T0 = 1_000_000;

export const NAMES = [
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
  'Pia',
];

export function players(
  n: number,
): { id: string; name: string; avatarId: string; connected: boolean }[] {
  return NAMES.slice(0, n).map((name) => ({
    id: name.toLowerCase(),
    name,
    avatarId: 'fox',
    connected: true,
  }));
}

export function start(
  settings: Record<string, number | string | boolean> = {},
  n = 6,
  seed = 1,
): State {
  return game.init({
    players: players(n),
    settings: { reader: 'none', ...settings },
    seed,
    now: T0,
  });
}

export function input(
  state: State,
  playerId: string,
  inp: Input,
  now = state.phase.startedAt + 500,
  vip = false,
): State {
  return game.reduce(state, {
    type: 'input',
    now,
    playerId,
    input: inp,
    ...(vip ? { vip: true } : {}),
  });
}

export function skip(state: State, now = state.phase.startedAt + 100): State {
  return game.reduce(state, { type: 'vip', now, action: 'skip' });
}

export function timer(state: State): State {
  return game.reduce(state, {
    type: 'timer',
    now: state.phase.deadline ?? state.phase.startedAt,
    phaseId: state.phase.id,
    startedAt: state.phase.startedAt,
  });
}

/** Past the intro, into question 1's `answer`. */
export function atAnswer(
  settings: Record<string, number | string | boolean> = {},
  n = 6,
  seed = 1,
): State {
  return skip(start(settings, n, seed));
}

/** Tile ids in the order the current question shows them. */
export function tileIds(state: State): string[] {
  return (state.q.tiles ?? []).map((t) => t.id);
}

/** Each player picks the tile at the given index (null = no answer), then the phase times out. */
export function pickAll(state: State, picks: (number | null)[]): State {
  const ids = tileIds(state);
  let s = state;
  picks.forEach((i, seat) => {
    const id = s.seats[seat];
    if (i === null || !id) return;
    s = input(s, id, { type: 'pick', tile: ids[i] ?? '' });
  });
  return s.phase.id === 'answer' ? timer(s) : s;
}

/** Each player types a text (null = no answer), then the phase times out. */
export function typeAll(state: State, texts: (string | null)[]): State {
  let s = state;
  texts.forEach((text, seat) => {
    const id = s.seats[seat];
    if (text === null || !id) return;
    s = input(s, id, { type: 'type', text });
  });
  return s.phase.id === 'answer' ? timer(s) : s;
}

/** From `answer`, through `herd`, into `score` with the given picks. */
export function scoreWith(state: State, picks: (number | null)[]): State {
  const herd = pickAll(state, picks);
  return timer(herd);
}

/** From `score` to the next `answer`. */
export function nextQuestion(state: State): State {
  return timer(state);
}

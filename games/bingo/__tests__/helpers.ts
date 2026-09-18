// Shared helpers for the Bingo tests: a three-player game, hand-built events, and the two
// shortcuts every rule needs — call numbers until a card's cells are all out, daub a set of cells.
import { game } from '../server/index';
import { VERDICT_READ_MS, claimRevealMs } from '../server/reveal';
import type { Input, State } from '../server/types';

export const T0 = 1_000_000;
export const PLAYERS = [
  { id: 'a', name: 'Ana', avatarId: 'fox', connected: true },
  { id: 'b', name: 'Ben', avatarId: 'owl', connected: true },
  { id: 'c', name: 'Cleo', avatarId: 'frog', connected: true },
];

export function start(settings: Record<string, number | string | boolean> = {}, seed = 1): State {
  return game.init({
    players: PLAYERS,
    settings: { rounds: 2, round1: 'line', round2: 'corners', callSeconds: 6, ...settings },
    seed,
    now: T0,
  });
}

export function input(
  state: State,
  playerId: string,
  value: Input,
  now = state.phase.startedAt + 500,
): State {
  return game.reduce(state, { type: 'input', now, playerId, input: value });
}

export function timer(state: State): State {
  const now = state.phase.deadline ?? state.phase.startedAt;
  return game.reduce(state, {
    type: 'timer',
    now,
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

/** Calls numbers until every index in `cells` of `playerId`'s card has been called. */
export function callUntil(state: State, playerId: string, cells: number[], cardIndex = 0): State {
  let s = state.phase.id === 'intro' ? timer(state) : state;
  const card = s.round.cards[playerId]?.[cardIndex] as number[];
  const need = new Set(cells.map((i) => card[i] as number).filter((n) => n !== 0));
  for (let guard = 0; guard < 80 && s.phase.id === 'play'; guard++) {
    const called = new Set(s.round.deck.slice(0, s.round.drawn));
    if ([...need].every((n) => called.has(n))) return s;
    s = timer(s);
  }
  throw new Error('deck ran out');
}

export function daubAll(state: State, playerId: string, cells: number[], card = 0): State {
  let s = state;
  for (const i of cells) if (i !== 12) s = input(s, playerId, { type: 'daub', card, index: i });
  return s;
}

/** BINGO! takes two taps on the same card: arm, then claim 100 ms later — the state as the TV
 * starts its reveal (a win is not scored yet: that is the verdict tick, `claim`). */
export function claimRaw(state: State, playerId: string, card = 0): State {
  const t = state.phase.startedAt + 500;
  const armed = input(state, playerId, { type: 'bingo', card }, t);
  return input(armed, playerId, { type: 'bingo', card }, t + 100);
}

/** A claim and the TV's verdict: the check's or the bingo phase's first tick (which scores a win). */
export function claim(state: State, playerId: string, card = 0): State {
  const s = claimRaw(state, playerId, card);
  return s.phase.id === 'check' || (s.phase.id === 'bingo' && s.round.winnerId) ? timer(s) : s;
}

/** A moment after the TV's reveal of the current claim: when the room may decide. */
export function after(state: State): number {
  const c = state.round.claim;
  return state.phase.startedAt + (c ? claimRevealMs(c.cells, c.daubs) + VERDICT_READ_MS : 0) + 10;
}

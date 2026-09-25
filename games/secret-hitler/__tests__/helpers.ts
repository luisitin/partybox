// Shared helpers for the Secret Hitler tests: a rigged table (seats p1…pN in order, known roles,
// an optional stacked deck) driven through the real reducer with hand-built events.
import type { GameEvent, VipGameAction } from '@partybox/game-sdk';
import { game } from '../server/index';
import { emptyRound } from '../server/phase';
import { fascistCount } from '../server/rules';
import type { Input, Party, Role, State } from '../server/types';

export const T0 = 1_700_000_000_000;

export function ids(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `p${i + 1}`);
}

export function makePlayers(n: number): State['players'][string][] {
  return ids(n).map((id, i) => ({ id, name: `Player ${i + 1}`, avatarId: 'fox', connected: true }));
}

/** A real init (random seats, roles, deck) for n players. */
export function start(n = 5, seed = 1, settings: Record<string, string> = {}): State {
  return game.init({ players: makePlayers(n), settings, seed, now: T0 });
}

/** Default rigged roles: the last seat is Hitler, the seats before it the Fascists (R1). */
export function defaultRoles(n: number): Record<string, Role> {
  const f = fascistCount(n);
  const role: Record<string, Role> = {};
  ids(n).forEach((id, i) => {
    role[id] = i === n - 1 ? 'hitler' : i >= n - 1 - f ? 'fascist' : 'liberal';
  });
  return role;
}

export interface Rig {
  roles?: Record<string, Role>;
  deck?: Party[];
  patch?: Partial<State>;
}

/** Seats p1…pN in order, p1 the first President, still in `seating`. */
export function rig(n = 5, options: Rig = {}): State {
  const s = start(n);
  const seats = ids(n);
  return {
    ...s,
    seats,
    alive: [...seats],
    role: options.roles ?? defaultRoles(n),
    deck: options.deck ?? s.deck,
    presPointer: 0,
    round: emptyRound(1, 'p1'),
    ...options.patch,
  };
}

export function reduce(state: State, event: GameEvent<Input>): State {
  return game.reduce(state, event);
}

export function now(state: State, plus = 100): number {
  return state.phase.startedAt + plus;
}

export function send(state: State, playerId: string, input: Input, at?: number): State {
  return reduce(state, { type: 'input', now: at ?? now(state), playerId, input });
}

export function vip(state: State, action: VipGameAction, at?: number): State {
  return reduce(state, { type: 'vip', now: at ?? now(state), action });
}

/** Fires the current phase's deadline. */
export function timeout(state: State): State {
  const deadline = state.phase.deadline ?? now(state);
  return reduce(state, {
    type: 'timer',
    now: deadline,
    phaseId: state.phase.id,
    startedAt: state.phase.startedAt,
  });
}

/** Fires deadlines until the phase is `id` (at most 40 steps). */
export function until(state: State, id: string): State {
  let s = state;
  for (let i = 0; i < 40 && s.phase.id !== id; i++) s = timeout(s);
  if (s.phase.id !== id) throw new Error(`never reached ${id} (stuck in ${s.phase.id})`);
  return s;
}

/** Every living player votes the same way. */
export function voteAll(state: State, ja: boolean): State {
  let s = state;
  for (const id of state.alive) if (s.phase.id === 'vote') s = send(s, id, { type: 'vote', ja });
  return s;
}

/** From `nominate`: the President nominates `chancellor` and the table votes `ja`. */
export function elect(state: State, chancellor: string, ja = true): State {
  const s = send(state, state.round.president, { type: 'nominate', target: chancellor });
  return voteAll(s, ja);
}

/** Everyone taps Got it, the 3 · 2 · 1 runs out: round 1's nominate. */
export function seated(state: State): State {
  let s = state;
  for (const id of state.alive) if (s.phase.id === 'seating') s = send(s, id, { type: 'ready' });
  return until(s, 'nominate');
}

/** From nominate: elect, discard index `d`, enact index `e`, land on the phase after enactReveal. */
export function govern(state: State, chancellor: string, d = 0, e = 0): State {
  let s = elect(state, chancellor);
  s = until(s, 'presDraw');
  s = send(s, s.round.president, { type: 'discard', index: d });
  s = send(s, chancellor, { type: 'enact', index: e });
  return timeout(s); // enactReveal → next
}

// The rules every phase and view shares: sides, who is alive (and who the room knows is alive),
// deaths, the win check (SPEC §10.8), what a night pick may target (§10.5) and the hunch tally.
import { hasPlayer } from '@partybox/game-sdk';
import type { Death, DeathHow, Role, Side, State } from './types';

export function sideOf(role: Role | undefined): Side {
  if (role === 'wolf') return 'wolves';
  if (role === 'jester') return 'jester';
  return 'village';
}

export function roleOf(state: State, id: string): Role | undefined {
  return Object.hasOwn(state.roles, id) ? state.roles[id] : undefined;
}

export function isAlive(state: State, id: string): boolean {
  return state.alive.includes(id);
}

/** Alive as the room knows it: the living plus the dead nobody has announced yet. */
export function knownAlive(state: State): string[] {
  const untold = new Set(state.dead.filter((d) => !d.told).map((d) => d.id));
  return state.seats.filter((id) => state.alive.includes(id) || untold.has(id));
}

export function knownDead(state: State): Death[] {
  return state.dead.filter((d) => d.told);
}

/** Living players who are connected: the "everyone done" denominator. */
export function livingConnected(state: State): string[] {
  return state.alive.filter((id) => state.players[id]?.connected === true);
}

export function allLivingDone(state: State, done: Iterable<string>): boolean {
  const set = new Set(done);
  const ids = livingConnected(state);
  return ids.length > 0 && ids.every((id) => set.has(id));
}

/** Kills `deaths` now (not yet announced). A hunter killed by anything but leaving gets a shot. */
export function kill(
  state: State,
  deaths: readonly { id: string; how: DeathHow }[],
  told = false,
): State {
  const fresh = deaths.filter((d) => state.alive.includes(d.id));
  if (fresh.length === 0) return state;
  const ids = new Set(fresh.map((d) => d.id));
  const hunter = fresh.find((d) => d.how !== 'left' && roleOf(state, d.id) === 'hunter');
  return {
    ...state,
    alive: state.alive.filter((id) => !ids.has(id)),
    dead: [...state.dead, ...fresh.map((d) => ({ id: d.id, day: state.day, how: d.how, told }))],
    leaving: state.leaving.filter((id) => !ids.has(id)),
    hunterPending: hunter ? hunter.id : state.hunterPending,
  };
}

/** Marks every death so far as announced. */
export function tellAll(state: State): State {
  if (state.dead.every((d) => d.told)) return state;
  return { ...state, dead: state.dead.map((d) => (d.told ? d : { ...d, told: true })) };
}

/** Deaths from players who left for good, applied at an announcement. */
export function departures(state: State): { id: string; how: DeathHow }[] {
  return state.leaving.filter((id) => isAlive(state, id)).map((id) => ({ id, how: 'left' }));
}

/** SPEC §10.8 in order. `jesterOut`: the jester was just voted out. `afterLastVote`: day maxDays is over. */
export function checkWin(
  state: State,
  opts: { jesterOut?: boolean; afterLastVote?: boolean } = {},
): Pick<State, 'winner' | 'reason'> | null {
  if (opts.jesterOut) return { winner: 'jester', reason: 'jester' };
  const wolves = state.alive.filter((id) => roleOf(state, id) === 'wolf').length;
  const others = state.alive.length - wolves;
  if (wolves === 0) return { winner: 'village', reason: 'wolvesGone' };
  if (wolves >= others) return { winner: 'wolves', reason: 'wolvesEqual' };
  if (opts.afterLastVote && state.day >= state.cfg.maxDays)
    return { winner: 'wolves', reason: 'maxDays' };
  return null;
}

/** Why a night pick does not count, or null when it does (SPEC §10.9's private messages). */
export function nightRefusal(
  state: State,
  by: string,
  target: string,
): 'packmate' | 'self' | 'repeat' | 'invalid' | null {
  if (!isAlive(state, by) || !isAlive(state, target) || !hasPlayer(state, target)) return 'invalid';
  const role = roleOf(state, by);
  if (role === 'wolf') {
    if (target === by) return 'self';
    return roleOf(state, target) === 'wolf' ? 'packmate' : null;
  }
  if (role === 'doctor') return target === state.lastProtected ? 'repeat' : null;
  return target === by ? 'self' : null;
}

/** Roles whose night pick is a hunch (villager side, no power). */
export function hunchRole(role: Role | undefined): boolean {
  return role === 'villager' || role === 'hunter' || role === 'jester';
}

/** Counts per target, highest first, ties in seat order. */
export function countBy(state: State, targets: readonly string[]): { id: string; n: number }[] {
  const counts = new Map<string, number>();
  for (const t of targets) counts.set(t, (counts.get(t) ?? 0) + 1);
  return state.seats
    .filter((id) => counts.has(id))
    .map((id) => ({ id, n: counts.get(id) ?? 0 }))
    .sort((a, b) => b.n - a.n || state.seats.indexOf(a.id) - state.seats.indexOf(b.id));
}

/** Who a voter may pick right now (players only; 'none' is always allowed). */
export function candidatesFor(state: State, voter: string): string[] {
  const pool = state.runoff ?? state.alive;
  return pool.filter((id) => id !== voter && isAlive(state, id));
}

export function nameOf(state: State, id: string): string {
  return hasPlayer(state, id) ? (state.players[id]?.name ?? '?') : '?';
}

/** Bumps one stat for one player. */
export function bump(state: State, id: string, key: keyof State['stats'][string], by = 1): State {
  const cur = state.stats[id];
  if (!cur) return state;
  return { ...state, stats: { ...state.stats, [id]: { ...cur, [key]: cur[key] + by } } };
}

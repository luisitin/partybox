// Test kit for Spy Grid: start a game, send inputs, fire timers, rig a key.
import { game } from '../server/index';
import type { Input, Kind, State } from '../server/types';
import type { PlayerInfo } from '@partybox/game-sdk';

export const T0 = 1_000_000;

export function players(n: number, bots = 0): PlayerInfo[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: `P${i + 1}`,
    avatarId: String(i),
    connected: true,
    ...(i >= n - bots ? { bot: true } : {}),
  }));
}

export function start(
  n: number,
  settings: Record<string, string | number | boolean> = {},
  seed = 1,
  bots = 0,
): State {
  return game.init({
    players: players(n, bots),
    settings: { reader: 'none', ...settings },
    seed,
    now: T0,
  });
}

export const now = (s: State): number => s.phase.startedAt + 10;

export function send(s: State, playerId: string, input: Input, vip = false): State {
  return game.reduce(s, { type: 'input', now: now(s), playerId, input, ...(vip ? { vip } : {}) });
}

export function tick(s: State): State {
  const at = s.phase.deadline ?? s.phase.startedAt + 1;
  return game.reduce(s, {
    type: 'timer',
    now: at,
    phaseId: s.phase.id,
    startedAt: s.phase.startedAt,
  });
}

export function skip(s: State): State {
  return game.reduce(s, { type: 'vip', now: now(s), action: 'skip' });
}

export function drop(s: State, playerId: string, gone?: 'left'): State {
  return game.reduce(s, {
    type: 'player',
    now: now(s),
    playerId,
    connected: false,
    ...(gone ? { gone } : {}),
  });
}

/** Fixed teams + spymasters + a key, for hand-built scenarios (teams mode, sun to clue). */
export function rig(s: State, key: Kind[], sun: string[], moon: string[]): State {
  return {
    ...s,
    key,
    teams: { sun, moon },
    spymaster: { sun: sun[0] ?? null, moon: moon[0] ?? null },
    turn: { ...s.turn, team: 'sun', spymaster: sun[0] ?? null },
    flipped: key.map(() => 0 as const),
  };
}

/** A key with sun agents at 0–8, moon at 9–16, bystanders 17–23, the assassin at 24. */
export function plainKey(): Kind[] {
  return [
    ...Array<Kind>(9).fill('sun'),
    ...Array<Kind>(8).fill('moon'),
    ...Array<Kind>(7).fill('bystander'),
    'assassin',
  ];
}

/** A teams game past `teams`, rigged: sun = p1 (spy) p2 p3, moon = p4 (spy) p5 p6. In `clue`. */
export function rigged(n = 6, settings: Record<string, string | number | boolean> = {}): State {
  let s = start(n, { teamPick: 'random', ...settings });
  const half = Math.ceil(n / 2);
  const ids = s.seats;
  s = rig(s, plainKey(), ids.slice(0, half), ids.slice(half));
  return s;
}

/** Sends a legal clue for sun (a word no board card resembles). */
export function clue(s: State, number = 2, word = 'zzyzx'): State {
  return send(s, s.turn.spymaster ?? '', { type: 'clue', word, number });
}

/** Every active guesser points at `target`. */
export function allPoint(s: State, target: number | 'end'): State {
  let out = s;
  const team = out.turn.team;
  for (const id of out.teams[team]) {
    if (id === out.spymaster[team] || out.phase.id !== 'guess') continue;
    out = send(out, id, { type: 'point', target });
  }
  return out;
}

/** Plays the flip's two beats. */
export function finishFlip(s: State): State {
  let out = s;
  while (out.phase.id === 'flip') out = tick(out);
  return out;
}

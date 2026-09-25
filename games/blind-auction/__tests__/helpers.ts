// Test kit: a room of named players, hand-driven events, and helpers that walk to a phase.
import { createRng } from '@partybox/game-sdk';
import type { GameEvent, Settings } from '@partybox/game-sdk';
import { game } from '../server/index';
import type { Input, State } from '../server/types';

export const T0 = 1_000_000;
export const NAMES = ['Ana', 'Ben', 'Cy', 'Dee', 'Eli', 'Fay', 'Gus', 'Hal'];

export function players(
  n: number,
  bots = 0,
): { id: string; name: string; avatarId: string; connected: boolean; bot?: boolean }[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: NAMES[i % NAMES.length] ?? `P${i + 1}`,
    avatarId: 'fox',
    connected: true,
    ...(i >= n - bots ? { bot: true } : {}),
  }));
}

export function start(n = 5, settings: Settings = {}, seed = 1, bots = 0): State {
  return game.init({ players: players(n, bots), settings, seed, now: T0 });
}

export function send(state: State, event: GameEvent<Input>): State {
  return game.reduce(state, event);
}

export const skip = (s: State, now = s.phase.startedAt + 10): State =>
  send(s, { type: 'vip', now, action: 'skip' });

export const timer = (s: State): State =>
  send(s, {
    type: 'timer',
    now: s.phase.deadline ?? s.phase.startedAt,
    phaseId: s.phase.id,
    startedAt: s.phase.startedAt,
  });

export const ready = (s: State, playerId: string, now = s.phase.startedAt + 100): State =>
  send(s, { type: 'input', now, playerId, input: { type: 'ready' } });

export const bet = (
  s: State,
  playerId: string,
  option: number,
  amount: number,
  now = s.phase.startedAt + 100,
): State => send(s, { type: 'input', now, playerId, input: { type: 'bet', option, amount } });

/** VIP-skips until the phase is `id` (at most 60 steps). */
export function walkTo(state: State, id: string): State {
  let s = state;
  for (let i = 0; i < 60 && s.phase.id !== id; i++) s = skip(s);
  if (s.phase.id !== id) throw new Error(`never reached ${id}`);
  return s;
}

/** The current box now holds option `outcome`. */
export function setOutcome(state: State, outcome: number): State {
  const boxes = [...state.boxes];
  const round = boxes[state.r.idx];
  if (round) boxes[state.r.idx] = { ...round, outcome };
  return { ...state, boxes };
}

/** Sets everyone's coins (by seat order). */
export function withCoins(state: State, coins: number[]): State {
  const next = { ...state.coins };
  state.seats.forEach((id, i) => (next[id] = coins[i] ?? next[id] ?? 0));
  return { ...state, coins: next };
}

/** Plays a whole game with the game's own bots, keeping every state it passes through. */
export function playThrough(
  seed: number,
  n: number,
  settings: Settings = {},
  voice = true,
): State[] {
  const rng = createRng(seed);
  let s = start(n, settings, seed, n);
  const seen: State[] = [s];
  for (let guard = 0; guard < 3000 && s.phase.id !== 'done'; guard++) {
    const acts = s.seats
      .map((id) => ({ id, input: game.bot.sampleInput(s, id, rng) }))
      .filter((a) => a.input !== null);
    const now = s.phase.startedAt + 50 + guard;
    const act = acts.length && rng.chance(0.7) ? acts[rng.int(0, acts.length - 1)] : null;
    s = act?.input
      ? send(s, { type: 'input', now, playerId: act.id, input: act.input })
      : send(s, {
          type: 'timer',
          now: s.phase.deadline ?? now,
          phaseId: s.phase.id,
          startedAt: s.phase.startedAt,
        });
    seen.push(s);
    // The host answers every reading a moment later (ADR-045), as a real room would.
    if (voice && rng.chance(0.8))
      for (const r of game.speech?.(s) ?? [])
        s = send(s, {
          type: 'speech',
          now: now + 5,
          key: r.key,
          ms: 900 + (r.key.length % 7) * 100,
        });
    seen.push(s);
  }
  return seen;
}

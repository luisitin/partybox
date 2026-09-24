// Shared helpers for the Who Said It tests: hand-built events against the real reducer.
import type { GameEvent, VipGameAction } from '@partybox/game-sdk';
import { game } from '../server/index';
import type { WsPhoneView, WsTvView } from '../server/index';
import type { Input, State } from '../server/types';

export const T0 = 1_700_000_000_000;

const NAMES = 'Ana Ben Cy Dee Eli Fay Gus Hal Ivy Jo Kit Lu Max Ned Oz Pia'.split(' ');
export const PLAYERS = NAMES.map((name, i) => ({
  id: name.toLowerCase(),
  name,
  avatarId: `face-${i}`,
  connected: true,
}));

export interface StartOptions {
  players?: number;
  seed?: number;
  settings?: Record<string, string | number | boolean>;
  bots?: number;
}

/** A fresh game in `intro`. The last `bots` seats are bots. */
export function start(options: StartOptions = {}): State {
  const n = options.players ?? 4;
  const bots = options.bots ?? 0;
  return game.init({
    players: PLAYERS.slice(0, n).map((p, i) => (i >= n - bots ? { ...p, bot: true } : p)),
    settings: { reader: 'none', ...options.settings },
    seed: options.seed ?? 1,
    now: T0,
  });
}

export function reduce(state: State, event: GameEvent<Input>): State {
  return game.reduce(state, event);
}

/** Fires the current phase's timer at its deadline. */
export function timer(state: State): State {
  return reduce(state, {
    type: 'timer',
    now: state.phase.deadline ?? state.phase.startedAt,
    phaseId: state.phase.id,
    startedAt: state.phase.startedAt,
  });
}

export function vip(state: State, action: VipGameAction, now = state.phase.startedAt + 500): State {
  return reduce(state, { type: 'vip', now, action });
}

export function input(state: State, playerId: string, inp: Input, now?: number): State {
  return reduce(state, {
    type: 'input',
    now: now ?? state.phase.startedAt + 500,
    playerId,
    input: inp,
  });
}

export const answer = (s: State, id: string, text: string): State =>
  input(s, id, { type: 'answer', text });
export const guess = (s: State, id: string, target: string): State =>
  input(s, id, { type: 'guess', target });

export function player(
  state: State,
  playerId: string,
  connected: boolean,
  gone?: 'left' | 'kicked',
): State {
  const now = state.phase.startedAt + 400;
  return reduce(state, gone ? { type: 'player', now, playerId, connected, gone } : { type: 'player', now, playerId, connected }); // prettier-ignore
}

/** Runs deadlines until the game reaches `phase` (at most 200 steps). */
export function until(state: State, phase: string): State {
  let s = state;
  for (let i = 0; i < 200 && s.phase.id !== phase; i += 1) s = timer(s);
  if (s.phase.id !== phase) throw new Error(`never reached ${phase} (at ${s.phase.id})`);
  return s;
}

/** Into `write` of the first prompt, then every player in `answers` answers. */
export function written(state: State, answers: Record<string, string>): State {
  let s = until(state, 'write');
  for (const [id, text] of Object.entries(answers)) s = answer(s, id, text);
  return s;
}

export const tv = (s: State): WsTvView => game.tvView(s);
export const phone = (s: State, id: string): WsPhoneView => game.controllerView(s, id);

/** The authors of the card on stage (test-only peek at the secret). */
export function authorsNow(s: State): string[] {
  return s.p.cards[s.p.idx]?.authors ?? [];
}

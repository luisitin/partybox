// Shared builders for Tune In's unit tests: a room of N players, inputs, timers and VIP actions
// with hand-picked times, and a way to pin the secret target.
import type { GameEvent, PlayerInfo } from '@partybox/game-sdk';
import { game } from '../server/index';
import type { Input, State } from '../server/types';

export const T0 = 1_000_000;
const NAMES = ['Ana', 'Ben', 'Cy', 'Dee', 'Eli', 'Fay', 'Gus', 'Hal', 'Ivy', 'Jo', 'Kai', 'Lu'];

export function roster(n: number, bots = 0): PlayerInfo[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: NAMES[i % NAMES.length] ?? `P${i + 1}`,
    avatarId: 'fox',
    connected: true,
    ...(i >= n - bots ? { bot: true } : {}),
  }));
}

export function start(n: number, settings: Record<string, string | number | boolean> = {}): State {
  return game.init({ players: roster(n), settings, seed: 42, now: T0 });
}

export function send(state: State, playerId: string, input: Input, now?: number): State {
  const at = now ?? state.phase.startedAt + 500;
  return game.reduce(state, { type: 'input', now: at, playerId, input });
}

export function timer(state: State, now?: number): State {
  const at = now ?? state.phase.deadline ?? state.phase.startedAt;
  return game.reduce(state, {
    type: 'timer',
    now: at,
    phaseId: state.phase.id,
    startedAt: state.phase.startedAt,
  });
}

export function vip(
  state: State,
  action: 'skip' | 'pause' | 'resume' | 'end',
  now?: number,
): State {
  return game.reduce(state, { type: 'vip', now: now ?? state.phase.startedAt + 100, action });
}

export function link(state: State, playerId: string, connected: boolean, gone?: 'left'): State {
  const event: GameEvent<Input> = {
    type: 'player',
    now: state.phase.startedAt + 200,
    playerId,
    connected,
    ...(gone ? { gone } : {}),
  };
  return game.reduce(state, event);
}

/** Pins the current turn's secret target (tests pick where the dial lands). */
export function withTarget(state: State, target: number): State {
  return { ...state, turn: { ...state.turn, target } };
}

/** From the intro into the first clue. */
export function toClue(state: State): State {
  return timer(state);
}

/** A legal clue from this turn's psychic (a bank clue of the spectrum on the dial). */
export function legalClue(state: State): string {
  return state.spectra[state.turn.spectrum]?.clues[0]?.text ?? 'something';
}

/** Clue sent: the room is dialling. */
export function toDial(state: State, target = 50): State {
  const clue = withTarget(state.phase.id === 'intro' ? toClue(state) : state, target);
  return send(clue, clue.turn.psychic, { type: 'clue', text: legalClue(clue) });
}

export function guessers(state: State): string[] {
  const pool = state.turn.team && state.teams ? state.teams[state.turn.team] : state.seats;
  return pool.filter((id) => id !== state.turn.psychic);
}

/** Every guesser dials `pos[i]` (in seat order) and locks in. */
export function dialAll(state: State, pos: number[]): State {
  let s = state;
  guessers(state).forEach((id, i) => {
    if (s.phase.id !== 'dial') return;
    s = send(s, id, { type: 'dial', pos: pos[i] ?? 50 });
    s = send(s, id, { type: 'lock' });
  });
  return s;
}

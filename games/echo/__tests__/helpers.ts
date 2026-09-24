// Test helpers: a started game with a known word and guesser, and short event builders.
import { createRng } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { FAMILY } from '../server/content';
import { game } from '../server/index';
import type { Input, State } from '../server/types';

export const T0 = 1_000_000;

export function players(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: ['Ana', 'Ben', 'Cy', 'Dee', 'Eli', 'Fay', 'Gus', 'Hal', 'Ivy', 'Jo'][i] ?? `P${i + 1}`,
    avatarId: 'fox',
    connected: true,
  }));
}

export function start(
  n = 5,
  settings: Record<string, string | number | boolean> = {},
  seed = 7,
): State {
  return game.init({ players: players(n), settings, seed, now: T0 });
}

/** The pack's own telescope (the spec's worked example), so bots find its clue bank. */
export const TELESCOPE = FAMILY.find((w) => w.answer === 'telescope') as (typeof FAMILY)[number];

/** A game in `clue` on TELESCOPE, guessed by p1, with the rest of the deck from the family pack. */
export function atClue(n = 5, settings: Record<string, string | number | boolean> = {}): State {
  const s = start(n, settings);
  const deck = [
    TELESCOPE,
    ...FAMILY.filter((w) => w.id !== TELESCOPE.id).slice(0, s.cfg.words - 1),
  ];
  const rotation = s.seats;
  const fixed: State = { ...s, deck, rotation, w: { ...s.w, word: TELESCOPE, guesser: 'p1' } };
  return skip(fixed, T0 + 1);
}

export function input(
  state: State,
  playerId: string,
  inp: Input,
  now = state.phase.startedAt + 1000,
  vip = false,
): State {
  const ev: GameEvent<Input> = {
    type: 'input',
    now,
    playerId,
    input: inp,
    ...(vip ? { vip } : {}),
  };
  return game.reduce(state, ev);
}

export function clue(state: State, playerId: string, ...texts: string[]): State {
  return input(state, playerId, { type: 'clue', texts });
}

export function skip(
  state: State,
  now = (state.phase.deadline ?? state.phase.startedAt) + 1,
): State {
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

/** Clues in seat order for p2..pN, then on to the next phase. */
export function withClues(state: State, texts: string[]): State {
  let s = state;
  texts.forEach((t, i) => {
    s = clue(s, `p${i + 2}`, t);
  });
  return s;
}

export const botRng = (seed = 1) => createRng(seed);

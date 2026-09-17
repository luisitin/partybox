// Shared helpers for the Blanks unit tests: hand-built events against the real reducer.
import type { GameEvent, VipGameAction } from '@partybox/game-sdk';
import { blackCard } from '../server/content';
import { game } from '../server/index';
import type { BlanksControllerView, BlanksTvView } from '../server/index';
import type { Input, Settings, State } from '../server/types';
import { controllerView, tvView } from '../server/views';

export const T0 = 1_700_000_000_000;

export const PLAYERS = [
  { id: 'ana', name: 'Ana', avatarId: 'fox', connected: true },
  { id: 'ben', name: 'Ben', avatarId: 'owl', connected: true },
  { id: 'cleo', name: 'Cleo', avatarId: 'frog', connected: true },
  { id: 'dev', name: 'Dev', avatarId: 'panda', connected: true },
  { id: 'eli', name: 'Eli', avatarId: 'cat', connected: true },
  { id: 'fay', name: 'Fay', avatarId: 'bear', connected: true },
];

export type StartOptions = Partial<Settings> & { players?: number; seed?: number };

/** A fresh game in `intro` of round 1. */
export function start(options: StartOptions = {}): State {
  const { players, seed, ...settings } = options;
  return game.init({
    players: PLAYERS.slice(0, players ?? 4),
    settings: { rounds: 3, answerSeconds: 60, judge: 'vote', decks: 'mild', ...settings },
    seed: seed ?? 1,
    now: T0,
  });
}

export function reduce(state: State, event: GameEvent<Input>): State {
  return game.reduce(state, event);
}

/** Fires the current phase's timer at its deadline (or `now`). */
export function timer(state: State, now = state.phase.deadline ?? state.phase.startedAt): State {
  return reduce(state, {
    type: 'timer',
    now,
    phaseId: state.phase.id,
    startedAt: state.phase.startedAt,
  });
}

export function vip(
  state: State,
  action: VipGameAction,
  now = state.phase.startedAt + 1000,
): State {
  return reduce(state, { type: 'vip', now, action });
}

export function connect(state: State, playerId: string, connected: boolean, now = T0): State {
  return reduce(state, { type: 'player', now, playerId, connected });
}

export function play(
  state: State,
  playerId: string,
  cards: string[],
  now = state.phase.startedAt + 1000,
): State {
  return reduce(state, { type: 'input', now, playerId, input: { type: 'play', cards } });
}

export function vote(
  state: State,
  playerId: string,
  slot: number,
  now = state.phase.startedAt + 1000,
): State {
  return reduce(state, { type: 'input', now, playerId, input: { type: 'vote', slot } });
}

/** The first `pick` cards of a player's hand. */
export function topCards(state: State, playerId: string): string[] {
  return (state.hands[playerId] ?? []).slice(0, blackCard(state.blackId).pick);
}

/** intro → answer. */
export function toAnswer(state: State): State {
  return state.phase.id === 'intro' ? timer(state) : state;
}

/** Every non-judge player plays the top of their hand, in id order (skipping `skip`). */
export function playAll(state: State, skip: readonly string[] = [], now?: number): State {
  let s = state;
  for (const id of Object.keys(state.players).sort()) {
    if (skip.includes(id) || id === s.czarId || s.phase.id !== 'answer') continue;
    s = play(s, id, topCards(s, id), now);
  }
  return s;
}

/** Runs every reveal step on its timer. */
export function readAll(state: State): State {
  let s = state;
  let guard = 0;
  while (s.phase.id === 'reveal') {
    if (guard++ > 40) throw new Error('reveal did not end');
    s = timer(s);
  }
  return s;
}

/** Everyone eligible votes for `slotFor(voterId)` (default: the first slot that is not theirs). */
export function voteAll(state: State, slotFor?: (voterId: string) => number): State {
  let s = state;
  for (const id of Object.keys(state.players).sort()) {
    if (s.phase.id !== 'judge') break;
    const slot = slotFor ? slotFor(id) : s.slots.findIndex((x) => x !== id);
    if (slot !== -1) s = vote(s, id, slot);
  }
  return s;
}

/** A whole round from `intro` to `result`: everybody plays, reads, votes. */
export function playRound(state: State, slotFor?: (voterId: string) => number): State {
  let s = readAll(playAll(toAnswer(state)));
  if (s.phase.id === 'judge') s = voteAll(s, slotFor);
  if (s.phase.id === 'judge') s = timer(s);
  return s;
}

/** Typed views (GameDefinition only promises the envelope). */
export function tv(state: State): BlanksTvView {
  return tvView(state, game.manifest.id);
}

export function cv(state: State, playerId: string): BlanksControllerView {
  return controllerView(state, game.manifest.id, playerId);
}

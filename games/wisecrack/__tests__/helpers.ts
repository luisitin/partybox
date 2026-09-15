// Shared helpers for the Wisecrack unit tests: hand-built events against the real reducer.
import type { GameEvent, VipGameAction } from '@partybox/game-sdk';
import { game } from '../server/index';
import type { WisecrackControllerView, WisecrackTvView } from '../server/index';
import type { Input, RoundPrompt, State } from '../server/types';
import { controllerView, tvView } from '../server/views';

export const T0 = 1_700_000_000_000;

export const PLAYERS = [
  { id: 'ana', name: 'Ana', avatarId: 'fox', connected: true },
  { id: 'ben', name: 'Ben', avatarId: 'owl', connected: true },
  { id: 'cleo', name: 'Cleo', avatarId: 'frog', connected: true },
  { id: 'dev', name: 'Dev', avatarId: 'panda', connected: true },
];

export interface StartOptions {
  rounds?: number;
  answerSeconds?: number;
  spicy?: boolean;
  players?: number;
  seed?: number;
}

/** A fresh game in `intro` of round 1. */
export function start(options: StartOptions = {}): State {
  return game.init({
    players: PLAYERS.slice(0, options.players ?? 4),
    settings: {
      rounds: options.rounds ?? 3,
      answerSeconds: options.answerSeconds ?? 60,
      spicy: options.spicy ?? false,
    },
    seed: options.seed ?? 1,
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

export function answer(
  state: State,
  playerId: string,
  promptId: string,
  text: string,
  now = state.phase.startedAt + 1000,
): State {
  return reduce(state, { type: 'input', now, playerId, input: { type: 'answer', promptId, text } });
}

export function vote(
  state: State,
  playerId: string,
  slot: number,
  now = state.phase.startedAt + 1000,
  promptId = current(state)?.id ?? 'nope',
): State {
  return reduce(state, { type: 'input', now, playerId, input: { type: 'vote', promptId, slot } });
}

export function current(state: State): RoundPrompt | null {
  return state.prompts[state.promptIndex] ?? null;
}

export function promptsOf(state: State, playerId: string): RoundPrompt[] {
  return state.prompts.filter((p) => p.authors.includes(playerId));
}

/** intro → answer. */
export function toAnswer(state: State): State {
  return state.phase.id === 'intro' ? timer(state) : state;
}

/** Every player answers every prompt with `textFor` (null = leave blank), in id order. */
export function answerAll(
  state: State,
  textFor: (playerId: string, prompt: RoundPrompt) => string | null = (id, p) =>
    `${p.id} by ${id.toUpperCase()}`,
  now?: number,
): State {
  let s = state;
  for (const id of Object.keys(state.players).sort())
    for (const p of promptsOf(state, id)) {
      const text = textFor(id, p);
      if (text !== null && s.phase.id === 'answer') s = answer(s, id, p.id, text, now);
    }
  return s;
}

/** Non-authors of the current prompt, in id order. */
export function voters(state: State): string[] {
  const prompt = current(state);
  if (!prompt) return [];
  return Object.keys(state.players)
    .sort()
    .filter((id) => !prompt.authors.includes(id));
}

/** Which slot a voter picks; `index` is the voter's position among the eligible voters. */
export type SlotFor = (voterId: string, index: number) => number;

/** Everyone eligible votes for `slotFor(voterId, index)` on the prompt on stage. */
export function voteAll(state: State, slotFor: SlotFor = () => 0): State {
  let s = state;
  voters(state).forEach((id, index) => {
    if (s.phase.id === 'vote') s = vote(s, id, slotFor(id, index));
  });
  return s;
}

/** Plays every vote/reveal of the round with `slotFor`, ending in `scores`. */
export function playVotes(state: State, slotFor: SlotFor = () => 0): State {
  let s = state;
  let guard = 0;
  while (s.phase.id === 'vote' || s.phase.id === 'reveal') {
    if (guard++ > 50) throw new Error('round did not end');
    s = s.phase.id === 'vote' ? voteAll(s, slotFor) : timer(s);
    if (s.phase.id === 'vote') s = timer(s); // nobody eligible → deadline
  }
  return s;
}

/** A whole round from `intro` to `scores`: everybody answers, everybody votes slot 0. */
export function playRound(state: State): State {
  return playVotes(answerAll(toAnswer(state)));
}

/** Typed views (GameDefinition only promises the envelope). */
export function tv(state: State): WisecrackTvView {
  return tvView(state, game.manifest.id);
}

export function cv(state: State, playerId: string): WisecrackControllerView {
  return controllerView(state, game.manifest.id, playerId);
}

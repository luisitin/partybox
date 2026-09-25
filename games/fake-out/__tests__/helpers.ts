// Shared helpers for the Fake-Out unit tests: hand-built events against the real reducer, plus a
// hand-made fact so scoring and leak tests do not depend on pack order.
import type { GameEvent, VipGameAction } from '@partybox/game-sdk';
import { game } from '../server/index';
import type { FakeOutControllerView, FakeOutTvView } from '../server/index';
import type { FactItem, Input, State } from '../server/types';

export const T0 = 1_700_000_000_000;

export const PLAYERS = [
  'ana',
  'ben',
  'cy',
  'dee',
  'eli',
  'fay',
  'gus',
  'hal',
  'ivy',
  'jo',
  'kai',
  'lu',
  'max',
  'nia',
  'oz',
  'pia',
].map((id, i) => ({
  id,
  name: id[0]?.toUpperCase() + id.slice(1),
  avatarId: `face-${i}`,
  connected: true,
}));

/** The spec's worked example (SPEC §3.2). */
export const PENGUIN: FactItem = {
  id: 'fo-animals-900',
  category: 'animals',
  kind: 'animal',
  fact: "Norway's King's Guard knighted a ___ named Nils Olav.",
  truth: {
    answer: 'penguin',
    accept: ['penguins', 'king penguin', 'emperor penguin', 'pengiun', 'penquin', 'pinguin'],
    reject: [],
  },
  houseLies: [
    'moose',
    'reindeer',
    'salmon',
    'horse',
    'polar bear',
    'puffin',
    'wolf',
    'golden retriever',
  ],
  source: 'Wikipedia: Nils Olav',
  verified: true,
};

export interface StartOptions {
  players?: number;
  seed?: number;
  settings?: Record<string, string | number | boolean>;
  /** Replace every drawn question with this fact (scoring tests). */
  fact?: FactItem;
  bots?: string[];
}

export function start(options: StartOptions = {}): State {
  const players = PLAYERS.slice(0, options.players ?? 5).map((p) =>
    options.bots?.includes(p.id) ? { ...p, bot: true } : p,
  );
  const state = game.init({
    players,
    settings: { reader: 'none', ...options.settings },
    seed: options.seed ?? 1,
    now: T0,
  });
  if (!options.fact) return state;
  const fact = options.fact;
  return { ...state, questions: state.questions.map(() => fact), q: { ...state.q, item: fact } };
}

export const reduce = (s: State, e: GameEvent<Input>): State => game.reduce(s, e);

export function timer(s: State, now = s.phase.deadline ?? s.phase.startedAt): State {
  return reduce(s, { type: 'timer', now, phaseId: s.phase.id, startedAt: s.phase.startedAt });
}

export function vip(s: State, action: VipGameAction, now = s.phase.startedAt + 500): State {
  return reduce(s, { type: 'vip', now, action });
}

export function input(s: State, playerId: string, i: Input, now = s.phase.startedAt + 1000): State {
  return reduce(s, { type: 'input', now, playerId, input: i });
}

export const lie = (s: State, p: string, text: string): State => input(s, p, { type: 'lie', text });
export const suggest = (s: State, p: string): State => input(s, p, { type: 'suggest' });
export const pick = (s: State, p: string, option: string): State =>
  input(s, p, { type: 'pick', option });
export const like = (s: State, p: string, option: string, on = true): State =>
  input(s, p, { type: 'like', option, on });

export function connect(
  s: State,
  p: string,
  connected: boolean,
  now = s.phase.startedAt + 800,
): State {
  return reduce(s, { type: 'player', now, playerId: p, connected });
}

export function speech(s: State, key: string, ms: number, now = s.phase.startedAt + 300): State {
  return reduce(s, { type: 'speech', now, key, ms });
}

/** question → lie. */
export function toLie(s: State): State {
  let out = s;
  while (out.phase.id === 'question') out = timer(out);
  return out;
}

/** Everyone listed lies; then the deadline opens the pick. */
export function lies(s: State, byPlayer: Record<string, string>): State {
  let out = s;
  for (const [p, text] of Object.entries(byPlayer))
    if (out.phase.id === 'lie') out = lie(out, p, text);
  return out.phase.id === 'lie' ? timer(out) : out;
}

/** The option whose display is `display` (case-insensitive). */
export function optionId(s: State, display: string): string {
  const o = s.q.options?.find((x) => x.display.toLowerCase() === display.toLowerCase());
  if (!o)
    throw new Error(`no option "${display}" in ${s.q.options?.map((x) => x.display).join(', ')}`);
  return o.id;
}

/** Each listed player picks the option shown as `display`; then the deadline opens the reveal. */
export function picks(s: State, byPlayer: Record<string, string>): State {
  let out = s;
  for (const [p, display] of Object.entries(byPlayer))
    if (out.phase.id === 'pick') out = pick(out, p, optionId(out, display));
  return out.phase.id === 'pick' ? timer(out) : out;
}

/** Runs the reveal to its end (the scores phase). */
export function throughReveal(s: State): State {
  let out = s;
  let guard = 0;
  while (out.phase.id === 'reveal') {
    if (guard++ > 40) throw new Error('reveal did not end');
    out = timer(out);
  }
  return out;
}

export const tv = (s: State): FakeOutTvView => game.tvView(s);
export const cv = (s: State, p: string): FakeOutControllerView => game.controllerView(s, p);

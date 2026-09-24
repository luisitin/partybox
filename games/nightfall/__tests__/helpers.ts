// Shared helpers for the Nightfall unit tests: hand-built events against the real reducer, and a
// way to fix who holds which role so each rule can be pinned exactly.
import { createRng } from '@partybox/game-sdk';
import type {
  GameEvent,
  InitContext,
  PlayerInfo,
  Settings,
  VipGameAction,
} from '@partybox/game-sdk';
import { game } from '../server/index';
import type { Input, Presence, Role, State } from '../server/types';

export const T0 = 1_700_000_000_000;
export const NAMES = [
  'Ana',
  'Ben',
  'Cy',
  'Dee',
  'Eli',
  'Fay',
  'Gus',
  'Hal',
  'Ivy',
  'Jo',
  'Kai',
  'Lu',
  'Max',
  'Nia',
  'Oz',
  'Pia',
];

/** Ids are lower-case names: 'ana', 'ben', … */
export function players(n: number, bots: readonly string[] = []): PlayerInfo[] {
  return NAMES.slice(0, n).map((name, i) => {
    const id = name.toLowerCase();
    const p: PlayerInfo = { id, name, avatarId: `face${i}`, connected: true };
    return bots.includes(id) ? { ...p, bot: true, avatarId: `robot:${i}` } : p;
  });
}

export interface StartOptions {
  n?: number;
  settings?: Settings;
  seed?: number;
  /** Fix the deal: id → role (everyone not listed is a villager). */
  roles?: Record<string, Role>;
  presence?: Presence;
  bots?: string[];
}

export function start(o: StartOptions = {}): State {
  const ctx = {
    players: players(o.n ?? 8, o.bots),
    settings: { reader: 'none', ...o.settings },
    seed: o.seed ?? 1,
    now: T0,
    ...(o.presence ? { presence: o.presence } : {}),
  } as InitContext;
  const s = game.init(ctx);
  if (!o.roles) return s;
  const roles: State['roles'] = {};
  for (const id of s.seats) roles[id] = o.roles[id] ?? 'villager';
  return { ...s, roles };
}

/** The classic eight: Ben + Cy wolves, Ana seer, Eli doctor. */
export const EIGHT: Record<string, Role> = { ben: 'wolf', cy: 'wolf', ana: 'seer', eli: 'doctor' };

export function reduce(state: State, event: GameEvent<Input>): State {
  return game.reduce(state, event);
}

export function input(state: State, playerId: string, inp: Input, now?: number): State {
  return reduce(state, {
    type: 'input',
    now: now ?? state.phase.startedAt + 500,
    playerId,
    input: inp,
  });
}

/** Fires the current phase's timer at its deadline. */
export function timer(state: State): State {
  const now = state.phase.deadline ?? state.phase.startedAt;
  return reduce(state, {
    type: 'timer',
    now,
    phaseId: state.phase.id,
    startedAt: state.phase.startedAt,
  });
}

/** Fires timers until the phase changes (steps and beats inside a phase are skipped over). */
export function finish(state: State): State {
  let s = state;
  const id = s.phase.id;
  for (let i = 0; i < 50 && s.phase.id === id; i++) s = timer(s);
  return s;
}

export function vip(state: State, action: VipGameAction, now?: number): State {
  return reduce(state, { type: 'vip', now: now ?? state.phase.startedAt + 1000, action });
}

/** Night picks, then the night ends (all done or its timer). */
export function night(state: State, picks: Record<string, string>): State {
  let s = state;
  for (const [by, target] of Object.entries(picks)) s = input(s, by, { type: 'night', target });
  return s.phase.id === 'night' ? timer(s) : s;
}

export function votes(state: State, ballots: Record<string, string>): State {
  let s = state;
  for (const [by, target] of Object.entries(ballots)) s = input(s, by, { type: 'vote', target });
  return s.phase.id === 'vote' || s.phase.id === 'runoff' ? timer(s) : s;
}

/** From `roles` straight into night 1. */
export function toNight(state: State): State {
  return state.phase.id === 'roles' ? timer(state) : state;
}

/** Plays dawn out to the next phase (day, hunter or end). */
export function throughDawn(state: State): State {
  return finish(state);
}

export function tv(state: State): string {
  return JSON.stringify(game.tvView(state));
}

export function phone(state: State, id: string): ReturnType<typeof game.controllerView> {
  return game.controllerView(state, id);
}

/** Plays a random game with every seat on the bot, collecting each state. */
export function playRandom(n: number, seed: number, settings = {}): State[] {
  const rng = createRng(seed);
  let s = game.init({
    players: players(n),
    settings: { reader: 'none', ...settings },
    seed,
    now: T0,
  });
  const out: State[] = [s];
  for (let i = 0; i < 4000 && s.phase.id !== 'done'; i++) {
    let acted = false;
    for (const id of s.seats) {
      if (!rng.chance(0.35)) continue;
      const inp = game.bot.sampleInput(s, id, rng);
      if (!inp) continue;
      s = reduce(s, { type: 'input', now: s.phase.startedAt + 100, playerId: id, input: inp });
      out.push(s);
      acted = true;
    }
    if (!acted && s.phase.deadline !== null) {
      const now = s.phase.deadline;
      s = reduce(s, { type: 'timer', now, phaseId: s.phase.id, startedAt: s.phase.startedAt });
      out.push(s);
    }
  }
  return out;
}

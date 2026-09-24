// Nightfall — hidden roles (SPEC: docs/game-pack/nightfall/SPEC.md). `game` is what the registry
// imports. One file per phase under ./phases; this file owns the phase order (`advance`, which is
// also what a VIP skip runs) and wires init / reduce / views / results / bot / speech / recap.
import { applyVip, gameManifestSchema, seedRng, setConnected } from '@partybox/game-sdk';
import type { GameDefinition, GameEvent, InitContext } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { botInput } from './bot';
import { enterDawn, reduceDawn } from './phases/dawn';
import { enterDay, reduceDay, shiftDay } from './phases/day';
import { enterDone, enterEnd, reduceEnd } from './phases/end';
import { enterHunter, reduceHunter } from './phases/hunter';
import { enterLastWords, reduceLastWords } from './phases/lastWords';
import { enterNight, reduceNight } from './phases/night';
import { enterRoles, reduceRoles } from './phases/roles';
import { enterVerdict, reduceVerdict } from './phases/verdict';
import { closeVote, enterRunoff, enterVote, reduceVote } from './phases/vote';
import { recap } from './recap';
import { allLivingDone, checkWin, isAlive, roleOf, tellAll } from './rules';
import { results } from './scoring';
import { deal, presenceOf, resolveCfg } from './setup';
import { speech } from './speech';
import { applySpeech } from './steps';
import { PHASES, inputSchema } from './types';
import type { Input, State } from './types';
import { phoneView } from './views-phone';
import type { NightfallControllerView } from './views-phone';
import { tvView } from './views-tv';
import type { NightfallTvView } from './views-tv';

export type { NightfallControllerView } from './views-phone';
export type { NightfallTvView } from './views-tv';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

function init(ctx: InitContext): State {
  const presence = presenceOf(ctx);
  const cfg = resolveCfg(ctx.settings, presence);
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const seats = ctx.players.map((p) => p.id);
  const [roles, rng] = deal(seats, cfg, seedRng(ctx.seed));
  const stats: State['stats'] = {};
  for (const id of seats)
    stats[id] = { votesOnWolves: 0, votesReceived: 0, daysAlive: 0, saves: 0, wolvesFound: 0 };
  const base: State = {
    phase: { id: 'roles', startedAt: ctx.now, deadline: null },
    rng,
    players,
    cfg,
    presence,
    seats,
    roles,
    alive: [...seats],
    dead: [],
    leaving: [],
    day: 0,
    ready: [],
    picks: {},
    lastProtected: null,
    victim: null,
    saved: false,
    tally: [],
    seerLog: [],
    board: [],
    votes: {},
    runoff: null,
    verdict: null,
    lastWords: null,
    hunterPending: null,
    hunterFrom: null,
    shot: null,
    step: 0,
    stepAt: ctx.now,
    dayEndsAt: null,
    beats: [],
    winner: null,
    reason: null,
    nights: [],
    days: [],
    stats,
    speechMs: {},
    ghostsDay: null,
  };
  return enterRoles(base, ctx.now);
}

/** After the win check: dawn leads to the day, a verdict to the next night. */
function proceed(state: State, now: number, from: 'dawn' | 'verdict'): State {
  const win = checkWin(state, { afterLastVote: from === 'verdict' });
  if (win) return enterEnd(state, now, win);
  return from === 'dawn' ? enterDay(state, now) : enterNight(state, now);
}

/** A dead hunter shoots before the win check (SPEC §10.7). */
function afterDeaths(state: State, now: number, from: 'dawn' | 'verdict'): State {
  if (state.hunterPending) return enterHunter(state, now, from);
  return proceed(state, now, from);
}

function afterVerdict(state: State, now: number): State {
  const out = state.verdict?.out ?? null;
  if (out && roleOf(state, out) === 'jester')
    return enterEnd(
      state,
      now,
      checkWin(state, { jesterOut: true }) ?? { winner: 'jester', reason: 'jester' },
    );
  const typed = state.presence.mode === 'remote-text';
  const left = state.dead.some((d) => d.id === out && d.how === 'left');
  if (out && typed && !left) return enterLastWords(state, now);
  return afterDeaths(state, now, 'verdict');
}

/** The phase order. What a deadline does — and what a VIP skip does (docs/GAME_CONTRACT.md). */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'roles':
      return enterNight(state, now);
    case 'night':
      return enterDawn(state, now);
    case 'dawn':
      return afterDeaths(tellAll(state), now, 'dawn');
    case 'hunter': {
      const from = state.hunterFrom ?? 'dawn';
      return proceed(tellAll({ ...state, hunterPending: null, hunterFrom: null }), now, from);
    }
    case 'day':
      return enterVote(state, now);
    case 'vote':
    case 'runoff': {
      const closed = closeVote(state);
      return 'ballots' in closed
        ? enterVerdict(state, now, closed)
        : enterRunoff(state, now, closed.runoff);
    }
    case 'verdict':
      return afterVerdict(tellAll(state), now);
    case 'lastWords':
      return afterDeaths(state, now, 'verdict');
    case 'end':
      return enterDone(state, now);
    default:
      return state;
  }
}

/** Who has finished the current input phase (to re-check "everyone done" after a drop). */
function doneIds(state: State): string[] | null {
  switch (state.phase.id) {
    case 'night':
      return Object.keys(state.picks);
    case 'vote':
    case 'runoff':
      return Object.keys(state.votes);
    default:
      return null;
  }
}

/** A drop: the phase may now be done. Leaving for good: they die at the next announcement. */
function onPlayer(state: State, event: Extract<GameEvent<Input>, { type: 'player' }>): State {
  let s = setConnected(state, event);
  const id = event.playerId;
  if (event.gone && isAlive(s, id) && !s.leaving.includes(id))
    s = { ...s, leaving: [...s.leaving, id] };
  if (s === state || s.phase.paused || event.connected) return s;
  const done = doneIds(s);
  return done && allLivingDone(s, done) ? advance(s, event.now) : s;
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return onPlayer(state, event);
  if (event.type === 'speech') return applySpeech(state, event.key, event.ms, event.now);
  let s = state;
  if (event.type === 'vip' && event.action !== 'pause' && s.phase.paused)
    s = shiftDay(s, Math.max(0, event.now - s.phase.paused.at));
  const vip = applyVip(s, event, { skip: advance, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'roles':
      return reduceRoles(state, event, advance);
    case 'night':
      return reduceNight(state, event, advance);
    case 'dawn':
      return reduceDawn(state, event, advance);
    case 'hunter':
      return reduceHunter(state, event, advance);
    case 'day':
      return reduceDay(state, event, advance);
    case 'vote':
    case 'runoff':
      return reduceVote(state, event, advance);
    case 'verdict':
      return reduceVerdict(state, event, advance);
    case 'lastWords':
      return reduceLastWords(state, event, advance);
    case 'end':
      return reduceEnd(state, event, advance);
    default:
      return state;
  }
}

// The view generics make `game.tvView(state).stage` type-check in tests and client code.
export const game: GameDefinition<State, Input, NightfallTvView, NightfallControllerView> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView,
  controllerView: phoneView,
  results,
  bot: {
    sampleInput(state, playerId, rng) {
      // Whether this seat is a bot is the one fact beyond its phone: only a bot waits for humans.
      const selfBot = state.players[playerId]?.bot === true;
      return botInput(phoneView(state, playerId), () => rng.float(), selfBot);
    },
  },
  speech,
  recap,
};

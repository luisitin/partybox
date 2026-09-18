// Bingo — 75-ball bingo with free daubing and a public check. `game` is what the registry
// imports. One file per phase under ./phases; this file wires init / reduce / views / results /
// bot together and owns the phase ORDER (docs/GAME_CONTRACT.md).
import { applyVip, gameManifestSchema, seedRng, setConnected } from '@partybox/game-sdk';
import type {
  GameDefinition,
  GameEvent,
  InitContext,
  Settings as RawSettings,
} from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { sampleInput } from './bot';
import { enterBingo, reduceBingo } from './phases/bingo';
import { enterCheck, reduceCheck } from './phases/check';
import { enterIntro, reduceIntro } from './phases/intro';
import { enterPlay, reducePlay } from './phases/play';
import { enterDone, enterScoreboard, reduceScoreboard } from './phases/scoreboard';
import { results } from './scoring';
import { DECK, MAX_CARDS, MAX_ROUNDS, PATTERNS, PHASES, inputSchema } from './types';
import type { Input, Pattern, Settings, State } from './types';
import { controllerView, tvView } from './views';
import type { BingoControllerView, BingoTvView } from './views';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

function asPattern(value: unknown, fallback: Pattern): Pattern {
  return (PATTERNS as readonly string[]).includes(String(value)) ? (value as Pattern) : fallback;
}

/** Settings arrive validated against the manifest spec; this only shapes them (per-round list). */
export function readSettings(raw: RawSettings): Settings {
  const rounds = Math.min(MAX_ROUNDS, Math.max(1, Math.round(Number(raw['rounds'] ?? 3))));
  const patterns: Pattern[] = [];
  for (let i = 1; i <= rounds; i++) patterns.push(asPattern(raw[`round${i}`], 'line'));
  return {
    rounds,
    patterns,
    cards: Math.min(MAX_CARDS, Math.max(1, Math.round(Number(raw['cards'] ?? 1)))),
    callSeconds: Math.min(12, Math.max(3, Number(raw['callSeconds'] ?? 6))),
    spicy: raw['spicy'] === true,
    showBoard: raw['showBoard'] === true,
    showPrevious: raw['showPrevious'] !== false,
  };
}

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  const wins: Record<string, number> = {};
  for (const p of ctx.players) {
    players[p.id] = p;
    wins[p.id] = 0;
  }
  const base: State = {
    phase: { id: 'intro', startedAt: ctx.now, deadline: null },
    rng: seedRng(ctx.seed),
    players,
    settings: readSettings(ctx.settings),
    round: {
      number: 0,
      pattern: 'line',
      deck: [],
      drawn: 0,
      cards: {},
      daubs: {},
      claim: null,
      waitForCall: {},
      winnerId: null,
      won: {},
      bingos: 0,
      patternBingos: 0,
      decision: null,
      arm: null,
      queue: [],
      menus: [],
      resumeAt: null,
      swapped: {},
    },
    wins,
    history: [],
    winsAtRoundStart: { ...wins },
  };
  return enterIntro(base, 1, ctx.now);
}

/** The next number — or, once all 75 are called, the end of the round with no winner. */
function nextCallOrEnd(state: State, now: number): State {
  return state.round.drawn >= DECK ? enterBingo(state, now, null, null) : enterPlay(state, now);
}

function afterBingo(state: State, now: number): State {
  return state.round.number < state.settings.rounds
    ? enterScoreboard(state, now)
    : enterDone(state, now);
}

function nextRound(state: State, now: number): State {
  return enterIntro(state, state.round.number + 1, now);
}

/** The phase order. What a deadline does — and what a VIP skip does (docs/GAME_CONTRACT.md). */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'intro':
      return enterPlay(state, now);
    case 'play': // skip = "next number, now"
    case 'check':
      return nextCallOrEnd(state, now);
    case 'bingo':
      return afterBingo(state, now);
    case 'scoreboard':
      return nextRound(state, now);
    default:
      return state;
  }
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return setConnected(state, event);
  // VIP skip = the phase's normal exit; VIP end always jumps to done (bingos as they stand).
  const vip = applyVip(state, event, { skip: advance, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, enterPlay);
    case 'play':
      return reducePlay(state, event, { next: nextCallOrEnd, win: enterBingo, check: enterCheck });
    case 'check':
      return reduceCheck(state, event, nextCallOrEnd);
    case 'bingo':
      return reduceBingo(state, event, {
        next: afterBingo,
        resume: (s, now) => enterPlay(s, now, true),
      });
    case 'scoreboard':
      return reduceScoreboard(state, event, nextRound);
    default:
      return state;
  }
}

export const game: GameDefinition<State, Input, BingoTvView, BingoControllerView> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView: (state) => tvView(state, manifest.id),
  controllerView: (state, playerId) => controllerView(state, manifest.id, playerId),
  results,
  bot: { sampleInput },
};

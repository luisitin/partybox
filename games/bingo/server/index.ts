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
import { credit, enterBingo, reduceBingo } from './phases/bingo';
import { enterCheck, reduceCheck } from './phases/check';
import { enterIntro, reduceIntro, settleIntro } from './phases/intro';
import { enterPlay, enterResume, reducePlay, resumeAfterHold } from './phases/play';
import {
  enterDone,
  enterFinal,
  enterScoreboard,
  reduceFinal,
  reduceScoreboard,
} from './phases/scoreboard';
import { results } from './scoring';
import { menusOpen } from './claims';
import { DECK, MAX_CARDS, MAX_ROUNDS, PATTERNS, PHASES, READERS, inputSchema } from './types';
import type { Input, Pattern, Reader, Settings, State } from './types';
import { controllerView, tvView } from './views';
import type { BingoControllerView, BingoTvView } from './views';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

function asPattern(value: unknown, fallback: Pattern): Pattern {
  return (PATTERNS as readonly string[]).includes(String(value)) ? (value as Pattern) : fallback;
}

/** Settings arrive validated against the manifest spec; this only shapes them (per-round list). */
/** I-112 B/C: the two display flags derived consistently (the board implies the last call;
 *  the three-way "calls shown" maps onto the same flags). */
function callFlags(raw: RawSettings): { showBoard: boolean; showPrevious: boolean } {
  const mode = raw['callsShown'];
  if (mode === 'none') return { showBoard: false, showPrevious: false };
  if (mode === 'board') return { showBoard: true, showPrevious: true };
  if (mode === 'last') return { showBoard: false, showPrevious: true };
  const showBoard = raw['showBoard'] === true;
  return { showBoard, showPrevious: showBoard || raw['showPrevious'] !== false };
}

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
    ...callFlags(raw),
    showClose: raw['showClose'] === true,
    // READER-VOICES: Bingo's default reader is the Soft-Spoken Woman (Kokoro "sky").
    reader: (READERS as readonly unknown[]).includes(raw['reader'])
      ? (raw['reader'] as Reader)
      : 'sky',
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
      judged: false,
      judgedAt: null,
      calledAt: null,
      arm: null,
      queue: [],
      menus: [],
      resumeAt: null,
      resumeAgain: false,
      resumeBy: null,
      swapped: {},
      ready: [],
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
    : enterFinal(state, now);
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
    case 'final': // skip = straight to the results
      return enterDone(state, now);
    default:
      return state;
  }
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player')
    return afterPlayerChange(state, setConnected(state, event), event.now);
  // VIP skip = the phase's normal exit; VIP end always jumps to done (bingos as they stand).
  // A win the TV has not scored yet (the VIP cut the reveal short) still counts — on skip and end
  // only: a pause must not score it (the phones would show the verdict mid-reveal — loop 294).
  const cutShort =
    state.phase.id === 'bingo' &&
    event.type === 'vip' &&
    (event.action === 'skip' || event.action === 'end');
  const vip = applyVip(cutShort ? credit(state, event.now) : state, event, {
    skip: advance,
    end: enterDone,
  });
  if (vip) return shiftResume(state, vip, event);
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, enterPlay);
    case 'play':
      return reducePlay(state, event, { next: nextCallOrEnd, win: enterBingo, check: enterCheck });
    case 'check':
      return reduceCheck(state, event);
    case 'bingo':
      return reduceBingo(state, event, {
        next: afterBingo,
        resume: enterResume,
      });
    case 'scoreboard':
      return reduceScoreboard(state, event, nextRound);
    case 'final':
      return reduceFinal(state, event);
    default:
      return state;
  }
}

/**
 * A VIP resume shifts `phase.deadline` by the pause (game-sdk); the game's own clocks that run to
 * that deadline — the 3 · 2 · 1's `resumeAt` — shift with it, or the ring would end early and the
 * number drop with no ring (loop 294). A resume mid-call (I-030, the owner: "it should repeat
 * the call it left on") then takes the hold's path: the 3 · 2 · 1 and the number that was up
 * AGAIN, before a full interval — the room was not listening when it dropped. A held caller
 * (no deadline: a menu is open) stays held; check / bingo / scoreboard keep the plain shift.
 */
function shiftResume(before: State, after: State, event: GameEvent<Input>): State {
  if (event.type !== 'vip' || event.action !== 'resume') return after;
  // The pause's length: the deadline's shift, or the pause itself when the phase had no deadline
  // (a held caller — the dibs window still needs it).
  const shift =
    before.phase.deadline !== null && after.phase.deadline !== null
      ? after.phase.deadline - before.phase.deadline
      : before.phase.paused
        ? event.now - before.phase.paused.at
        : 0;
  const round = after.round;
  const shifted =
    shift <= 0
      ? after
      : {
          ...after,
          round: {
            ...round,
            resumeAt: round.resumeAt === null ? null : round.resumeAt + shift,
            // Dibs (a 3 s window to tap again) survive a pause whole (loop 295).
            arm: round.arm === null ? null : { ...round.arm, until: round.arm.until + shift },
          },
        };
  return after.phase.id === 'play' && after.phase.deadline !== null
    ? resumeAfterHold(shifted, event.now)
    : shifted;
}

/**
 * A player with the card-style menu open who drops out would leave the caller held for good
 * (`menusOpen` ignores the disconnected): the last open menu going away resumes calling with the
 * usual 3 · 2 · 1 (loop 294).
 */
function afterPlayerChange(before: State, after: State, now: number): State {
  // A straggler leaving the card-pick step: everyone left is ready → the 3 · 2 · 1 (loop 344).
  if (after.phase.id === 'intro') return settleIntro(after, now);
  const held = after.phase.id === 'play' && after.phase.deadline === null;
  if (!held || !menusOpen(before) || menusOpen(after)) return after;
  // From the drop, not the hold's start (loop 329): a hold longer than the ring left the deadline
  // in the past — the next number fired at once, no 3 · 2 · 1.
  return resumeAfterHold(after, now);
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
  // I-546 B: where the game is, for an early end's results
  progress: (state) => ({ at: state.round.number, total: state.settings.rounds, unit: 'round' }),
  bot: { sampleInput },
};

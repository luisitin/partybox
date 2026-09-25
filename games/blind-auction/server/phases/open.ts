// Phase "open" (two beats, ADR-033): step 0 — every bet lands on the table, face and stake on the
// content it backs; step 1 — the box turns, its content lands with its fixed line ("It's a
// trap!"), right calls are paid stake × the odds (× 2 for the grand box), wrong ones lose their
// stake. Coins are settled on entry but the room sees them move only at step 1 (views gate it).
// A reading ("Two winners!") plays after the fixed line if ready in time; the box waits for it.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { tierOf } from '../odds';
import { returned } from '../returns';
import { fixedRequest, lineOf, openRequest } from '../speech';
import {
  EVENT_MS,
  OPEN_HOLD_MS,
  OPEN_LINE_AT_MS,
  OPEN_VOICE_MAX_MS,
  VOICE_BEAT_MS,
  betsMs,
} from '../timing';
import type { Input, State, Stats, Transition } from '../types';

const VOICE_LATE_MS = 3_000;

/** Stakes and winnings for every bet on the current box. */
export function settle(state: State): State {
  const round = state.boxes[state.r.idx];
  if (!round) return state;
  const { box } = round;
  const coins = { ...state.coins };
  const stats: Record<string, Stats> = { ...state.stats };
  for (const [id, bet] of Object.entries(state.r.bets)) {
    if (bet.amount <= 0 || !Object.hasOwn(coins, id)) continue;
    const s = stats[id] ?? { biggestBet: 0, biggestWin: 0, longShots: 0, calls: 0, lost: 0 };
    const option = box.options[bet.option];
    const back = returned(state, id);
    // A right call is one that paid more than the stake (keno's one "option" always matches).
    const won = back > bet.amount;
    coins[id] = Math.max(0, (coins[id] ?? 0) - bet.amount + back);
    stats[id] = {
      biggestBet: Math.max(s.biggestBet, bet.amount),
      biggestWin: Math.max(s.biggestWin, back - bet.amount),
      longShots:
        s.longShots + (won && option !== undefined && tierOf(option.chance) === 'RARE' ? 1 : 0),
      calls: s.calls + (won ? 1 : 0),
      lost: s.lost + (won ? 0 : bet.amount),
    };
  }
  return { ...state, coins, stats };
}

export function staked(state: State): number {
  return Object.values(state.r.bets).filter((b) => b.amount > 0).length;
}

export function enterOpen(state: State, now: number): State {
  const settled = settle({
    ...state,
    notices: {},
    r: { ...state.r, step: 0, voiceAt: null, turnedAt: null },
  });
  // A live event runs once the bets are down: the payouts wait for its finish.
  const kind = state.boxes[state.r.idx]?.box.event;
  return enterPhase(settled, 'open', now, betsMs(staked(state)) + (kind ? EVENT_MS[kind] : 0));
}

/** When the reading may start: after the fixed line has been said. */
function readingAt(state: State, now: number, turnedAt: number): number {
  const key = fixedRequest(state, lineOf(state))?.key;
  const lineMs = key ? Math.max(0, state.speechMs[key] ?? 0) : 0;
  return Math.max(now, turnedAt + OPEN_LINE_AT_MS + lineMs + 150);
}

function voiceEnd(state: State, turnedAt: number): number {
  const key = openRequest(state)?.key;
  const ms = key ? (state.speechMs[key] ?? -1) : -1;
  if (state.r.voiceAt === null || ms < 0) return 0;
  return Math.min(
    turnedAt + OPEN_HOLD_MS + OPEN_VOICE_MAX_MS,
    state.r.voiceAt + ms + VOICE_BEAT_MS,
  );
}

function turnedAt(state: State): number {
  return state.r.turnedAt ?? state.phase.startedAt;
}

/** ADR-045: the reading is ready. At step 1, if it is not too late, it plays and the box waits. */
export function openSpeech(state: State, key: string, ms: number, now: number): State {
  const { phase, r } = state;
  if (phase.id !== 'open' || phase.paused || r.step !== 1 || r.voiceAt !== null || ms < 0)
    return state;
  const turned = turnedAt(state);
  if (openRequest(state)?.key !== key || now > turned + VOICE_LATE_MS) return state;
  const voiced: State = { ...state, r: { ...r, voiceAt: readingAt(state, now, turned) } };
  return {
    ...voiced,
    phase: { ...phase, deadline: Math.max(phase.deadline ?? now, voiceEnd(voiced, turned)) },
  };
}

export function reduceOpen(state: State, event: GameEvent<Input>, next: Transition): State {
  if (!isTimerFor(state, event)) return state;
  if (state.r.step === 1) return next(state, event.now);
  const opened: State = {
    ...state,
    phase: { ...state.phase, deadline: event.now + OPEN_HOLD_MS },
    r: { ...state.r, step: 1, turnedAt: event.now },
  };
  // A reading already made (a quick synth) starts on its beat right away.
  const key = openRequest(opened)?.key;
  const ms = key ? state.speechMs[key] : undefined;
  return key && ms !== undefined && ms >= 0 ? openSpeech(opened, key, ms, event.now) : opened;
}

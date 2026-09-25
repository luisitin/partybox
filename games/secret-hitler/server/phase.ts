// Helpers every phase file shares (phase files never import each other, so this is where the
// common pieces live): entering a phase, a fresh round, the public history, and small setters.
import { enterPhase, pick } from '@partybox/game-sdk';
import type { HeadlineEvent } from '../content/schema';
import { HEADLINES } from './content';
import { stepMs } from './rules';
import type { HistoryRow, Party, Round, State, TimedStep } from './types';

/**
 * Enters a phase. A D3 announcement made by the timeout that ended the last phase stays up for
 * this one (`fresh` → shown), then clears; D4's Last call never carries over.
 */
export function go(state: State, id: string, now: number, ms: number | null): State {
  const announce = state.announce?.fresh ? { ...state.announce, fresh: false } : null;
  return enterPhase(
    { ...state, announce, round: { ...state.round, lastCall: false } },
    id,
    now,
    ms,
  );
}

/** D1: a timed step's length at the room's pace. */
export function timed(state: State, step: TimedStep): number {
  return stepMs(state.cfg.pace, step);
}

export function emptyRound(n: number, president: string): Round {
  return {
    n,
    president,
    nominee: null,
    votes: {},
    elected: null,
    draw: null,
    passed: null,
    vetoRequested: false,
    vetoAgreed: null,
    enacted: null,
    chaosCard: null,
    chaosAfter: null,
    power: null,
    lastCall: false,
  };
}

export function withRound(state: State, patch: Partial<Round>): State {
  return { ...state, round: { ...state.round, ...patch } };
}

/** Marks a random choice made by a timeout (D3); `who` only when the result may be named. */
export function announced(state: State, who: string | null): State {
  return { ...state, announce: { who, fresh: true } };
}

const HISTORY_CAP = 40;

/** Adds or updates the Record row of the current round (§10.3), keeping the last 40. */
export function patchHistory(state: State, patch: Partial<HistoryRow>): State {
  const r = state.round;
  const at = state.history.findIndex((h) => h.n === r.n);
  const base: HistoryRow =
    at >= 0
      ? (state.history[at] as HistoryRow)
      : {
          n: r.n,
          president: r.president,
          chancellor: r.nominee ?? '',
          ja: 0,
          nein: 0,
          elected: false,
          enacted: null,
          veto: false,
          chaos: null,
        };
  const row = { ...base, ...patch };
  const history =
    at >= 0
      ? state.history.map((h, i) => (i === at ? row : h))
      : [...state.history, row].slice(-HISTORY_CAP);
  return { ...state, history };
}

/** Puts a card on its track (R20: any enactment resets the tracker). */
export function enactOnBoard(state: State, card: Party): State {
  const board = { ...state.board, [card]: state.board[card] + 1 };
  return { ...state, board, tracker: 0, vetoUnlocked: state.vetoUnlocked || board.F >= 5 };
}

/** The newspaper prints a new headline for a public event (one of 6–8, with the rng). */
export function headlined(state: State, event: HeadlineEvent): State {
  const [headline, rng] = pick(state.rng, HEADLINES[event]);
  return { ...state, headline, rng };
}

export function without<T>(list: readonly T[], item: T): T[] {
  return list.filter((x) => x !== item);
}

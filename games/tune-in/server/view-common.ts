// What both views share: chip statuses, the public turn header, the reveal's facts and the
// huddle's live markers. Secrets go out under keys no other field shares (`bullseyeAt`,
// `huddleMarks`, `revealDials`, `revealCalls`) so the contract suite can check them by name.
import type { PlayerStatus } from '@partybox/game-sdk';
import { BANDS, bandPoints, coopRating, teamCall, targetSide } from './scoring';
import { verdictLine } from './speech';
import type { LineId } from './speech';
import { callersOf, guessersOf, plannedTurns } from './turn';
import type { Mode, Side, State, TargetSize, TeamId } from './types';

export interface Mark {
  id: string;
  pos: number;
}

export interface TurnHeader {
  mode: Mode;
  n: number;
  total: number;
  psychic: string;
  team: TeamId | null;
  catchUp: boolean;
  spectrumId: string;
  left: string;
  right: string;
  /** The same ends in Spanish (a Spanish phone or TV shows these; the reading stays English). */
  es: { left: string; right: string };
  /** Client only (client/ends.ts): the English ends, when a Spanish screen swapped them in. */
  en?: { left: string; right: string };
  clue: string | null;
  size: TargetSize;
  /** The edges of the 4 / 3 / 2 bands for this target size. */
  bands: [number, number, number];
  /** A reader is on: the stage waits a moment for a line before it lands its text. */
  voiced: boolean;
  /** Live dials show during the dial phase (teams / co-op with the huddle on). */
  huddle: boolean;
}

export interface RevealFacts {
  step: 0 | 1;
  void: boolean;
  bullseyeAt: number;
  revealDials: { id: string; pos: number; pts: number }[];
  needle: number | null;
  needlePts: number | null;
  /** Teams: the calling team's majority, the taps each way and whether it scored. */
  revealCalls: { side: Side | null; left: number; right: number; scored: boolean } | null;
  teamPoints: Record<TeamId, number>;
  /** The psychic's points (solo) — the guessers' average, perfect tune included. */
  psychicPts: number;
  perfect: boolean;
  verdict: LineId | null;
}

export function isRevealed(state: State): boolean {
  const id = state.phase.id;
  return id === 'reveal' || id === 'scores' || id === 'done';
}

export function header(state: State): TurnHeader {
  const { turn } = state;
  const spectrum = state.spectra[turn.spectrum];
  const [four, three, two] = BANDS[state.cfg.targetSize];
  return {
    mode: state.mode,
    n: turn.n,
    total: plannedTurns(state),
    psychic: turn.psychic,
    team: turn.team,
    catchUp: turn.catchUp,
    spectrumId: spectrum?.id ?? '',
    left: spectrum?.left ?? '',
    right: spectrum?.right ?? '',
    es: spectrum?.es ?? { left: spectrum?.left ?? '', right: spectrum?.right ?? '' },
    clue: turn.clue,
    size: state.cfg.targetSize,
    bands: [four, three, two],
    voiced: state.cfg.reader !== 'none',
    huddle: state.cfg.huddle && state.mode !== 'solo',
  };
}

export function statusOf(state: State): (id: string) => PlayerStatus {
  const { turn } = state;
  const phase = state.phase.id;
  const guessers = phase === 'dial' ? guessersOf(state) : [];
  const callers = phase === 'call' ? callersOf(state) : [];
  return (id) => {
    if (phase === 'clue') return id === turn.psychic ? 'active' : 'waiting';
    if (phase === 'dial' && guessers.includes(id))
      return turn.locked.includes(id) ? 'submitted' : 'active';
    if (phase === 'call' && callers.includes(id))
      return Object.hasOwn(turn.calls, id) ? 'submitted' : 'active';
    return 'waiting';
  };
}

/** The huddle's live markers (teams / co-op with the huddle on), in seat order. */
export function huddleMarks(state: State): Mark[] {
  return guessersOf(state)
    .filter((id) => Object.hasOwn(state.turn.dials, id))
    .map((id) => ({ id, pos: state.turn.dials[id] as number }));
}

export function liveHuddle(state: State): boolean {
  return state.cfg.huddle && state.mode !== 'solo' && state.phase.id === 'dial';
}

export function revealFacts(state: State): RevealFacts {
  const { turn, cfg } = state;
  const dialled = guessersOf(state).filter((id) => Object.hasOwn(turn.dials, id));
  const needlePts =
    turn.needle === null ? null : bandPoints(turn.needle - turn.target, cfg.targetSize);
  let calls: RevealFacts['revealCalls'] = null;
  if (state.mode === 'teams' && turn.needle !== null) {
    const callers = callersOf(state);
    const count = (side: Side): number => callers.filter((id) => turn.calls[id] === side).length;
    const side = teamCall(state);
    const scored =
      side !== null && needlePts !== 4 && targetSide(turn.target, turn.needle) === side;
    calls = { side, left: count('left'), right: count('right'), scored };
  }
  return {
    step: turn.step,
    void: turn.void,
    bullseyeAt: turn.target,
    revealDials: dialled.map((id) => ({
      id,
      pos: turn.dials[id] as number,
      pts: bandPoints((turn.dials[id] as number) - turn.target, cfg.targetSize),
    })),
    needle: turn.needle,
    needlePts,
    revealCalls: calls,
    teamPoints: turn.teamPoints,
    psychicPts: state.mode === 'solo' ? (turn.points[turn.psychic] ?? 0) : (needlePts ?? 0),
    perfect: verdictLine(state) === 'perfect',
    verdict: verdictLine(state),
  };
}

export interface CoopMeter {
  total: number;
  max: number;
  rating: ReturnType<typeof coopRating>;
}

export function coopMeter(state: State): CoopMeter {
  return {
    total: state.coopTotal,
    max: plannedTurns(state) * 4,
    rating: coopRating(state.coopTotal, Math.max(1, state.played)),
  };
}

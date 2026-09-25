// controllerView (spec §5.10): what one phone may know. The target only on the psychic's phone
// until the reveal; a solo dial only on its own phone; huddle markers only on the active side;
// a call only on its caller's phone. The player's own result waits for the TV's points beat.
import { controllerEnvelope } from '@partybox/game-sdk';
import type { ControllerView } from '@partybox/game-sdk';
import { needleOf, psychicPoints } from './scoring';
import { stageReading } from './speech';
import { callersOf, guessersOf, isOver, teamOf } from './turn';
import type { Rejection, Side, State, TeamId } from './types';
import {
  coopMeter,
  header,
  huddleMarks,
  isRevealed,
  liveHuddle,
  revealFacts,
  statusOf,
  readyUp,
} from './view-common';
import type { CoopMeter, Mark, RevealFacts, TurnHeader } from './view-common';
import type { Reading } from './tv-view';

export type Role = 'psychic' | 'guesser' | 'caller' | 'waiting';

/** The player's own result, once the TV has shown the points. */
export interface MyResult {
  pts: number;
  /** How far my dial was (null: I didn't dial, or I was the psychic). */
  away: number | null;
  /** Solo psychic: the guessers' points summed, how many dialled, and the perfect-tune bonus. */
  psychic: { sum: number; n: number; perfect: boolean } | null;
}

export interface TuneControllerView extends ControllerView {
  role: Role;
  myTeam: TeamId | null;
  turn: TurnHeader;
  /** SECRET: the psychic's phone only, until the TV's reveal. */
  bullseyeAt?: number;
  myDial: number | null;
  locked: boolean;
  /** Huddle, the active side only: teammates' live dials. */
  huddleMarks?: Mark[];
  needle: number | null;
  myCall: Side | null;
  rejected: Rejection | null;
  reveal?: RevealFacts;
  mine: MyResult | null;
  team: Record<TeamId, number>;
  winAt: number;
  coop: CoopMeter | null;
  last: boolean;
  reading: Reading | null;
  /** The intro's ready-up [cc45f4]: have I tapped I'm ready, and how many of the room have. */
  ready: boolean;
  readyCount: number;
  readyHere: number;
  startAt: number | null;
}

function roleOf(state: State, id: string): Role {
  const { turn } = state;
  const phase = state.phase.id;
  if ((phase === 'clue' || phase === 'dial') && id === turn.psychic) return 'psychic';
  if (phase === 'dial' && guessersOf(state).includes(id)) return 'guesser';
  if (phase === 'call' && callersOf(state).includes(id)) return 'caller';
  return 'waiting';
}

/** The active side: everyone who dials this turn, and their psychic. */
function onActiveSide(state: State, id: string): boolean {
  return id === state.turn.psychic || guessersOf(state).includes(id);
}

function pointsShown(state: State): boolean {
  const phase = state.phase.id;
  return (phase === 'reveal' && state.turn.step === 1) || phase === 'scores' || phase === 'done';
}

function myResult(state: State, id: string): MyResult | null {
  const { turn } = state;
  if (!pointsShown(state) || turn.void || !Object.hasOwn(state.players, id)) return null;
  const facts = revealFacts(state);
  if (id === turn.psychic) {
    const pts = facts.revealDials.map((d) => d.pts);
    const sum = pts.reduce((a, b) => a + b, 0);
    const solo = state.mode === 'solo';
    return {
      pts: solo ? psychicPoints(pts) : facts.psychicPts,
      away: null,
      psychic: solo ? { sum, n: pts.length, perfect: facts.perfect } : null,
    };
  }
  const dial = facts.revealDials.find((d) => d.id === id);
  if (!dial) return null;
  const pts = state.mode === 'solo' ? dial.pts : (facts.needlePts ?? 0);
  return { pts, away: Math.abs(dial.pos - turn.target), psychic: null };
}

function readyFor(
  state: State,
  id: string,
): Pick<TuneControllerView, 'ready' | 'readyCount' | 'readyHere' | 'startAt'> {
  const up = readyUp(state);
  return {
    ready: up.ready.includes(id),
    readyCount: up.ready.length,
    readyHere: up.here,
    startAt: up.startAt,
  };
}

export function controllerView(state: State, gameId: string, id: string): TuneControllerView {
  const { turn } = state;
  const phase = state.phase.id;
  const revealed = isRevealed(state);
  const isPsychic = id === turn.psychic && Object.hasOwn(state.players, id);
  const huddleSide = liveHuddle(state) && onActiveSide(state, id);
  const shown = phase === 'scores' || phase === 'done' ? state.scores : undefined;
  const liveNeedle = huddleSide ? needleOf(state) : null;
  const view: TuneControllerView = {
    ...controllerEnvelope(state, gameId, id, { statusOf: statusOf(state), scores: shown }),
    // The clue is thinking time and the reveal and scores are paced beats: a bar, never a countdown.
    ...(phase === 'dial' || phase === 'call' ? {} : { timerMode: 'quiet' as const }),
    role: roleOf(state, id),
    myTeam: teamOf(state, id),
    turn: header(state),
    myDial: Object.hasOwn(turn.dials, id) ? (turn.dials[id] as number) : null,
    locked: turn.locked.includes(id),
    needle: phase === 'call' || revealed ? turn.needle : liveNeedle,
    myCall: turn.calls[id] ?? null,
    rejected: isPsychic && phase === 'clue' ? turn.rejected : null,
    mine: myResult(state, id),
    ...readyFor(state, id),
    team: state.team,
    winAt: state.cfg.targetScore,
    coop: state.mode === 'coop' ? coopMeter(state) : null,
    last: isOver(state),
    reading: stageReading(state),
  };
  if ((isPsychic && !revealed) || pointsShown(state)) view.bullseyeAt = turn.target;
  if (huddleSide) view.huddleMarks = huddleMarks(state);
  if (revealed && turn.n > 0) view.reveal = revealFacts(state);
  return view;
}

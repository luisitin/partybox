// tvView (spec §5.10): identical for every TV. Before the reveal it never carries the target,
// and in solo it never carries a dial; the huddle's markers are the point of a huddle, so the TV
// shows them live.
import { envelope } from '@partybox/game-sdk';
import type { TvView } from '@partybox/game-sdk';
import { needleOf } from './scoring';
import { fixedReading, playable, stageReading } from './speech';
import { earnsCatchUp, isOver } from './turn';
import type { State, TeamId } from './types';
import {
  coopMeter,
  header,
  huddleMarks,
  isRevealed,
  liveHuddle,
  revealFacts,
  statusOf,
} from './view-common';
import type { CoopMeter, Mark, RevealFacts, TurnHeader } from './view-common';

export interface Reading {
  key: string;
  url: string;
}

export interface TuneTvView extends TvView {
  turn: TurnHeader;
  /** When the clue arrived: the stage lands it with its reading (or after a short wait). */
  clueAt: number | null;
  /** Huddle only: the active side's live dials and their average. */
  huddleMarks?: Mark[];
  needle: number | null;
  /** From the reveal on. */
  reveal?: RevealFacts;
  teams: Record<TeamId, string[]> | null;
  team: Record<TeamId, number>;
  winAt: number;
  coop: CoopMeter | null;
  /** Scores phase: points gained this turn, per player (solo) — the board's deltas. */
  deltas: Record<string, number>;
  /** Scores phase: the team goes again (catch-up), or this was the last turn. */
  catchUpNext: boolean;
  last: boolean;
  reading: Reading | null;
  /** Dial phase: "Lock it in." for the stage to say with a few seconds left. */
  lockIn: Reading | null;
}

function deltas(state: State): Record<string, number> {
  if (state.phase.id !== 'scores' && state.phase.id !== 'done') return {};
  const out: Record<string, number> = {};
  for (const id of state.seats) {
    const d = (state.scores[id] ?? 0) - (state.turnStartScores[id] ?? 0);
    if (d !== 0) out[id] = d;
  }
  return out;
}

export function tvView(state: State, gameId: string): TuneTvView {
  const phase = state.phase.id;
  const revealed = isRevealed(state);
  // The strip never counts points the stage hasn't shown yet.
  const shown = phase === 'reveal' ? state.turnStartScores : state.scores;
  const view: TuneTvView = {
    ...envelope(state, gameId, { statusOf: statusOf(state), scores: shown }),
    // The clue is thinking time and the reveal and scores are paced beats: a bar, never a countdown.
    ...(phase === 'dial' || phase === 'call' ? {} : { timerMode: 'quiet' as const }),
    ...(phase === 'scores' ? { vipSkipLabel: isOver(state) ? 'See results' : 'Next round' } : {}),
    turn: header(state),
    clueAt: state.turn.clueAt,
    needle: liveHuddle(state)
      ? needleOf(state)
      : phase === 'call' || revealed
        ? state.turn.needle
        : null,
    teams: state.teams,
    team: state.team,
    winAt: state.cfg.targetScore,
    coop: state.mode === 'coop' ? coopMeter(state) : null,
    deltas: deltas(state),
    catchUpNext: phase === 'scores' && !isOver(state) && earnsCatchUp(state),
    last: isOver(state),
    reading: stageReading(state),
    lockIn: phase === 'dial' ? playable(state, fixedReading(state, 'lockIn')) : null,
  };
  if (liveHuddle(state)) view.huddleMarks = huddleMarks(state);
  if (revealed && state.turn.n > 0) view.reveal = revealFacts(state);
  return view;
}

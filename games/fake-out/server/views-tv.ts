// tvView (SPEC §3.10): the fact (blank until the truth step), the category and final flag, chip
// statuses, the options as { id, display } only, and during the reveal the steps already shown.
import { envelope } from '@partybox/game-sdk';
import type { PlayerStatus, TvView } from '@partybox/game-sdk';
import type { LineId } from './speech';
import { shownScores } from './scoring';
import {
  factView,
  leadNow,
  linesReady,
  readAlongNow,
  readingNow,
  revealView,
  standingsView,
} from './views-common';
import type {
  FactView,
  ReadAlongView,
  ReadingView,
  RevealView,
  StandingView,
} from './views-common';
import type { State } from './types';

export interface FakeOutTvView extends TvView {
  n: number;
  total: number;
  final: boolean;
  /** scores: the next question is the Final Fake-Out (double points). */
  finalNext: boolean;
  fact: FactView;
  /** pick + reveal: every option, anonymous, in the one seeded order. */
  options: { id: string; display: string }[];
  /** lie: how many lies are in; pick: how many picks. */
  inCount: number;
  expected: number;
  reveal: RevealView | null;
  reading: ReadingView | null;
  /** The fixed line that opens this moment (question lead-in, lie, pick), once made. */
  lead: ReadingView | null;
  /** The words of the text on stage light up with the reader. */
  readAlong: ReadAlongView;
  lines: Partial<Record<LineId, string>>;
  likesOn: boolean;
  standings: StandingView[];
}

export function statusOf(state: State): (id: string) => PlayerStatus {
  const phase = state.phase.id;
  return (id) => {
    if (phase === 'lie') return Object.hasOwn(state.q.lies, id) ? 'submitted' : 'active';
    if (phase === 'pick') return Object.hasOwn(state.q.picks, id) ? 'submitted' : 'active';
    return 'active';
  };
}

export function timerModeOf(state: State): 'normal' | 'quiet' | 'hidden' {
  const phase = state.phase.id;
  if (phase === 'lie' || phase === 'pick') return 'normal';
  if (phase === 'question' || phase === 'reveal') return 'hidden';
  return 'quiet';
}

function counts(state: State): [number, number] {
  const connected = Object.values(state.players).filter((p) => p.connected).length;
  if (state.phase.id === 'lie') return [Object.keys(state.q.lies).length, connected];
  if (state.phase.id === 'pick') return [Object.keys(state.q.picks).length, connected];
  return [0, connected];
}

export function tvView(state: State, gameId: string): FakeOutTvView {
  const phase = state.phase.id;
  const [inCount, expected] = counts(state);
  const opts = phase === 'pick' || phase === 'reveal' ? (state.q.options ?? []) : [];
  return {
    ...envelope(state, gameId, { statusOf: statusOf(state), scores: shownScores(state) }),
    timerMode: timerModeOf(state),
    n: state.q.n,
    total: state.cfg.questions,
    final: state.q.final,
    finalNext: state.cfg.finalDouble && state.q.n + 1 === state.cfg.questions,
    fact: factView(state),
    options: opts.map((o) => ({ id: o.id, display: o.display })),
    inCount,
    expected,
    reveal: revealView(state),
    reading: readingNow(state),
    lead: leadNow(state),
    readAlong: readAlongNow(state),
    lines: linesReady(state),
    likesOn: state.cfg.likes,
    standings: phase === 'scores' || phase === 'done' ? standingsView(state) : [],
  };
}

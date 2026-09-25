// tvView (SPEC §10.12): identical for every TV and for spectators. Never a living player's role
// (§10.10): roles appear only through the graveyard and the stage, once their card has flipped.
import { envelope } from '@partybox/game-sdk';
import type { PlayerStatus, TvView } from '@partybox/game-sdk';
import { flavourOf } from './content';
import { isAlive } from './rules';
import { castOf, graveyardOf, livingOf, stageOf } from './views-common';
import type { CastEntry, GraveEntry, StageView } from './views-common';
import type { FlavourId, State } from './types';

export const GAME_ID = 'nightfall';

export interface NightfallTvView extends TvView {
  flavour: FlavourId;
  day: number;
  maxDays: number;
  step: number;
  /** The end of the 3 · 2 · 1 before night 1 (roles step 1), else null. */
  countEnd: number | null;
  /** "Who's a wolf?" in this flavour. */
  question: string;
  cast: CastEntry[];
  living: string[];
  graveyard: GraveEntry[];
  readyCount: number;
  livingCount: number;
  townBoard: boolean;
  /** Today's town board, newest last: the TV shows 8, a phone 20. */
  board: { by: string; text: string }[];
  runoff: string[] | null;
  stage: StageView;
}

/** Chips (§10.10): at night every living player gets ✓ once they picked, whatever their role. */
export function statusOf(state: State): (id: string) => PlayerStatus {
  const phase = state.phase.id;
  return (id) => {
    if (!isAlive(state, id) && phase !== 'roles') return 'waiting';
    if (phase === 'roles' || phase === 'day')
      return state.ready.includes(id) ? 'submitted' : 'active';
    if (phase === 'night') return Object.hasOwn(state.picks, id) ? 'submitted' : 'active';
    if (phase === 'vote' || phase === 'runoff')
      return Object.hasOwn(state.votes, id) ? 'submitted' : 'active';
    if (phase === 'hunter') return id === state.hunterPending ? 'active' : 'waiting';
    if (phase === 'last-words') return id === state.verdict?.out ? 'active' : 'waiting';
    return 'waiting';
  };
}

/** The envelope, with the day's real end as its deadline and the night's clock kept quiet. */
export function countEndOf(state: State): number | null {
  return state.phase.id === 'roles' && state.step === 1 ? state.phase.deadline : null;
}

export function nightfallEnvelope(state: State): ReturnType<typeof envelope> {
  const env = envelope(state, GAME_ID, { statusOf: statusOf(state) });
  // The ready-up shows no clock (its fallback is for empty rooms only), and its 3 · 2 · 1 is the
  // scene's own (`countEnd`), not the shell's timer.
  const deadline =
    state.phase.id === 'day'
      ? state.dayEndsAt
      : state.phase.id === 'roles'
        ? null
        : state.phase.deadline;
  const paced = ['dawn', 'verdict', 'end', 'done'].includes(state.phase.id);
  const lastWordsShown = state.phase.id === 'last-words' && state.step === 1;
  const hunterShot = state.phase.id === 'hunter' && state.step === 1;
  return {
    ...env,
    deadline,
    timerMode:
      state.phase.id === 'night'
        ? 'quiet'
        : paced || lastWordsShown || hunterShot
          ? 'hidden'
          : 'normal',
  };
}

export function boardToday(state: State, last: number): { by: string; text: string }[] {
  return state.board
    .filter((p) => p.day === state.day)
    .slice(-last)
    .map((p) => ({ by: p.by, text: p.text }));
}

export function tvView(state: State): NightfallTvView {
  const living = livingOf(state);
  return {
    ...nightfallEnvelope(state),
    countEnd: countEndOf(state),
    flavour: state.cfg.flavour,
    day: state.day,
    maxDays: state.cfg.maxDays,
    step: state.step,
    question: flavourOf(state.cfg.flavour).words.question,
    cast: castOf(state),
    living,
    graveyard: graveyardOf(state),
    readyCount: state.ready.filter((id) => isAlive(state, id)).length,
    livingCount: living.length,
    townBoard: state.cfg.townBoard,
    board: state.cfg.townBoard ? boardToday(state, 8) : [],
    runoff: state.phase.id === 'runoff' ? state.runoff : null,
    stage: stageOf(state),
  };
}

// controllerView(p) (SPEC §3.10): the fact; the player's own lie, suggestions and legality message;
// every option except their own; their own pick and likes; their own moments for steps the TV has
// already shown. The reveal and standings ride along for PhoneStage (phone-only / remote phones).
import { controllerEnvelope, hasPlayer } from '@partybox/game-sdk';
import type { ControllerView } from '@partybox/game-sdk';
import { ownOption, pickersOf, unpickedLies } from './options';
import { optionOnStep } from './pacing';
import { multiplier, shownScores, standings } from './scoring';
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
import { statusOf, timerModeOf } from './views-tv';
import type { LineId } from './speech';
import { FOOL_POINTS, TRUTH_POINTS } from './types';
import type { LieRejection, State, Why } from './types';

/** One line of the phone's reveal list: "You fell for Ana's MOOSE", "Your REINDEER fooled Ben
 *  +500", "You found the truth! +1000", "Nobody fell for your HORSE". */
export interface Moment {
  step: number;
  k: 'fell' | 'house' | 'found' | 'fooled' | 'nobody';
  display: string;
  /** fell: the authors; fooled: who fell for it. */
  who: string[];
  pts: number;
}

export interface FakeOutControllerView extends ControllerView {
  n: number;
  total: number;
  final: boolean;
  fact: FactView;
  /** lie: what I have locked in, and the last refusal (with a counter to buzz once). */
  myLie: string | null;
  rejected: { why: LieRejection; n: number } | null;
  /** lie: Suggest's two fakes once asked; `canSuggest` while the button may show. */
  suggestions: string[];
  canSuggest: boolean;
  /** pick: every option but mine. */
  options: { id: string; display: string }[];
  /** pick: my own option's display (already merged), if I wrote one. */
  mine: string | null;
  myPick: string | null;
  myLikes: string[];
  likesOn: boolean;
  moments: Moment[];
  reveal: RevealView | null;
  reading: ReadingView | null;
  /** The fixed line that opens this moment (question lead-in, lie, pick), once made. */
  lead: ReadingView | null;
  readAlong: ReadAlongView;
  lines: Partial<Record<LineId, string>>;
  myScore: number;
  myRank: number;
  myDelta: number;
  myWhy: Why[];
  standings: StandingView[];
  /** intro: I tapped I'm ready; when the 3 · 2 · 1 ends (null until everyone is). */
  meReady: boolean;
  goAt: number | null;
}

function momentsFor(state: State, p: string): Moment[] {
  if (state.phase.id !== 'reveal') return [];
  const out: Moment[] = [];
  const mult = multiplier(state);
  for (let s = 0; s <= state.q.step; s++) {
    const o = optionOnStep(state, s);
    if (!o) continue;
    const pickers = pickersOf(state, o.id);
    if (state.q.picks[p] === o.id) {
      const k = o.truth ? 'found' : o.house ? 'house' : 'fell';
      out.push({
        step: s,
        k,
        display: o.display,
        who: o.authors,
        pts: o.truth ? TRUTH_POINTS * mult : 0,
      });
    }
    if (o.authors.includes(p) && pickers.length > 0)
      out.push({
        step: s,
        k: 'fooled',
        display: o.display,
        who: pickers,
        pts: FOOL_POINTS * pickers.length * mult,
      });
  }
  const unpickedStep = state.q.revealOrder.length + 1;
  if (state.q.step >= unpickedStep)
    for (const o of unpickedLies(state))
      if (o.authors.includes(p))
        out.push({ step: unpickedStep, k: 'nobody', display: o.display, who: [], pts: 0 });
  return out;
}

export function controllerView(state: State, gameId: string, p: string): FakeOutControllerView {
  const phase = state.phase.id;
  const player = hasPlayer(state, p);
  const { q } = state;
  const own = player ? ownOption(state, p) : null;
  const picking = phase === 'pick' && player;
  const me = standings(state).find((r) => r.playerId === p);
  const onBoard = phase === 'scores' || phase === 'done';
  const asked = player && Object.hasOwn(q.suggestions, p);
  return {
    ...controllerEnvelope(state, gameId, p, {
      statusOf: statusOf(state),
      scores: shownScores(state),
    }),
    timerMode: timerModeOf(state),
    n: q.n,
    total: state.cfg.questions,
    final: q.final,
    fact: factView(state),
    myLie: player ? (q.lies[p] ?? null) : null,
    rejected: phase === 'lie' && player ? (q.rejected[p] ?? null) : null,
    suggestions: phase === 'lie' && asked ? (q.suggestions[p] ?? []) : [],
    // A bot's phone always offers Suggest: that is how bots lie (SPEC §3.11).
    canSuggest:
      phase === 'lie' &&
      player &&
      !asked &&
      (state.cfg.suggestions || state.players[p]?.bot === true),
    options: picking
      ? (q.options ?? [])
          .filter((o) => o.id !== own?.id)
          .map((o) => ({ id: o.id, display: o.display }))
      : [],
    mine: picking ? (own?.display ?? null) : null,
    myPick: picking ? (q.picks[p] ?? null) : null,
    myLikes: picking ? (q.likes[p] ?? []) : [],
    likesOn: state.cfg.likes,
    moments: player ? momentsFor(state, p) : [],
    reveal: revealView(state),
    reading: readingNow(state),
    lead: leadNow(state),
    readAlong: readAlongNow(state),
    lines: linesReady(state),
    myScore: onBoard ? (me?.score ?? 0) : 0,
    myRank: onBoard ? (me?.rank ?? 0) : 0,
    myDelta: onBoard ? (me?.delta ?? 0) : 0,
    myWhy: onBoard ? (me?.why ?? []) : [],
    standings: onBoard ? standingsView(state) : [],
    meReady: phase === 'intro' && state.ready.includes(p),
    goAt: phase === 'intro' ? state.goAt : null,
  };
}

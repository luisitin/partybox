// The phase order (SPEC §4 "Transitions"). `advance` is what a deadline does and what a VIP skip
// does outside the choosing phases; there, a VIP skip is D4's Last call instead (the owner's call,
// 2026-09-24). `resolveNow` applies a phase's timeout result at once (D7: the chooser left).
import { withRound, emptyRound } from './phase';
import { enterChanEnact, timeoutChanEnact } from './phases/chanEnact';
import { enterChaos } from './phases/chaos';
import { enterClaims } from './phases/claims';
import { enterDone, enterGameOver } from './phases/gameOver';
import { enterHitlerCheck } from './phases/hitlerCheck';
import { enterNominate, timeoutNominate } from './phases/nominate';
import { enterPower, pendingPower, timeoutPower } from './phases/power';
import { deliverFile, enterPowerReveal } from './phases/powerReveal';
import { enterPresDraw, timeoutPresDraw } from './phases/presDraw';
import { enterEnactReveal } from './phases/enactReveal';
import { answerVeto, enterVetoAsk } from './phases/vetoAsk';
import { enterVote } from './phases/vote';
import { enterVoteReveal } from './phases/voteReveal';
import { nextPresident, powerTargets } from './rules';
import { LAST_CALL_MS } from './types';
import type { State } from './types';

/** Phases where someone is choosing: a VIP skip hurries them (D4) instead of choosing for them. */
export const CHOOSING: readonly string[] = [
  'nominate',
  'vote',
  'presDraw',
  'chanEnact',
  'vetoAsk',
  'power',
];

/** Who must act in a single-chooser phase. */
export function chooserOf(state: State): string | null {
  switch (state.phase.id) {
    case 'nominate':
    case 'presDraw':
    case 'vetoAsk':
    case 'power':
      return state.round.president;
    case 'chanEnact':
      return state.round.nominee;
    default:
      return null;
  }
}

/** D8: fewer than 3 players left: the side closer to its policy goal wins; a tie is Fascist. */
export function endTooFew(state: State): State {
  const liberals = state.board.L / 5 > state.board.F / 6;
  return { ...state, winner: liberals ? 'liberals' : 'fascists', winReason: 'tooFew' };
}

/** R5 / R16: the candidacy passes on to the next President, and a new round begins. */
export function nextRound(state: State, now: number): State {
  const { id, pointer } = nextPresident(state);
  if (id === null) return enterGameOver(endTooFew(state), now);
  const round = emptyRound(state.round.n + 1, id);
  return enterNominate({ ...state, presPointer: pointer, special: null, round }, now);
}

/** D7: entering a choosing phase whose chooser has left applies the timeout result at once. */
function settle(state: State, now: number): State {
  const chooser = chooserOf(state);
  return chooser === null || state.alive.includes(chooser) ? state : resolveNow(state, now);
}

export function resolveNow(state: State, now: number): State {
  switch (state.phase.id) {
    case 'nominate':
      return state.alive.includes(state.round.president)
        ? advance(timeoutNominate(state), now)
        : nextRound(state, now);
    case 'presDraw':
      return advance(timeoutPresDraw(state), now);
    case 'chanEnact':
      return advance(timeoutChanEnact(state), now);
    case 'vetoAsk':
      return advance(answerVeto(state, false), now);
    case 'power':
      return advance(timeoutPower(state), now);
    default:
      return advance(state, now);
  }
}

function afterSession(state: State, now: number): State {
  const kind = pendingPower(state);
  if (!kind) return nextRound(state, now);
  if (kind !== 'peek' && powerTargets(state, kind).length === 0)
    return enterPowerReveal(withRound(state, { power: { kind, target: null, shown: false } }), now);
  return settle(enterPower(state, now, kind), now);
}

export function advance(state: State, now: number): State {
  const r = state.round;
  switch (state.phase.id) {
    case 'seating':
      return enterNominate(state, now); // init already seated the first President (R5)
    case 'nominate':
      return r.nominee !== null ? enterVote(state, now) : nextRound(state, now);
    case 'vote':
      return enterVoteReveal(state, now);
    case 'voteReveal':
      if (!r.elected)
        return state.tracker >= 3 ? enterChaos(state, now, 'fail') : nextRound(state, now);
      return state.board.F >= 3
        ? enterHitlerCheck(state, now)
        : settle(enterPresDraw(state, now), now);
    case 'hitlerCheck':
      return state.winner ? enterGameOver(state, now) : settle(enterPresDraw(state, now), now);
    case 'presDraw': {
      const s = timeoutPresDraw(state);
      return s.round.passed === null ? nextRound(s, now) : settle(enterChanEnact(s, now), now);
    }
    case 'chanEnact': {
      if (r.vetoRequested && r.vetoAgreed === null && r.enacted === null)
        return settle(enterVetoAsk(state, now), now);
      const s = timeoutChanEnact(state);
      return s.round.enacted === null ? nextRound(s, now) : enterEnactReveal(s, now);
    }
    case 'vetoAsk': {
      const s = answerVeto(state, false); // no-op once answered
      if (s.round.vetoAgreed === true)
        return s.tracker >= 3 ? enterChaos(s, now, 'veto') : enterClaims(s, now);
      return settle(enterChanEnact(s, now), now);
    }
    case 'enactReveal':
      return state.winner ? enterGameOver(state, now) : enterClaims(state, now);
    case 'claims':
      return afterSession(state, now);
    case 'power':
      return enterPowerReveal(timeoutPower(state), now);
    case 'powerReveal': {
      const s = deliverFile(state); // a skipped pause still hands the President the file
      return s.winner ? enterGameOver(s, now) : nextRound(s, now);
    }
    case 'chaos':
      if (state.winner) return enterGameOver(state, now);
      return r.chaosAfter === 'veto' ? enterClaims(state, now) : nextRound(state, now);
    case 'gameOver':
      return enterDone(state, now);
    default:
      return state;
  }
}

/** The VIP's Skip: Last call in a choosing phase (D4), else the phase's normal exit. */
export function vipSkip(state: State, now: number): State {
  if (!CHOOSING.includes(state.phase.id)) return advance(state, now);
  if (state.round.lastCall || state.phase.deadline === null) return state;
  const deadline = Math.min(state.phase.deadline, now + LAST_CALL_MS);
  return { ...withRound(state, { lastCall: true }), phase: { ...state.phase, deadline } };
}

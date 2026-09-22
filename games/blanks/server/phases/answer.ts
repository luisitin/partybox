// Phase "answer": every player but the judge plays `pick` white cards from their hand, in blank
// order. Exits a beat after every connected answerer has played ("Everyone's in!" holds the stage
// for ALL_IN_MS), on Next from any player (untimed rounds), on the deadline (answerSeconds + 15 s
// per extra card, or a hidden 3 min fallback when untimed), or on VIP skip; whoever has not played
// sits the round out.
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { blackCard } from '../content';
import { leadWithFit, refillHands } from '../deal';
import { hasPlayed, isCzar, playersDone, sitsOut } from '../round';
import { ALL_IN_MS, EXTRA_PICK_S, REDRAWS_PER_GAME, UNTIMED_ANSWER_MS } from '../types';
import type { Input, PlayInput, State } from '../types';
import type { Transition } from './intro';

export function answerMs(state: State): number {
  const { pick } = blackCard(state.blackId);
  return (state.settings.answerSeconds + EXTRA_PICK_S * (pick - 1)) * 1000;
}

export function enterAnswer(state: State, now: number): State {
  return enterPhase(
    state,
    'answer',
    now,
    state.settings.timed ? answerMs(state) : UNTIMED_ANSWER_MS,
  );
}

/** "Before half the answer time" is measured against the deadline so a pause does not cheat it.
 *  An untimed round has no clock but the same yardstick: half of `answerSeconds` from the phase's
 *  (pause-shifted) start — before, its 3 min fallback made every play "fast" (review-loop #115). */
function isFast(state: State, now: number): boolean {
  const { deadline } = state.phase;
  if (deadline === null) return false;
  const phaseMs = state.settings.timed ? answerMs(state) : UNTIMED_ANSWER_MS;
  return now < deadline - phaseMs + answerMs(state) / 2;
}

function applyPlay(state: State, playerId: string, input: PlayInput, now: number): State {
  if (!hasPlayer(state, playerId) || isCzar(state, playerId) || hasPlayed(state, playerId))
    return state;
  if (sitsOut(state, playerId)) return state; // I-147 A: the tie-break card is the tied players'
  const hand = state.hands[playerId] ?? [];
  const { pick } = blackCard(state.blackId);
  // Exactly the cards the black card asks for, all distinct, all from this hand.
  if (input.cards.length !== pick || new Set(input.cards).size !== pick) return state;
  if (!input.cards.every((id) => hand.includes(id))) return state;
  const fast = isFast(state, now) ? 1 : 0;
  return {
    ...state,
    hands: { ...state.hands, [playerId]: hand.filter((id) => !input.cards.includes(id)) },
    submissions: { ...state.submissions, [playerId]: [...input.cards] },
    stats: {
      ...state.stats,
      fastPlays: {
        ...state.stats.fastPlays,
        [playerId]: (state.stats.fastPlays[playerId] ?? 0) + fast,
      },
    },
  };
}

/** New hands left for `playerId` this game. */
export function redrawsLeft(state: State, playerId: string): number {
  return Math.max(0, REDRAWS_PER_GAME - (state.redraws[playerId] ?? 0));
}

/** A whole new hand (the owner, 2026-09-21): the old one goes to the discard and the hand is
 *  dealt again under every rule a fresh hand follows — the kind floors, the good and best floors,
 *  the filler cap, a word, and the round's fit on top. Before playing only, REDRAWS_PER_GAME
 *  times a game, never for the judge. */
function applyRedraw(state: State, playerId: string): State {
  if (!hasPlayer(state, playerId) || isCzar(state, playerId) || hasPlayed(state, playerId))
    return state;
  if (sitsOut(state, playerId)) return state; // I-147 A
  if (redrawsLeft(state, playerId) === 0) return state;
  const old = state.hands[playerId] ?? [];
  const emptied: State = {
    ...state,
    hands: { ...state.hands, [playerId]: [] },
    discard: [...state.discard, ...old],
    redraws: { ...state.redraws, [playerId]: (state.redraws[playerId] ?? 0) + 1 },
  };
  const { draw } = blackCard(state.blackId);
  return leadWithFit(refillHands(emptied, draw, [playerId]), [playerId]);
}

export function reduceAnswer(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    // Moving an untimed round along is the VIP's alone, through the engine's skip (ADR-036).
    if (event.input.type === 'redraw') return applyRedraw(state, event.playerId);
    if (event.input.type !== 'play') return state;
    const after = applyPlay(state, event.playerId, event.input, event.now);
    if (after === state) return state;
    return allConnectedDone(after, playersDone(after)) ? holdAllIn(after, event.now) : after;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}

/** Everyone connected has played: the room gets a beat to see it before the first card — the
 *  deadline moves up to now + ALL_IN_MS (never later than it already was) and the timer ends the
 *  phase (review-loop #128). */
export function holdAllIn(state: State, now: number): State {
  const deadline = Math.min(state.phase.deadline ?? Infinity, now + ALL_IN_MS);
  return { ...state, phase: { ...state.phase, deadline } };
}

/** The beat is on: everyone connected has played and the phase only waits for its timer. */
export function allIn(state: State): boolean {
  return state.phase.id === 'answer' && allConnectedDone(state, playersDone(state));
}

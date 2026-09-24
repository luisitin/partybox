// Phase "question": "Question 3 of 7" (or FINAL FAKE-OUT), the category and the fact with its
// blank, read aloud. Holds for the reading plus a beat (at most 12 s, hidden timer); a VIP skip goes
// straight to `lie`. A reading that arrives late re-times the card to it.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { factStartMs, questionMs } from '../pacing';
import { factReading, voiceOf } from '../speech';
import { QUESTION_BEAT_MS, QUESTION_MAX_MS } from '../types';
import type { FactItem, Input, Question, State, Transition } from '../types';

/** A fresh question `n` (1-based) from the drawn list. */
export function newQuestion(state: Pick<State, 'questions' | 'cfg'>, n: number): Question {
  const item = state.questions[n - 1] ?? state.questions[state.questions.length - 1];
  return {
    n,
    final: state.cfg.finalDouble && n === state.cfg.questions,
    item: item as FactItem,
    lies: {},
    truthTyped: [],
    rejected: {},
    suggestions: {},
    claimed: [],
    options: null,
    picks: {},
    likes: {},
    revealOrder: [],
    step: 0,
    stepAt: 0,
    delta: {},
  };
}

/** Enters the question card for `state.q` (set up by the caller). */
export function enterQuestion(state: State, now: number): State {
  return enterPhase(state, 'question', now, questionMs(state));
}

/** The fact's reading arrived while its card is up: hold for it (it starts now, or after the
 *  lead-in if that is still playing) plus the beat. */
export function retimeQuestion(state: State, key: string, now: number): State {
  const voice = voiceOf(state);
  const { phase } = state;
  if (phase.id !== 'question' || phase.deadline === null || !voice) return state;
  if (factReading(voice, state.q.item).key !== key) return state;
  const ms = state.speechMs[key] ?? -1;
  if (ms < 0) return state;
  const start = Math.max(now, phase.startedAt + factStartMs(state));
  const deadline = Math.min(phase.startedAt + QUESTION_MAX_MS, start + ms + QUESTION_BEAT_MS);
  return { ...state, phase: { ...phase, deadline: Math.max(deadline, now + 500) } };
}

export function reduceQuestion(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

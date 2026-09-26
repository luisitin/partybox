// Starting a prompt and the selectors every phase and view needs. Pure.
import { dealIdeas } from './cards';
import { DONE_GRACE_MS } from './types';
import type { Card, PromptRound, State } from './types';

/** Every player from the start who has not left for good: the candidates of a new prompt. */
export function seatedNow(state: State): string[] {
  return state.seats.filter((id) => !state.left.includes(id));
}

/** A fresh round for prompt `n`: candidates fixed now, idea chips dealt, scores remembered. */
export function startPrompt(state: State, n: number): State {
  const seated = seatedNow(state);
  const bank = state.prompts[n]?.botAnswers ?? [];
  const [ideas, rng] = dealIdeas(bank, state.seats, state.rng);
  const p: PromptRound = {
    n,
    seated,
    answers: {},
    ideas,
    ideaUsed: [],
    cards: [],
    idx: 0,
    guesses: {},
    guessesByCard: [],
    step: 'land',
    flip: null,
    startScores: { ...state.scores },
    points: {},
  };
  return { ...state, rng, p };
}

export function currentCard(state: State): Card | undefined {
  return state.p.cards[state.p.idx];
}

export function isSeated(state: State, id: string): boolean {
  return state.p.seated.includes(id);
}

/** Seated players who have answered (the write phase's "done" set). */
export function answeredIds(state: State): string[] {
  return state.p.seated.filter((id) => state.p.answers[id] !== undefined);
}

/** The last card is deductable only when every seated player submitted an answer. */
export function everyoneAnswered(state: State): boolean {
  return answeredIds(state).length === state.p.seated.length;
}

/** Seated players who have tapped a face on the current card. */
export function guessedIds(state: State): string[] {
  return state.p.seated.filter((id) => state.p.guesses[id] !== undefined);
}

/** Players who can't act this prompt count as done, so they never hold an all-done exit. */
export function notSeated(state: State): string[] {
  return state.seats.filter((id) => !state.p.seated.includes(id));
}

export function isLastPrompt(state: State): boolean {
  return state.p.n >= state.cfg.prompts - 1 || state.p.n >= state.prompts.length - 1;
}

/** All done: the deadline comes in to a short grace (never later than it already was). */
export function closeSoon(state: State, now: number): State {
  const { deadline } = state.phase;
  const soon = now + DONE_GRACE_MS;
  if (deadline !== null && deadline <= soon) return state;
  return { ...state, phase: { ...state.phase, deadline: soon } };
}

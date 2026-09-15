// Phase "answer": every player writes for their two prompts. Exits when every connected player
// has answered both, on the deadline, or on VIP skip; unanswered prompts stay blank.
import { allConnectedDone, enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { answerOf, promptsFor } from '../round';
import { PROMPTS_PER_PLAYER } from '../types';
import type { AnswerInput, Input, State } from '../types';
import type { Transition } from './intro';

export function enterAnswer(state: State, now: number): State {
  return enterPhase(state, 'answer', now, state.settings.answerSeconds * 1000);
}

/** Players who have answered every prompt they were given (the "all submitted" set). */
export function playersDone(state: State): string[] {
  return Object.keys(state.players).filter((id) =>
    promptsFor(state, id).every((p) => answerOf(state, p.id, id) !== null),
  );
}

export function answeredCount(state: State): number {
  return Object.values(state.answers).reduce((n, byAuthor) => n + Object.keys(byAuthor).length, 0);
}

export function answersExpected(state: State): number {
  return Object.keys(state.players).length * PROMPTS_PER_PLAYER;
}

/** "Before half the answer time" is measured against the deadline so a pause does not cheat it. */
function isFast(state: State, now: number): boolean {
  const { deadline } = state.phase;
  return deadline !== null && now < deadline - (state.settings.answerSeconds * 1000) / 2;
}

function applyAnswer(state: State, playerId: string, input: AnswerInput, now: number): State {
  const prompt = state.prompts.find((p) => p.id === input.promptId);
  // Only the two authors of a current-round prompt, once each; whitespace-only is not an answer.
  if (!state.players[playerId] || !prompt || !prompt.authors.includes(playerId)) return state;
  if (answerOf(state, prompt.id, playerId) !== null) return state;
  const text = input.text.trim();
  if (text.length === 0) return state;
  const fast = isFast(state, now) ? 1 : 0;
  return {
    ...state,
    answers: { ...state.answers, [prompt.id]: { ...state.answers[prompt.id], [playerId]: text } },
    stats: {
      ...state.stats,
      fastAnswers: {
        ...state.stats.fastAnswers,
        [playerId]: (state.stats.fastAnswers[playerId] ?? 0) + fast,
      },
    },
  };
}

export function reduceAnswer(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (event.input.type !== 'answer') return state;
    const after = applyAnswer(state, event.playerId, event.input, event.now);
    if (after === state) return state;
    return allConnectedDone(after, playersDone(after)) ? next(after, event.now) : after;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}

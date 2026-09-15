// Phase "vote": the TV shows one prompt and its two answers anonymously; everyone who did not
// write for it picks one. Exits when every connected eligible voter has voted, on the 20 s
// deadline, or on VIP skip (votes so far count).
import { allConnectedDone, enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { currentPrompt, hasVoted } from '../round';
import { VOTE_MS } from '../types';
import type { Input, State, VoteInput } from '../types';
import type { Transition } from './intro';

/** Starts voting on `state.prompts[index]`. */
export function enterVote(state: State, now: number, index: number): State {
  return enterPhase({ ...state, promptIndex: index }, 'vote', now, VOTE_MS);
}

/** Voters plus authors: authors count as "done" so they never block the all-voted exit. */
export function votingDone(state: State): string[] {
  const prompt = currentPrompt(state);
  if (!prompt) return Object.keys(state.players);
  return [...Object.keys(state.votes[prompt.id] ?? {}), ...prompt.authors];
}

function applyVote(state: State, voterId: string, input: VoteInput): State {
  const prompt = currentPrompt(state);
  // Only players, only on the prompt being voted on, never authors, once each.
  if (!state.players[voterId] || !prompt || prompt.id !== input.promptId) return state;
  if (prompt.authors.includes(voterId) || hasVoted(state, prompt.id, voterId)) return state;
  const authorId = prompt.authors[input.slot === 0 ? 0 : 1];
  return {
    ...state,
    votes: { ...state.votes, [prompt.id]: { ...state.votes[prompt.id], [voterId]: authorId } },
  };
}

export function reduceVote(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (event.input.type !== 'vote') return state;
    const after = applyVote(state, event.playerId, event.input);
    if (after === state) return state;
    return allConnectedDone(after, votingDone(after)) ? next(after, event.now) : after;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}

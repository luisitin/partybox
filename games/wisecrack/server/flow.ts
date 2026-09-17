// The phase graph: which phase follows which. intro → answer → (vote → reveal)* → scores → intro |
// done. Phase files only know their own entry/exit; this file wires the loop so no phase imports
// another (dependency-cruiser forbids cycles). VIP skip uses the same transitions as a deadline.
import { applyVip, setConnected } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { enterAnswer, reduceAnswer } from './phases/answer';
import { enterIntro, reduceIntro } from './phases/intro';
import { enterReveal, reduceReveal } from './phases/reveal';
import { enterDone, enterScores, reduceScores } from './phases/scores';
import { enterVote, reduceVote } from './phases/vote';
import { isLastRound, isWalkover, nextVotableIndex } from './round';
import type { Input, RoundPrompt, State } from './types';

/** First votable prompt at or after `from`, else the round scoreboard. A prompt with one blank
 *  answer skips its vote: straight to the reveal, where the real answer wins by default. */
function voteFrom(state: State, now: number, from: number): State {
  const index = nextVotableIndex(state, from);
  if (index === -1) return enterScores(state, now);
  const prompt = state.prompts[index] as RoundPrompt;
  if (isWalkover(state, prompt)) return enterReveal({ ...state, promptIndex: index }, now);
  return enterVote(state, now, index);
}

export function afterIntro(state: State, now: number): State {
  return enterAnswer(state, now);
}

export function afterAnswer(state: State, now: number): State {
  return voteFrom(state, now, 0);
}

export function afterVote(state: State, now: number): State {
  return enterReveal(state, now);
}

export function afterReveal(state: State, now: number): State {
  return voteFrom(state, now, state.promptIndex + 1);
}

export function afterScores(state: State, now: number): State {
  return isLastRound(state) ? enterDone(state, now) : enterIntro(state, now);
}

/** "Skip" = what the current phase's deadline would do; "end" = straight to done. */
function skip(state: State, now: number): State {
  switch (state.phase.id) {
    case 'intro':
      return afterIntro(state, now);
    case 'answer':
      return afterAnswer(state, now);
    case 'vote':
      return afterVote(state, now);
    case 'reveal':
      return afterReveal(state, now);
    case 'scores':
      return afterScores(state, now);
    default:
      return state;
  }
}

export function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return setConnected(state, event);
  const vip = applyVip(state, event, { skip, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, afterIntro);
    case 'answer':
      return reduceAnswer(state, event, afterAnswer);
    case 'vote':
      return reduceVote(state, event, afterVote);
    case 'reveal':
      return reduceReveal(state, event, afterReveal);
    case 'scores':
      return reduceScores(state, event, afterScores);
    default:
      return state;
  }
}

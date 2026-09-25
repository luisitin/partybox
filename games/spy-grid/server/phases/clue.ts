// Phase "clue" (SPEC §9.4, §9.8): the active spymaster sends one word and a number. A clue that
// breaks a rule is refused with the reason on their phone; a sent clue opens the guessing. No clue
// by the deadline (or a VIP skip) passes the turn — `next` sees `turn.clue === null`.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { clueDisplay, clueProblem } from '../clue-rules';
import { wordEntry } from '../content';
import { bumpStats } from '../round';
import type { ClueTarget } from '../clue-rules';
import type { Input, State, Transition } from '../types';

export function enterClue(state: State, now: number): State {
  return enterPhase(state, 'clue', now, state.settings.clueSeconds * 1000);
}

/** The face-down words a clue is judged against (flipped words are fair game, §9.8). */
export function clueTargets(state: State): ClueTarget[] {
  const out: ClueTarget[] = [];
  state.board.forEach((card, i) => {
    if (state.flipped[i] === 0)
      out.push({ answer: card.itemId, family: wordEntry(card.itemId).family });
  });
  return out;
}

export function sendClue(state: State, playerId: string, word: string, number: number): State {
  const problem = clueProblem(word, clueTargets(state));
  if (problem)
    return {
      ...state,
      turn: { ...state.turn, clueError: { word: word.slice(0, 20), reason: problem } },
    };
  const clue = { word: clueDisplay(word), number };
  const coop = state.coop ? { cluesLeft: Math.max(0, state.coop.cluesLeft - 1) } : null;
  const s = state.stats[playerId];
  const withStats = s ? bumpStats(state, playerId, { clues: s.clues + 1 }) : state;
  return {
    ...withStats,
    coop,
    idleTurns: 0,
    turn: { ...state.turn, clue, clueError: null, left: number + 1, made: 0 },
    history: [
      ...state.history,
      { round: state.round, team: state.turn.team, spymaster: playerId, ...clue, flips: [] },
    ],
  };
}

export function reduceClue(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'clue') return state;
  if (!hasPlayer(state, event.playerId) || state.turn.spymaster !== event.playerId) return state;
  const after = sendClue(state, event.playerId, event.input.word, event.input.number);
  return after.turn.clue ? next(after, event.now) : after;
}

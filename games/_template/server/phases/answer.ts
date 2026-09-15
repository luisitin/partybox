// Phase "answer": everyone types one word. Exits when every connected player has answered or
// the deadline fires. Inputs from spectators/unknown ids are ignored (reduce must stay total).
import { allConnectedDone, enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { enterReveal } from './reveal';
import type { Input, State } from '../types';

export function enterAnswer(state: State, now: number): State {
  return enterPhase(state, 'answer', now, state.settings.answerSeconds * 1000);
}

export function reduceAnswer(state: State, event: GameEvent<Input>): State {
  if (event.type === 'input') {
    // Only playing players, only once each. Later inputs from the same player are ignored, which
    // keeps "submitted" honest on the TV and makes replays trivially deterministic.
    if (!state.players[event.playerId] || event.playerId in state.answers) return state;
    const next: State = {
      ...state,
      answers: { ...state.answers, [event.playerId]: event.input.text.trim() },
    };
    return allConnectedDone(next, Object.keys(next.answers)) ? enterReveal(next, event.now) : next;
  }
  if (isTimerFor(state, event)) return enterReveal(state, event.now);
  return state;
}

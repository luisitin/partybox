// Phase "clue": only the psychic sees the target and types a clue (spec §5.8 rules). Ends when a
// legal clue arrives, at the deadline, or on a VIP skip — with no clue, the round is void. A
// psychic who drops keeps it open a few seconds at most, and gets the rest back on return.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { checkClue } from '../clue';
import { DROP_GRACE_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterClue(state: State, now: number): State {
  const entered = enterPhase(state, 'clue', now, state.cfg.clueSeconds * 1000);
  const full = entered.phase.deadline;
  const away = state.players[state.turn.psychic]?.connected !== true;
  const deadline = away && full !== null ? Math.min(full, now + DROP_GRACE_MS) : full;
  return {
    ...entered,
    phase: { ...entered.phase, deadline },
    turn: { ...entered.turn, clueDeadline: full },
  };
}

export function reduceClue(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'clue') return state;
  const { turn } = state;
  if (event.playerId !== turn.psychic || turn.clue !== null) return state;
  const spectrum = state.spectra[turn.spectrum];
  if (!spectrum) return state;
  const verdict = checkClue(event.input.text, spectrum.left, spectrum.right);
  if (!verdict.ok) {
    const n = (turn.rejected?.n ?? 0) + 1;
    return { ...state, turn: { ...turn, rejected: { reason: verdict.reason, n } } };
  }
  const sent = { ...turn, clue: verdict.text, clueAt: event.now, rejected: null };
  return next({ ...state, turn: sent }, event.now);
}

/** The psychic dropped (keep the clue open DROP_GRACE_MS at most) or came back (the full time
 *  returns). Called by flow.ts on `player` events during `clue`. */
export function psychicLink(state: State, connected: boolean, now: number): State {
  const { deadline } = state.phase;
  const full = state.turn.clueDeadline;
  if (deadline === null || full === null) return state;
  const moved = connected ? Math.max(deadline, full) : Math.min(deadline, now + DROP_GRACE_MS);
  return moved === deadline ? state : { ...state, phase: { ...state.phase, deadline: moved } };
}

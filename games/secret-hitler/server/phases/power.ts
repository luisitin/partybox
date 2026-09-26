// Phase "power" (R14–R18): the President uses the power of the Fascist slot just filled —
// investigate, special election, policy peek or execution. A timeout picks a random valid target
// and names it (D1, D3); a peek closes after 15 s at normal pace.
import { isTimerFor, pick } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { announced, go, timed, withRound } from '../phase';
import { powerForSlot, powerTargets } from '../rules';
import type { Input, PowerKind, State, Transition } from '../types';

/** R14: the power the government's Fascist enactment earned (chaos policies earn none, R10). */
export function pendingPower(state: State): PowerKind | null {
  if (state.round.enacted !== 'F' || state.winner !== null) return null;
  return powerForSlot(state.seats.length, state.board.F);
}

export function enterPower(state: State, now: number, kind: PowerKind): State {
  const s = withRound(state, { power: { kind, target: null, shown: false } });
  if (kind !== 'peek') return go(s, 'power', now, timed(s, 'power'));
  // R17: the President privately sees the top three; the deck is untouched.
  const president = s.round.president;
  const note = { n: s.round.n, k: 'peek' as const, cards: s.deck.slice(0, 3) };
  const intel = { ...s.intel, [president]: [...(s.intel[president] ?? []), note] };
  return go({ ...s, intel }, 'power', now, timed(s, 'peek'));
}

export function timeoutPower(state: State): State {
  const p = state.round.power;
  if (!p || p.kind === 'peek' || p.target !== null) return state;
  const targets = powerTargets(state, p.kind);
  if (targets.length === 0) return state;
  const [target, rng] = pick(state.rng, targets);
  return announced(withRound({ ...state, rng }, { power: { ...p, target } }), target);
}

export function reducePower(state: State, event: GameEvent<Input>, next: Transition): State {
  const p = state.round.power;
  if (event.type === 'input' && p && event.playerId === state.round.president) {
    if (event.input.type === 'peekDone' && p.kind === 'peek') return next(state, event.now);
    if (event.input.type !== 'target' || p.kind === 'peek' || p.target !== null) return state;
    const target = event.input.target;
    if (!powerTargets(state, p.kind).includes(target)) return state;
    return next(withRound(state, { power: { ...p, target } }), event.now);
  }
  if (isTimerFor(state, event)) return next(timeoutPower(state), event.now);
  return state;
}

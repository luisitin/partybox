// Phase "play": one number is on the TV; every `callSeconds` the timer draws the next one by
// re-entering this phase (a new `startedAt` ⇒ a new timer instance). Daubs are free — the server
// accepts every tap. BINGO! evaluates the claimant's cards and checks the closest one: valid → the
// round is won (`exits.win`), invalid → the check (`exits.check`). The deck running out ends the
// round via `exits.next`.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { calledNumbers, toggleDaub } from '../cards';
import { evaluate } from '../patterns';
import type { Claim, Input, State, Transition } from '../types';

export interface PlayExits {
  /** The next number — or the end of the round when the deck is empty. */
  next: Transition;
  win: (state: State, now: number, playerId: string, claim: Claim) => State;
  check: (state: State, now: number, claim: Claim) => State;
}

/** Draws the next number and (re)starts the call timer. */
export function enterPlay(state: State, now: number): State {
  const round = state.round;
  return enterPhase(
    { ...state, round: { ...round, drawn: round.drawn + 1, claim: null } },
    'play',
    now,
    state.settings.callSeconds * 1000,
  );
}

export function canClaim(state: State, playerId: string): boolean {
  const round = state.round;
  return (
    state.phase.id === 'play' &&
    hasPlayer(state, playerId) &&
    Object.hasOwn(round.cards, playerId) &&
    round.drawn >= (round.waitForCall[playerId] ?? 0)
  );
}

/** Closer to the pattern: valid first, then more green, then fewer red. */
function closer(a: Claim, b: Claim | null): boolean {
  if (!b) return true;
  if (a.valid !== b.valid) return a.valid;
  if (a.green.length !== b.green.length) return a.green.length > b.green.length;
  return a.red.length < b.red.length;
}

/**
 * The claim BINGO! puts on the TV: the first valid card, else the card nearest the pattern —
 * one press, whichever card the player was looking at.
 */
export function bestClaim(state: State, playerId: string): Claim | null {
  const round = state.round;
  const called = calledNumbers(state);
  let best: Claim | null = null;
  (round.cards[playerId] ?? []).forEach((card, i) => {
    const daubs = round.daubs[playerId]?.[i] ?? [];
    const claim = evaluate(playerId, i, card, daubs, called, round.pattern);
    if (closer(claim, best)) best = claim;
  });
  return best;
}

export function reducePlay(state: State, event: GameEvent<Input>, exits: PlayExits): State {
  if (event.type === 'input') {
    if (event.input.type === 'daub')
      return toggleDaub(state, event.playerId, event.input.card, event.input.index);
    if (!canClaim(state, event.playerId)) return state;
    const claim = bestClaim(state, event.playerId);
    if (!claim) return state;
    return claim.valid
      ? exits.win(state, event.now, event.playerId, claim)
      : exits.check(state, event.now, claim);
  }
  if (isTimerFor(state, event)) return exits.next(state, event.now);
  return state;
}

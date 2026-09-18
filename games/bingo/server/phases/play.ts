// Phase "play": one number is on the TV; every `callSeconds` the timer draws the next one by
// re-entering this phase (a new `startedAt` ⇒ a new timer instance). Daubs are free — the server
// accepts every tap. BINGO! on a card takes two taps (claims.ts): the second one evaluates THAT
// card — valid → a bingo (`exits.win`), invalid → the check (`exits.check`). The deck running out
// ends the round via `exits.next`. A card-style menu open on any phone holds the caller: the
// deadline is dropped, and when the last menu closes a RESUME_MS countdown runs before the next
// number.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { calledNumbers, toggleDaub } from '../cards';
import { clearClaims, menusOpen, setMenu, settle, tapBingo } from '../claims';
import { evaluate } from '../patterns';
import { liveCards } from './bingo';
import { RESUME_MS } from '../types';
import type { Claim, Input, State, Transition } from '../types';

export interface PlayExits {
  /** The next number — or the end of the round when the deck is empty. */
  next: Transition;
  win: (state: State, now: number, playerId: string, claim: Claim) => State;
  check: (state: State, now: number, claim: Claim) => State;
}

/**
 * Draws the next number and (re)starts the call timer — or holds, with a menu open somewhere.
 * `again` repeats the number that was up (the room keeps going after a bingo: whoever was halfway
 * through daubing it gets it back, owner 2026-09-17) — the phase still restarts, so the TV calls
 * it again.
 */
export function enterPlay(state: State, now: number, again = false): State {
  const round = state.round;
  const drawn = {
    ...state,
    round: {
      ...round,
      drawn: again ? round.drawn : round.drawn + 1,
      claim: null,
      resumeAt: null,
      resumeAgain: false, // a VIP skip through the countdown must not repeat a number later
      resumeBy: null,
      calledAt: now, // the stamp the TV speaks and the phones buzz on (a repeat is a new call)
    },
  };
  // A window that is open survives the call: an armed player's second tap still claims.
  return enterPhase(
    drawn,
    'play',
    now,
    menusOpen(drawn) ? null : state.settings.callSeconds * 1000,
  );
}

/**
 * Back into play after a bingo (loop 276): a 3 · 2 · 1 on every screen first (`resumeAt`, the
 * same countdown the card-style menu uses), then the number that was up is called again.
 */
export function enterResume(state: State, now: number, by: string | null = null): State {
  return enterPhase(
    {
      ...state,
      round: {
        ...state.round,
        claim: null,
        resumeAt: now + RESUME_MS,
        resumeAgain: true,
        resumeBy: by,
      },
    },
    'play',
    now,
    RESUME_MS,
  );
}

/** Held: no deadline, the number stays up. Resuming: the countdown's deadline. */
export function isHeld(state: State): boolean {
  return state.phase.id === 'play' && state.phase.deadline === null;
}

/** A live card, and no wait after a failed claim. */
export function canClaim(state: State, playerId: string, card?: number): boolean {
  const round = state.round;
  const live = liveCards(state, playerId);
  return (
    state.phase.id === 'play' &&
    hasPlayer(state, playerId) &&
    Object.hasOwn(round.cards, playerId) &&
    (card === undefined ? live.length > 0 : live.includes(card)) &&
    round.drawn >= (round.waitForCall[playerId] ?? 0)
  );
}

/** The card-style menu opened or closed: hold the caller, or start the 3 · 2 · 1. */
function applyMenu(state: State, playerId: string, open: boolean, now: number): State {
  const next = setMenu(state, playerId, open);
  if (next === state) return state;
  const wasOpen = menusOpen(state);
  const isOpen = menusOpen(next);
  if (isOpen && !wasOpen)
    return enterPhase({ ...next, round: { ...next.round, resumeAt: null } }, 'play', now, null);
  if (!isOpen && wasOpen)
    return enterPhase(
      { ...next, round: { ...next.round, resumeAt: now + RESUME_MS } },
      'play',
      now,
      RESUME_MS,
    );
  return next;
}

export function reducePlay(state: State, event: GameEvent<Input>, exits: PlayExits): State {
  if (event.type === 'input') {
    const input = event.input;
    if (input.type === 'daub') return toggleDaub(state, event.playerId, input.card, input.index);
    if (input.type === 'menu') return applyMenu(state, event.playerId, input.open, event.now);
    if (input.type === 'lapse') return settle(state, event.now);
    if (input.type !== 'bingo' || !canClaim(state, event.playerId, input.card)) return state;
    const tapped = tapBingo(state, event.playerId, input.card, event.now);
    if (!tapped.claim) return tapped.state;
    const round = tapped.state.round;
    const claim = evaluate(
      event.playerId,
      input.card,
      round.cards[event.playerId]?.[input.card] ?? [],
      round.daubs[event.playerId]?.[input.card] ?? [],
      calledNumbers(tapped.state),
      round.pattern,
    );
    const cleared = clearClaims(tapped.state);
    return claim.valid
      ? exits.win(cleared, event.now, event.playerId, claim)
      : exits.check(cleared, event.now, claim);
  }
  if (!isTimerFor(state, event)) return state;
  // The countdown after "keep going" ends: the same number, called again.
  if (state.round.resumeAgain)
    return enterPlay({ ...state, round: { ...state.round, resumeAgain: false } }, event.now, true);
  return exits.next(settle(state, event.now), event.now);
}

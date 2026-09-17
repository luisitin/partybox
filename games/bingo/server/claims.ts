// Claiming takes two taps, and the card-style menu holds the caller. Pure helpers shared by the
// phases (phase files never import each other).
//
// Two taps: the first BINGO! on a card arms it for ARM_MS — that player has dibs — and the second
// tap on the same card is the claim. Other players' first taps queue behind; when a window lapses
// (the armed phone says so, or the next event notices) the next in line gets a fresh window.
//
// The menu: any phone with the card-style sheet open holds the caller (the play deadline is
// dropped); when the last one closes, a RESUME_MS countdown runs on every screen and calling
// resumes.
import { hasPlayer } from '@partybox/game-sdk';
import { ARM_MS } from './types';
import type { State } from './types';

/** Lapsed windows pass on: pop the queue until a live window (or nothing) remains. */
export function settle(state: State, now: number): State {
  const round = state.round;
  let arm = round.arm;
  const queue = [...round.queue];
  while (arm && now >= arm.until) {
    const next = queue.shift();
    arm = next ? { playerId: next.playerId, card: next.card, until: arm.until + ARM_MS } : null;
  }
  if (arm === round.arm && queue.length === round.queue.length) return state;
  return { ...state, round: { ...round, arm, queue } };
}

/** The first tap (arm), a queued tap, or a re-arm on another card. Returns null on the claim. */
export function tapBingo(
  state: State,
  playerId: string,
  card: number,
  now: number,
): { state: State; claim: boolean } {
  const settled = settle(state, now);
  const round = settled.round;
  if (round.arm && round.arm.playerId === playerId) {
    if (round.arm.card === card) return { state: settled, claim: true };
    return {
      state: { ...settled, round: { ...round, arm: { playerId, card, until: now + ARM_MS } } },
      claim: false,
    };
  }
  if (round.arm) {
    if (round.queue.some((q) => q.playerId === playerId)) return { state: settled, claim: false };
    return {
      state: { ...settled, round: { ...round, queue: [...round.queue, { playerId, card }] } },
      claim: false,
    };
  }
  return {
    state: { ...settled, round: { ...round, arm: { playerId, card, until: now + ARM_MS } } },
    claim: false,
  };
}

/** A claim, the end of a phase or a pattern change: nobody holds dibs any more. */
export function clearClaims(state: State): State {
  if (!state.round.arm && state.round.queue.length === 0) return state;
  return { ...state, round: { ...state.round, arm: null, queue: [] } };
}

/** Who has the card-style menu open (players only; a phone that left is dropped). */
export function setMenu(state: State, playerId: string, open: boolean): State {
  if (!hasPlayer(state, playerId)) return state;
  const menus = state.round.menus.filter((id) => id !== playerId && hasPlayer(state, id));
  if (open) menus.push(playerId);
  if (
    menus.length === state.round.menus.length &&
    menus.every((id, i) => id === state.round.menus[i])
  )
    return state;
  return { ...state, round: { ...state.round, menus } };
}

export function menusOpen(state: State): boolean {
  return state.round.menus.some((id) => hasPlayer(state, id) && state.players[id]?.connected);
}

// Round setup and the selectors every phase and view needs: who judges, who answers, what was
// played, who may vote on which slot, and the tally.
import { shuffle } from '@partybox/game-sdk';
import { drawBlack, drawWhite, refillHands } from './cards';
import { blackCard, blackPool } from './content';
import { RANDO } from './types';
import type { State } from './types';

/** The judge for `round` (czar mode): seats rotate; a disconnected seat is skipped. */
export function czarFor(state: State, round: number): string | null {
  if (state.settings.judge !== 'czar' || state.order.length === 0) return null;
  const n = state.order.length;
  const from = (round - 1) % n;
  for (let i = 0; i < n; i++) {
    const id = state.order[(from + i) % n] as string;
    if (state.players[id]?.connected) return id;
  }
  return state.order[from] as string;
}

/** Players who play a card this round: everyone but the judge. */
export function answerers(state: State): string[] {
  return Object.keys(state.players)
    .sort()
    .filter((id) => id !== state.czarId);
}

export function isCzar(state: State, playerId: string): boolean {
  return state.czarId !== null && state.czarId === playerId;
}

export function hasPlayed(state: State, id: string): boolean {
  return Object.hasOwn(state.submissions, id);
}

/** Everyone who no longer holds the answer phase up: submitted, or the judge. */
export function playersDone(state: State): string[] {
  return Object.keys(state.players).filter((id) => isCzar(state, id) || hasPlayed(state, id));
}

/** Real (non-rando) submissions so far. */
export function playedCount(state: State): number {
  return Object.keys(state.submissions).filter((id) => id !== RANDO).length;
}

/** Answers the room can still reach: connected answerers plus anyone who already played
 *  (a dropped phone never blocks the phase, and a played card is never uncounted). */
export function playersExpected(state: State): number {
  return answerers(state).filter((id) => state.players[id]?.connected || hasPlayed(state, id))
    .length;
}

/**
 * Starts round `state.round + 1`: last round's cards to the discard, hands refilled, a black card
 * drawn (plus its extra draws), the judge chosen, and — with Rando on — the phantom's cards
 * taken off the deck. Submissions, slots and votes are cleared.
 */
export function startRound(state: State): State {
  const round = state.round + 1;
  const discard = [...state.discard, ...Object.values(state.submissions).flat()];
  let next: State = {
    ...state,
    round,
    discard,
    submissions: {},
    slots: [],
    revealIndex: 0,
    votes: {},
    winners: [],
  };
  const [blackId, drawn] = drawBlack(next, blackPool(state.settings.decks));
  next = { ...drawn, blackId };
  next = { ...next, czarId: czarFor(next, round) };
  const black = blackCard(blackId);
  next = refillHands(next, black.draw, answerers(next));
  if (state.settings.rando) {
    const [cards, after] = drawWhite(next, black.pick);
    next = cards.length === black.pick ? { ...after, submissions: { [RANDO]: cards } } : next;
  }
  return next;
}

/** Closes the answer phase: submitters into a shuffled, anonymous slot order. */
export function closeAnswers(state: State): State {
  const [slots, rng] = shuffle(state.rng, Object.keys(state.submissions).sort());
  return { ...state, rng, slots, votes: {} };
}

export function slotOf(state: State, submitterId: string): number {
  return state.slots.indexOf(submitterId);
}

/** Who may vote this round: everyone (vote mode) or the judge alone (czar mode). */
export function eligibleVoters(state: State): string[] {
  if (state.settings.judge === 'czar') return state.czarId ? [state.czarId] : [];
  return Object.keys(state.players).sort();
}

/** A vote is valid on a slot that exists and is not the voter's own card. */
export function canVote(state: State, voterId: string, slot: number): boolean {
  return (
    eligibleVoters(state).includes(voterId) &&
    slot >= 0 &&
    slot < state.slots.length &&
    state.slots[slot] !== voterId
  );
}

/** Someone with nothing left to vote on (only their own card is up) never blocks the phase. */
export function hasVotableSlot(state: State, voterId: string): boolean {
  return state.slots.some((id) => id !== voterId);
}

/** Voters who voted, plus everyone who is not (or cannot be) a voter this round. */
export function votingDone(state: State): string[] {
  const voters = new Set(eligibleVoters(state).filter((id) => hasVotableSlot(state, id)));
  return Object.keys(state.players).filter(
    (id) => !voters.has(id) || Object.hasOwn(state.votes, id),
  );
}

export interface SlotTally {
  slot: number;
  submitterId: string;
  cards: string[];
  voterIds: string[];
  votes: number;
}

export function tally(state: State): SlotTally[] {
  return state.slots.map((submitterId, slot) => {
    const voterIds = Object.keys(state.votes)
      .filter((v) => state.votes[v] === slot)
      .sort();
    return {
      slot,
      submitterId,
      cards: state.submissions[submitterId] ?? [],
      voterIds,
      votes: voterIds.length,
    };
  });
}

/**
 * The round's winners: the most-voted slot(s) (ties share it); a single submission wins by
 * walkover; no votes → nobody.
 */
export function roundWinners(state: State): string[] {
  if (state.slots.length === 1) return [...state.slots];
  if (voteIsFormality(state) && Object.keys(state.votes).length === 0) return [...state.slots];
  const rows = tally(state);
  const top = Math.max(0, ...rows.map((r) => r.votes));
  if (top === 0) return [];
  return rows.filter((r) => r.votes === top).map((r) => r.submitterId);
}

export function isWalkover(state: State): boolean {
  return state.slots.length === 1;
}

/** Two cards whose authors are the only connected voters: each could only vote for the other,
 *  so the vote decides nothing — the round skips it and both take the point (review-loop #135). */
export function voteIsFormality(state: State): boolean {
  if (state.slots.length !== 2) return false;
  const voters = eligibleVoters(state).filter(
    (id) => state.players[id]?.connected && hasVotableSlot(state, id),
  );
  return voters.length > 0 && voters.every((id) => state.slots.includes(id));
}

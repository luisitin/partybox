// Round setup and the selectors every phase and view needs: who judges, who answers, what was
// played, who may vote on which slot, and the tally.
import { shuffle } from '@partybox/game-sdk';
import { drawBlack } from './cards';
import { drawGreat, leadWithFit, refillHands } from './deal';
import { dealKiller } from './killers';
import { blackCard, blackPool } from './content';
import { BLACK_CHOICES, RANDO } from './types';
import type { State } from './types';

/** The judge for `round` (czar mode): seats rotate; a disconnected seat is skipped. */
export function czarFor(state: State, round: number): string | null {
  if (state.settings.judge !== 'czar' || state.order.length === 0) return null;
  const n = state.order.length;
  const from = (round - 1) % n;
  const tied = state.tied;
  if (tied) {
    // I-147 A: sudden death's judge comes from outside the tie — a tied judge could not play.
    for (let i = 0; i < n; i++) {
      const id = state.order[(from + i) % n] as string;
      if (state.players[id]?.connected && !tied.includes(id)) return id;
    }
  }
  for (let i = 0; i < n; i++) {
    const id = state.order[(from + i) % n] as string;
    if (state.players[id]?.connected) return id;
  }
  return state.order[from] as string;
}

/** READER-VOICES: a voice is reading — set, and none of its readings has failed (a host without
 *  the voice installed answers -1: the room falls back to a person reading, as before). */
export function voiced(state: State): boolean {
  if ((state.settings.reader ?? 'none') === 'none') return false;
  return !Object.values(state.speech ?? {}).some((ms) => ms < 0);
}

/** Vote mode: the seat asked to read this round's cards out loud — the same rotation the judge
 *  uses, so over a game everyone gets a turn; a disconnected seat is skipped. Null in czar mode,
 *  where the judge is already the reader (review-loop #248). */
export function readerFor(state: State, round: number): string | null {
  if (state.settings.judge === 'czar' || state.order.length === 0) return null;
  // READER-VOICES: a voice reads the cards — nobody is asked to.
  if (voiced(state)) return null;
  const n = state.order.length;
  const from = (round - 1) % n;
  // I-143 A: a bot is "connected" but cannot read a card out loud — the rotation walks past it.
  for (let i = 0; i < n; i++) {
    const id = state.order[(from + i) % n] as string;
    const p = state.players[id];
    if (p?.connected && p.bot !== true) return id;
  }
  // Nobody in the room can read it: the TV takes the card (I-143 B).
  return null;
}

/** I-143 C: the reading is up for grabs — vote mode, and nobody connected (and not a bot) holds it. */
export function readingOpen(state: State): boolean {
  if (state.settings.judge === 'czar' || state.phase.id !== 'reveal') return false;
  if (voiced(state)) return false; // the voice has it
  const cur = state.readerId === null ? undefined : state.players[state.readerId];
  return !cur || !cur.connected || cur.bot === true;
}

/** Players who play a card this round: everyone but the judge. */
export function answerers(state: State): string[] {
  const all = Object.keys(state.players)
    .sort()
    .filter((id) => id !== state.czarId);
  // I-147 A: in sudden death only the tied players play a card; everyone else still votes.
  return state.tied ? all.filter((id) => state.tied?.includes(id)) : all;
}

export function isCzar(state: State, playerId: string): boolean {
  return state.czarId !== null && state.czarId === playerId;
}

export function hasPlayed(state: State, id: string): boolean {
  return Object.hasOwn(state.submissions, id);
}

/** I-147 A: sudden death — everyone outside the tie sits the card out (they still vote on it). */
export function sitsOut(state: State, id: string): boolean {
  return !!state.tied && !state.tied.includes(id);
}

/** Everyone who no longer holds the answer phase up: submitted, or the judge. */
export function playersDone(state: State): string[] {
  return Object.keys(state.players).filter(
    (id) => isCzar(state, id) || hasPlayed(state, id) || sitsOut(state, id), // I-147 A
  );
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
 * Starts round `state.round + 1`: last round's cards to the discard, hands refilled to ten, the
 * judge chosen, and the black card drawn — in czar mode BLACK_CHOICES of them for the judge to
 * choose between (the first is the default). Submissions, slots and votes are cleared. The
 * card's extra draws and Rando's play wait for `settleBlack` (answer entry), once the card is
 * known.
 */
export function startRound(state: State): State {
  // I-147 A: a tie-break is not round N+1 of N — it replays the last round's number.
  const round = state.tied ? state.round : state.round + 1;
  const discard = [...state.discard, ...Object.values(state.submissions).flat()];
  // I-773 A: a round the room judged in the judge's place goes back to a judge
  const settings = state.judgeGone ? { ...state.settings, judge: 'czar' as const } : state.settings;
  let next: State = {
    ...state,
    settings,
    judgeGone: null,
    round,
    discard,
    submissions: {},
    guesses: {},
    slots: [],
    revealIndex: 0,
    votes: {},
    winners: [],
    blackChoices: [],
  };
  next = { ...next, czarId: czarFor(next, round), readerId: readerFor(next, round) };
  const pool = blackPool(state.settings.decks);
  const choices: string[] = [];
  const wanted = next.czarId ? BLACK_CHOICES : 1;
  while (choices.length < wanted) {
    const [id, drawn] = drawBlack(next, pool);
    next = drawn;
    if (id === null || choices.includes(id)) break;
    choices.push(id);
  }
  next = { ...next, blackId: choices[0] ?? null, blackChoices: choices.length > 1 ? choices : [] };
  return refillHands(next);
}

/** The judge's choice (czar mode): `index` into `blackChoices`. The three stay on the stage for a
 *  beat — the room watches the chosen one light up — and `settleBlack` clears them. */
export function chooseBlack(state: State, index: number): State {
  const id = state.blackChoices[index];
  if (id === undefined) return state;
  return { ...state, blackId: id };
}

/** The black card is final: its extra draws to the answerers' hands, and Rando's play. */
export function settleBlack(state: State): State {
  let next = state.blackId === null ? chooseBlack(state, 0) : state;
  // The questions not taken go under the deck for a later round.
  const rest = next.blackChoices.filter((id) => id !== next.blackId);
  next = { ...next, blackChoices: [], blackDeck: [...next.blackDeck, ...rest] };
  const black = blackCard(next.blackId);
  // The prompt's own killer (a card tagged for it) into one answerer's hand (the 2026-09-22 audit),
  // then the fit floor and the order — which keep it and lead with it.
  next = refillHands(next, black.draw, answerers(next));
  next = leadWithFit(dealKiller(next, answerers(next)), answerers(next));
  if (state.settings.rando) {
    const [cards, after] = drawGreat(next, black.pick);
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

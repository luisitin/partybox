// What is on the table, as the TV and the phones see it: the black card (and the judge's three
// choices), the anonymous cards on stage, and — once the result is public — who played each one and
// who voted for it. The rules for what may be shown when live in views.ts.
import { revealSpan } from './cards';
import { blackCard, whiteText } from './content';
import { tally } from './round';
import { RANDO, RANDO_NAME } from './types';
import type { State } from './types';

export interface BlackView {
  text: string;
  pick: number;
  draw: number;
  /** pick: the one the judge took (the others dim for a beat before the round starts). */
  chosen?: boolean;
}

export interface PersonView {
  id: string;
  name: string;
  avatarId: string;
  connected: boolean;
}

/** One anonymous submission on stage. */
export interface CardView {
  slot: number;
  whites: string[];
}

/** A submission once authors are public (result). */
export interface RevealedCard extends CardView {
  submitterId: string;
  name: string;
  avatarId: string;
  /** The phantom player (Rando setting). */
  rando: boolean;
  votes: number;
  voterIds: string[];
  /** Who voted for this card, in id order (result only) — the room sees who liked what. */
  voters: PersonView[];
  winner: boolean;
}

export function blackView(state: State): BlackView | null {
  if (state.round === 0) return null;
  const { text, pick, draw } = blackCard(state.blackId);
  return { text, pick, draw };
}

export function blackChoices(state: State): BlackView[] {
  if (state.phase.id !== 'pick') return [];
  return state.blackChoices.map((id) => {
    const { text, pick, draw } = blackCard(id);
    return { text, pick, draw, chosen: id === state.blackId };
  });
}

export function person(state: State, id: string | null): PersonView | null {
  const p = id ? state.players[id] : undefined;
  return p ? { id: p.id, name: p.name, avatarId: p.avatarId, connected: p.connected } : null;
}

export function cardViews(state: State, upTo: number): CardView[] {
  return state.slots.slice(0, upTo).map((submitter, slot) => ({
    slot,
    whites: (state.submissions[submitter] ?? []).map(whiteText),
  }));
}

export /** Cards on stage for this phase: none until reveal, one more per reveal step, all from judge on. */
function stageCards(state: State): CardView[] {
  const phase = state.phase.id;
  // I-157: the whole flight on stage — exactly the flight, so nothing unrevealed leaks early.
  if (phase === 'reveal')
    return cardViews(state, Math.min(state.slots.length, state.revealIndex + revealSpan(state.slots.length)));
  if (phase === 'judge' || phase === 'result') return cardViews(state, state.slots.length);
  return [];
}

export function revealedCards(state: State): RevealedCard[] {
  if (state.phase.id !== 'result') return [];
  const winners = new Set(state.winners);
  return tally(state).map((t) => {
    const p = state.players[t.submitterId];
    const rando = t.submitterId === RANDO;
    return {
      slot: t.slot,
      whites: t.cards.map(whiteText),
      submitterId: t.submitterId,
      name: rando ? RANDO_NAME : (p?.name ?? '?'),
      avatarId: rando ? 'robot' : (p?.avatarId ?? 'ghost'),
      rando,
      votes: t.votes,
      voterIds: t.voterIds,
      voters: t.voterIds.map((id) => person(state, id)).filter((p): p is PersonView => p !== null),
      winner: winners.has(t.submitterId),
    };
  });
}

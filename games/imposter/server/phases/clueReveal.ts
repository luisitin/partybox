// Phase "clueReveal": the TV deals this clue round's cards face up one at a time, each with its
// author, in a seeded shuffle (never submission order, SPEC §1.5), each held for its reading + 0.3 s
// (1.2–3 s; 1.4 s with no reader). One phase instance, one deadline per card (ADR-033 beats); the
// last card stays 2 s more. A pause freezes the step; resume continues from the same card.
import { enterPhase, isTimerFor, shuffle } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { activeSeats } from '../round';
import { clueLine, fixedLine, voiceOf } from '../speech';
import { CARD_BEAT_MS, CARD_LAST_MS, CARD_MAX_MS, CARD_MIN_MS, CARD_SILENT_MS } from '../types';
import type { Input, State, Transition } from '../types';

/** "Clues are in." holds the empty table this long before the first card. */
const OPEN_MS = 1_600;

function holdFor(state: State, key: string | null): number {
  if (!voiceOf(state) || key === null) return CARD_SILENT_MS;
  const ms = state.speechMs[key];
  if (ms === undefined) return CARD_MAX_MS; // not made yet: hold the most; it re-times on arrival
  if (ms < 0) return CARD_SILENT_MS;
  return Math.min(CARD_MAX_MS, Math.max(CARD_MIN_MS, ms + CARD_BEAT_MS));
}

/** The reading key for card `k` (1-based), or null for a card with no clue. */
function cardKey(state: State, k: number): string | null {
  const r = state.round;
  const by = r.revealOrder[k - 1];
  const clue = r.clues.find((c) => c.by === by && c.r === r.clueRound);
  return clue ? (clueLine(state, clue.text)?.req.key ?? null) : null;
}

function cardMs(state: State, k: number): number {
  const last = k >= state.round.revealOrder.length;
  return holdFor(state, cardKey(state, k)) + (last ? CARD_LAST_MS : 0);
}

export function enterClueReveal(state: State, now: number): State {
  const [order, rng] = shuffle(state.rng, activeSeats(state));
  const round = { ...state.round, revealOrder: order, revealed: 0 };
  const said = { ...state.said };
  for (const c of state.round.clues)
    if (c.r === state.round.clueRound) said[c.by] = [...(said[c.by] ?? []), c.text];
  const open = fixedLine(state, 'cluesIn');
  const openMs = open
    ? Math.max(OPEN_MS, (state.speechMs[open.req.key] ?? 0) + CARD_BEAT_MS)
    : OPEN_MS;
  return enterPhase(
    { ...state, rng, round, said },
    'clueReveal',
    now,
    order.length > 0 ? openMs : CARD_LAST_MS,
  );
}

/** A reading arrived: the card on the table re-times to it (its voice starts now). */
export function retimeClueReveal(state: State, key: string, now: number): State {
  const k = state.round.revealed;
  if (state.phase.id !== 'clueReveal' || k === 0 || state.phase.deadline === null) return state;
  if (cardKey(state, k) !== key) return state;
  return { ...state, phase: { ...state.phase, deadline: now + cardMs(state, k) } };
}

export function reduceClueReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  if (!isTimerFor(state, event)) return state;
  const r = state.round;
  if (r.revealed >= r.revealOrder.length) return next(state, event.now);
  const k = r.revealed + 1;
  const after: State = { ...state, round: { ...r, revealed: k } };
  return { ...after, phase: { ...after.phase, deadline: event.now + cardMs(after, k) } };
}

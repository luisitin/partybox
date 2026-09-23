// Phase "reveal": the TV (and every phone) reads one submission at a time — the black card with
// the white cards dropped in — one phase instance per slot, timed to its length. Exits on each
// card's deadline; a VIP skip is the next card (I-774), and the last one's opens the vote.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { revealMs } from '../cards';
import { readingOpen } from '../round';
import { readingFor } from '../speech';
import { blackCard, whiteText } from '../content';
import type { Input, State } from '../types';
import type { Transition } from './intro';

/** READER-VOICES: after a reading, a beat before the next card (the room waits for the reader). */
export const VOICE_BEAT_MS = 900;
/** A reading that is not made yet holds the card this long at most — a stuck synth never holds
 *  the room; when it arrives the card re-times to it. */
export const VOICE_WAIT_MS = 12_000;

/** How long card `index` stays up: its reading plus a beat, else the time to read it out loud. */
function stayMs(state: State, index: number): number {
  const reading = readingFor(state, index);
  const ms = reading ? state.speech?.[reading.key] : undefined;
  if (reading && ms === undefined) return VOICE_WAIT_MS;
  if (reading && ms !== undefined && ms >= 0) return ms + VOICE_BEAT_MS;
  const submitter = state.slots[index];
  const whites = (submitter ? state.submissions[submitter] : []) ?? [];
  return revealMs(blackCard(state.blackId).text, whites.map(whiteText), state.slots.length);
}

/** Puts `state.slots[index]` on stage. */
export function enterReveal(state: State, now: number, index: number): State {
  return enterPhase({ ...state, revealIndex: index }, 'reveal', now, stayMs(state, index));
}

/** ADR-045: a reading is ready (or failed). The card on stage re-times to it: the voice starts
 *  on the TV now, so the next card waits for it and a beat. */
export function applySpeech(state: State, key: string, ms: number, now: number): State {
  const next: State = { ...state, speech: { ...state.speech, [key]: ms } };
  if (state.phase.id !== 'reveal' || state.phase.deadline === null) return next;
  if (readingFor(state, state.revealIndex)?.key !== key) return next;
  return { ...next, phase: { ...next.phase, deadline: now + stayMs(next, state.revealIndex) } };
}

export function reduceReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  // I-143 C: nobody can do the reading — the first person to offer takes it.
  if (event.type === 'input' && event.input.type === 'takeReading') {
    const p = state.players[event.playerId];
    if (!readingOpen(state) || !p?.connected || p.bot === true) return state;
    return { ...state, readerId: event.playerId };
  }
  return state;
}

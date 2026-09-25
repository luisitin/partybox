// Phase "clue": everyone types one word at the same time (SPEC §1.7). Crew clues are checked
// against the word; the imposter's never is (Part 00 §4.7 — the reason would leak the word). From
// clue round two, a clue already on the board is turned down for everyone (public clues only).
// A resend replaces the earlier clue. Ends when every connected player has one, on the deadline,
// or on the VIP's skip.
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { isLegalClue, sameAnswer } from '../../match';
import { PACK_LANG } from '../content';
import { activeSeats, boardClues, isImposter, wordOf } from '../round';
import { CLUE_MAX_CHARS } from '../types';
import type { Input, RejectReason, State, Transition } from '../types';

export function enterClue(state: State, now: number, clueRound: number): State {
  const round = { ...state.round, clueRound, revealOrder: [], revealed: 0 };
  return enterPhase({ ...state, round }, 'clue', now, state.cfg.clueSeconds * 1000);
}

/** Why a clue is turned down, or null when it stands. */
export function clueProblem(state: State, id: string, text: string): RejectReason | null {
  const raw = text.trim();
  if (raw.length === 0) return 'empty';
  if ([...raw].length > CLUE_MAX_CHARS) return 'too-long';
  if (raw.split(/\s+/).length > 1) return 'not-one-word';
  const word = wordOf(state);
  if (!isImposter(state, id) && word) {
    const v = isLegalClue(raw, word, { oneWord: true, maxChars: CLUE_MAX_CHARS, lang: PACK_LANG });
    if (!v.ok) return v.reason;
  }
  if (boardClues(state).some((c) => sameAnswer(c.text, raw, PACK_LANG))) return 'repeat';
  return null;
}

function submitted(state: State): string[] {
  return state.round.clues.filter((c) => c.r === state.round.clueRound).map((c) => c.by);
}

export function reduceClue(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'clue') return state;
  const id = event.playerId;
  if (!hasPlayer(state, id) || !activeSeats(state).includes(id)) return state;
  const r = state.round;
  const why = clueProblem(state, id, event.input.text);
  if (why) {
    const n = (r.rejects[id]?.n ?? 0) + 1;
    return { ...state, round: { ...r, rejects: { ...r.rejects, [id]: { why, n } } } };
  }
  const text = event.input.text.trim();
  const clues = [
    ...r.clues.filter((c) => !(c.by === id && c.r === r.clueRound)),
    { by: id, text, r: r.clueRound },
  ];
  const rejects = { ...r.rejects };
  delete rejects[id];
  const after: State = { ...state, round: { ...r, clues, rejects } };
  return allConnectedDone(after, submitted(after)) ? next(after, event.now) : after;
}

// Phase "clue": every clue-giver sees the word and writes one clue (two in a 3-player game).
// Ends when every connected clue-giver has one in, on the clock, or by the VIP. Half the
// connected clue-givers tapping "Don't know it" early swaps the word for a spare (§7.6).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { PACK_LANG } from '../content';
import { nextIdx } from '../deck';
import { isLegalClue, sameAnswer } from '../match/index';
import { cluesPerGiver, connectedGivers, giversDone, guesserFor, isGiver } from '../roles';
import { CLUE_MAX_CHARS, DONT_KNOW_WINDOW_MS, MAX_SWAPS } from '../types';
import type { ClueReject, Input, State, Transition, Word } from '../types';

function freshWord(state: State, idx: number, swaps: number): Word {
  return {
    idx,
    word: state.deck[idx] ?? (state.deck[0] as Word['word']),
    guesser: guesserFor(state, state.turns.length),
    clues: {},
    rejects: {},
    dontKnow: [],
    swaps,
    groups: null,
    checkOk: [],
    guess: null,
  };
}

/** The next word on the table (server/index.ts only calls this while the deck has one). */
export function enterClue(state: State, now: number): State {
  const w = freshWord(state, nextIdx(state), 0);
  return enterPhase({ ...state, w }, 'clue', now, state.cfg.clueSeconds * 1000);
}

export function canSwap(state: State): boolean {
  return state.w.swaps < MAX_SWAPS && state.spares.length > 0;
}

/** Why `texts` can't be this player's clue, or null. Mirrors what the phone checks as they type. */
export function clueProblem(state: State, texts: readonly string[]): ClueReject | null {
  if (texts.length !== cluesPerGiver(state)) return 'count';
  for (const t of texts) {
    const res = isLegalClue(t, state.w.word, PACK_LANG, {
      oneWord: true,
      maxChars: CLUE_MAX_CHARS,
    });
    if (!res.ok) return res.reason;
  }
  if (texts.length === 2 && sameAnswer(texts[0] as string, texts[1] as string, PACK_LANG))
    return 'twin';
  return null;
}

function onClue(
  state: State,
  playerId: string,
  texts: string[],
  now: number,
  next: Transition,
): State {
  // Two texts outside a 3-player game are ignored, not refused (§7.9).
  if (!state.twoClues && texts.length !== 1) return state;
  const clean = texts.map((t) => t.trim());
  const problem = clueProblem(state, clean);
  if (problem)
    return { ...state, w: { ...state.w, rejects: { ...state.w.rejects, [playerId]: problem } } };
  const rejects = { ...state.w.rejects };
  delete rejects[playerId];
  const after: State = {
    ...state,
    w: { ...state.w, clues: { ...state.w.clues, [playerId]: clean }, rejects },
  };
  return giversDone(after, Object.keys(after.w.clues)) ? next(after, now) : after;
}

function onDontKnow(state: State, playerId: string, now: number): State {
  if (state.w.dontKnow.includes(playerId)) return state;
  if (now - state.phase.startedAt > DONT_KNOW_WINDOW_MS || !canSwap(state)) return state;
  const dontKnow = [...state.w.dontKnow, playerId];
  const live = connectedGivers(state);
  const need = Math.max(1, Math.ceil(live.length / 2));
  const votes = dontKnow.filter((id) => live.includes(id)).length;
  if (votes < need) return { ...state, w: { ...state.w, dontKnow } };
  // Swap: the spare takes this word's place in the deck; the clues start over with a full clock.
  const [spare, ...spares] = state.spares;
  const deck = state.deck.map((w, i) => (i === state.w.idx && spare ? spare : w));
  const swapped: State = { ...state, deck, spares };
  const w = { ...freshWord(swapped, state.w.idx, state.w.swaps + 1), guesser: state.w.guesser };
  return enterPhase({ ...swapped, w }, 'clue', now, state.cfg.clueSeconds * 1000);
}

export function reduceClue(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || !isGiver(state, event.playerId)) return state;
  const { input } = event;
  if (input.type === 'clue') return onClue(state, event.playerId, input.texts, event.now, next);
  if (input.type === 'dontKnow') return onDontKnow(state, event.playerId, event.now);
  return state;
}

/** A player left or dropped: the room may now be complete without them. */
export function recheckClue(state: State, now: number, next: Transition): State {
  return giversDone(state, Object.keys(state.w.clues)) ? next(state, now) : state;
}

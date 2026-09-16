// Phase "pick" (20 s): everyone chooses their secret word — one of three offers, or their own
// text when custom words are on. Closing the phase fills unpicked books with the medium offer and
// starts step 1 via `next`.
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { PICK_MS } from '../types';
import type { Book, Input, State, Transition } from '../types';

export function enterPick(state: State, now: number): State {
  return enterPhase(state, 'pick', now, PICK_MS);
}

export function hasPicked(state: State, playerId: string): boolean {
  const seat = state.seats.indexOf(playerId);
  return seat >= 0 && (state.books[seat]?.pages.length ?? 0) > 0;
}

function withWord(state: State, playerId: string, text: string): State {
  const seat = state.seats.indexOf(playerId);
  const books = state.books.map((book, b): Book =>
    b === seat ? { ...book, pages: [{ kind: 'word', authorId: playerId, text }] } : book,
  );
  return { ...state, books };
}

/** Unpicked players get their medium offer; then the first step begins. */
export function closePick(state: State, now: number, next: Transition): State {
  let s = state;
  for (const id of s.seats) {
    if (hasPicked(s, id)) continue;
    s = withWord(s, id, s.offers[id]?.[1] ?? 'a mystery');
  }
  return next({ ...s, step: 1 }, now);
}

export function reducePick(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    const { playerId, input } = event;
    if (!hasPlayer(state, playerId) || hasPicked(state, playerId)) return state;
    let text: string | null = null;
    if (input.type === 'pick') text = state.offers[playerId]?.[input.option] ?? null;
    else if (input.type === 'pickCustom' && state.settings.customWords) text = input.text.trim();
    if (!text) return state;
    const after = withWord(state, playerId, text);
    const picked = after.seats.filter((id) => hasPicked(after, id));
    return allConnectedDone(after, picked) ? closePick(after, event.now, next) : after;
  }
  if (isTimerFor(state, event)) return closePick(state, event.now, next);
  return state;
}

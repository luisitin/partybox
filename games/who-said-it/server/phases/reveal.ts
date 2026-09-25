// Phase "reveal", in two beats of one phase instance (ADR-033): `land` — the guesses fly onto the
// faces they picked, a hold, "It was…"; then `shown` — the author flips up, the card is scored,
// the reader says the name. Points and authors reach the views only at `shown`, so neither the TV
// nor a phone can run ahead of the flip. A VIP skip jumps to the next card (scored first).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { currentCard } from '../round';
import { scoreCard, tallyCard } from '../scoring';
import { fixedLine, flipReading, msOf } from '../speech';
import { LAND_MS, LINE_GAP_MS, SHOWN_MS } from '../types';
import type { FlipLine, Input, State, Transition } from '../types';

/** After the reader's last line, the beat before the next card. */
export const TAIL_MS = 900;

export function enterReveal(state: State, now: number): State {
  const p = { ...state.p, step: 'land' as const, flip: null, points: {} };
  return enterPhase({ ...state, p }, 'reveal', now, LAND_MS);
}

/** Which lines play at the flip — only ones already made, so nothing is said late. */
function flipLine(state: State, at: number): FlipLine {
  const card = currentCard(state);
  if (!card) return { at, key: null, ms: 0, after: null, afterMs: 0 };
  const name = flipReading(state, card);
  const nameMs = msOf(state, name);
  const fallback = fixedLine(state, 'itWas');
  const fbMs = msOf(state, fallback);
  const [key, ms] =
    name && nameMs !== undefined && nameMs > 0
      ? [name.key, nameMs]
      : fallback && fbMs !== undefined && fbMs > 0
        ? [fallback.key, fbMs]
        : [null, 0];
  const t = tallyCard(state, card);
  const tapped = t.right.length + t.wrong.length;
  const which = tapped >= 2 && t.wrong.length === 0 ? 'everyone' : tapped >= 2 && t.right.length === 0 ? 'nobody' : null; // prettier-ignore
  const after = which ? fixedLine(state, which) : null;
  const afterMs = msOf(state, after);
  return after && afterMs !== undefined && afterMs > 0 && key
    ? { at, key, ms, after: after.key, afterMs }
    : { at, key, ms, after: null, afterMs: 0 };
}

/** The flip: score the card once, fix the lines, hold for the voice and a tail. */
export function flip(state: State, now: number): State {
  const line = flipLine(state, now);
  const scored = scoreCard(state);
  const voice = line.ms + (line.after ? LINE_GAP_MS + line.afterMs : 0);
  const hold = Math.max(SHOWN_MS, voice + TAIL_MS);
  return {
    ...scored,
    p: { ...scored.p, step: 'shown', flip: line },
    phase: { ...scored.phase, deadline: now + hold },
  };
}

export function reduceReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  if (!isTimerFor(state, event)) return state;
  return state.p.step === 'land' ? flip(state, event.now) : next(state, event.now);
}

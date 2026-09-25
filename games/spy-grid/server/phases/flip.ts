// Phase "flip" (SPEC §9.4, §9.12): two beats. Stage 0 (on entry) the TV turns the card — no phone
// learns what it is yet; stage 1, 0.8 s later, the identity reaches every phone and the reader says
// it. Then `next` (flow.ts) applies the result. A VIP skip completes the flip at once.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { bumpStats, foundThisClue, logFlip } from '../round';
import { flipLine } from '../speech';
import { FLIP_SHOW_MS, FLIP_STAGE_MS, VOICE_BEAT_MS } from '../types';
import type { Input, State, Transition } from '../types';

function withFlipStats(state: State): State {
  const flip = state.turn.flip;
  if (!flip) return state;
  let s = state;
  const own = flip.kind === state.turn.team;
  if (flip.first && own)
    s = bumpStats(s, flip.first, { sharp: (s.stats[flip.first]?.sharp ?? 0) + 1 });
  if (flip.first && flip.kind === 'assassin')
    s = bumpStats(s, flip.first, { trap: (s.stats[flip.first]?.trap ?? 0) + 1 });
  const spy = state.turn.spymaster;
  if (spy && own) {
    const found = foundThisClue(s);
    const st = s.stats[spy];
    if (st)
      s = bumpStats(s, spy, {
        agentsFromClues: st.agentsFromClues + 1,
        bestClue: Math.max(st.bestClue, found),
      });
  }
  return s;
}

export function enterFlip(state: State, now: number): State {
  const flip = state.turn.flip;
  if (!flip) return state;
  const flipped = state.flipped.map((f, i) => (i === flip.card ? 1 : f));
  const turn = { ...state.turn, left: state.turn.left - 1, made: state.turn.made + 1 };
  const logged = withFlipStats(logFlip({ ...state, flipped, turn }, flip));
  return enterPhase(logged, 'flip', now, FLIP_STAGE_MS);
}

/** Stage 1: the identity everywhere, held for the reader's line (or the plain beat). */
export function showFlip(state: State): State {
  const flip = state.turn.flip;
  if (!flip) return state;
  return { ...state, flipped: state.flipped.map((f, i) => (i === flip.card ? 2 : f)) };
}

function showMs(state: State): number {
  const line = flipLine(state);
  const ms = line ? state.speechMs[line.key] : undefined;
  return ms !== undefined && ms >= 0 ? Math.max(FLIP_SHOW_MS, ms + VOICE_BEAT_MS) : FLIP_SHOW_MS;
}

export function reduceFlip(state: State, event: GameEvent<Input>, next: Transition): State {
  if (!isTimerFor(state, event)) return state;
  const card = state.turn.flip?.card ?? -1;
  if (state.flipped[card] === 1) {
    // ADR-033: answering the timer with a later deadline in the same phase is a second beat.
    const shown = showFlip(state);
    return { ...shown, phase: { ...shown.phase, deadline: event.now + showMs(shown) } };
  }
  return next(state, event.now);
}

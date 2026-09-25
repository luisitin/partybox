// Phase "intro" (teams only): the roster card after the shell's start stage (ADR-053) — the two
// sides and who plays first, while the first psychic's reading is made. The rules, READY and the
// 3 · 2 · 1 are the shell's now; this card has none of them and ends on its own after
// TEAMS_CARD_MS (or the VIP's Skip). Solo and co-op start straight at turn 1.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { TEAMS_CARD_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterIntro(state: State, now: number): State {
  return enterPhase(state, 'intro', now, TEAMS_CARD_MS);
}

export function reduceIntro(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

// Phase "check" (clue-givers only, up to 12 s, quiet clock): every clue, echoes struck through.
// "Not the same ✋" splits an echo, "Same word ✋" joins two survivors; any tap applies at once
// and anyone can undo it (co-op: nobody gains by cheating). Ends when every connected clue-giver
// taps Looks good, on the clock, or by the VIP.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { autoGroups, joinGroups, splitGroup } from '../echoes';
import { giversDone, isGiver } from '../roles';
import { CHECK_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterCheck(state: State, now: number): State {
  return enterPhase(
    { ...state, w: { ...state.w, groups: autoGroups(state), checkOk: [] } },
    'check',
    now,
    CHECK_MS,
  );
}

/** The check is worth a phase only when it's on and there are two clues to compare. */
export function wantsCheck(state: State): boolean {
  const count = Object.values(state.w.clues).reduce((n, t) => n + t.length, 0);
  return state.cfg.check && count >= 2;
}

export function reduceCheck(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || !isGiver(state, event.playerId)) return state;
  const { input } = event;
  const groups = state.w.groups ?? autoGroups(state);
  if (input.type === 'split' || input.type === 'join') {
    const changed =
      input.type === 'split'
        ? splitGroup(groups, input.group)
        : joinGroups(groups, input.a, input.b);
    return changed ? { ...state, w: { ...state.w, groups: changed } } : state;
  }
  if (input.type === 'ok') {
    if (state.w.checkOk.includes(event.playerId)) return state;
    const after: State = {
      ...state,
      w: { ...state.w, checkOk: [...state.w.checkOk, event.playerId] },
    };
    return giversDone(after, after.w.checkOk) ? next(after, event.now) : after;
  }
  return state;
}

export function recheckCheck(state: State, now: number, next: Transition): State {
  return giversDone(state, state.w.checkOk) ? next(state, now) : state;
}

// Phase "night": every living player picks someone on the same screen (SPEC §10.5), so nobody can
// be spotted by what they do. A pick the role may not make is ignored (the phone already told its
// owner why: NOTES decision 1). Picks can change until the phase ends: every living connected
// player has picked, the night clock runs out, or the VIP skips.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { allLivingDone, isAlive, nightRefusal } from '../rules';
import type { Input, State, Transition } from '../types';

export function enterNight(state: State, now: number): State {
  const fresh: State = {
    ...state,
    day: state.day + 1,
    picks: {},
    ready: [],
    votes: {},
    runoff: null,
    verdict: null,
    lastWords: null,
    shot: null,
    step: 0,
    stepAt: now,
    dayEndsAt: null,
    beats: [],
    lateKeys: [],
  };
  return enterPhase(fresh, 'night', now, state.cfg.nightSeconds * 1000);
}

export function reduceNight(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'night') return state;
  const by = event.playerId;
  const target = event.input.target;
  if (!hasPlayer(state, by) || !isAlive(state, by)) return state;
  if (nightRefusal(state, by, target) !== null || state.picks[by] === target) return state;
  const after: State = { ...state, picks: { ...state.picks, [by]: target } };
  return allLivingDone(after, Object.keys(after.picks)) ? next(after, event.now) : after;
}

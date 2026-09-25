// Phase "pick": the options are built (SPEC §3.8) and every phone gets them minus its own lie. Tap
// one to pick it (resend to change); 👍 up to two others. Exits when every connected player has
// picked, on the deadline, or on VIP skip.
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { buildOptions } from '../options';
import { MAX_LIKES } from '../types';
import type { Input, State, Transition } from '../types';

export function enterPick(state: State, now: number): State {
  const [options, rng] = buildOptions(state);
  return enterPhase(
    { ...state, rng, q: { ...state.q, options } },
    'pick',
    now,
    state.cfg.pickSeconds * 1000,
  );
}

export function picksIn(state: State): string[] {
  return Object.keys(state.q.picks);
}

/** True when `playerId` may pick or like option `id`: it exists and they did not write it. */
function pickable(state: State, playerId: string, id: string): boolean {
  const option = state.q.options?.find((o) => o.id === id);
  return option !== undefined && !option.authors.includes(playerId);
}

function applyPick(state: State, playerId: string, option: string): State {
  if (!pickable(state, playerId, option) || state.q.picks[playerId] === option) return state;
  return { ...state, q: { ...state.q, picks: { ...state.q.picks, [playerId]: option } } };
}

function applyLike(state: State, playerId: string, option: string, on: boolean): State {
  if (!state.cfg.likes || !pickable(state, playerId, option)) return state;
  const mine = state.q.likes[playerId] ?? [];
  const has = mine.includes(option);
  if (on === has || (on && mine.length >= MAX_LIKES)) return state;
  const likes = on ? [...mine, option] : mine.filter((id) => id !== option);
  return { ...state, q: { ...state.q, likes: { ...state.q.likes, [playerId]: likes } } };
}

export function reducePick(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (!hasPlayer(state, event.playerId)) return state;
    const { input } = event;
    if (input.type === 'like') return applyLike(state, event.playerId, input.option, input.on);
    if (input.type !== 'pick') return state;
    const after = applyPick(state, event.playerId, input.option);
    return after !== state && allConnectedDone(after, picksIn(after))
      ? next(after, event.now)
      : after;
  }
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

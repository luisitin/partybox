// Phase "live" (Live mode, SPEC §8.6): open rising bids. A raise carries the absolute amount the
// phone showed; it stands only if higher, affordable and not from the high bidder. The clock is
// the phase's own deadline, re-armed per stage (ADR-033): a bid → 3 s → "Going once…" → 2 s →
// "Going twice…" → 2 s → SOLD. Any bid resets it; 40 s after opening the next stage is SOLD; with
// no bid at all the lot is unsold after 8 s. A pause freezes the clock (the shared helper).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { inGame, refuseRaise } from '../auction';
import { LIVE_CAP_MS, LIVE_NO_BIDS_MS, LIVE_STAGE_MS } from '../timing';
import type { Input, State, Transition } from '../types';

export function enterLive(state: State, now: number): State {
  return enterPhase(
    { ...state, l: { ...state.l, openedAt: now, high: null, stage: 0 } },
    'live',
    now,
    LIVE_NO_BIDS_MS,
  );
}

function onTimer(state: State, now: number, next: Transition): State {
  const { l } = state;
  if (!l.high || now >= l.openedAt + LIVE_CAP_MS || l.stage === 2) return next(state, now);
  const stage = (l.stage + 1) as 1 | 2;
  const deadline = now + (LIVE_STAGE_MS[stage] ?? 2_000);
  return { ...state, phase: { ...state.phase, deadline }, l: { ...l, stage } };
}

export function reduceLive(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return onTimer(state, event.now, next);
  if (event.type !== 'input' || event.input.type !== 'raise') return state;
  const id = event.playerId;
  if (!inGame(state, id)) return state;
  const amount = event.input.amount;
  const refused = refuseRaise(state, id, amount);
  if (refused) {
    const have = state.coins[id] ?? 0;
    return {
      ...state,
      notices: { ...state.notices, [id]: { code: refused, have, at: event.now } },
    };
  }
  const { [id]: _cleared, ...notices } = state.notices;
  return {
    ...state,
    notices,
    phase: { ...state.phase, deadline: event.now + LIVE_STAGE_MS[0] },
    l: { ...state.l, high: { by: id, amount }, stage: 0 },
  };
}

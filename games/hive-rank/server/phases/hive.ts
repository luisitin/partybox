// Phase "hive": the reveal. Step 0 is "The hive has decided…"; steps 1–5 land the spots from 5th
// to 1st, each held about 2 s or its reading plus a beat. One phase instance: each step re-arms
// the deadline (ADR-033). A spot whose reading is still being made waits for it — never past
// VOICE_WAIT_MS into the phase. A VIP skip is the next spot, at once. Fewer than two orders:
// "Not enough bees!" and no points. Points are worked out here and applied at `score`.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { buildHive, lowsOf, queensOf, scoreRound } from '../hive';
import { question } from '../round';
import { lineRequest, msOf, spotRequest, voiceOf } from '../speech';
import {
  DECIDED_BEAT_MS,
  DECIDED_MS,
  SHORT_MS,
  SPOT_BEAT_MS,
  SPOT_MS,
  TOP_SPOT_MS,
  VOICE_WAIT_MS,
} from '../types';
import type { Input, State, Transition } from '../types';

/** The number one spot's reading gets a longer beat after it: it is the moment. */
const TOP_BEAT_MS = 1_500;

export function enterHive(state: State, now: number): State {
  const orders = Object.fromEntries(
    Object.entries(state.q.orders).filter(([id]) => hasPlayer(state, id)),
  );
  const packOrder = question(state)?.items.map((i) => i.id) ?? [];
  const hive = buildHive(packOrder, Object.values(orders));
  if (!hive) {
    const short: State = { ...state, q: { ...state.q, orders, short: true, step: 0 } };
    return enterPhase(short, 'hive', now, SHORT_MS);
  }
  const delta = scoreRound(orders, hive.order);
  const q = {
    ...state.q,
    orders,
    hive: hive.order,
    totals: hive.totals,
    step: 0,
    delta,
    queens: queensOf(delta),
    lows: lowsOf(delta),
  };
  const decided = msOf(state, lineRequest(state, 'decided'));
  const hold =
    decided !== undefined && decided >= 0
      ? Math.max(DECIDED_MS, DECIDED_BEAT_MS + decided + 300)
      : DECIDED_MS;
  return enterPhase({ ...state, q }, 'hive', now, hold);
}

/** Lands spot `step` (1 = 5th place … 5 = 1st) and holds it. */
function land(state: State, step: number, now: number): State {
  const ms = msOf(state, spotRequest(state, step));
  const voiced = ms !== undefined && ms >= 0;
  const hold =
    step < 5
      ? voiced
        ? Math.max(SPOT_MS, ms + SPOT_BEAT_MS)
        : SPOT_MS
      : voiced
        ? Math.max(TOP_SPOT_MS, ms + TOP_BEAT_MS)
        : TOP_SPOT_MS;
  const q = {
    ...state.q,
    step,
    hold: false,
    voiced: voiced ? [...state.q.voiced, step] : state.q.voiced,
  };
  return { ...state, q, phase: { ...state.phase, deadline: now + hold } };
}

/** The next step at once (a VIP skip, or a reading that arrived): false when the reveal is over. */
export function nextStep(state: State, now: number): State | null {
  if (state.q.short || state.q.step >= 5) return null;
  return land(state, state.q.step + 1, now);
}

/** Should the next spot wait for its reading? */
function mustWait(state: State, now: number): boolean {
  if (!voiceOf(state) || state.q.short || state.q.step >= 5) return false;
  const ms = msOf(state, spotRequest(state, state.q.step + 1));
  return ms === undefined && now < state.phase.startedAt + VOICE_WAIT_MS;
}

export function reduceHive(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) {
    if (!state.q.hold && mustWait(state, event.now)) {
      const until = state.phase.startedAt + VOICE_WAIT_MS;
      return {
        ...state,
        q: { ...state.q, hold: true },
        phase: { ...state.phase, deadline: until },
      };
    }
    return next(state, event.now);
  }
  // The reading the next spot was waiting for is ready: land it now.
  if (event.type === 'speech' && state.q.hold) {
    const wanted = spotRequest(state, state.q.step + 1);
    if (wanted?.key === event.key) return next(state, event.now);
  }
  return state;
}

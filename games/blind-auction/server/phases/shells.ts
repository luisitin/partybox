// The shell game (LIVE-EVENTS.md, the owner's spec): everyone stakes into one pot at `bet`; the pot
// sets the speed tier (×1 … ×10); `shuffle` — the TV shows the ball go under a cup and the cups
// swap, faster the bigger the pot; `cups` — every staker picks the cup they think hides it. The
// shuffle is drawn here, so the ball's cup is known the moment the shuffle starts; only the TV's
// view carries the swaps (it has to show them), the phones never do.
import { allConnectedDone, enterPhase, isTimerFor, nextFloat } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { CUPS_MS, SHELL_TIER_AT, shellSwaps, shuffleMs } from '../timing';
import type { Input, State, Transition } from '../types';
import { inGame } from './bet';

export function isShells(state: State): boolean {
  return state.boxes[state.r.idx]?.box.event === 'shells';
}

/** Who put coins in the pot and is still here. */
export function stakers(state: State): string[] {
  return Object.entries(state.r.bets)
    .filter(([id, b]) => b.amount > 0 && inGame(state, id))
    .map(([id]) => id);
}

/** The speed tier (0 … 5) the pot reached: its share of the room's starting coins. */
export function tierOf(state: State): number {
  const pot = Object.values(state.r.bets).reduce((s, b) => s + Math.max(0, b.amount), 0);
  const room = Math.max(1, state.seats.length * state.cfg.startCoins);
  let tier = 0;
  SHELL_TIER_AT.forEach((at, i) => {
    if (pot / room >= at && at > 0) tier = i;
  });
  return tier;
}

export function enterShuffle(state: State, now: number): State {
  const tier = tierOf(state);
  const round = state.boxes[state.r.idx];
  let ball = round?.detail?.[0] ?? 0;
  let rng = state.rng;
  const swaps: [number, number][] = [];
  for (let i = 0; i < shellSwaps(tier); i++) {
    const [f, next] = nextFloat(rng);
    rng = next;
    // One of the three pairs, never the same pair twice in a row (reads as a stall).
    const pairs: [number, number][] = [
      [0, 1],
      [1, 2],
      [0, 2],
    ];
    const prev = swaps[swaps.length - 1];
    const choices = pairs.filter((p) => !prev || p[0] !== prev[0] || p[1] !== prev[1]);
    const pair = choices[Math.min(choices.length - 1, Math.floor(f * choices.length))] ?? [0, 1];
    swaps.push(pair);
    if (ball === pair[0]) ball = pair[1];
    else if (ball === pair[1]) ball = pair[0];
  }
  const boxes = state.boxes.map((b, i) => (i === state.r.idx ? { ...b, outcome: ball } : b));
  return enterPhase(
    { ...state, rng, boxes, r: { ...state.r, tier, moves: swaps, picks: {} } },
    'shuffle',
    now,
    shuffleMs(tier),
  );
}

export function reduceShuffle(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

export function enterCups(state: State, now: number): State {
  return enterPhase(state, 'cups', now, CUPS_MS);
}

export function cupsIn(state: State): boolean {
  const done = Object.keys(state.r.picks ?? {});
  const idle = state.seats.filter((id) => !stakers(state).includes(id));
  return allConnectedDone(state, [...done, ...idle]);
}

/** The picks become the bets `open` settles; a staker who never picked backed no cup (−1). */
export function closeCups(state: State): State {
  const bets = { ...state.r.bets };
  for (const [id, bet] of Object.entries(bets))
    if (bet.amount > 0) bets[id] = { ...bet, option: state.r.picks?.[id] ?? -1 };
  return { ...state, r: { ...state.r, bets } };
}

export function reduceCups(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'cup') return state;
  const id = event.playerId;
  if (!stakers(state).includes(id)) return state;
  const after: State = {
    ...state,
    r: { ...state.r, picks: { ...state.r.picks, [id]: event.input.cup } },
  };
  return cupsIn(after) ? next(after, event.now) : after;
}

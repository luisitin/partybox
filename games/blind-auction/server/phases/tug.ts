// Phase "tug" (tug of war, LIVE-EVENTS.md — the owner: "based on clicking on phone… each tap being
// 60 % of a tap"): the teams were dealt at `init` and shown before the bets; everyone bet on their
// own side. Now every tap on a phone pulls the rope toward its team by TUG_STEP × that player's
// share of the team's stake, so each team's shares add to 100 % and a player who bet nothing pulls
// nothing. The rope all the way over, or the time up, ends it: the side ahead wins; a dead heat
// gives every stake back. The VIP's skip ends it where the rope stands.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { TUG_MS, TUG_STEP, TUG_TAP_MS } from '../timing';
import type { Input, State, Transition } from '../types';

export function isTug(state: State): boolean {
  return state.boxes[state.r.idx]?.box.event === 'tug';
}

/** 0 = ▲ Sun, 1 = ● Moon, null = not on a team. */
export function teamOf(state: State, id: string): 0 | 1 | null {
  const teams = state.boxes[state.r.idx]?.teams;
  if (teams?.sun.includes(id)) return 0;
  if (teams?.moon.includes(id)) return 1;
  return null;
}

/** Your share of your team's stake (0…1); 0 with no stake. */
export function shareOf(state: State, id: string): number {
  const team = teamOf(state, id);
  const round = state.boxes[state.r.idx];
  if (team === null || !round?.teams) return 0;
  const members = team === 0 ? round.teams.sun : round.teams.moon;
  const stake = (m: string): number => state.r.bets[m]?.amount ?? 0;
  const total = members.reduce((s, m) => s + stake(m), 0);
  return total > 0 ? stake(id) / total : 0;
}

export function enterTug(state: State, now: number): State {
  return enterPhase({ ...state, r: { ...state.r, rope: 0, lastTap: {} } }, 'tug', now, TUG_MS);
}

/** The pull is over: the side the rope leans to wins; dead level, every stake goes back. */
export function finishTug(state: State): State {
  const rope = state.r.rope ?? 0;
  if (rope === 0) {
    const bets = Object.fromEntries(
      Object.entries(state.r.bets).map(([id, b]) => [id, { ...b, amount: 0 }]),
    );
    return { ...state, r: { ...state.r, bets, draw: true } };
  }
  const outcome = rope < 0 ? 0 : 1;
  const boxes = state.boxes.map((b, i) => (i === state.r.idx ? { ...b, outcome } : b));
  return { ...state, boxes };
}

export function reduceTug(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'tug') return state;
  const id = event.playerId;
  const team = teamOf(state, id);
  const last = state.r.lastTap?.[id] ?? -Infinity;
  if (team === null || event.now - last < TUG_TAP_MS) return state;
  const pull = TUG_STEP * shareOf(state, id) * (team === 0 ? -1 : 1);
  const rope = Math.max(-1, Math.min(1, (state.r.rope ?? 0) + pull));
  const after: State = {
    ...state,
    r: { ...state.r, rope, lastTap: { ...state.r.lastTap, [id]: event.now } },
  };
  return Math.abs(rope) >= 1 ? next(after, event.now) : after;
}

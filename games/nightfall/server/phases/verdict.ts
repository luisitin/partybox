// Phase "verdict" (SPEC §10.9): the vote is revealed in paced steps — 0 the voters' faces land
// on their targets with the counts, 1 the spotlight moves to the eliminated player (or the TV says
// why nobody went), 2 their card flips (roles revealed). Anyone who left the game is announced here
// too. Exits after the last step or on the VIP's skip.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { bump, departures, kill, roleOf, sideOf, tellAll } from '../rules';
import { enterStep } from '../steps';
import type { Input, State, Transition, Verdict } from '../types';

/** Day stats from the deciding ballots: Wolf Hunter's hits, Best Liar's votes, days alive. */
function tallyStats(state: State, verdict: Verdict): State {
  let s = state;
  for (const id of state.alive) s = bump(s, id, 'daysAlive');
  for (const b of verdict.ballots) {
    if (b.target === 'none') continue;
    s = bump(s, b.target, 'votesReceived');
    const hit = roleOf(state, b.target) === 'wolf';
    if (hit && sideOf(roleOf(state, b.by)) === 'village') s = bump(s, b.by, 'votesOnWolves');
  }
  return s;
}

export function enterVerdict(state: State, now: number, verdict: Verdict): State {
  let s = tallyStats({ ...state, verdict }, verdict);
  const board = s.board.filter((p) => p.day === s.day).map((p) => ({ by: p.by, text: p.text }));
  s = {
    ...s,
    days: [...s.days, { day: s.day, ballots: verdict.ballots, out: verdict.out, board }],
  };
  const out = verdict.out ? [{ id: verdict.out, how: 'vote' as const }] : [];
  s = kill(s, [...out, ...departures(s)]);
  return enterStep(enterPhase(s, 'verdict', now, null), now, 0);
}

export function reduceVerdict(state: State, event: GameEvent<Input>, next: Transition): State {
  if (!isTimerFor(state, event)) return state;
  if (state.step === 0) return enterStep(tellAll(state), event.now, 1);
  const flips = state.cfg.revealRoles && state.verdict?.out;
  if (state.step === 1 && flips) return enterStep(state, event.now, 2);
  return next(state, event.now);
}

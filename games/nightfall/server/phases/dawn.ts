// Phase "dawn": the night resolves (SPEC §10.5, in order: protection, the pack's target, the seer's
// result, deaths), then the TV tells it in paced steps — 0 sunrise, 1 the news, 2 the role cards
// flip (when roles are revealed and someone died). Dawn tells deaths only: never who was attacked,
// protected or checked. Exits after the last step, or on the VIP's skip.
import { enterPhase, isTimerFor, nextInt } from '@partybox/game-sdk';
import type { GameEvent, RngState } from '@partybox/game-sdk';
import { bump, countBy, departures, hunchRole, isAlive, kill, roleOf, tellAll } from '../rules';
import { tonightsDeaths } from '../speech';
import { enterStep } from '../steps';
import type { Input, State, Transition } from '../types';

function aliveWith(state: State, role: string): string | null {
  return state.alive.find((id) => roleOf(state, id) === role) ?? null;
}

/** The pack's target: the player most wolves picked; a tie goes to the rng; no picks, no kill. */
export function packTarget(state: State): [string | null, RngState] {
  const targets = state.alive
    .filter((id) => roleOf(state, id) === 'wolf')
    .map((id) => state.picks[id])
    .filter((t): t is string => t !== undefined && isAlive(state, t));
  const tally = countBy(state, targets);
  const top = tally[0]?.n ?? 0;
  const tied = tally.filter((t) => t.n === top).map((t) => t.id);
  if (tied.length === 0) return [null, state.rng];
  if (tied.length === 1) return [tied[0] as string, state.rng];
  const [i, rng] = nextInt(state.rng, 0, tied.length - 1);
  return [tied[i] as string, rng];
}

/** Resolves the night (SPEC §10.5) without announcing anything yet. */
export function resolveNight(state: State): State {
  const doctor = aliveWith(state, 'doctor');
  const guarded = doctor ? (state.picks[doctor] ?? null) : null;
  const [victim, rng] = packTarget(state);
  const saved = victim !== null && victim === guarded;
  let s: State = { ...state, rng, victim, saved, lastProtected: guarded };
  if (saved && doctor) s = bump(s, doctor, 'saves');
  const seer = aliveWith(state, 'seer');
  const checked = seer ? state.picks[seer] : undefined;
  if (seer && checked !== undefined) {
    const wolf = roleOf(state, checked) === 'wolf';
    s = { ...s, seerLog: [...s.seerLog, { night: state.day, target: checked, wolf }] };
    if (wolf) s = bump(s, seer, 'wolvesFound');
  }
  const hunches = state.alive
    .filter((id) => hunchRole(roleOf(state, id)))
    .map((id) => state.picks[id])
    .filter((t): t is string => t !== undefined);
  s = { ...s, tally: state.cfg.hunches ? countBy(state, hunches) : [] };
  s = {
    ...s,
    nights: [...s.nights, { night: state.day, picks: { ...state.picks }, victim, saved }],
  };
  const deaths = victim && !saved ? [{ id: victim, how: 'night' as const }] : [];
  return kill(s, [...deaths, ...departures(s)]);
}

export function enterDawn(state: State, now: number): State {
  const resolved = resolveNight(state);
  return enterStep(enterPhase(resolved, 'dawn', now, null), now, 0);
}

export function reduceDawn(state: State, event: GameEvent<Input>, next: Transition): State {
  if (!isTimerFor(state, event)) return state;
  if (state.step === 0) return enterStep(tellAll(state), event.now, 1);
  const flips = state.cfg.revealRoles && tonightsDeaths(state).length > 0;
  if (state.step === 1 && flips) return enterStep(state, event.now, 2);
  return next(state, event.now);
}

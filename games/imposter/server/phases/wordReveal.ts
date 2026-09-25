// Phase "wordReveal": "The word was PIZZA" lands first (the reading is asked for only now, SPEC
// §1.5); on the second beat the imposters' clues slide forward with the guess line, and phones get
// their own result. In typed mode, the VIP may count a guess the matcher turned down (Part 00
// §4.8): the round re-scores and the TV tags it "Counted by the VIP".
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { roundDelta } from '../scoring';
import { WORD_MS, WORD_RESULT_MS } from '../types';
import type { Input, State, Transition } from '../types';

/** The VIP gets longer to decide while a typed guess waits to be counted. */
const COUNT_WAIT_MS = 10_000;

export function countable(state: State): boolean {
  return state.cfg.lastChance === 'typed' && Object.values(state.round.guesses).some((g) => !g.ok);
}

export function enterWordReveal(state: State, now: number): State {
  const scored: State = { ...state, round: { ...state.round, step: 0 } };
  const round = { ...scored.round, delta: roundDelta(scored) };
  return enterPhase({ ...scored, round }, 'wordReveal', now, WORD_MS);
}

/** "The word was pizza." arrived after the phase began: the first beat waits for it to finish. */
export function retimeWordReveal(state: State, ms: number, now: number): State {
  if (state.phase.id !== 'wordReveal' || state.round.step !== 0 || ms < 0) return state;
  const deadline = Math.max(state.phase.deadline ?? now, now + ms + 600);
  return { ...state, phase: { ...state.phase, deadline } };
}

export function reduceWordReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  const r = state.round;
  if (isTimerFor(state, event)) {
    if (r.step > 0) return next(state, event.now);
    const hold = countable(state) ? COUNT_WAIT_MS : WORD_RESULT_MS;
    return {
      ...state,
      round: { ...r, step: 1 },
      phase: { ...state.phase, deadline: event.now + hold },
    };
  }
  if (event.type !== 'input' || event.input.type !== 'countGuess') return state;
  if (event.vip !== true || !countable(state)) return state;
  const guesses: State['round']['guesses'] = {};
  for (const [id, g] of Object.entries(r.guesses))
    guesses[id] = g.ok ? g : { ...g, ok: true, byVip: true };
  const counted: State = { ...state, round: { ...r, guesses } };
  return { ...counted, round: { ...counted.round, delta: roundDelta(counted) } };
}

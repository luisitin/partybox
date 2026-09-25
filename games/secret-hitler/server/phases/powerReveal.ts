// Phase "powerReveal" (R15–R18): the power's public outcome. An investigation holds the uniform
// "Checking the files…" pause, then hands the President the target's PARTY (never the role) as a
// second beat of the same phase (ADR-033). An execution of Hitler wins for the Liberals.
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { go, headlined, withRound, without } from '../phase';
import { partyOf } from '../rules';
import { REVEAL_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterPowerReveal(state: State, now: number): State {
  const p = state.round.power;
  const target = p?.target ?? null;
  if (!p || (target === null && p.kind !== 'peek'))
    return go(state, 'powerReveal', now, REVEAL_MS.none);
  switch (p.kind) {
    case 'investigate': {
      const s = { ...state, investigated: [...state.investigated, target as string] };
      return go(headlined(s, 'investigation'), 'powerReveal', now, REVEAL_MS.investigatePause);
    }
    case 'special':
      const s = headlined({ ...state, special: target }, 'special');
      return go(s, 'powerReveal', now, REVEAL_MS.special);
    case 'peek':
      return go(state, 'powerReveal', now, REVEAL_MS.peek);
    case 'execute': {
      const id = target as string;
      let s: State = {
        ...state,
        executed: [...state.executed, id],
        alive: without(state.alive, id),
      };
      if (state.role[id] === 'hitler')
        s = { ...s, winner: 'liberals', winReason: 'hitlerExecuted' };
      s = headlined(s, s.winner ? 'hitlerExecuted' : 'execution');
      return go(s, 'powerReveal', now, REVEAL_MS.execute);
    }
  }
}

/** The file reaches the President: party only (R1, R15). Also run by a VIP skip of the pause. */
export function deliverFile(state: State): State {
  const p = state.round.power;
  const who = p?.target;
  if (!p || p.kind !== 'investigate' || !who || p.shown) return state;
  const president = state.round.president;
  const note = {
    n: state.round.n,
    k: 'investigate' as const,
    who,
    party: partyOf(state.role[who]),
  };
  const intel = { ...state.intel, [president]: [...(state.intel[president] ?? []), note] };
  return withRound({ ...state, intel }, { power: { ...p, shown: true } });
}

export function reducePowerReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  if (!isTimerFor(state, event)) return state;
  const p = state.round.power;
  if (p?.kind === 'investigate' && p.target !== null && !p.shown) {
    const s = deliverFile(state);
    return { ...s, phase: { ...s.phase, deadline: event.now + REVEAL_MS.investigateShow } };
  }
  return next(state, event.now);
}

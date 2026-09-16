// Phase "check" (5 s): the caller stops and the TV shows the invalid claim — green where the
// pattern was right, red where a daub was never called, outlined where a square was missed. The
// claimant's card is wiped blank on entry (the penalty: re-daub from memory) and they may not
// claim again until the next number. Everyone may keep daubing. Exits on the deadline via `next`.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { toggleDaub } from '../cards';
import { CHECK_MS } from '../types';
import type { Claim, Input, State, Transition } from '../types';

export function enterCheck(state: State, now: number, claim: Claim): State {
  const round = state.round;
  return enterPhase(
    {
      ...state,
      round: {
        ...round,
        claim,
        daubs: { ...round.daubs, [claim.playerId]: [] },
        waitForCall: { ...round.waitForCall, [claim.playerId]: round.drawn + 1 },
      },
    },
    'check',
    now,
    CHECK_MS,
  );
}

export function reduceCheck(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    // Daubing stays open; a second BINGO! during a check is ignored (one check at a time).
    if (event.input.type === 'daub') return toggleDaub(state, event.playerId, event.input.index);
    return state;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}

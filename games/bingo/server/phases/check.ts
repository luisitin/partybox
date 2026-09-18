// Phase "check" (5 s): the caller stops and the TV shows the invalid claim — green where the
// pattern was right, red where a daub was never called, outlined where a square was missed. The
// checked card is wiped blank on entry (the penalty: re-daub from memory; the claimant's other
// cards keep their daubs) and they may not claim again until the next number. Everyone may keep
// daubing. Two beats (ADR-033): the reveal, then the verdict is read (`round.judged`); exits on
// the second deadline via `next`.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { toggleDaub } from '../cards';
import { clearClaims, setMenu } from '../claims';
import { VERDICT_READ_MS, claimRevealMs } from '../reveal';
import type { Claim, Input, State, Transition } from '../types';

export function enterCheck(state: State, now: number, claim: Claim): State {
  const round = state.round;
  const mine = round.daubs[claim.playerId] ?? [];
  const wiped = mine.map((d, i) => (i === claim.cardIndex ? [] : d));
  return enterPhase(
    clearClaims({
      ...state,
      round: {
        ...round,
        claim,
        daubs: { ...round.daubs, [claim.playerId]: wiped },
        waitForCall: { ...round.waitForCall, [claim.playerId]: round.drawn + 1 },
        judged: false,
      },
    }),
    'check',
    now,
    claimRevealMs(claim.cells, claim.daubs),
  );
}

export function reduceCheck(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    // Daubing stays open; a second BINGO! during a check is ignored (one check at a time).
    if (event.input.type === 'daub')
      return toggleDaub(state, event.playerId, event.input.card, event.input.index);
    if (event.input.type === 'menu') return setMenu(state, event.playerId, event.input.open);
    return state;
  }
  if (!isTimerFor(state, event)) return state;
  if (state.round.judged) return next(state, event.now);
  // The verdict: the phones may show it now; a moment to read it, then the caller resumes.
  return {
    ...state,
    round: { ...state.round, judged: true },
    phase: { ...state.phase, deadline: (state.phase.deadline ?? event.now) + VERDICT_READ_MS },
  };
}

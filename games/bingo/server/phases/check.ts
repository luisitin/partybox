// Phase "check" (5 s): the caller stops and the TV shows the invalid claim — green where the
// pattern was right, red where a daub was never called, outlined where a square was missed. The
// checked card is wiped blank on entry (the penalty: re-daub from memory; the claimant's other
// cards keep their daubs) and they may not claim again until the next number. Everyone may keep
// daubing. Two beats (ADR-033): the reveal, then the verdict is read (`round.judged`); the second
// deadline goes back to play with a 3 · 2 · 1 (loop 282), whose tick calls the next number.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { toggleDaub } from '../cards';
import { clearClaims, menusOpen, setMenu } from '../claims';
import { WRONG_READ_MS, claimRevealMs } from '../reveal';
import { RESUME_MS } from '../types';
import type { Claim, Input, State } from '../types';

export function enterCheck(state: State, now: number, claim: Claim): State {
  const round = state.round;
  const mine = round.daubs[claim.playerId] ?? [];
  // I-435 A: the wrong daubs and the claimed line go; the other called daubs stay
  const drop = new Set([...claim.red, ...claim.cells.filter((i) => i !== 12)]);
  const lost = (mine[claim.cardIndex] ?? []).filter((c) => drop.has(c));
  const wiped = mine.map((d, i) => (i === claim.cardIndex ? d.filter((c) => !drop.has(c)) : d));
  return enterPhase(
    clearClaims({
      ...state,
      // I-401 B: counted for "Trigger finger"
      wrongClaims: {
        ...state.wrongClaims,
        [claim.playerId]: (state.wrongClaims?.[claim.playerId] ?? 0) + 1,
      },
      round: {
        ...round,
        claim: { ...claim, wiped: lost },
        daubs: { ...round.daubs, [claim.playerId]: wiped },
        waitForCall: { ...round.waitForCall, [claim.playerId]: round.drawn + 1 },
        judged: false,
      },
    }),
    'check',
    now,
    claimRevealMs(claim.cells, claim.daubs, claim),
  );
}

export function reduceCheck(state: State, event: GameEvent<Input>): State {
  if (event.type === 'input') {
    // Daubing stays open; a second BINGO! during a check is ignored (one check at a time).
    if (event.input.type === 'daub')
      return toggleDaub(state, event.playerId, event.input.card, event.input.index);
    if (event.input.type === 'menu') return setMenu(state, event.playerId, event.input.open);
    return state;
  }
  if (!isTimerFor(state, event)) return state;
  // Read: back to play through the same 3 · 2 · 1 every stop in calling ends with (loop 282);
  // the countdown's own tick then calls the next number (`next`, via reducePlay).
  if (state.round.judged) {
    const cleared = { ...state, round: { ...state.round, claim: null } };
    // A card-style menu still open: play is held (no clock) until it closes, as ever.
    if (menusOpen(cleared)) return enterPhase(cleared, 'play', event.now, null);
    return enterPhase(
      { ...cleared, round: { ...cleared.round, resumeAt: event.now + RESUME_MS } },
      'play',
      event.now,
      RESUME_MS,
    );
  }
  // The verdict: the phones may show it now; a moment to read it, then the caller resumes.
  return {
    ...state,
    round: { ...state.round, judged: true },
    phase: { ...state.phase, deadline: (state.phase.deadline ?? event.now) + WRONG_READ_MS },
  };
}

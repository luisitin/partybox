// Phase "result" (paced, about 6 s): the word, the guess marked ✓ / ✗ / PASS, the echoes
// uncovered with their authors, the deck updating. The VIP may count a rejected guess (§4.8).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { PACK_LANG } from '../content';
import { settle } from '../deck';
import { echoedRefs, survivorRefs } from '../echoes';
import { matchAnswer } from '../match/index';
import { BURN_EXTRA_MS, RESULT_MS } from '../types';
import type { Input, Outcome, State, Transition, Turn } from '../types';

/** Right when the matcher says fuzzy or better (§7.7). */
export function judge(state: State, text: string): Outcome {
  return matchAnswer(text, state.w.word, PACK_LANG) === 'none' ? 'wrong' : 'right';
}

function stayMs(turn: Turn): number {
  return RESULT_MS + (turn.burned || turn.unwon ? BURN_EXTRA_MS : 0);
}

export function enterResult(
  state: State,
  now: number,
  outcome: Outcome | 'judge',
  text: string,
): State {
  const result = outcome === 'judge' ? judge(state, text) : outcome;
  const scored: State = { ...state, w: { ...state.w, guess: { text, result, byVip: false } } };
  const turn = settle(
    scored,
    result,
    false,
    survivorRefs(state).map((r) => r.by),
    echoedRefs(state).map((r) => r.by),
  );
  return enterPhase({ ...scored, turns: [...state.turns, turn] }, 'result', now, stayMs(turn));
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}

/** The VIP's "✓ That counts": the wrong guess becomes right and the deck is recomputed. */
function countGuess(state: State, now: number): State {
  const g = state.w.guess;
  const last = state.turns[state.turns.length - 1];
  if (!g || g.result !== 'wrong' || !last) return state;
  const turn: Turn = { ...last, result: 'right', byVip: true, burned: null, unwon: null };
  const deadline = Math.max(state.phase.deadline ?? now, now + RESULT_MS / 2);
  return {
    ...state,
    w: { ...state.w, guess: { ...g, result: 'right', byVip: true } },
    turns: [...state.turns.slice(0, -1), turn],
    phase: { ...state.phase, deadline },
  };
}

export function reduceResult(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type === 'input' && event.input.type === 'countGuess' && event.vip === true)
    return countGuess(state, event.now);
  return state;
}

// The bot every harness uses (contract suite, sim, e2e). Picks the right answer half the time,
// wagers a random allowed option, and stays quiet otherwise. Randomness comes from the given rng.
import type { Rng } from '@partybox/game-sdk';
import { questionById } from './content';
import { wagerOptions } from './scoring';
import { isPlayer } from './types';
import type { Input, State } from './types';

export const BOT_CORRECT_PROBABILITY = 0.5;
const CHOICE_INDICES = [0, 1, 2, 3] as const;

export function sampleInput(state: State, playerId: string, rng: Rng): Input | null {
  if (!isPlayer(state, playerId)) return null;
  if (state.phase.id === 'question' && !Object.hasOwn(state.picks, playerId)) {
    const question = questionById(state.questionIds[state.index] ?? '');
    if (!question) return { type: 'pick', index: rng.pick(CHOICE_INDICES) };
    if (rng.chance(BOT_CORRECT_PROBABILITY)) return { type: 'pick', index: question.answerIndex };
    const wrong = CHOICE_INDICES.filter((i) => i !== question.answerIndex);
    return { type: 'pick', index: rng.pick(wrong) };
  }
  if (state.phase.id === 'wager' && !Object.hasOwn(state.wagers, playerId)) {
    const option = rng.pick(wagerOptions(state.scores[playerId] ?? 0));
    return { type: 'wager', percent: option.percent };
  }
  return null;
}

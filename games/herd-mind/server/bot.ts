// The bot (SPEC §2.10) decides from its own phone's view — the question, the tiles, its own
// answer — and its content bank: the pack's popularity weights for what that view shows (brief
// rule 9). It leans towards popular answers (weight^1.5) but not always; in typed mode it sometimes
// sends a misspelling or synonym to exercise the matcher. Nothing to do outside `answer`.
import type { Rng } from '@partybox/game-sdk';
import { answerLabel } from './content';
import { controllerView } from './views';
import type { Input, State } from './types';

/** An index drawn with probability proportional to `weights` (all zero → uniform). */
function weighted(rng: Rng, weights: number[]): number {
  const total = weights.reduce((s, w) => s + w, 0);
  if (total <= 0) return rng.int(0, weights.length - 1);
  let roll = rng.float() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i] ?? 0;
    if (roll < 0) return i;
  }
  return weights.length - 1;
}

export function botInput(state: State, playerId: string, rng: Rng, gameId: string): Input | null {
  const view = controllerView(state, playerId, gameId);
  if (view.me.role !== 'player') return null;
  // intro: a bot has read the rules.
  if (view.phaseId === 'intro') return view.ready.includes(playerId) ? null : { type: 'ready' };
  if (view.phaseId !== 'answer' || view.mine !== null) return null;
  // The content bank: this question's answers, looked up by what the phone shows.
  const bank = state.questions[view.n - 1]?.answers ?? [];
  if (view.mode === 'tiles') {
    const tiles = view.tiles ?? [];
    if (tiles.length === 0) return null;
    const weightOf = (id: string): number => bank.find((a) => a.id === id)?.weight ?? 0;
    const i = weighted(
      rng,
      tiles.map((t) => Math.max(0.5, weightOf(t.id)) ** 1.5),
    );
    return { type: 'pick', tile: tiles[i]?.id ?? '' };
  }
  if (bank.length === 0) return null;
  const choice =
    bank[
      weighted(
        rng,
        bank.map((a) => Math.max(0.5, a.weight)),
      )
    ];
  if (!choice) return null;
  const text =
    choice.accept.length > 0 && rng.chance(0.3) ? rng.pick(choice.accept) : answerLabel(choice);
  return { type: 'type', text: text.slice(0, 30) };
}

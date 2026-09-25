// The bot (SPEC §6.9): it decides from its own phone's view only (foundation §7.9). It starts from
// the writer's expected order (the `hint` a bot's view carries) and makes 1–4 swaps of
// neighbours, drawn from 1, 1, 2, 2, 3, 4, plus a 35 % chance of one far swap — near the hive
// often, but a room of bots doesn't simply become the hive.
import type { Rng } from '@partybox/game-sdk';
import type { HiveControllerView } from './views';
import type { Input } from './types';

// Play-test (nightfall, 2026-09-25): with the spec's 0–3 neighbour swaps the bots clustered on
// `expected`, so in a small room they WERE the hive and humans couldn't win. Wider draw, and
// sometimes one far swap: a bot still leans the writer's way, but is its own bee.
const SWAPS = [1, 1, 2, 2, 3, 4] as const;
const FAR_SWAP_CHANCE = 0.35;

export function decide(view: HiveControllerView, rng: Rng): Input | null {
  if (view.phaseId !== 'rank' || view.me.role !== 'player' || view.locked || !view.question)
    return null;
  const order = [...(view.hint ?? view.question.items.map((i) => i.id))];
  const swaps = rng.pick(SWAPS);
  for (let s = 0; s < swaps; s++) {
    const i = rng.int(0, order.length - 2);
    const a = order[i] ?? '';
    order[i] = order[i + 1] ?? '';
    order[i + 1] = a;
  }
  if (rng.chance(FAR_SWAP_CHANCE)) {
    const i = rng.int(0, order.length - 1);
    const j = rng.int(0, order.length - 1);
    const a = order[i] ?? '';
    order[i] = order[j] ?? '';
    order[j] = a;
  }
  return { type: 'order', items: order };
}

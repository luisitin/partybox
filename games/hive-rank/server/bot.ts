// The bot (SPEC §6.9): it decides from its own phone's view only (foundation §7.9). It starts from
// the writer's expected order (the `hint` a bot's view carries) and makes 0–3 swaps of
// neighbours, drawn from 0, 1, 1, 2, 2, 3 — near the hive often, never the same every round.
import type { Rng } from '@partybox/game-sdk';
import type { HiveControllerView } from './views';
import type { Input } from './types';

const SWAPS = [0, 1, 1, 2, 2, 3] as const;

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
  return { type: 'order', items: order };
}

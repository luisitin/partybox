// Hints for the shared contract suite. The secret is each player's order until `hive`: an order is
// a list of item ids, so the check looks for its JSON run ("a","b","c","d","e") — the items list
// in a view is objects ({"id":"a","label":…}), which can never contain that run by accident.
import type { GameStateBase } from '@partybox/game-sdk';
import type { State } from '../server/types';

const run = (order: readonly string[]): string => JSON.stringify(order).slice(1, -1);

function secretOrders(state: GameStateBase, except: string | null): string[] {
  const s = state as State;
  if (s.phase.id !== 'rank') return [];
  const own = except ? s.q.orders[except] : undefined;
  // A bot's view carries the writer's expected order as its hint: an order equal to it is not a leak.
  const hint = except && s.players[except]?.bot ? s.questions[s.q.n - 1]?.expected : undefined;
  const known = [own, hint].filter((o): o is string[] => o !== undefined).map(run);
  return Object.entries(s.q.orders)
    .filter(([id, order]) => id !== except && !known.includes(run(order)))
    .map(([, order]) => run(order));
}

export const contractConfig = {
  hiddenFromTv: (state: GameStateBase): string[] => secretOrders(state, null),
  hiddenFromController: (state: GameStateBase, viewer: string): string[] =>
    secretOrders(state, viewer),
  settingsVariants: [
    { rounds: 3, rankSeconds: 15, spicy: true, reader: 'none' },
    { rounds: 10, rankSeconds: 60, spicy: false, reader: 'george' },
  ],
};

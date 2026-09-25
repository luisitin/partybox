// Typed access to content/*.json and the draw (P00 §2.5): `init` takes exactly the boxes this game
// plays, with each one's outcome, and nothing else of the packs ever enters state or a view. A lot
// from the packs becomes a box: each possible outcome is something the box might hold.
import { nextFloat, shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { lotPackSchema, pronunciationsSchema } from '../content/schema';
import type { Lot, Outcome, Pronunciations } from '../content/schema';
import grandJson from '../content/grand.json' with { type: 'json' };
import lotsJson from '../content/lots.json' with { type: 'json' };
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };
import spicyJson from '../content/spicy.json' with { type: 'json' };
import { payOf } from './odds';
import type { Box, BoxOption, Cfg, ContentKind } from './types';

export const LOT_POOL: readonly Lot[] = lotPackSchema.parse(lotsJson);
export const GRAND_POOL: readonly Lot[] = lotPackSchema.parse(grandJson);
export const SPICY_POOL: readonly Lot[] = lotPackSchema.parse(spicyJson);
export const PRONUNCIATIONS: Pronunciations = pronunciationsSchema.parse(pronunciationsJson);

/** What each outcome is as a thing in the box. Two gains in one box: the bigger is the jackpot. */
function kindOf(o: Outcome, all: readonly Outcome[]): ContentKind {
  switch (o.type) {
    case 'gain': {
      const gains = all.filter((x): x is Extract<Outcome, { type: 'gain' }> => x.type === 'gain');
      return gains.length > 1 && o.amount === Math.max(...gains.map((g) => g.amount))
        ? 'jackpot'
        : 'treasure';
    }
    case 'lose':
      return 'trap';
    case 'steal':
      return 'raccoon';
    case 'swap':
      return 'mirror';
    case 'double':
      return 'twins';
    case 'refund':
      return 'receipt';
    case 'dud':
      return 'empty';
  }
}

export function boxOf(lot: Lot, grand: boolean): Box {
  const options: BoxOption[] = lot.outcomes.map((o) => ({
    kind: kindOf(o, lot.outcomes),
    chance: o.chance,
    pay: payOf(o.chance),
  }));
  return { id: lot.id, name: lot.name, icon: lot.icon, flavour: lot.flavour, options, grand };
}

/** `count` distinct lots from `pool` (fewer if the pool is short), not already in `taken`. */
function take(
  rng: RngState,
  pool: readonly Lot[],
  count: number,
  taken: Set<string>,
): [Lot[], RngState] {
  const [mixed, next] = shuffle(
    rng,
    pool.filter((l) => !taken.has(l.id)),
  );
  const out = mixed.slice(0, Math.max(0, count));
  for (const l of out) taken.add(l.id);
  return [out, next];
}

/** Draws the chance-weighted outcome index. */
function drawOutcome(rng: RngState, options: readonly BoxOption[]): [number, RngState] {
  const [f, next] = nextFloat(rng);
  let roll = f * 100;
  for (let i = 0; i < options.length; i++) {
    roll -= options[i]?.chance ?? 0;
    if (roll < 0) return [i, next];
  }
  return [options.length - 1, next];
}

/** Boxes with a single possible content would be a sure thing: never drawn. */
const bettable = (l: Lot): boolean => l.outcomes.length >= 2;

/** The game's boxes in play order; with `spicy`, half come from the spicy pack; the grand box last. */
export function drawBoxes(cfg: Cfg, rng: RngState): [{ box: Box; outcome: number }[], RngState] {
  const taken = new Set<string>();
  const ordinary = cfg.rounds - (cfg.grand ? 1 : 0);
  const spicyCount = cfg.spicy ? Math.ceil(ordinary / 2) : 0;
  let state = rng;
  const [fromSpicy, s1] = take(state, SPICY_POOL.filter(bettable), spicyCount, taken);
  const [fromLots, s2] = take(s1, LOT_POOL.filter(bettable), ordinary - fromSpicy.length, taken);
  const [order, s3] = shuffle(s2, [...fromSpicy, ...fromLots]);
  state = s3;
  const boxes = order.map((l) => boxOf(l, false));
  if (cfg.grand) {
    const [grand, s4] = take(state, GRAND_POOL.filter(bettable), 1, taken);
    state = s4;
    for (const g of grand) boxes.push(boxOf(g, true));
  }
  const out: { box: Box; outcome: number }[] = [];
  for (const box of boxes) {
    const [outcome, next] = drawOutcome(state, box.options);
    state = next;
    out.push({ box, outcome });
  }
  return [out, state];
}

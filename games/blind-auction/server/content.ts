// Typed access to content/*.json and the draw (P00 §2.5): `init` takes exactly the lots this game
// plays, with each one's outcome, and nothing else of the packs ever enters state or a view.
import { nextFloat, shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { lotPackSchema, pronunciationsSchema } from '../content/schema';
import type { Chaos, Lot, Outcome, Pronunciations } from '../content/schema';
import grandJson from '../content/grand.json' with { type: 'json' };
import lotsJson from '../content/lots.json' with { type: 'json' };
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };
import spicyJson from '../content/spicy.json' with { type: 'json' };
import type { Cfg, LotItem } from './types';

const LOTS = lotPackSchema.parse(lotsJson);
export const NORMAL_POOL: readonly Lot[] = LOTS.filter((l) => l.chaos !== 'wild');
export const WILD_POOL: readonly Lot[] = LOTS.filter((l) => l.chaos === 'wild');
export const GRAND_POOL: readonly Lot[] = lotPackSchema.parse(grandJson);
export const SPICY_POOL: readonly Lot[] = lotPackSchema.parse(spicyJson);
export const PRONUNCIATIONS: Pronunciations = pronunciationsSchema.parse(pronunciationsJson);

/** Share of the ordinary slots that come from the wild pool, per `chaos` setting. */
const WILD_SHARE: Record<Chaos, number> = { calm: 0, normal: 0.2, wild: 0.5 };

/** A coin amount at `startCoins`: the packs assume 100, rounded to 5 (never below 5). */
export function scaleAmount(amount: number, startCoins: number): number {
  return Math.max(5, Math.round((amount * startCoins) / 100 / 5) * 5);
}

function scaleOutcome(o: Outcome, startCoins: number): Outcome {
  return o.type === 'gain' || o.type === 'lose'
    ? { ...o, amount: scaleAmount(o.amount, startCoins) }
    : o;
}

function toItem(lot: Lot, startCoins: number, grand: boolean): LotItem {
  return {
    id: lot.id,
    name: lot.name,
    icon: lot.icon,
    flavour: lot.flavour,
    outcomes: lot.outcomes.map((o) => scaleOutcome(o, startCoins)),
    grand,
  };
}

function allowed(lot: Lot, chaos: Chaos): boolean {
  return chaos === 'calm' ? lot.chaos === 'calm' : true;
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
function drawOutcome(rng: RngState, outcomes: readonly Outcome[]): [number, RngState] {
  const [f, next] = nextFloat(rng);
  let roll = f * 100;
  for (let i = 0; i < outcomes.length; i++) {
    roll -= outcomes[i]?.chance ?? 0;
    if (roll < 0) return [i, next];
  }
  return [outcomes.length - 1, next];
}

/**
 * The game's lots in play order. Wild lots are spread among the ordinary ones by the shuffle; with
 * `spicy`, half the ordinary slots come from the spicy pool; the Grand Lot (if on) is always last.
 */
export function drawLots(
  cfg: Cfg,
  rng: RngState,
): [{ item: LotItem; outcome: number }[], RngState] {
  const taken = new Set<string>();
  const slots = cfg.lots - (cfg.grandLot ? 1 : 0);
  const wildCount = Math.round(slots * WILD_SHARE[cfg.chaos]);
  const ordinary = slots - wildCount;
  const spicyCount = cfg.spicy ? Math.ceil(ordinary / 2) : 0;
  let state = rng;
  const spicyOrdinary = SPICY_POOL.filter((l) => l.chaos !== 'wild' && allowed(l, cfg.chaos));
  const [fromSpicy, s1] = take(state, spicyOrdinary, spicyCount, taken);
  state = s1;
  const normals = NORMAL_POOL.filter((l) => allowed(l, cfg.chaos));
  const [fromNormal, s2] = take(state, normals, ordinary - fromSpicy.length, taken);
  state = s2;
  const wilds = cfg.spicy
    ? [...WILD_POOL, ...SPICY_POOL.filter((l) => l.chaos === 'wild')]
    : WILD_POOL;
  const [fromWild, s3] = take(state, wilds, wildCount, taken);
  state = s3;
  const [order, s4] = shuffle(state, [...fromSpicy, ...fromNormal, ...fromWild]);
  state = s4;
  const items = order.map((l) => toItem(l, cfg.startCoins, false));
  if (cfg.grandLot) {
    const [grand, s5] = take(
      state,
      GRAND_POOL.filter((l) => allowed(l, cfg.chaos)),
      1,
      taken,
    );
    state = s5;
    for (const g of grand) items.push(toItem(g, cfg.startCoins, true));
  }
  const out: { item: LotItem; outcome: number }[] = [];
  for (const item of items) {
    const [outcome, next] = drawOutcome(state, item.outcomes);
    state = next;
    out.push({ item, outcome });
  }
  return [out, state];
}

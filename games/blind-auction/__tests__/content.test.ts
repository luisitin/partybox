// The packs (SPEC §8.16): sizes, text limits, chances, balance, a wanted outcome on every lot,
// chaos tags, the speech stand-in, and what the draw takes for each setting.
import { describe, expect, it } from 'vitest';
import type { Lot } from '../content/schema';
import { GRAND_POOL, NORMAL_POOL, SPICY_POOL, WILD_POOL, drawLots } from '../server/content';
import { tierOf } from '../server/hints';
import { numberWords, toSpeakable } from '../server/speak';
import { start } from './helpers';

const ALL = [...NORMAL_POOL, ...WILD_POOL, ...GRAND_POOL, ...SPICY_POOL];

/** EV at 100 coins, heists against a richest other of 150, swaps at 0, as the bot values the rest. */
function ev(lot: Lot): number {
  return lot.outcomes.reduce((sum, o) => {
    const v = { gain: 0, lose: 0, steal: 0, swap: 0, double: 100, refund: 50, dud: 0 }[o.type];
    const n =
      o.type === 'gain'
        ? o.amount
        : o.type === 'lose'
          ? -o.amount
          : o.type === 'steal'
            ? 1.5 * o.percent
            : v;
    return sum + (o.chance / 100) * n;
  }, 0);
}

describe('packs', () => {
  it('have the sizes the spec gives', () => {
    expect([NORMAL_POOL.length, WILD_POOL.length, GRAND_POOL.length, SPICY_POOL.length]).toEqual([
      60, 20, 12, 20,
    ]);
  });

  it('ids and names are unique; names ≤ 20, flavour ≤ 60, chances sum to 100', () => {
    expect(new Set(ALL.map((l) => l.id)).size).toBe(ALL.length);
    expect(new Set(ALL.map((l) => l.name)).size).toBe(ALL.length);
    for (const lot of ALL) {
      expect(lot.name.length, lot.id).toBeLessThanOrEqual(20);
      expect(lot.flavour.length, lot.id).toBeLessThanOrEqual(60);
      expect(
        lot.outcomes.reduce((s, o) => s + o.chance, 0),
        lot.id,
      ).toBe(100);
    }
  });

  it('every lot has an outcome worth wanting', () => {
    for (const lot of ALL)
      expect(
        lot.outcomes.some((o) => ['gain', 'steal', 'swap', 'double'].includes(o.type)),
        lot.id,
      ).toBe(true);
  });

  it('most normal lots are worth 40–150 at 100 coins; grand lots about 2.5×', () => {
    const inBand = NORMAL_POOL.filter((l) => ev(l) >= 40 && ev(l) <= 150);
    expect(inBand.length / NORMAL_POOL.length).toBeGreaterThanOrEqual(0.9);
    const grand = GRAND_POOL.filter((l) => l.chaos === 'calm').map(ev);
    expect(grand.reduce((a, b) => a + b, 0) / grand.length).toBeGreaterThan(150);
  });

  it('calm lots have no heist or swap; wild lots lean on them', () => {
    for (const lot of ALL.filter((l) => l.chaos === 'calm'))
      expect(
        lot.outcomes.every((o) => o.type !== 'steal' && o.type !== 'swap'),
        lot.id,
      ).toBe(true);
    for (const lot of WILD_POOL)
      expect(
        lot.outcomes.some((o) => o.type === 'steal' || o.type === 'swap'),
        lot.id,
      ).toBe(true);
  });

  it('tier words follow the chance bands', () => {
    expect([tierOf(50), tierOf(49), tierOf(20), tierOf(19)]).toEqual([
      'LIKELY',
      'MAYBE',
      'MAYBE',
      'RARE',
    ]);
  });

  it('every name and flavour line comes out of the speech stand-in as plain words', () => {
    for (const lot of ALL) {
      const said = toSpeakable(`The ${lot.name}. ${lot.flavour}`);
      expect(said, lot.id).not.toMatch(
        /\d|[“”"]|\b(?!(?:it|that|what|there|here|let|he|she)'s)[a-z]+'s\b/i,
      );
      expect(said.length).toBeGreaterThan(8);
    }
    expect(toSpeakable("Pirate's Chest. Tagged in 1998. It's 11:58.")).toBe(
      "Pirates Chest. Tagged in nineteen ninety-eight. It's eleven fifty-eight.",
    );
    expect(numberWords(1250)).toBe('one thousand two hundred fifty');
  });
});

describe('the draw', () => {
  const cfg = start(3).cfg;
  const draw = (over: Partial<typeof cfg>, seed = 1): Lot['id'][] =>
    drawLots({ ...cfg, ...over }, { seed, step: 0 })[0].map((l) => l.item.id);

  it('takes exactly `lots` distinct lots, the Grand Lot last', () => {
    for (let seed = 1; seed < 20; seed++) {
      const [lots] = drawLots({ ...cfg, lots: 12 }, { seed, step: 0 });
      expect(lots).toHaveLength(12);
      expect(new Set(lots.map((l) => l.item.id)).size).toBe(12);
      expect(lots.map((l) => l.item.grand)).toEqual([...Array(11).fill(false), true]);
    }
    expect(
      draw({ grandLot: false, lots: 5 }).every((id) => !GRAND_POOL.some((g) => g.id === id)),
    ).toBe(true);
  });

  it('calm draws no heist or swap anywhere; wild draws about half its lots from the wild pool', () => {
    const wildIds = new Set(WILD_POOL.map((l) => l.id));
    for (let seed = 1; seed < 20; seed++) {
      const [calm] = drawLots({ ...cfg, chaos: 'calm', lots: 12 }, { seed, step: 0 });
      expect(
        calm.flatMap((l) => l.item.outcomes).some((o) => o.type === 'steal' || o.type === 'swap'),
      ).toBe(false);
      expect(draw({ chaos: 'wild', lots: 9 }, seed).filter((id) => wildIds.has(id))).toHaveLength(
        4,
      );
      expect(draw({ chaos: 'normal', lots: 8 }, seed).filter((id) => wildIds.has(id))).toHaveLength(
        1,
      );
    }
  });

  it('spicy fills half the ordinary slots from the spicy pool; off, none', () => {
    const spicyIds = new Set(SPICY_POOL.map((l) => l.id));
    expect(
      draw({ spicy: true, chaos: 'calm', lots: 9 }).filter((id) => spicyIds.has(id)),
    ).toHaveLength(4);
    expect(draw({ spicy: false, lots: 12 }).some((id) => spicyIds.has(id))).toBe(false);
  });

  it('outcomes follow the chances over many draws', () => {
    let likely = 0;
    let total = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const [lots] = drawLots({ ...cfg, chaos: 'calm' }, { seed, step: 0 });
      for (const lot of lots) {
        total++;
        const o = lot.item.outcomes[lot.outcome];
        if (o && o.chance >= 50) likely++;
      }
    }
    expect(likely / total).toBeGreaterThan(0.45);
    expect(likely / total).toBeLessThan(0.75);
  });
});

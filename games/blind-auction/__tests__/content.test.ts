// The packs and the draw: sizes, text limits, chances, every lot a real bet (2+ distinct contents),
// and what the draw takes for each setting.
import { describe, expect, it } from 'vitest';
import { GRAND_POOL, LOT_POOL, SPICY_POOL, boxOf, drawBoxes } from '../server/content';
import { start } from './helpers';

const ALL = [...LOT_POOL, ...GRAND_POOL, ...SPICY_POOL];

describe('packs', () => {
  it('have the sizes the pack promises', () => {
    expect([LOT_POOL.length, GRAND_POOL.length, SPICY_POOL.length]).toEqual([80, 12, 20]);
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

  it('every box is a real bet: 2–3 distinct contents, each with a payout', () => {
    for (const lot of ALL) {
      const box = boxOf(lot, false);
      expect(box.options.length, lot.id).toBeGreaterThanOrEqual(2);
      expect(new Set(box.options.map((o) => o.kind)).size, lot.id).toBe(box.options.length);
      for (const o of box.options) expect(o.pay, lot.id).toBeGreaterThan(1);
    }
  });
});

describe('the draw', () => {
  const cfg = start(3).cfg;

  it('takes exactly `rounds` distinct boxes, the grand box last', () => {
    for (let seed = 1; seed < 20; seed++) {
      const [boxes] = drawBoxes({ ...cfg, rounds: 12 }, { seed, step: 0 });
      expect(boxes).toHaveLength(12);
      expect(new Set(boxes.map((b) => b.box.id)).size).toBe(12);
      expect(boxes.map((b) => b.box.grand)).toEqual([...Array(11).fill(false), true]);
    }
    const [plain] = drawBoxes({ ...cfg, rounds: 5, grand: false }, { seed: 3, step: 0 });
    expect(plain.some((b) => b.box.grand)).toBe(false);
  });

  it('spicy fills half the ordinary boxes from the spicy pack; off, none', () => {
    const spicy = new Set(SPICY_POOL.map((l) => l.id));
    const [on] = drawBoxes({ ...cfg, rounds: 9, spicy: true }, { seed: 1, step: 0 });
    expect(on.filter((b) => spicy.has(b.box.id))).toHaveLength(4);
    const [off] = drawBoxes({ ...cfg, rounds: 12 }, { seed: 1, step: 0 });
    expect(off.some((b) => spicy.has(b.box.id))).toBe(false);
  });

  it('outcomes follow the chances over many draws', () => {
    let likely = 0;
    let total = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const [boxes] = drawBoxes(cfg, { seed, step: 0 });
      for (const b of boxes) {
        total++;
        if ((b.box.options[b.outcome]?.chance ?? 0) >= 50) likely++;
      }
    }
    expect(likely / total).toBeGreaterThan(0.4);
    expect(likely / total).toBeLessThan(0.75);
  });
});

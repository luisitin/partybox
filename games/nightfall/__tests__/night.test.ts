// SPEC §10.5 / §10.20 "Night": protection and saves, the doctor's no-repeat rule, seer results
// (hunter and jester read "not a wolf"), tied and missing wolf picks, and the resolution order.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { EIGHT, finish, input, night, phone, start, timer, toNight, votes } from './helpers';

function nightOne(roles = EIGHT, settings = {}): ReturnType<typeof start> {
  return toNight(start({ roles, settings }));
}

describe('night', () => {
  it('the pack kills its target and dawn tells the death, never who picked', () => {
    let s = night(nightOne(), { ben: 'dee', cy: 'dee', ana: 'ben', eli: 'eli' });
    expect(s.phase.id).toBe('dawn');
    expect(s.alive).not.toContain('dee');
    expect(game.tvView(s).stage.news).toBeNull(); // step 0: sunrise only
    s = timer(s);
    expect(game.tvView(s).stage.news?.map((d) => d.id)).toEqual(['dee']);
    expect(game.tvView(s).stage.lines).toEqual(['Dee did not survive the night.']);
    const tv = JSON.stringify(game.tvView(s));
    expect(tv).not.toContain('protect');
    expect(tv).not.toContain('seerLog');
  });

  it('a protected target survives: "Everyone survived the night!" hides both sides', () => {
    let s = night(nightOne(), { ben: 'dee', cy: 'dee', eli: 'dee' });
    s = timer(s);
    expect(s.alive).toContain('dee');
    expect(s.saved).toBe(true);
    const tv = game.tvView(s);
    expect(tv.stage.lines).toEqual(['Everyone survived the night!']);
    expect(JSON.stringify(tv)).not.toContain('"saved"');
    expect(s.stats['eli']?.saves).toBe(1);
  });

  it('the doctor may protect themself, but never the same player two nights running', () => {
    let s = night(nightOne(), { eli: 'eli', ben: 'fay', cy: 'fay' });
    s = finish(s); // dawn → day
    s = votes(s.phase.id === 'day' ? finish(s) : s, {}); // nobody votes: nobody out
    s = finish(s); // verdict → night 2
    expect(s.phase.id).toBe('night');
    const again = input(s, 'eli', { type: 'night', target: 'eli' });
    expect(again.picks['eli']).toBeUndefined();
    expect(phone(s, 'eli').lastProtected).toBe('eli');
    expect(input(s, 'eli', { type: 'night', target: 'ana' }).picks['eli']).toBe('ana');
  });

  it('the seer learns wolf or not; the hunter and the jester read "not a wolf"', () => {
    const roles = { ...EIGHT, fay: 'hunter', gus: 'jester' } as const;
    for (const [target, wolf] of [
      ['ben', true],
      ['fay', false],
      ['gus', false],
      ['dee', false],
    ] as const) {
      const s = night(nightOne(roles), { ana: target });
      expect(s.seerLog).toEqual([{ night: 1, target, wolf }]);
      const report = phone(s, 'ana').report ?? '';
      expect(report).toContain(wolf ? 'is a WOLF' : 'is not a wolf');
    }
  });

  it('split wolf picks: the rng picks among the tied targets', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 12; seed++) {
      const s = night(toNight(start({ roles: EIGHT, seed })), { ben: 'dee', cy: 'fay' });
      expect(['dee', 'fay']).toContain(s.victim);
      seen.add(s.victim as string);
    }
    expect(seen.size).toBe(2);
  });

  it('no wolf picks at all: a quiet night', () => {
    const s = night(nightOne(), { ana: 'dee', eli: 'fay' });
    expect(s.victim).toBeNull();
    expect(s.alive).toHaveLength(8);
  });

  it('invalid picks are ignored: packmate, self for the seer and villagers', () => {
    const s = nightOne();
    expect(input(s, 'ben', { type: 'night', target: 'cy' }).picks).toEqual({});
    expect(input(s, 'ana', { type: 'night', target: 'ana' }).picks).toEqual({});
    expect(input(s, 'dee', { type: 'night', target: 'dee' }).picks).toEqual({});
    expect(input(s, 'dee', { type: 'night', target: 'nobody' }).picks).toEqual({});
  });

  it('picks can change; the night ends once every living connected player picked', () => {
    let s = nightOne();
    s = input(s, 'ben', { type: 'night', target: 'dee' });
    s = input(s, 'ben', { type: 'night', target: 'fay' });
    expect(s.picks['ben']).toBe('fay');
    const all = { cy: 'fay', ana: 'ben', eli: 'eli', dee: 'ben', fay: 'cy', gus: 'ben', hal: 'cy' };
    for (const [by, target] of Object.entries(all)) s = input(s, by, { type: 'night', target });
    expect(s.phase.id).toBe('dawn');
  });

  it('wolves see each other’s picks live; the seer’s result survives the seer’s death', () => {
    let s = nightOne();
    s = input(s, 'ben', { type: 'night', target: 'ana' });
    expect(phone(s, 'cy').packPicks).toEqual([{ by: 'ben', target: 'ana' }]);
    expect(phone(s, 'ana').packPicks).toEqual([]);
    s = night(s, { cy: 'ana', ana: 'ben' });
    expect(s.alive).not.toContain('ana');
    expect(s.seerLog).toEqual([{ night: 1, target: 'ben', wolf: true }]);
    s = timer(s);
    expect(phone(s, 'ana').ghost).toBe(true);
    expect(phone(s, 'ana').report).toContain('Ben is a WOLF');
  });

  it('hunches: an anonymous tally of villager-side picks at dawn (names only with roles hidden)', () => {
    let s = night(nightOne(), {
      dee: 'ben',
      fay: 'ben',
      gus: 'cy',
      ana: 'cy',
      ben: 'hal',
      cy: 'hal',
    });
    expect(game.tvView(s).stage.tally).toEqual([]); // not before the news
    s = timer(s);
    expect(game.tvView(s).stage.tally).toEqual([
      { id: 'ben', n: 2 },
      { id: 'cy', n: 1 },
    ]);
    let hidden = night(nightOne(EIGHT, { revealRoles: false }), { dee: 'ben', fay: 'ben' });
    hidden = timer(hidden);
    expect(game.tvView(hidden).stage.tally).toEqual([{ id: 'ben', n: null }]);
    const off = timer(night(nightOne(EIGHT, { hunches: false }), { dee: 'ben' }));
    expect(game.tvView(off).stage.tally).toEqual([]);
  });

  it('chips at night: every living player who picked gets ✓, whatever their role', () => {
    let s = nightOne();
    s = input(s, 'ben', { type: 'night', target: 'dee' });
    s = input(s, 'dee', { type: 'night', target: 'ben' });
    const status = Object.fromEntries(game.tvView(s).players.map((p) => [p.id, p.status]));
    expect(status['ben']).toBe('submitted');
    expect(status['dee']).toBe('submitted');
    expect(status['ana']).toBe('active');
  });
});

// SPEC §10.3 / §10.20 "Dealing": role counts per player count and option, wolves see their pack,
// the jester needs 7+ players, and the TV shows the public role list.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { resolveCfg, roleList, wolfCount } from '../server/setup';
import { phone, start } from './helpers';

const together = { mode: 'together', phoneOnly: false } as const;

describe('dealing', () => {
  it('auto wolves follow the table', () => {
    const want: Record<number, number> = { 6: 2, 7: 2, 8: 2, 9: 3, 10: 3, 11: 3, 12: 4, 16: 4 };
    for (const [n, w] of Object.entries(want)) expect(wolfCount(Number(n), 0)).toBe(w);
  });

  it('a set count never exceeds a third of the players', () => {
    expect(wolfCount(6, 4)).toBe(2);
    expect(wolfCount(9, 4)).toBe(3);
    expect(wolfCount(16, 1)).toBe(1);
  });

  it('seer and doctor by default; hunter and jester take villager seats when on', () => {
    const base = resolveCfg({}, together);
    expect(roleList(8, base).sort()).toEqual(
      ['doctor', 'seer', 'villager', 'villager', 'villager', 'villager', 'wolf', 'wolf'].sort(),
    );
    const all = resolveCfg({ roles: 'seer,doctor,hunter,jester' }, together);
    const eight = roleList(8, all);
    expect(eight.filter((r) => r === 'villager')).toHaveLength(2);
    expect(eight).toContain('hunter');
    expect(eight).toContain('jester');
  });

  it('the jester needs 7+ players', () => {
    const cfg = resolveCfg({ roles: 'jester' }, together);
    expect(roleList(6, cfg)).not.toContain('jester');
    expect(roleList(7, cfg)).toContain('jester');
  });

  it('every seat gets a role, and the deal is seeded', () => {
    for (const n of [6, 9, 12, 16]) {
      const s = start({ n, settings: { roles: 'seer,doctor,hunter,jester' } });
      expect(Object.keys(s.roles)).toHaveLength(n);
      expect(start({ n, settings: {}, seed: 7 }).roles).toEqual(start({ n, seed: 7 }).roles);
    }
  });

  it('wolves see their pack; nobody else sees a wolf', () => {
    const s = start({ roles: { ben: 'wolf', cy: 'wolf', ana: 'seer' } });
    expect(phone(s, 'ben').pack).toEqual(['cy']);
    expect(phone(s, 'cy').pack).toEqual(['ben']);
    expect(phone(s, 'ana').pack).toEqual([]);
    expect(phone(s, 'ana').role?.id).toBe('seer');
    expect(phone(s, 'dee').roles).toBeNull();
    expect(phone(s, 'dee').packPicks).toEqual([]);
  });

  it('the TV shows the public role list', () => {
    const s = start({ n: 8 });
    const cast = game.tvView(s).cast.map((c) => `${c.count} ${c.role}`);
    expect(cast).toEqual(['2 wolf', '1 seer', '1 doctor', '4 villager']);
  });

  it('the mafia flavour renames roles but deals the same', () => {
    const s = start({ n: 8, settings: { flavour: 'mafia' } });
    const names = game.tvView(s).cast.map((c) => c.name);
    expect(names).toEqual(['Mafia', 'Detective', 'Doctor', 'Townsperson']);
    expect(s.roles).toEqual(start({ n: 8 }).roles);
  });
});

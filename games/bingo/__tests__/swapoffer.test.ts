// I-139 (preview branch): "Another" keeps the old card beside the new one until the player picks.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { input, start } from './helpers';

describe('I-139 swap offer', () => {
  it('keeps the old card for the choice; keepOld puts it back, takeNew keeps the new one', () => {
    const s0 = start();
    const old = s0.round.cards['a']?.[0] as number[];
    let s = input(s0, 'a', { type: 'swap', card: 0 });
    const fresh = s.round.cards['a']?.[0] as number[];
    expect(fresh).not.toEqual(old);
    expect(s.round.offer?.['a']?.old).toEqual(old);
    expect(game.controllerView(s, 'a').offer?.card).toBe(0);
    const kept = input(s, 'a', { type: 'keepOld' });
    expect(kept.round.cards['a']?.[0]).toEqual(old);
    expect(kept.round.offer?.['a']).toBeUndefined();
    expect(kept.round.swapped['a'] ?? []).toEqual([0]);
    expect(game.controllerView(kept, 'a').swappable).not.toContain(0);
    s = input(s, 'a', { type: 'takeNew' });
    expect(s.round.cards['a']?.[0]).toEqual(fresh);
    expect(s.round.offer?.['a']).toBeUndefined();
  });

  it('Ready settles an open offer on the new card', () => {
    let s = input(start(), 'a', { type: 'swap', card: 0 });
    const fresh = s.round.cards['a']?.[0];
    s = input(s, 'a', { type: 'ready' });
    expect(s.round.offer?.['a']).toBeUndefined();
    expect(s.round.cards['a']?.[0]).toEqual(fresh);
    expect(input(s, 'a', { type: 'keepOld' }).round.cards['a']?.[0]).toEqual(fresh);
    expect(game.controllerView(s, 'a').offer).toBeNull();
  });
});

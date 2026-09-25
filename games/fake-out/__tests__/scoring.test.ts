// Scoring (SPEC §3.6, §3.17 "Scoring"): the truth, one lie fooling several players, shared lies,
// padding lies, the final double, idle players — starting with the spec's own worked example.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import {
  PENGUIN,
  cv,
  lies,
  optionId,
  pick,
  picks,
  start,
  throughReveal,
  timer,
  toLie,
  tv,
} from './helpers';

/** SPEC §3.2: Ana moose, Ben reindeer, Cy royal chef, Dee moose, Eli horse. */
function workedExample(settings: Record<string, string | number | boolean> = {}) {
  const s = toLie(start({ fact: PENGUIN, settings }));
  return lies(s, { ana: 'moose', ben: 'reindeer', cy: 'royal chef', dee: 'Moose', eli: 'horse' });
}

describe('the worked example (SPEC §3.2)', () => {
  const pickPhase = workedExample();
  const revealed = picks(pickPhase, {
    cy: 'horse',
    ben: 'moose',
    eli: 'moose',
    ana: 'penguin',
    dee: 'penguin',
  });

  it('merges the two moose into one option and needs no padding', () => {
    const displays = (pickPhase.q.options ?? []).map((o) => o.display).sort();
    expect(displays).toEqual(['Horse', 'Moose', 'Penguin', 'Reindeer', 'Royal chef']);
    const moose = pickPhase.q.options?.find((o) => o.display === 'Moose');
    expect(moose?.authors).toEqual(['ana', 'dee']);
    expect(pickPhase.q.options?.some((o) => o.house)).toBe(false);
  });

  it('reveals least-picked first, the truth last', () => {
    const order = revealed.q.revealOrder.map(
      (id) => revealed.q.options?.find((o) => o.id === id)?.display,
    );
    expect(order).toEqual(['Horse', 'Moose', 'Penguin']);
  });

  it('pays +500 per player fooled to every author and +1000 per truth', () => {
    const after = throughReveal(revealed);
    expect(after.phase.id).toBe('scores');
    expect(after.scores).toEqual({ ana: 2000, ben: 0, cy: 0, dee: 2000, eli: 500 });
    expect(after.q.delta['ana']?.why).toEqual([
      { k: 'truth', pts: 1000 },
      { k: 'fooled', n: 2, pts: 1000 },
    ]);
  });

  it('lists the lies nobody fell for, with their authors', () => {
    let s = revealed;
    while (s.phase.id === 'reveal' && tv(s).reveal?.kind !== 'unpicked') s = timer(s);
    expect(tv(s).reveal?.unpicked).toEqual([
      { display: 'Reindeer', authors: ['ben'] },
      { display: 'Royal chef', authors: ['cy'] },
    ]);
  });

  it('gives each phone its own moments', () => {
    let s = revealed;
    while (s.phase.id === 'reveal' && tv(s).reveal?.kind !== 'unpicked') s = timer(s);
    expect(cv(s, 'eli').moments.map((m) => [m.k, m.display, m.who, m.pts])).toEqual([
      ['fooled', 'Horse', ['cy'], 500],
      ['fell', 'Moose', ['ana', 'dee'], 0],
    ]);
    expect(cv(s, 'ben').moments.map((m) => m.k)).toEqual(['fell', 'nobody']);
  });
});

describe('scoring rules', () => {
  it('doubles everything on the Final Fake-Out', () => {
    let s = start({ fact: PENGUIN, settings: { questions: 3 } });
    for (let q = 1; q < 3; q++) s = timer(throughReveal(timer(timer(toLie(s)))));
    expect(s.q.final).toBe(true);
    s = lies(toLie(s), { ana: 'moose', ben: 'reindeer', cy: 'horse', dee: 'wolf', eli: 'salmon' });
    const before = { ...s.scores };
    s = throughReveal(picks(s, { ben: 'moose', ana: 'penguin' }));
    expect((s.scores['ana'] ?? 0) - (before['ana'] ?? 0)).toBe(2000 + 1000);
    expect(s.q.delta['ana']?.why).toContainEqual({ k: 'final' });
  });

  it('keeps the final at single points when the setting is off', () => {
    const s = start({ fact: PENGUIN, settings: { questions: 3, finalDouble: false } });
    expect(game.tvView({ ...s, q: { ...s.q, n: 3 } }).final).toBe(false);
  });

  it('only the truth + the lies when everyone writes; a padding lie scores nobody', () => {
    const full = lies(toLie(start({ fact: PENGUIN, players: 2 })), { ana: 'moose', ben: 'otter' });
    expect(full.q.options?.length).toBe(3);
    expect(full.q.options?.some((o) => o.house)).toBe(false);
    // one of two didn't write: a single house lie keeps it a choice for the liar
    let s = lies(toLie(start({ fact: PENGUIN, players: 2 })), { ben: 'moose' });
    expect(s.q.options?.length).toBe(3);
    const house = s.q.options?.find((o) => o.house);
    expect(house).toBeDefined();
    s = pick(s, 'ana', optionId(s, 'moose'));
    s = pick(s, 'ben', house?.id ?? '');
    s = throughReveal(s);
    expect(s.scores).toEqual({ ana: 0, ben: 500 });
    expect(s.stats['ben']?.house).toBe(1);
  });

  it('pays idle players nothing and gives a silent writer no option', () => {
    let s = lies(toLie(start({ fact: PENGUIN })), { ana: 'moose', ben: 'reindeer' });
    expect(s.q.options?.some((o) => o.authors.includes('cy'))).toBe(false);
    s = throughReveal(picks(s, { cy: 'penguin' }));
    expect(s.scores['cy']).toBe(1000);
    expect(s.scores['dee']).toBe(0);
  });

  it('never lowers a score, and ties share a rank', () => {
    let s = lies(toLie(start({ fact: PENGUIN, players: 3, settings: { questions: 3 } })), {});
    s = throughReveal(picks(s, { ana: 'penguin', ben: 'penguin' }));
    const results = game.results({ ...s, phase: { ...s.phase, id: 'done' } });
    expect(results?.ranking.filter((r) => r.rank === 1).map((r) => r.playerId)).toEqual([
      'ana',
      'ben',
    ]);
    expect(Object.values(s.scores).every((v) => v >= 0)).toBe(true);
  });

  it('hands out the awards that were earned, ties shared', () => {
    let s = lies(toLie(start({ fact: PENGUIN })), { ana: 'moose', ben: 'reindeer', cy: 'pengwin' });
    s = throughReveal(picks(s, { cy: 'moose', dee: 'reindeer', eli: 'penguin' }));
    const done = { ...s, phase: { ...s.phase, id: 'done' } };
    const awards = game.results(done)?.awards ?? [];
    expect(awards.filter((a) => a.id.startsWith('master-liar')).map((a) => a.playerId)).toEqual([
      'ana',
      'ben',
    ]);
    expect(awards.find((a) => a.id === 'lucky-guess')?.playerId).toBe('cy');
    expect(new Set(awards.map((a) => a.id)).size).toBe(awards.length);
  });
});

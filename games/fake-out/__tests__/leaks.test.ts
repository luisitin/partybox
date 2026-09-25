// Leaks (SPEC §3.5, §3.17): option ids carry no meaning; no view holds authors, house or truth
// before that option's reveal step; a player's own lie never appears in their own options; the
// display form makes the truth and the lies indistinguishable; speech never singles out the truth.
import { describe, expect, it } from 'vitest';
import { displayForm } from '../server/lies';
import { completedReading, factReading, optionReading } from '../server/speech';
import { game } from '../server/index';
import type { State } from '../server/types';
import { PENGUIN, cv, lies, picks, start, timer, toLie, tv } from './helpers';

function pickPhase(seed = 1): State {
  return lies(toLie(start({ fact: PENGUIN, seed, settings: { reader: 'fable' } })), {
    ana: 'a moose',
    ben: 'Reindeer.',
    cy: 'THE ROYAL CHEF',
    dee: 'moose',
  });
}

/** Every key the TV or a phone may hold for an option before its step. */
const FLAG_KEYS = ['"authors"', '"house"', '"truth":true', '"stamp"', '"pickers"'];

describe('option ids and order', () => {
  it('are drawn from the rng: never a player id, never "truth", not in any fixed order', () => {
    const idSets = new Set<string>();
    for (let seed = 1; seed <= 12; seed++) {
      const s = pickPhase(seed);
      const ids = (s.q.options ?? []).map((o) => o.id);
      for (const id of ids) {
        expect(id).toMatch(/^o\d{1,2}$/);
        expect(Object.keys(s.players)).not.toContain(id);
      }
      const truthIndex = s.q.options?.findIndex((o) => o.truth) ?? -1;
      idSets.add(`${truthIndex}`);
    }
    expect(idSets.size).toBeGreaterThan(2); // the truth lands in different slots across seeds
  });

  it('is one order on the TV and every phone (each phone minus its own lie)', () => {
    const s = pickPhase();
    const order = tv(s).options.map((o) => o.id);
    for (const p of ['ana', 'ben', 'cy', 'dee', 'eli']) {
      const mine = s.q.options?.find((o) => o.authors.includes(p))?.id;
      expect(cv(s, p).options.map((o) => o.id)).toEqual(order.filter((id) => id !== mine));
    }
  });
});

describe('secrets stay on the server until their step', () => {
  it('pick: no view holds authors, house, truth flags or picks', () => {
    const s = pickPhase();
    const views = [tv(s), ...['ana', 'ben', 'cy', 'dee', 'eli'].map((p) => cv(s, p))];
    for (const v of views)
      for (const key of FLAG_KEYS) expect(JSON.stringify(v)).not.toContain(key);
  });

  it('reveal: each option shows its flags only once its step is on stage', () => {
    let s = picks(pickPhase(), { eli: 'moose', ana: 'penguin', ben: 'royal chef' });
    const order = s.q.revealOrder;
    for (let step = 0; step < order.length; step++) {
      expect(s.q.step).toBe(step);
      const shown = tv(s).reveal?.shown.map((o) => o.id);
      expect(shown).toEqual(order.slice(0, step + 1));
      for (const p of ['ana', 'eli'])
        expect(cv(s, p).reveal?.shown.map((o) => o.id)).toEqual(shown);
      // the truth (the last step) never appears as a revealed card before its turn
      if (step < order.length - 1)
        expect(tv(s).reveal?.shown.some((o) => o.stamp === 'truth')).toBe(false);
      if (step < order.length - 1) expect(tv(s).fact.truth).toBeNull();
      s = timer(s);
    }
    expect(tv(s).fact.truth).toBe('penguin');
  });

  it('a phone only gets its own moments, and only for steps already shown', () => {
    const s = picks(pickPhase(), { eli: 'moose', ana: 'penguin', ben: 'royal chef' });
    expect(
      cv(s, 'dee')
        .moments.map((m) => m.step)
        .every((st) => st <= s.q.step),
    ).toBe(true);
    expect(cv(s, 'cy').moments.every((m) => m.k === 'fooled' || m.step <= s.q.step)).toBe(true);
  });

  it('running scores in views hold back this question until the reveal is over', () => {
    const s = picks(pickPhase(), { eli: 'moose', ana: 'penguin' });
    expect(s.scores['ana']).toBe(1000 + 500);
    expect(tv(s).players.find((p) => p.id === 'ana')?.score).toBe(0);
  });
});

describe('one look for every option (SPEC §3.5)', () => {
  it('display form: trim, collapse, drop one article, drop trailing punctuation, capitalise', () => {
    expect(displayForm('  a   moose ')).toBe('Moose');
    expect(displayForm('THE ROYAL CHEF')).toBe('Royal chef');
    expect(displayForm('Reindeer.')).toBe('Reindeer');
    expect(displayForm('penguin')).toBe('Penguin');
    expect(displayForm('the')).toBe('The');
    expect(displayForm('pengiun!!')).toBe('Pengiun');
  });

  it('snapshot: a lowercase truth and mixed-case lies with articles look alike', () => {
    const s = pickPhase();
    const shown = tv(s).options.map((o) => o.display);
    expect(shown).toEqual(expect.arrayContaining(['Moose', 'Reindeer', 'Royal chef', 'Penguin']));
    for (const d of shown) {
      expect(d).toBe(d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()); // one case style
      expect(d).not.toMatch(/^(a|an|the)\s/i);
      expect(d).not.toMatch(/[.!?,;:]$/);
    }
  });
});

describe('speech never singles out the truth', () => {
  it('asks for every option reading together as the pick opens, and nothing secret earlier', () => {
    const lie = toLie(start({ fact: PENGUIN, settings: { reader: 'fable' } }));
    const early = (game.speech?.(lie) ?? []).map((r) => r.key);
    expect(early).not.toContain(completedReading('fable', PENGUIN).key);
    expect(early).not.toContain(optionReading('fable', 'Penguin').key);
    const s = pickPhase();
    const keys = (game.speech?.(s) ?? []).map((r) => r.key);
    const options = (s.q.options ?? []).map((o) => optionReading('fable', o.display).key);
    expect(options.every((k) => keys.includes(k))).toBe(true);
    expect(keys).not.toContain(completedReading('fable', PENGUIN).key);
  });

  it('asks for the completed fact only once the truth step is on stage', () => {
    let s = picks(pickPhase(), { eli: 'moose' });
    const done = completedReading('fable', PENGUIN).key;
    while (s.q.step < s.q.revealOrder.length - 1) {
      expect((game.speech?.(s) ?? []).map((r) => r.key)).not.toContain(done);
      s = timer(s);
    }
    expect((game.speech?.(s) ?? []).map((r) => r.key)).toContain(done);
  });

  it('never puts a reading url in a view before its moment', () => {
    const s = pickPhase();
    const key = factReading('fable', PENGUIN).key;
    const withMs = { ...s, speechMs: { [key]: 2000 } };
    expect(JSON.stringify(tv(withMs))).not.toContain(key);
  });
});

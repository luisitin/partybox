// SPEC §2.8 typed grouping: list matches (misspellings, plurals), loose answers grouped with each
// other, stable labels, and the VIP's merges and unmerges.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import type { QuestionItem, State } from '../server/types';
import { atAnswer, input, timer, typeAll } from './helpers';

const PIZZA: QuestionItem = {
  id: 'hm-food-999',
  style: 'name',
  prompt: 'Name a pizza topping.',
  answers: [
    {
      id: 'pepperoni',
      answer: 'pepperoni',
      weight: 40,
      accept: ['peperoni', 'pepperonis', 'roni'],
    },
    { id: 'cheese', answer: 'cheese', weight: 18, accept: ['extra cheese', 'mozzarella'] },
    { id: 'mushrooms', answer: 'mushrooms', weight: 12, accept: ['mushroom', 'shrooms'] },
    { id: 'pineapple', answer: 'pineapple', weight: 6, accept: [] },
    { id: 'olives', answer: 'olives', weight: 4, accept: [] },
    { id: 'onions', answer: 'onions', weight: 3, accept: [] },
    { id: 'ham', answer: 'ham', weight: 3, accept: [] },
    { id: 'bacon', answer: 'bacon', weight: 3, accept: [] },
  ],
};

function typed(n = 6): State {
  const s = atAnswer({ mode: 'typed' }, n);
  return { ...s, questions: [PIZZA, ...s.questions.slice(1)] };
}

const labels = (s: State): string[] =>
  (s.q.groups ?? []).map((g) => `${g.label}:${g.members.join(',')}`);

describe('typed grouping', () => {
  it('matches misspellings, plurals and accepts to the list, labelled with its display form', () => {
    const s = typeAll(typed(), [
      'Pepperoni',
      'peperoni',
      'PEPPERONIS!',
      'mushroom',
      'Mushrooms',
      'pinapple',
    ]);
    expect(labels(s)).toEqual(['Pepperoni:ana,ben,cy', 'Mushrooms:dee,eli', 'Pineapple:fay']);
    expect(s.q.groups?.[0]?.raw).toEqual({ ana: 'Pepperoni', ben: 'peperoni', cy: 'PEPPERONIS!' });
    expect(s.q.outcome).toBe('herd');
  });

  it('groups answers the list does not know, labelled by the most common form (ties: first seat)', () => {
    const s = typeAll(typed(), [
      'anchovy',
      'Anchovies',
      'anchovies',
      'jalapeños',
      'jalapenos',
      'corn',
    ]);
    expect(labels(s)).toEqual(['Anchovies:ana,ben,cy', 'Jalapeños:dee,eli', 'Corn:fay']);
  });

  it('is stable: the same answers always give the same groups, keys and labels', () => {
    const a = typeAll(typed(), ['roni', 'ham', 'Ham', 'hams', 'cheese', 'mozzarella']);
    const b = typeAll(typed(), ['roni', 'ham', 'Ham', 'hams', 'cheese', 'mozzarella']);
    expect(a.q.groups).toEqual(b.q.groups);
    expect(a.q.groups?.map((g) => g.key)).toEqual(['a:ham', 'a:cheese', 'a:pepperoni']);
  });

  it('text that normalizes to nothing is not an answer', () => {
    const s = input(typed(), 'ana', { type: 'type', text: '!!! 🍕' });
    expect(s.q.answers['ana']).toBeUndefined();
  });

  it('keeps the first 30 characters', () => {
    const s = input(typed(), 'ana', { type: 'type', text: 'x'.repeat(60) });
    expect(s.q.answers['ana']?.text).toHaveLength(30);
  });
});

describe('VIP merges', () => {
  const herd = (): State =>
    typeAll(typed(), ['coke', 'cola', 'coca cola', 'pepsi', 'cheese', 'coke']);

  it('waits for the VIP when there is something to merge', () => {
    const s = herd();
    expect(s.phase.id).toBe('herd');
    expect(s.phase.deadline).toBe(s.phase.startedAt + 20_000);
  });

  it('merges two groups (the bigger keeps its label), live, and unmerges', () => {
    let s = herd();
    const key = (label: string): string => s.q.groups?.find((g) => g.label === label)?.key ?? '';
    const [coke, cola] = [key('Coke'), key('Cola')];
    s = input(s, 'ana', { type: 'merge', a: cola, b: coke }, s.phase.startedAt + 1000, true);
    expect(labels(s)[0]).toBe('Coke:ana,ben,fay');
    expect(s.q.groups?.[0]?.merged).toEqual([cola]);
    expect(s.q.outcome).toBe('herd');
    s = input(s, 'ana', { type: 'unmerge', a: coke, b: cola }, s.phase.startedAt + 2000, true);
    expect(labels(s)[0]).toBe('Coke:ana,fay');
    expect(s.q.merges).toEqual([]);
  });

  it('ignores merges without the VIP stamp, with itself, or with unknown groups', () => {
    const s = herd();
    const k = s.q.groups?.[0]?.key ?? '';
    const other = s.q.groups?.[1]?.key ?? '';
    expect(input(s, 'ana', { type: 'merge', a: k, b: other })).toBe(s);
    expect(input(s, 'ana', { type: 'merge', a: k, b: k }, undefined, true)).toBe(s);
    expect(input(s, 'ana', { type: 'merge', a: k, b: 'a:nope' }, undefined, true)).toBe(s);
  });

  it('tiles mode ignores merges', () => {
    let s = atAnswer();
    s = timer(s);
    expect(input(s, 'ana', { type: 'merge', a: 'x', b: 'y' }, undefined, true)).toBe(s);
  });

  it('Score it is the VIP skip; without it the groups score as they stand after 20 s', () => {
    const s = herd();
    expect(
      game.reduce(s, { type: 'vip', now: s.phase.startedAt + 5, action: 'skip' }).phase.id,
    ).toBe('score');
    expect(timer(s).phase.id).toBe('score');
  });
});

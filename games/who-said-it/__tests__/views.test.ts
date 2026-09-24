// Hidden information (SPEC §4.5, §4.16): the author's phone is identical to everyone else's during
// their own card; no author id in any view before the flip; upcoming cards never shown; a phone's
// own result only after the TV's flip; budgets at 16 players.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import type { State } from '../server/types';
import { authorsNow, guess, phone, start, timer, tv, until, written } from './helpers';

const FIVE = { ana: 'avocado', ben: 'bacon', cy: 'sushi', dee: 'tacos', eli: 'pancakes' };

/** A phone view with the viewer's own identity swapped out, so two players' views compare. */
function neutral(s: State, id: string): unknown {
  const v = JSON.parse(JSON.stringify(phone(s, id))) as Record<string, unknown>;
  const others = (v['candidates'] as string[]).length;
  delete v['me'];
  delete v['candidates'];
  return { ...v, candidates: others };
}

describe('author camouflage', () => {
  it("during their own card the author's phone equals a guesser's, before and after tapping", () => {
    let s = until(written(start({ players: 5 }), FIVE), 'guess');
    const author = authorsNow(s)[0] as string;
    const other = s.seats.find((id) => id !== author) as string;
    expect(neutral(s, author)).toEqual(neutral(s, other));
    s = guess(guess(s, author, other), other, author);
    const a = phone(s, author);
    const o = phone(s, other);
    expect(a.myGuess).toBe(other);
    expect(o.myGuess).toBe(author);
    expect({ ...(neutral(s, author) as object), myGuess: 0 }).toEqual({ ...(neutral(s, other) as object), myGuess: 0 }); // prettier-ignore
    // Their tap shows ✓ like anyone's.
    expect(tv(s).players.find((p) => p.id === author)?.status).toBe('submitted');
  });

  it('the author is never a candidate on their own phone, and never a "yours" field exists', () => {
    const s = until(written(start({ players: 5 }), FIVE), 'guess');
    const author = authorsNow(s)[0] as string;
    const view = phone(s, author);
    expect(view.candidates).not.toContain(author);
    expect(view.myAnswer).toBeNull();
    expect(JSON.stringify(view)).not.toMatch(/mine|yours|author/i);
  });
});

describe('leaks', () => {
  it('no author id in any view before the flip; the TV shows them at the flip', () => {
    let s = until(written(start({ players: 5 }), FIVE), 'guess');
    for (let card = 0; card < 5; card += 1) {
      const author = authorsNow(s)[0] as string;
      for (const phase of ['guess', 'reveal']) {
        expect(s.phase.id).toBe(phase);
        expect(tv(s).reveal?.authors ?? []).toEqual([]);
        for (const id of s.seats) {
          expect(phone(s, id).reveal?.authors ?? []).toEqual([]);
          expect(phone(s, id).result).toBeNull();
        }
        s = timer(s);
      }
      expect(s.p.step).toBe('shown');
      expect(tv(s).reveal?.authors).toEqual([author]);
      expect(game.tvView(s).say).toEqual([]);
      s = timer(s);
    }
  });

  it('the text of upcoming cards never appears in any view', () => {
    let s = until(written(start({ players: 5 }), FIVE), 'guess');
    while (s.phase.id === 'guess' || s.phase.id === 'reveal') {
      const upcoming = s.p.cards.slice(s.p.idx + 1).map((c) => c.text);
      const views = [tv(s), ...s.seats.map((id) => phone(s, id))].map((v) => JSON.stringify(v));
      for (const text of upcoming) for (const v of views) expect(v).not.toContain(text);
      s = timer(s);
    }
  });

  it('other players’ answers are not on any phone while people write', () => {
    const s = written(start({ players: 5 }), FIVE);
    const v = JSON.stringify(phone(s, 'ana'));
    for (const text of ['bacon', 'sushi', 'tacos', 'pancakes']) expect(v).not.toContain(text);
    expect(phone(s, 'ana').myAnswer).toBe('avocado');
    expect(JSON.stringify(tv(s))).not.toContain('avocado');
  });

  it("a phone's own line appears only with the TV's flip", () => {
    let s = until(written(start({ players: 5 }), FIVE), 'guess');
    const author = authorsNow(s)[0] as string;
    const right = s.seats.find((id) => id !== author) as string;
    s = timer(guess(s, right, author));
    expect(phone(s, right).result).toBeNull();
    s = timer(s);
    expect(phone(s, right).result).toMatchObject({ kind: 'right', points: 2 });
    expect(phone(s, author).result).toMatchObject({ kind: 'mine', fooled: 0 });
  });
});

describe('budgets at 16 players', () => {
  it('state stays under 20 KB and every view under 4 KB', () => {
    let s = start({ players: 16, settings: { prompts: '2', reader: 'sky' } });
    let maxState = 0;
    let maxView = 0;
    let steps = 0;
    while (s.phase.id !== 'done' && steps < 400) {
      if (s.phase.id === 'write')
        for (const id of s.seats) s = game.reduce(s, { type: 'input', now: s.phase.startedAt + 10, playerId: id, input: { type: 'answer', text: `${id} ${'long answer text '.repeat(4)}` } }); // prettier-ignore
      if (s.phase.id === 'guess')
        s.seats.forEach((id, i) => { s = guess(s, id, s.seats[(i + 1) % 16] as string); }); // prettier-ignore
      maxState = Math.max(maxState, JSON.stringify(s).length);
      maxView = Math.max(maxView, JSON.stringify(tv(s)).length, ...s.seats.map((id) => JSON.stringify(phone(s, id)).length)); // prettier-ignore
      s = timer(s);
      steps += 1;
    }
    console.log(`who-said-it @16: max state ${maxState} B, max view ${maxView} B`);
    expect(maxState).toBeLessThan(20 * 1024);
    expect(maxView).toBeLessThan(4 * 1024);
  });
});

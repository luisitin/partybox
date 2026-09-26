// Hidden information (SPEC §4.5, §4.16, as amended by the owner 2026-09-24: the author sits out
// their own card); no author id in any view before the flip; upcoming cards never shown; a phone's
// own result only after the TV's flip; budgets at 16 players.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { authorsNow, guess, phone, start, timer, tv, until, written } from './helpers';

const FIVE = { ana: 'avocado', ben: 'bacon', cy: 'sushi', dee: 'tacos', eli: 'pancakes' };

describe('the author sits out their own card (the owner, 2026-09-24)', () => {
  it("the author's phone says it is theirs, with no faces; everyone else gets the grid", () => {
    let s = until(written(start({ players: 5 }), FIVE), 'guess');
    const author = authorsNow(s)[0] as string;
    const other = s.seats.find((id) => id !== author) as string;
    expect(phone(s, author)).toMatchObject({ mine: true, candidates: [] });
    expect(phone(s, other).mine).toBe(false);
    expect(phone(s, other).candidates).toHaveLength(4);
    // The author's tap is ignored.
    s = guess(s, author, other);
    expect(s.p.guesses[author]).toBeUndefined();
  });

  it('at guess start every seated player reads the same, so no ✓ names the author (imposter, a030b2)', () => {
    const s = until(written(start({ players: 5 }), FIVE), 'guess');
    expect(new Set(tv(s).players.map((p) => p.status))).toEqual(new Set(['active']));
  });

  it('the landing shows anonymous taps; names arrive with the flip', () => {
    let s = until(written(start({ players: 5 }), FIVE), 'guess');
    const author = authorsNow(s)[0] as string;
    for (const id of s.seats.filter((x) => x !== author))
      s = guess(s, id, s.seats.find((x) => x !== id) as string);
    s = until(s, 'reveal');
    expect(s.p.step).toBe('land');
    const land = tv(s).reveal?.guesses ?? {};
    expect(Object.keys(land)).toHaveLength(4);
    expect(Object.keys(land).every((k) => k.startsWith('anon-'))).toBe(true);
    expect(Object.values(land).sort()).toEqual(Object.values(s.p.guesses).sort());
    s = timer(s);
    expect(Object.keys(tv(s).reveal?.guesses ?? {}).sort()).toEqual(s.seats.filter((x) => x !== author).sort()); // prettier-ignore
  });

  it('the guess closes once every other connected player has tapped', () => {
    let s = until(written(start({ players: 4 }), { ana: 'avocado', ben: 'bacon', cy: 'sushi', dee: 'tacos' }), 'guess'); // prettier-ignore
    const author = authorsNow(s)[0] as string;
    for (const id of s.seats.filter((x) => x !== author))
      s = guess(s, id, s.seats.find((x) => x !== id) as string);
    expect(s.phase.deadline).toBeLessThan(s.phase.startedAt + 12_000);
  });
});

describe('leaks', () => {
  it('no author id in any view before the flip; the TV shows them at the flip', () => {
    let s = until(written(start({ players: 5 }), FIVE), 'guess');
    while (s.phase.id === 'guess') {
      expect(tv(s).reveal).toBeNull();
      for (const id of s.seats) expect(phone(s, id).result).toBeNull();
      s = timer(s);
    }
    for (let card = 0; card < 5; card += 1) {
      const author = authorsNow(s)[0] as string;
      expect(s.phase.id).toBe('reveal');
      expect(tv(s).reveal?.authors ?? []).toEqual([]);
      for (const id of s.seats) {
        expect(phone(s, id).reveal?.authors ?? []).toEqual([]);
        expect(phone(s, id).result).toBeNull();
      }
      s = timer(s);
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
    s = until(guess(s, right, author), 'reveal');
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

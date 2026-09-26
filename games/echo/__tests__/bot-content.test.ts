// §7.17 Bots (clue variety, guesser probabilities) and the pack tests (§7.15, foundation §4.9).
import { describe, expect, it } from 'vitest';
import { checkPack } from '../content/check';
import { CATEGORIES } from '../content/schema';
import { FAMILY, SPICY, drawWords, rankByClues } from '../server/content';
import { game } from '../server/index';
import { normalize } from '../server/match/index';
import { atClue, botRng, skip, TELESCOPE, withClues } from './helpers';

describe('content packs', () => {
  it('family has 300 words and spicy 80, all valid', () => {
    expect(FAMILY).toHaveLength(300);
    expect(SPICY).toHaveLength(80);
    const { problems } = checkPack([...FAMILY, ...SPICY]);
    expect(problems).toEqual([]);
  });

  it('every category has words; answers are unique across both packs', () => {
    for (const c of CATEGORIES)
      expect(FAMILY.filter((w) => w.category === c).length).toBeGreaterThanOrEqual(20);
    const seen = new Set<string>();
    for (const w of [...FAMILY, ...SPICY]) {
      const c = normalize(w.answer, 'en').compact;
      expect(seen.has(c), w.id).toBe(false);
      seen.add(c);
    }
  });

  it('draws the deck plus six spares without repeats, inside the ticked categories', () => {
    const [deck, spares] = drawWords({ seed: 5, step: 0 }, ['animals'], false, 10, 6);
    expect(new Set([...deck, ...spares].map((w) => w.id)).size).toBe(16);
    expect([...deck, ...spares].every((w) => w.category === 'animals')).toBe(true);
    const [spicyDeck] = drawWords({ seed: 5, step: 0 }, [], true, 13, 6);
    expect(spicyDeck).toHaveLength(13);
  });
});

describe('bots', () => {
  it('clue bots vary their clues and sometimes echo each other', () => {
    const seen = new Set<string>();
    let echoes = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const s = atClue(4);
      const rng = botRng(seed);
      const a = game.bot.sampleInput(s, 'p2', rng);
      const b = game.bot.sampleInput(s, 'p3', rng);
      if (a?.type !== 'clue' || b?.type !== 'clue') throw new Error('expected clues');
      seen.add(a.texts[0] ?? '');
      if (a.texts[0] === b.texts[0]) echoes++;
    }
    expect(seen.size).toBeGreaterThanOrEqual(5);
    expect(echoes).toBeGreaterThan(0);
    expect(echoes).toBeLessThan(30);
  });

  it('3-player clue bots give two different clues; bots never say Don’t know', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const inp = game.bot.sampleInput(atClue(3), 'p2', botRng(seed));
      expect(inp?.type).toBe('clue');
      if (inp?.type === 'clue') expect(new Set(inp.texts).size).toBe(2);
    }
  });

  it('the guesser bot ranks the pack by bank hits and guesses about 0.3 + 0.15k', () => {
    expect(rankByClues(['stars', 'lens', 'Galileo', 'astronomer'], false)[0]?.[0]).toBe(
      TELESCOPE.id,
    );
    const g = skip(withClues(atClue(5), ['stars', 'lens', 'Galileo', 'astronomer']));
    let right = 0;
    let passes = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const inp = game.bot.sampleInput(g, 'p1', botRng(seed));
      if (inp?.type === 'guess' && inp.text === 'telescope') right++;
      if (inp?.type === 'pass') passes++;
    }
    // k = 4 → p = 0.85 for the best word.
    expect(right / 400).toBeGreaterThan(0.78);
    expect(right / 400).toBeLessThan(0.92);
    expect(passes).toBeGreaterThan(0);
  });

  it('with no clues at all the guesser bot passes; givers tap Looks good; nobody acts in result', () => {
    const none = skip(atClue(4));
    expect(none.phase.id).toBe('guess');
    expect(game.bot.sampleInput(none, 'p1', botRng())).toEqual({ type: 'pass' });
    const check = withClues(atClue(4), ['stars', 'lens', 'zoom']);
    expect(game.bot.sampleInput(check, 'p2', botRng())).toEqual({ type: 'ok' });
    expect(game.bot.sampleInput(check, 'p1', botRng())).toBeNull();
  });
});

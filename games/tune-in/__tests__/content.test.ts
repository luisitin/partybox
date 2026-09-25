// Spec §5.16: 150 family and 50 spicy spectra, labels ≤ 18 characters and capitalised, 12 bank
// clues each spread over every fifth of the dial, every bank clue legal against its own labels,
// no two alike, ids stable and unique; bots recognise the bank; the state holds only what's drawn.
import { describe, expect, it } from 'vitest';
import { estimate } from '../server/bot';
import { checkClue } from '../server/clue';
import { FAMILY, SPICY } from '../server/content';
import { game } from '../server/index';
import { sameAnswer } from '@partybox/game-sdk/match';
import { dialAll, guessers, start, timer, toClue, toDial, withTarget } from './helpers';

const ALL = [...FAMILY.spectra, ...SPICY.spectra];

describe('the packs', () => {
  it('have the sizes the spec gives', () => {
    expect(FAMILY.spectra).toHaveLength(150);
    expect(SPICY.spectra).toHaveLength(50);
  });

  it('ids and label pairs are unique; labels are short and capitalised', () => {
    expect(new Set(ALL.map((s) => s.id)).size).toBe(ALL.length);
    expect(new Set(ALL.map((s) => `${s.left}|${s.right}`.toLowerCase())).size).toBe(ALL.length);
    for (const s of ALL)
      for (const label of [s.left, s.right]) {
        expect(label.length, s.id).toBeLessThanOrEqual(18);
        expect(label[0], s.id).toBe(label[0]?.toUpperCase());
      }
  });

  it('every bank clue passes the clue rules against its own spectrum, Spanish ends too', () => {
    for (const s of ALL)
      for (const c of s.clues)
        expect(checkClue(c.text, s.left, s.right, s.es).ok, `${s.id}: ${c.text}`).toBe(true);
  });

  it('every dial has Spanish ends: short, capitalised, a distinct pair', () => {
    expect(new Set(ALL.map((s) => `${s.es.left}|${s.es.right}`.toLowerCase())).size).toBe(
      ALL.length,
    );
    for (const s of ALL)
      for (const label of [s.es.left, s.es.right]) {
        expect(label.length, s.id).toBeLessThanOrEqual(18);
        expect(label[0], s.id).toBe(label[0]?.toUpperCase());
      }
  });

  it('every fifth of the dial holds at least two clues, and no two clues are alike', () => {
    for (const s of ALL) {
      const fifths = [0, 0, 0, 0, 0];
      for (const c of s.clues) {
        const k = Math.min(4, Math.floor(c.pos / 20));
        fifths[k] = (fifths[k] ?? 0) + 1;
      }
      expect(Math.min(...fifths), s.id).toBeGreaterThanOrEqual(2);
      s.clues.forEach((c, i) => {
        for (const d of s.clues.slice(i + 1))
          expect(sameAnswer(c.text, d.text, 'en'), `${s.id}: ${c.text}`).toBe(false);
      });
    }
  });
});

describe('the bot', () => {
  it('as the psychic, picks one of the two bank clues nearest the target', () => {
    const s = withTarget(toClue(start(4, { mode: 'solo' })), 88);
    const spectrum = s.spectra[s.turn.spectrum];
    const nearest = [...(spectrum?.clues ?? [])]
      .sort((a, b) => Math.abs(a.pos - 88) - Math.abs(b.pos - 88))
      .slice(0, 2)
      .map((c) => c.text);
    const rng = { pick: <T>(xs: readonly T[]): T => xs[1] as T } as never;
    expect(nearest).toContain(
      (game.bot.sampleInput(s, s.turn.psychic, rng) as { text: string }).text,
    );
  });

  it('as a guesser, recognises a bank clue (and a plural of it) and dials near its spot', () => {
    const s = toDial(start(4, { mode: 'solo' }), 50);
    const spectrum = s.spectra[s.turn.spectrum];
    const view = game.controllerView(s, guessers(s)[0] as string);
    expect(estimate(view)).toBe(spectrum?.clues[0]?.pos);
    const plural = { ...view, turn: { ...view.turn, clue: `${spectrum?.clues[0]?.text ?? ''}s` } };
    expect(estimate(plural)).toBe(spectrum?.clues[0]?.pos);
    expect(estimate({ ...view, turn: { ...view.turn, clue: 'zzqx' } })).toBeNull();
  });

  it('never needs the target: a guesser view carries none', () => {
    const s = toDial(start(4, { mode: 'solo' }), 50);
    expect(game.controllerView(s, guessers(s)[0] as string).bullseyeAt).toBeUndefined();
  });
});

describe('state size', () => {
  it('stays under 16 KB at 16 players (the test fails above 32 KB)', () => {
    let worst = 0;
    for (const mode of ['solo', 'teams', 'coop']) {
      let s = start(16, { mode, spicy: true });
      for (let i = 0; i < 80 && s.phase.id !== 'done'; i += 1) {
        if (s.phase.id === 'dial')
          s = dialAll(
            s,
            guessers(s).map((_, k) => (k * 7) % 100),
          );
        worst = Math.max(worst, JSON.stringify(s).length);
        s = s.phase.id === 'clue' ? toDial(s) : timer(s);
      }
    }
    console.log(`tune-in: largest 16-player state ${worst} bytes`);
    expect(worst).toBeLessThan(32 * 1024);
    expect(worst).toBeLessThan(16 * 1024);
  });
});

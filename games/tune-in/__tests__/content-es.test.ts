// ADR-054: a Spanish game. Session C's banks are not in yet (content/es.ts is empty), so this file
// stands in a complete one: every dial with its Spanish ends and twelve made-up Spanish clues.
import { describe, expect, it, vi } from 'vitest';
import { estimate } from '../server/bot';
import { ES_READY } from '../server/content';
import { game } from '../server/index';
import { readContentLang } from '../server/settings';
import { announceReading, fixedReading } from '../server/speech';
import type { State } from '../server/types';
import { guessers, roster, send, T0, toClue, toDial, withTarget } from './helpers';

vi.mock('../content/es', async () => {
  type Pack = {
    spectra: {
      id: string;
      es: { left: string; right: string };
      clues: { text: string; pos: number }[];
    }[];
  };
  const family = (await import('../content/family.json')).default as Pack;
  const spicy = (await import('../content/spicy.json')).default as Pack;
  // vi.mock is hoisted above the file's own constants, so the words live in here.
  const words = ['bruma', 'ceniza', 'dintel', 'esquila', 'fragua', 'granza'].concat([
    'hisopo',
    'jaspe',
    'lebrel',
    'mimbre',
    'orujo',
    'pellizco',
  ]);
  const toEs = (pack: Pack) => ({
    lang: 'es' as const,
    spectra: pack.spectra.map((s) => ({
      id: s.id,
      es: s.es,
      clues: s.clues.map((c, i) => ({ text: `una ${words[i] ?? 'nube'}`, pos: c.pos })),
    })),
  });
  return { ES_PACKS: [toEs(family), toEs(spicy)] };
});

function startEs(n: number, settings: Record<string, string | number | boolean> = {}): State {
  return game.init({ players: roster(n), settings, seed: 42, now: T0, contentLang: 'es' } as never);
}

describe('ADR-054: a Spanish game', () => {
  it('plays in Spanish when the room asks and every dial has its bank', () => {
    expect(ES_READY).toBe(true);
    const s = startEs(4, { mode: 'solo' });
    expect(s.lang).toBe('es');
    expect(game.tvView(s).turn.lang).toBe('es');
    expect(readContentLang({ players: [], settings: {}, seed: 1, now: 0 } as never)).toBe('en');
    expect(readContentLang({ contentLang: 'es' } as never, false)).toBe('en');
  });

  it('the bot psychic writes from the Spanish bank', () => {
    const s = withTarget(toClue(startEs(4, { mode: 'solo' })), 88);
    const rng = { pick: <T>(xs: readonly T[]): T => xs[0] as T } as never;
    const clue = (game.bot.sampleInput(s, s.turn.psychic, rng) as { text: string }).text;
    expect(clue).toMatch(/^una [a-zñ]+$/);
  });

  it('a bot guesser recognises a Spanish bank clue', () => {
    const s = toDial(startEs(4, { mode: 'solo' }), 50);
    const view = game.controllerView(s, guessers(s)[0] as string);
    const spectrum = s.spectra[s.turn.spectrum];
    const spanish = { ...view, turn: { ...view.turn, clue: 'una bruma' } };
    expect(estimate(spanish)).toBe(spectrum?.clues[0]?.pos);
  });

  it("the reader speaks Latin American Spanish: the nearest voice, the TV's words, the Spanish ends", () => {
    const s = toClue(startEs(4, { mode: 'solo', reader: 'sky' }));
    const bull = fixedReading(s, 'bullseye');
    expect(bull?.voice).toBe('dora');
    expect(bull?.parts.map((p) => p.text).join(' ')).toContain('En el blanco');
    const spectrum = s.spectra[s.turn.spectrum];
    const said =
      announceReading(s)
        ?.parts.map((p) => p.text)
        .join(' ') ?? '';
    expect(said).toContain('es el vidente');
    expect(said).toContain(`De ${spectrum?.es.left ?? ''} a ${spectrum?.es.right ?? ''}`);
    const george = toClue(startEs(4, { mode: 'solo', reader: 'george' }));
    expect(fixedReading(george, 'close')?.voice).toBe('alex');
  });

  it("a person's clue gets the Spanish rules", () => {
    const s = toClue(startEs(4, { mode: 'solo' }));
    const refused = send(s, s.turn.psychic, { type: 'clue', text: 'a la izquierda' });
    expect(refused.turn.rejected?.reason).toBe('position-word');
    const sent = send(s, s.turn.psychic, { type: 'clue', text: 'una sopa de tortilla' });
    expect(sent.turn.clue).toBe('una sopa de tortilla');
  });
});

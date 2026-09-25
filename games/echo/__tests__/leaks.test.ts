// §7.17 Leaks: the word never reaches the guesser, the TV or a spectator before `result`; clues
// never reach the TV or the guesser before `guess`; echoed texts and authors not before `result`;
// "Don't know it" never reaches the guesser. Plus the view budget.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import type { State } from '../server/types';
import { atClue, input, players, skip, withClues } from './helpers';

const WORD = 'telescope';
const CLUES = ['astronomer', 'astronomers', 'Galileo', 'observatory'];

function views(s: State) {
  return {
    tv: JSON.stringify(game.tvView(s)),
    guesser: JSON.stringify(game.controllerView(s, 'p1')),
    spectator: JSON.stringify(game.controllerView(s, 'late')),
    giver: JSON.stringify(game.controllerView(s, 'p2')),
  };
}

describe('hidden information', () => {
  it('clue phase: the word only on clue-givers; clues only on their author', () => {
    const s = withClues(atClue(5), CLUES.slice(0, 2));
    const v = views(s);
    for (const k of ['tv', 'guesser', 'spectator'] as const) {
      expect(v[k]).not.toContain(WORD);
      for (const c of CLUES.slice(0, 2)) expect(v[k]).not.toContain(c);
    }
    expect(v.giver).toContain(WORD);
    expect(JSON.stringify(game.controllerView(s, 'p4'))).not.toContain('astronomer');
  });

  it('check phase: clues only on clue-givers', () => {
    const s = withClues(atClue(5), CLUES);
    expect(s.phase.id).toBe('check');
    const v = views(s);
    for (const k of ['tv', 'guesser', 'spectator'] as const) {
      expect(v[k]).not.toContain(WORD);
      for (const c of CLUES) expect(v[k]).not.toContain(c);
    }
    expect(v.giver).toContain('observatory');
    expect(v.giver).not.toContain('"by"');
  });

  it('guess phase: survivors everywhere, echoes and authors nowhere', () => {
    const s = skip(withClues(atClue(5), CLUES));
    const v = views(s);
    for (const k of ['tv', 'guesser', 'spectator'] as const) {
      expect(v[k]).not.toContain(WORD);
      expect(v[k]).toContain('Galileo');
      expect(v[k]).not.toContain('astronomer');
      expect(v[k]).not.toContain('"by"');
    }
    expect(game.tvView(s).echoCount).toBe(2);
  });

  it('result phase: the word, every clue and its author', () => {
    const s = input(skip(withClues(atClue(5), CLUES)), 'p1', { type: 'guess', text: 'star' });
    const r = game.tvView(s).result;
    expect(r?.word).toBe(WORD);
    expect(r?.clues).toContainEqual({ text: 'astronomers', by: 'p3', echo: true });
  });

  it('survivors are in text order, never seat order', () => {
    const s = skip(withClues(atClue(5), ['zoom', 'lens', 'Galileo', 'moon']));
    expect(game.tvView(s).survivors).toEqual(['Galileo', 'lens', 'moon', 'zoom']);
  });

  it('the guesser never learns about Don’t know it taps', () => {
    const s = input(atClue(5), 'p2', { type: 'dontKnow' });
    expect(JSON.stringify(game.controllerView(s, 'p1'))).not.toContain('"mine"');
    expect(JSON.stringify(game.tvView(s))).not.toContain('dontKnow');
  });
});

describe('budgets', () => {
  it('state stays under 16 KB at 10 players and is logged at 16', () => {
    const at10 = game.init({ players: players(10), settings: { words: 13 }, seed: 3, now: 0 });
    const size10 = JSON.stringify(skip(at10, 1)).length;
    const at16 = game.init({
      players: Array.from({ length: 16 }, (_, i) => ({
        id: `q${i}`,
        name: `Q${i}`,
        avatarId: 'fox',
        connected: true,
      })),
      settings: { words: 13 },
      seed: 3,
      now: 0,
    });
    const size16 = JSON.stringify(skip(at16, 1)).length;
    console.log(`echo state: ${size10} B at 10 players, ${size16} B at 16 players (13 words)`);
    expect(size10).toBeLessThan(16 * 1024);
    expect(size16).toBeLessThan(32 * 1024);
  });

  it('views stay under 4 KB at 10 players in the busiest phase', () => {
    let s = skip(game.init({ players: players(10), settings: {}, seed: 3, now: 0 }), 1);
    const texts = [
      'astronomer',
      'observatory',
      'Galileo',
      'planets',
      'nebula',
      'eyepiece',
      'tripod',
      'cosmos',
      'zoom',
    ];
    s.seats
      .filter((id) => id !== s.w.guesser)
      .forEach((id, i) => {
        s = input(s, id, { type: 'clue', texts: [texts[i] ?? 'sky'] });
      });
    const sizes = [
      JSON.stringify(game.tvView(s)).length,
      ...s.seats.map((id) => JSON.stringify(game.controllerView(s, id)).length),
    ];
    expect(Math.max(...sizes)).toBeLessThan(4096);
  });
});

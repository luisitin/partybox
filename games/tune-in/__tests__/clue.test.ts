// Spec §5.8 / §5.18 "Clue rules": digits, number words, label words and position words are
// rejected; a legal compound like "hotdog" is accepted. The server re-checks what the phone checked.
import { describe, expect, it } from 'vitest';
import { checkClue } from '../server/clue';
import { send, start, toClue } from './helpers';

const hot = (text: string): string => {
  const verdict = checkClue(text, 'Cold', 'Hot');
  return verdict.ok ? 'ok' : verdict.reason;
};

describe('clue rules (Cold ↔ Hot)', () => {
  it.each([
    ['coffee', 'ok'],
    ['hotdog', 'ok'],
    ['a sauna in July', 'ok'],
    ['', 'empty'],
    ['   ', 'empty'],
    ['!!!', 'empty'],
    ['the inside of a volcano at noon', 'too-long'],
    ['50 degrees', 'number'],
    ['twenty-one', 'number'],
    ['seven dwarfs', 'number'],
    ['a million suns', 'number'],
    ['a dozen eggs', 'number'],
    ['very hot', 'label-word'],
    ['hotter than hell', 'label-word'],
    ['the hottest day', 'label-word'],
    ['COLDS', 'label-word'],
    ['left of lava', 'position-word'],
    ['right in the middle', 'position-word'],
    ['the dial', 'position-word'],
    ['halfway there', 'position-word'],
  ])('%j → %s', (text, want) => {
    expect(hot(text)).toBe(want);
  });

  it('checks both labels, whole words only, 3+ letters', () => {
    expect(checkClue('easy peasy', 'Easy to spell', 'Hard to spell').ok).toBe(false);
    expect(checkClue('spelling bee', 'Easy to spell', 'Hard to spell').ok).toBe(false);
    expect(checkClue('spellbound', 'Easy to spell', 'Hard to spell').ok).toBe(true);
    expect(checkClue('go to bed', 'Easy to spell', 'Hard to spell').ok).toBe(true);
    expect(checkClue('superpowers', 'Useless superpower', 'Useful superpower').ok).toBe(false);
    expect(checkClue('nicer', 'Nice', 'Naughty').ok).toBe(false);
    expect(checkClue('happily ever after', 'Sad', 'Happy').ok).toBe(false);
  });

  it('bans the Spanish ends too (a Spanish psychic sees those), accents folded', () => {
    const es = { left: 'Frío', right: 'Caliente' };
    expect(checkClue('muy caliente', 'Cold', 'Hot', es)).toEqual({
      ok: false,
      reason: 'label-word',
    });
    expect(checkClue('calientes', 'Cold', 'Hot', es).ok).toBe(false);
    expect(checkClue('frio polar', 'Cold', 'Hot', es).ok).toBe(false);
    expect(checkClue('volcán', 'Cold', 'Hot', es).ok).toBe(true);
    const kids = { left: 'Cosa de niños', right: 'Cosa de adultos' };
    expect(checkClue('de noche', 'Kid stuff', 'Grown-up stuff', kids).ok).toBe(true);
    expect(checkClue('niños', 'Kid stuff', 'Grown-up stuff', kids).ok).toBe(false);
  });

  it('counts at most 30 characters and trims', () => {
    expect(checkClue('  coffee  ', 'Cold', 'Hot')).toEqual({ ok: true, text: 'coffee' });
    expect(checkClue('a'.repeat(30), 'Cold', 'Hot').ok).toBe(true);
    expect(checkClue('a'.repeat(31), 'Cold', 'Hot').ok).toBe(false);
  });
});

describe('the server re-checks', () => {
  it('an illegal clue is refused with its reason; a legal one opens the dial', () => {
    let s = toClue(start(4, { mode: 'solo' }));
    const psychic = s.turn.psychic;
    const spectrum = s.spectra[s.turn.spectrum];
    const labelWord = spectrum?.left.split(' ')[0] ?? 'x';
    s = send(s, psychic, { type: 'clue', text: `${labelWord} stuff` });
    expect(s.phase.id).toBe('clue');
    expect(s.turn.rejected).toEqual({ reason: 'label-word', n: 1 });
    s = send(s, psychic, { type: 'clue', text: 'seven' });
    expect(s.turn.rejected).toEqual({ reason: 'number', n: 2 });
    s = send(s, psychic, { type: 'clue', text: spectrum?.clues[3]?.text ?? '' });
    expect(s.phase.id).toBe('dial');
    expect(s.turn.rejected).toBeNull();
  });
  it('a clue from anyone but the psychic is ignored', () => {
    const s = toClue(start(4, { mode: 'solo' }));
    const other = s.seats.find((id) => id !== s.turn.psychic) as string;
    expect(send(s, other, { type: 'clue', text: 'coffee' })).toBe(s);
  });
});

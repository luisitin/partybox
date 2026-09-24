// Spec §5.13 and P00 §5: the reader says the psychic and the ends at `clue`, the clue at `dial`,
// the verdict at the points beat; never the target; a key reaches a view only when its line plays.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { readableName, speakableText, speechKey } from '../server/speakable';
import { announceReading, clueReading, speech } from '../server/speech';
import { dialAll, send, start, timer, toClue, toDial } from './helpers';

const said = (parts: readonly { text?: string }[]): string =>
  parts.map((p) => p.text ?? '').join('');

describe('what the reader says', () => {
  it('"Ana is the psychic. From X, to Y." — or "New psychic." for an unreadable name', () => {
    const s = toClue(start(4, { mode: 'solo' }));
    const spectrum = s.spectra[s.turn.spectrum];
    const name = s.players[s.turn.psychic]?.name ?? '';
    expect(said(announceReading(s)?.parts ?? [])).toBe(
      `${name} is the psychic. From ${spectrum?.left}, to ${spectrum?.right}.`,
    );
    const odd = {
      ...s,
      players: {
        ...s.players,
        [s.turn.psychic]: { ...s.players[s.turn.psychic], name: 'xX_99_Xx' },
      },
    } as typeof s;
    expect(said(announceReading(odd)?.parts ?? [])).toMatch(/^New psychic\. From /);
  });

  it('the clue itself, capitalised with a stop, once it is sent', () => {
    let s = toClue(start(4, { mode: 'solo' }));
    s = send(s, s.turn.psychic, { type: 'clue', text: 'LAVA LAMP!!!' });
    expect(s.phase.id).toBe('dial');
    expect(said(clueReading(s)?.parts ?? [])).toBe('Lava lamp!');
    expect(speakableText('an FBI agent', true)).toBe('an F B I agent');
    expect(speakableText('a NASA rocket', true)).toBe('a NASA rocket');
    expect(readableName('BEN')).toBe('Ben');
  });

  it('never speaks the target, and never with the reader off', () => {
    let s = toDial(start(4, { mode: 'solo' }), 73);
    for (let i = 0; i < 6; i += 1) {
      for (const r of speech(s)) expect(said(r.parts)).not.toMatch(/73|seventy/);
      s = s.phase.id === 'dial' ? dialAll(s, [73, 70, 60]) : timer(s);
    }
    expect(speech(start(4, { reader: 'none' }))).toEqual([]);
  });
});

describe('keys', () => {
  it('fit the host’s key pattern and are stable per voice and text', () => {
    const k = speechKey('sky', [{ text: 'Coffee.' }]);
    expect(k).toMatch(/^[a-z0-9]{6,40}$/);
    expect(speechKey('sky', [{ text: 'Coffee.' }])).toBe(k);
    expect(speechKey('george', [{ text: 'Coffee.' }])).not.toBe(k);
  });

  it('reach a view only once made, and only in the phase that plays them', () => {
    let s = toClue(start(4, { mode: 'solo' }));
    const want = announceReading(s);
    expect(game.tvView(s).reading).toBeNull();
    s = game.reduce(s, {
      type: 'speech',
      now: s.phase.startedAt + 300,
      key: want?.key ?? '',
      ms: 2100,
    });
    expect(game.tvView(s).reading?.key).toBe(want?.key);
    s = game.reduce(s, { type: 'speech', now: s.phase.startedAt + 400, key: 'tifailed', ms: -1 });
    expect(game.tvView(s).reading?.key).toBe(want?.key);
    s = timer(s); // void → reveal: the announcement is gone
    expect(game.tvView(s).reading).toBeNull();
  });

  it('asks for at most 10 at once', () => {
    for (const phase of [start(6, { mode: 'teams' }), toClue(start(6, { mode: 'teams' }))])
      expect(speech(phase).length).toBeLessThanOrEqual(10);
  });
});

describe('speakable text', () => {
  it('straightens quotes, reads symbols, calms shouting and stretched words', () => {
    expect(speakableText('Rock & roll', true)).toBe('Rock and roll');
    expect(speakableText('SOOOO HOT', true)).toBe('soo hot');
    expect(speakableText('it’s 🔥', true)).toBe("it's");
  });
  it('skips names with no vowels or mostly symbols', () => {
    expect(readableName('Ana')).toBe('Ana');
    expect(readableName('xkcd')).toBeNull();
    expect(readableName('__99__')).toBeNull();
  });
});

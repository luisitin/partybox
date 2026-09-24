// I-652: the lobby's "Tonight" card — the night's games and tally, compact from 9 players.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { RoomSnapshot } from '@partybox/shared';
import { Tonight, ordinal } from './Tonight';

const person = (name: string) => ({ name, avatarId: 'fox' });
const room = (players: number): RoomSnapshot =>
  ({
    players: Array.from({ length: players }, (_, i) => ({ id: `p${i}`, name: `P${i}` })),
    games: [{ id: 'lightning-round', name: 'Lightning Round' }],
    tonight: [
      { gameId: 'lightning-round', winners: [], botsWon: true },
      { gameId: 'lightning-round', winners: [person('Sam')], botsWon: false },
      { gameId: 'lightning-round', winners: [person('Priya')], botsWon: false },
      { gameId: 'lightning-round', winners: [person('Sam')], botsWon: false },
    ],
  }) as unknown as RoomSnapshot;

describe('I-652 Tonight', () => {
  it('ordinals in English and Spanish', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22].map((n) => ordinal(n))).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
    ]);
    expect(ordinal(3, 'es')).toBe('3.º');
  });

  it('lists every game and names the leader; bots never count', () => {
    const html = renderToStaticMarkup(<Tonight room={room(4)} />);
    expect(html).toContain('Tonight · 4 games');
    expect((html.match(/<li/g) ?? []).length).toBe(4);
    expect(html).toContain('🤖 bots');
    expect(html).toContain('👑 Sam leads tonight');
    expect(html).toContain('Sam 2 · Priya 1');
  });

  it('from 9 players keeps only the tally', () => {
    const html = renderToStaticMarkup(<Tonight room={room(9)} />);
    expect(html).not.toContain('<li');
    expect(html).toContain('Sam 2 · Priya 1');
  });
});

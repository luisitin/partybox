// WordGrid (@partybox/game-sdk/ui/word-grid, Part 05 §9.5): the 5×5 board on the TV and phones.
// Pins what the room relies on: row letters and column numbers, an identity never shown by colour
// alone, the list layout's coordinates, taps only where the game passes a handler, faces capped.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WordGrid, coord } from '@partybox/game-sdk/ui/word-grid';
import type { GridCard } from '@partybox/game-sdk/ui/word-grid';

const words = Array.from({ length: 25 }, (_, i) => `WORD${i}`);
const cards = (patch: Partial<GridCard>[] = []): GridCard[] =>
  words.map((word, i) => ({ word, kind: null, ...(patch[i] ?? {}) }));

describe('WordGrid', () => {
  it('names every card by its coordinate: A1 … E5', () => {
    expect([0, 4, 5, 12, 24].map(coord)).toEqual(['A1', 'A5', 'B1', 'C3', 'E5']);
  });

  it('grid layout: row letters, column numbers and all 25 words', () => {
    const html = renderToStaticMarkup(<WordGrid surface="tv" cards={cards()} />);
    for (const w of words) expect(html).toContain(`>${w}<`);
    for (const r of 'ABCDE') expect(html).toContain(`>${r}<`);
    for (const c of [1, 2, 3, 4, 5]) expect(html).toContain(`>${c}<`);
  });

  it('a turned card shows its identity with a mark, not colour alone', () => {
    const html = renderToStaticMarkup(
      <WordGrid
        surface="phone"
        cards={cards([
          { kind: 'sun' },
          { kind: 'moon' },
          { kind: 'bystander' },
          { kind: 'assassin' },
        ])}
      />,
    );
    expect(html.match(/<svg/g)?.length).toBe(2); // ▲ and ● drawn as shapes
    expect(html).toContain('🚶');
    expect(html).toContain('💀');
  });

  it('list layout carries the coordinates beside each word', () => {
    const html = renderToStaticMarkup(<WordGrid surface="phone" layout="list" cards={cards()} />);
    expect(html).toContain('>A1<');
    expect(html).toContain('>E5<');
  });

  it('is tappable only with a handler, and labels each button', () => {
    const still = renderToStaticMarkup(<WordGrid surface="tv" cards={cards()} />);
    expect(still).not.toContain('<button');
    const live = renderToStaticMarkup(
      <WordGrid surface="phone" cards={cards()} onTap={() => undefined} label={(i) => coord(i)} />,
    );
    expect(live.match(/<button/g)?.length).toBe(25);
    expect(live).toContain('aria-label="C3"');
  });

  it('shows at most four faces on a card, then +N', () => {
    const faces = Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, avatarId: String(i) }));
    const html = renderToStaticMarkup(
      <WordGrid surface="tv" cards={cards([{ faces, ring: 'sun' }])} />,
    );
    expect(html).toContain('+2');
  });
});

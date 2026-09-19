// The recap the host writes when a room records (ADR-035): every book as a chain — the word, each
// drawing (as an SVG file next to the markdown) and each guess, with who did what and whether the
// book came home intact. Pure: strings in, strings out.
import type { GameRecap, RecapContext, RecapFile } from '@partybox/game-sdk';
import { isIntact } from './books';
import { CANVAS, decodePoints } from './encoding';
import { PALETTE, PAPER, WIDTHS } from './palette';
import type { Drawing, State } from './types';

function pathOf(points: number[]): string {
  if (points.length < 2) return '';
  let d = `M${points[0]} ${points[1]}`;
  if (points.length === 2) d += ' l0.01 0';
  for (let i = 2; i < points.length; i += 2) d += ` L${points[i]} ${points[i + 1]}`;
  return d;
}

/** A drawing as a standalone SVG (256 × 256 canvas units, scalable). Null = an empty sheet. */
export function drawingSvg(drawing: Drawing | null): string {
  const strokes = (drawing?.strokes ?? [])
    .map((s) => {
      const d = pathOf(decodePoints(s.p));
      if (!d) return '';
      const color = PALETTE[s.c] ?? PALETTE[0];
      const width = WIDTHS[s.w] ?? WIDTHS[1];
      return `  <path d="${d}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .filter(Boolean)
    .join('\n');
  const empty = strokes
    ? ''
    : `  <text x="${CANVAS / 2}" y="${CANVAS / 2}" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#888" font-style="italic">(nothing was drawn)</text>\n`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="512" height="512">
  <rect width="${CANVAS}" height="${CANVAS}" fill="${PAPER}"/>
${strokes ? strokes + '\n' : ''}${empty}</svg>
`;
}

function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'player'
  );
}

export function recap(state: State, ctx: RecapContext<State>): GameRecap | null {
  const name = (id: string): string =>
    ctx.players.find((p) => p.id === id)?.name ?? state.players[id]?.name ?? id;
  const files: RecapFile[] = [];
  const lines: string[] = [];
  const s = state.settings;
  lines.push('# Broken Pencil — recap', '');
  lines.push(`Players: ${ctx.players.map((p) => p.name).join(', ')}`);
  lines.push(
    `Settings: ${s.passes} passes · draw ${s.drawSeconds} s · guess ${s.guessSeconds} s · custom words ${s.customWords ? 'on' : 'off'} · spicy ${s.spicy ? 'on' : 'off'}`,
  );
  const unfinished = state.books.filter((b) => b.pages.length < state.pageCount).length;
  if (!ctx.results) lines.push('', '_The game was ended before the show._');
  else if (unfinished > 0)
    lines.push(
      '',
      `_The game was ended early during the ${state.phase.id} phase — ${unfinished} of ${state.books.length} books were unfinished._`,
    );
  lines.push('');
  state.books.forEach((book, b) => {
    const owner = name(book.ownerId);
    const word = book.pages[0]?.kind === 'word' ? book.pages[0].text : '?';
    const complete = book.pages.length >= state.pageCount;
    const verdict = !complete ? 'unfinished' : isIntact(book) ? 'intact ✓' : 'broken ✗';
    lines.push(`## Book ${b + 1} — ${owner} — “${word}” — ${verdict}`, '');
    book.pages.forEach((page, i) => {
      const who = name(page.authorId);
      if (page.kind === 'word') lines.push(`${i + 1}. **${who}'s word:** ${page.text}`);
      else if (page.kind === 'guess')
        lines.push(`${i + 1}. **${who} guessed:** ${page.text ?? '??? (no guess)'}`);
      else {
        const file = `book-${String(b + 1).padStart(2, '0')}-page-${String(i + 1).padStart(2, '0')}-${slug(who)}.svg`;
        files.push({ name: file, body: drawingSvg(page.drawing) });
        lines.push(
          `${i + 1}. **${who} drew:** ![${who}'s drawing](${file})${page.drawing ? '' : ' _(empty sheet)_'}`,
        );
      }
    });
    const chain = book.pages
      .filter((p) => p.kind !== 'draw')
      .map((p) => (p.kind === 'word' ? p.text : (p.text ?? '???')));
    lines.push('', `Chain: ${chain.join(' → ')}`, '');
  });
  return { markdown: lines.join('\n'), files };
}

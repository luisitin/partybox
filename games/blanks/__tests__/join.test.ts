// I-150 C (preview branch): the join, tested on the WHOLE deck where it used to break.
import { describe, expect, it } from 'vitest';
import { BLANK } from '../content/schema';
import { fillText } from '../server/cards';
import { blackCard, blackPool, whitePool, whiteText } from '../server/content';
import { innerQuotes } from '../server/scoring';

/** The first blank sits inside a double quotation opened by the black card itself. */
function quotedBlank(text: string): boolean {
  const before = text.split(BLANK)[0] ?? '';
  const straight = (before.match(/"/g) ?? []).length;
  const curly = (before.match(/\u201c/g) ?? []).length - (before.match(/\u201d/g) ?? []).length;
  return straight % 2 === 1 || curly > 0;
}

/** Two double quotes side by side, or double quotes that no longer balance. */
function broken(line: string): boolean {
  if (/["\u201c\u201d]\s*["\u201c\u201d]/.test(line)) return true;
  const straight = (line.match(/"/g) ?? []).length;
  return (
    straight % 2 === 1 ||
    (line.match(/\u201c/g) ?? []).length !== (line.match(/\u201d/g) ?? []).length
  );
}

describe('the join across the deck (I-150)', () => {
  const blacks = [...new Set(blackPool('wild'))].map((id) => blackCard(id));
  const whites = [...new Set(whitePool('wild'))].map((id) => whiteText(id));

  it('a quoted card inside a quotation never doubles or unbalances its quotes', () => {
    const quoted = whites.filter((w) => /["\u201c\u201d]/.test(w));
    const cards = blacks.filter(
      (b) => b.pick === 1 && quotedBlank(b.text) && !broken(b.text.replace(BLANK, 'x')),
    );
    expect(cards.length).toBeGreaterThan(100); // the sweep really covers the deck's quoted blanks
    expect(quoted.length).toBeGreaterThan(100);
    const bad: string[] = [];
    for (const b of cards)
      for (const w of quoted) {
        const line = fillText(b.text, [w]);
        if (broken(line)) bad.push(line);
      }
    expect(bad.slice(0, 5)).toEqual([]);
  });

  it("the note's own card closes once", () => {
    expect(fillText('"Most likely to ____."', ['Naming a goldfish "Doug."'])).toBe(
      `"Most likely to naming a goldfish 'Doug.'"`,
    );
  });

  it('the results screen quotes a quoted sentence without doubling', () => {
    const line = fillText('The porn parody of the movie was called "____."', [
      'Faking an orgasm at a s\u00e9ance.',
    ]);
    expect(`\u201c${innerQuotes(line)}\u201d`).not.toMatch(/["\u201d]\u201d/);
  });
});

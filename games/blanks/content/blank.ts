// How a blank is written in a black card's text, and how many a card has. Its own file with no zod
// in reach: the phone and TV entries fill cards with it without downloading the pack schemas
// (ADR-050).

/** How a blank is written in a black card's text. */
export const BLANK = '____';

export function blanksIn(text: string): number {
  return text.split(BLANK).length - 1;
}

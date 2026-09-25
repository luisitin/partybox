// Turning a prompt's answers into cards (SPEC §4.6, §4.15): identical answers (`sameAnswer`) merge
// into one card with every author; cards play in a seeded order, never submission order. The idea
// chips are dealt here too. Pure.
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { sameAnswer } from '@partybox/game-sdk/match';
import type { Card } from './types';

/** Cards for `answers` (authors in seat order), shuffled with the state's PRNG. */
export function buildCards(
  answers: Record<string, string>,
  seats: readonly string[],
  n: number,
  rng: RngState,
): [Card[], RngState] {
  const groups: { text: string; authors: string[] }[] = [];
  for (const id of seats) {
    const text = answers[id];
    if (text === undefined) continue;
    const match = groups.find((g) => sameAnswer(g.text, text, 'en'));
    if (match) match.authors.push(id);
    else groups.push({ text, authors: [id] });
  }
  const [order, next] = shuffle(rng, groups);
  return [order.map((g, i) => ({ id: `c${n}-${i}`, text: g.text, authors: g.authors })), next];
}

/**
 * The idea chips (§4.4): the bank shuffled once per prompt; seat i is offered bank[i] and the
 * answer halfway round the bank, so up to bank-size seats each lead with a different answer —
 * which keeps bot answers distinct (bots answer with their first chip, §4.10).
 */
export function dealIdeas(
  bank: readonly string[],
  seats: readonly string[],
  rng: RngState,
): [Record<string, string[]>, RngState] {
  const [deck, next] = shuffle(rng, [...bank]);
  const out: Record<string, string[]> = {};
  const half = Math.ceil(deck.length / 2);
  seats.forEach((id, i) => {
    const first = deck[i % deck.length];
    const second = deck[(i + half) % deck.length];
    out[id] = [first, second].filter((x): x is string => typeof x === 'string');
  });
  return [out, next];
}

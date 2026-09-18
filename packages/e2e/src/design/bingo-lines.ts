// Bingo helpers for the design harness: skip calls until one of a player's cards holds a complete
// line, then daub that line the way a thumb would. One copy, used by every Bingo capture script
// and the audio tracer.
import type { Page } from 'playwright';
import type { DevApi } from './session';
import { settle } from './session';

/** Every winning line of a 5 × 5 card, by cell index (12 = FREE). */
export const LINES: number[][] = [
  ...Array.from({ length: 5 }, (_, r) => [0, 1, 2, 3, 4].map((c) => r * 5 + c)),
  ...Array.from({ length: 5 }, (_, c) => [0, 1, 2, 3, 4].map((r) => r * 5 + c)),
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

interface BingoState {
  round: { deck: number[]; drawn: number; cards: Record<string, number[][]> };
  phase: { id: string };
}

/** Skip calls (dev API) until `playerId`'s card `cardIndex` holds a called line; returns it. */
export async function skipToLine(
  api: DevApi,
  playerId: string,
  cardIndex = 0,
  maxCalls = 70,
): Promise<{ line: number[]; card: number[] }> {
  for (let i = 0; i < maxCalls; i += 1) {
    const s = (await api.state()).room?.game?.state as unknown as BingoState;
    if (s.phase.id !== 'play') break;
    const card = s.round.cards[playerId]?.[cardIndex] ?? [];
    const called = new Set(s.round.deck.slice(0, s.round.drawn));
    const line = LINES.find((l) => l.every((k) => k === 12 || called.has(card[k] ?? -1)));
    if (line) return { line, card };
    await api.skip();
    await settle(80);
  }
  throw new Error(`no line called within ${maxCalls} numbers`);
}

/** Tap each cell of `line` on the card shown big (FREE is already daubed). */
export async function daubLine(page: Page, line: number[], card: number[]): Promise<void> {
  for (const i of line) {
    if (i === 12) continue;
    const letter = 'BINGO'[i % 5];
    await page
      .getByRole('gridcell', { name: new RegExp(`^${letter} ${card[i]}$`) })
      .first()
      .click();
  }
}

// The prompt's killer is dealt (2026-09-22): a card tagged for the round's prompt — "Fall." for
// "What's Vladimir Putin's favorite season?" — goes into one answerer's hand, once.
import { describe, expect, it } from 'vitest';
import { DECKS, whiteTags } from '../server/content';
import { dealKiller } from '../server/killers';
import { settleBlack } from '../server/round';
import { tagHit } from '../server/topics';
import { HAND_SIZE } from '../server/types';
import type { State } from '../server/types';
import { start } from './helpers';

const wild = DECKS.wild;
const putin = wild.black.find((b) => b.text === "What's Vladimir Putin's favorite season?")!;
const fall = wild.white.find((w) => w.text === 'Fall.')!;
const isKiller = (id: string): boolean => tagHit(putin.text, whiteTags(id));

/** A wild game whose round is about to settle on Putin's prompt, "Fall." still in the deck. */
function onPutin(): State {
  const s = start({ decks: 'wild-only', players: 5, seed: 7 });
  const hands = Object.fromEntries(
    Object.entries(s.hands).map(([p, h]) => [p, h.filter((c) => !isKiller(c))]),
  );
  const held = new Set(Object.values(s.hands).flat());
  const deck = [...s.whiteDeck.filter((c) => !isKiller(c)), fall.id].filter(
    (c) => !held.has(c) || !isKiller(c),
  );
  return { ...s, blackId: putin.id, blackChoices: [putin.id], hands, whiteDeck: deck };
}
const answerersOf = (s: State): string[] => Object.keys(s.hands);

describe('the prompt killer', () => {
  it('the pun pair is in the deck, tagged for its prompt', () => {
    expect(putin).toBeDefined();
    expect(fall).toBeDefined();
    expect(isKiller(fall.id)).toBe(true);
  });

  it('goes into exactly one hand, traded — hand sizes stay put', () => {
    const before = onPutin();
    const after = dealKiller(before, answerersOf(before));
    const holders = Object.entries(after.hands).filter(([, h]) => h.includes(fall.id));
    expect(holders).toHaveLength(1);
    for (const [p, h] of Object.entries(after.hands))
      expect(h.length).toBe(before.hands[p]!.length);
    expect(after.whiteDeck).not.toContain(fall.id);
  });

  it('is not dealt twice', () => {
    const s = onPutin();
    const once = dealKiller(s, answerersOf(s));
    const twice = dealKiller(once, answerersOf(once));
    expect(
      Object.values(twice.hands)
        .flat()
        .filter((c) => c === fall.id),
    ).toHaveLength(1);
    expect(twice.hands).toEqual(once.hands);
  });

  it('leaves a prompt with no tagged card alone', () => {
    const s = onPutin();
    const untagged = wild.black.find((b) => !wild.white.some((w) => tagHit(b.text, w.tags)))!;
    const plain = { ...s, blackId: untagged.id };
    expect(dealKiller(plain, answerersOf(plain))).toEqual(plain);
  });

  it('survives the round settling: the fit floor never trades it away', () => {
    const s = settleBlack(onPutin());
    const hands = Object.values(s.hands);
    expect(hands.filter((h) => h.includes(fall.id))).toHaveLength(1);
    for (const h of hands) expect(h.length).toBeGreaterThanOrEqual(HAND_SIZE);
  });
});

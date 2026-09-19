// Dealing (README "Players" and the round start): distinct cards, the kind, quality and variety
// floors, the black deck's order, and the hand leading with the prompt's best fits.
import { describe, expect, it } from 'vitest';
import { BEST_FLOOR, GOOD_FLOOR, KIND_FLOORS, refillHands } from '../server/deal';
import { topicsOf } from '../server/topics';
import { fitScore, servesOf } from '../server/fit';
import {
  DECKS,
  WHITE_KINDS,
  blackCard,
  blackPool,
  blackTier,
  whitePool,
  whiteServes,
  whiteText,
  whiteTier,
} from '../server/content';
import { game } from '../server/index';
import { HAND_SIZE } from '../server/types';
import { T0, playRound, start, timer, toAnswer } from './helpers';

describe('dealing', () => {
  it('deals ten distinct cards to everyone from the chosen decks, no card in two hands', () => {
    const s = start({ players: 6, decks: 'adults' });
    const pool = new Set(whitePool('adults'));
    const seen = new Set<string>();
    for (const id of Object.keys(s.players)) {
      const hand = s.hands[id] ?? [];
      expect(hand).toHaveLength(HAND_SIZE);
      for (const card of hand) {
        expect(pool.has(card)).toBe(true);
        expect(seen.has(card)).toBe(false);
        seen.add(card);
      }
    }
    // Cards the deal swapped out for the floors sit in the discard, still out of every hand.
    expect(s.whiteDeck.length + s.discard.length).toBe(pool.size - 60);
    expect(blackPool('adults')).toHaveLength(DECKS.mild.black.length + DECKS.crude.black.length);
  });

  it('the top of every hand carries one of each kind (the first screenful on a phone)', () => {
    // A phone shows about four cards without scrolling: every kind has to be up there, not just
    // somewhere in the ten (review-loop #195).
    for (const decks of ['mild', 'adults', 'wild'] as const) {
      let s = start({ players: 6, decks, seed: 3, rounds: 6 });
      for (let round = 1; round <= 6; round++) {
        for (const id of Object.keys(s.players)) {
          // `name` is only ever a card's second reading, so three kinds lead the hand — an
          // event card covers thing and doing at once, so the top three serve all three kinds.
          const top = new Set((s.hands[id] ?? []).slice(0, 3).flatMap((c) => [...whiteServes(c)]));
          for (const kind of ['thing', 'doing', 'person'] as const)
            expect(top.has(kind), `${decks} r${round} ${id} ${[...top].join()}`).toBe(true);
        }
        s = timer(playRound(s));
        if (s.phase.id === 'final' || s.phase.id === 'done') break;
      }
    }
  });

  it('the black deck leads with the great prompts and keeps the filler for the back', () => {
    const s = start({ players: 4, decks: 'wild-only', seed: 5 });
    const tiers = s.blackDeck.map(blackTier);
    const firstTwo = tiers.indexOf(2);
    const firstOne = tiers.indexOf(1);
    expect(tiers.slice(0, firstTwo).every((t) => t === 3)).toBe(true);
    expect(tiers.slice(firstTwo, firstOne).every((t) => t === 2)).toBe(true);
    expect(tiers.slice(firstOne).every((t) => t === 1)).toBe(true);
    expect(blackTier(s.blackId as string)).toBe(3);
  });

  it('once the prompt is known, every hand leads with the cards that fit it best', () => {
    // "What did the sex robot refuse to do?" wants a doing: the gerund cards come first, the best
    // tier among them first, and every card after the lead reads no better than it.
    const intro = { ...start({ players: 6, decks: 'wild-only', seed: 9 }), blackId: 'wb267' };
    const s = timer(intro);
    expect(s.phase.id).toBe('answer');
    for (const id of Object.keys(s.players)) {
      if (s.czarId === id) continue;
      const hand = s.hands[id] ?? [];
      const fits = hand.map((c) => fitScore('doing', whiteServes(c)));
      expect(fits[0]).toBe(Math.max(...fits));
      for (let i = 1; i < fits.length; i += 1)
        expect(fits[i - 1]).toBeGreaterThanOrEqual(fits[i] as number);
      expect(whiteServes(hand[0] as string)).toContain('doing');
    }
  });

  it('a hand with four cards on one subject trades the weakest of them for something else', () => {
    // Four death cards (a coffin, a hearse, a funeral selfie, dying in a Golden Corral) in a
    // nine-card hand: the refill tops up to ten and swaps one death card out, never for a
    // weaker card, with every floor kept.
    const s0 = start({ players: 4, decks: 'wild-only', seed: 21 });
    const clumped = ['ww305', 'ww369', 'ww347', 'ww315', 'ww12', 'ww2', 'ww383', 'ww484', 'ww77'];
    const deck = s0.whiteDeck.filter((id) => !clumped.includes(id));
    const s1 = refillHands({ ...s0, whiteDeck: deck, hands: { ...s0.hands, ana: clumped } });
    const hand = s1.hands['ana'] ?? [];
    expect(hand).toHaveLength(10);
    const deaths = hand.filter((id) => topicsOf(whiteText(id)).includes('death'));
    expect(deaths.length).toBeLessThanOrEqual(3);
    expect(hand.filter((c) => whiteTier(c) >= 3).length).toBeGreaterThanOrEqual(GOOD_FLOOR);
    expect(hand.filter((c) => whiteTier(c) === 4).length).toBeGreaterThanOrEqual(BEST_FLOOR);
  });

  it('a wild hand holds at least five great and two amazing cards, round after round (the quality floors)', () => {
    let s = start({ players: 8, decks: 'wild-only', seed: 11, rounds: 8 });
    for (let round = 1; round <= 8; round++) {
      for (const id of Object.keys(s.players)) {
        const good = (s.hands[id] ?? []).filter((c) => whiteTier(c) >= 3).length;
        expect(good, `r${round} ${id}`).toBeGreaterThanOrEqual(GOOD_FLOOR);
        const best = (s.hands[id] ?? []).filter((c) => whiteTier(c) === 4).length;
        expect(best, `r${round} ${id} amazing`).toBeGreaterThanOrEqual(BEST_FLOOR);
      }
      s = timer(playRound(s));
      if (s.phase.id === 'final' || s.phase.id === 'done') break;
    }
  });

  it('a hand always holds at least two things, two doings, two people and two names while the deck has them', () => {
    // A hand loses a card a round, so the refill also swaps a surplus kind out when a hand has
    // fallen short of one (review-loop #175) — checked here over eight rounds of every preset.
    const counts = (hand: string[]): Record<string, number> => {
      const c: Record<string, number> = { thing: 0, doing: 0, person: 0, name: 0 };
      for (const id of hand) for (const k of whiteServes(id)) c[k] = (c[k] ?? 0) + 1;
      return c;
    };
    for (const decks of ['mild', 'adults', 'wild', 'wild-only'] as const) {
      let s = start({ players: 6, decks, seed: 7, rounds: 8 });
      for (let round = 1; round <= 8; round++) {
        for (const id of Object.keys(s.players)) {
          const c = counts(s.hands[id] ?? []);
          for (const kind of WHITE_KINDS)
            expect(c[kind], `${decks} r${round} ${kind}`).toBeGreaterThanOrEqual(KIND_FLOORS[kind]);
        }
        s = timer(playRound(s));
        // Past the last round the hands are spent and never refilled again — nothing to assert.
        if (s.phase.id === 'final' || s.phase.id === 'done') break;
      }
    }
    expect(servesOf({ text: 'Yodeling.' })).toEqual(['doing', 'name']);
    expect(servesOf({ text: 'Quietly winning Monopoly at the wake.' })).toEqual(['doing']);
    expect(servesOf({ text: 'A nun with a strap-on.' })).toEqual(['person']);
    expect(servesOf({ text: 'Beans.' })).toEqual(['thing', 'name']);
    expect(servesOf({ text: 'The wedding my mother planned.' })).toEqual(['thing', 'doing']); // an event
    expect(servesOf({ text: 'The mattress my mother bought.' })).toEqual(['thing']);
  });

  it('refills hands to ten after a round and never re-deals a played card before the discard turns', () => {
    let s = playRound(start({ players: 4 }));
    const played = new Set(Object.values(s.submissions).flat());
    s = timer(s); // → intro of round 2
    for (const id of Object.keys(s.players)) {
      expect(s.hands[id]).toHaveLength(HAND_SIZE);
      for (const card of s.hands[id] ?? []) expect(played.has(card)).toBe(false);
    }
    // Every played card is in the discard, with whatever the refill swapped out for the floors.
    for (const card of played) expect(s.discard).toContain(card);
    expect(s.discard.length).toBeGreaterThanOrEqual(played.size);
  });

  it('the mild deck alone still deals a full 12-player game (discard reshuffles in)', () => {
    let s = game.init({
      players: Array.from({ length: 12 }, (_, i) => ({
        id: `p${String(i).padStart(2, '0')}`,
        name: `P${i}`,
        avatarId: 'fox',
        connected: true,
      })),
      settings: { decks: 'mild', rounds: 15 },
      seed: 7,
      now: T0,
    });
    for (let round = 1; round <= 15; round++) {
      expect(s.round).toBe(round);
      // Ten on the round card; plus the black card's draw once picking opens (Pick 3 cards say
      // "draw 2" — the card is only final then, in czar mode).
      for (const id of Object.keys(s.players)) expect(s.hands[id]?.length).toBe(HAND_SIZE);
      s = toAnswer(s);
      for (const id of Object.keys(s.players))
        expect(s.hands[id]?.length).toBe(HAND_SIZE + blackCard(s.blackId).draw);
      s = playRound(s);
      s = timer(s);
    }
    expect(s.phase.id).toBe('final');
  });
});

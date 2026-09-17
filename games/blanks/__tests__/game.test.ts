// Unit tests for Blanks: a whole game on timers alone, dealing, the fill rule and content
// (README "Phases" + "Content"). Phase and scoring edge cases live in phases.test.ts.
import { describe, expect, it } from 'vitest';
import { fill, fillText, revealMs } from '../server/cards';
import { DECKS, blackCard, blackPool, whitePool } from '../server/content';
import { game } from '../server/index';
import {
  BIG_REVEAL_MAX_MS,
  BIG_REVEAL_MIN_MS,
  HAND_SIZE,
  REVEAL_MAX_MS,
  REVEAL_MIN_MS,
} from '../server/types';
import { PLAYERS, T0, playRound, start, timer } from './helpers';

describe('whole game', () => {
  it('finishes on timers alone (idle room): nobody plays, every round is winnerless', () => {
    let s = start({ rounds: 3 });
    const phases: string[] = [];
    let guard = 0;
    while (game.results(s) === null) {
      if (guard++ > 100) throw new Error(`stuck in ${s.phase.id}`);
      expect(s.phase.deadline).not.toBeNull();
      phases.push(s.phase.id);
      s = timer(s);
    }
    const round = ['intro', 'answer', 'result'];
    expect(phases).toEqual([...round, ...round, ...round]);
    expect(game.results(s)?.scores).toEqual({ ana: 0, ben: 0, cleo: 0, dev: 0 });
  });

  it('a played game reads every card, votes, scores one point per round', () => {
    let s = start({ rounds: 3, players: 4 });
    s = playRound(s);
    expect(s.phase.id).toBe('result');
    expect(s.slots).toHaveLength(4);
    expect(s.winners.length).toBeGreaterThan(0);
    const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
    expect(total).toBe(s.winners.length);
    s = timer(s); // result → intro (round 2)
    expect(s.phase.id).toBe('intro');
    expect(s.round).toBe(2);
    s = timer(playRound(s));
    expect(s.round).toBe(3);
    s = timer(playRound(s));
    expect(s.phase.id).toBe('done');
    expect(game.results(s)).not.toBeNull();
  });

  it('manifest matches manifest.json and declares the six phases in order', () => {
    expect(game.manifest.id).toBe('blanks');
    expect(game.phases).toEqual(['intro', 'answer', 'reveal', 'judge', 'result', 'done']);
    expect(game.manifest.settings.map((s) => s.key)).toEqual([
      'decks',
      'judge',
      'timed',
      'rounds',
      'answerSeconds',
      'rando',
    ]);
  });

  it('clamps out-of-range settings to the manifest spec', () => {
    const s = game.init({
      players: PLAYERS.slice(0, 3),
      settings: { rounds: 99, answerSeconds: 1, judge: 'nope', decks: 'x', rando: 'yes' },
      seed: 1,
      now: T0,
    });
    expect(s.settings).toEqual({
      rounds: 15,
      answerSeconds: 30,
      judge: 'vote',
      decks: 'wild',
      rando: false,
      timed: false,
    });
  });
});

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
    expect(s.whiteDeck.length).toBe(pool.size - 60);
    expect(blackPool('adults')).toHaveLength(DECKS.mild.black.length + DECKS.crude.black.length);
  });

  it('refills hands to ten after a round and never re-deals a played card before the discard turns', () => {
    let s = playRound(start({ players: 4 }));
    const played = new Set(Object.values(s.submissions).flat());
    s = timer(s); // → intro of round 2
    for (const id of Object.keys(s.players)) {
      expect(s.hands[id]).toHaveLength(HAND_SIZE);
      for (const card of s.hands[id] ?? []) expect(played.has(card)).toBe(false);
    }
    expect(s.discard.length).toBe(played.size);
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
      // Ten, plus the black card's draw (Pick 3 cards say "draw 2").
      for (const id of Object.keys(s.players))
        expect(s.hands[id]?.length).toBe(HAND_SIZE + blackCard(s.blackId).draw);
      s = playRound(s);
      s = timer(s);
    }
    expect(s.phase.id).toBe('done');
  });
});

describe('fill', () => {
  it('drops whites into blanks, dropping a trailing period inside the sentence', () => {
    expect(fillText('I got 99 problems but ____ ain’t one.', ['Puppies.'])).toBe(
      'I got 99 problems but Puppies ain’t one.',
    );
    expect(fillText('Coming soon: ____.', ['A windmill.'])).toBe('Coming soon: A windmill.');
    expect(fillText('Nothing beats ____', ['Bees?'])).toBe('Nothing beats Bees?');
  });

  it('two blanks take two whites in order; missing whites stay blank', () => {
    const { segments, extra } = fill('____ is just ____ for adults.', ['Naps.', 'Wine.']);
    expect(segments.map((s) => `${s.kind}:${s.text}`)).toEqual([
      'fill:Naps',
      'text: is just ',
      'fill:Wine',
      'text: for adults.',
    ]);
    expect(extra).toEqual([]);
    expect(fillText('____ is just ____ for adults.', ['Naps.'])).toBe(
      'Naps is just ____ for adults.',
    );
  });

  it('two adjacent blanks each carry their comma and leave a bare space between them', () => {
    const { segments } = fill('Regrets: ____, ____, and ____.', ['A.', 'B.', 'C.']);
    expect(segments.map((s) => `${s.kind}:${s.text}`)).toEqual([
      'text:Regrets: ',
      'fill:A,',
      'text: ',
      'fill:B,',
      'text: and ',
      'fill:C.',
    ]);
  });

  it('carries a closing quote inside the paper but never a possessive', () => {
    expect(fill('"Goodnight, ____."', ['A cow.']).segments.map((s) => s.text)).toEqual([
      '"Goodnight, ',
      'A cow."',
    ]);
    expect(fill("____'s big day.", ['Bob.']).segments.map((s) => s.text)).toEqual([
      'Bob',
      "'s big day.",
    ]);
  });

  it('a question card lists the whites underneath (extra)', () => {
    const { segments, extra } = fill("What's that smell?", ['Grandma.', 'The Force.']);
    expect(segments).toEqual([{ kind: 'text', text: "What's that smell?" }]);
    expect(extra).toEqual(['Grandma.', 'The Force.']);
    expect(fillText("What's that smell?", ['Grandma.'])).toBe("What's that smell? Grandma.");
  });

  it('reveal time grows with length and is clamped', () => {
    expect(revealMs('Hi ____.', ['Yo.'])).toBe(REVEAL_MIN_MS + 'Hi Yo.'.length * 35);
    expect(revealMs('x'.repeat(200), ['y'.repeat(100)])).toBe(REVEAL_MAX_MS);
    // A big room reads faster: twelve cards stay under a minute.
    expect(revealMs('Hi ____.', ['Yo.'], 12)).toBe(BIG_REVEAL_MIN_MS + 'Hi Yo.'.length * 25);
    expect(revealMs('x'.repeat(200), ['y'.repeat(100)], 12)).toBe(BIG_REVEAL_MAX_MS);
    expect(revealMs('x'.repeat(200), ['y'.repeat(100)], 8)).toBe(REVEAL_MAX_MS);
  });
});

describe('content', () => {
  it('every deck has the promised counts and pick ≥ blanks on every black card', () => {
    expect(DECKS.mild.black.length).toBeGreaterThanOrEqual(40);
    expect(DECKS.mild.white.length).toBeGreaterThanOrEqual(160);
    expect(DECKS.crude.black.length).toBeGreaterThanOrEqual(40);
    expect(DECKS.wild.black.length).toBeGreaterThanOrEqual(100);
    expect(DECKS.wild.white.length).toBeGreaterThanOrEqual(500);
    for (const deck of Object.values(DECKS))
      for (const card of deck.black)
        expect(card.pick, card.text).toBeGreaterThanOrEqual(card.text.split('____').length - 1);
  });

  it('white ids are unique across all three decks', () => {
    const all = whitePool('wild');
    expect(new Set(all).size).toBe(all.length);
  });
});

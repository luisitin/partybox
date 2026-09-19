// Unit tests for Blanks: a whole game on timers alone, dealing, the fill rule and content
// (README "Phases" + "Content"). Phase and scoring edge cases live in phases.test.ts.
import { describe, expect, it } from 'vitest';
import { GOOD_FLOOR, KIND_FLOOR, fill, fillText, glue, revealMs } from '../server/cards';
import { fitScore, servesOf } from '../server/fit';
import {
  DECKS,
  WHITE_KINDS,
  blackCard,
  blackPool,
  blackTier,
  whiteKind,
  whitePool,
  whiteServes,
  whiteTier,
} from '../server/content';
import { game } from '../server/index';
import {
  BIG_REVEAL_MAX_MS,
  BIG_REVEAL_MIN_MS,
  BIG_REVEAL_PER_CHAR_MS,
  FINAL_MS,
  HAND_SIZE,
  REVEAL_MAX_MS,
  REVEAL_MIN_MS,
  REVEAL_PER_CHAR_MS,
} from '../server/types';
import { PLAYERS, T0, playRound, start, timer, toAnswer, tv } from './helpers';

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
    expect(phases).toEqual([...round, ...round, ...round, 'final']);
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
    // The last result goes to the final board (4 s drumroll, results still null), then done.
    expect(s.phase.id).toBe('final');
    expect(s.phase.deadline).toBe(s.phase.startedAt + FINAL_MS);
    expect(game.results(s)).toBeNull();
    expect(tv(s).standings).toHaveLength(4);
    expect(tv(s).timerMode).toBe('quiet');
    s = timer(s);
    expect(s.phase.id).toBe('done');
    expect(game.results(s)).not.toBeNull();
  });

  it('manifest matches manifest.json and declares the eight phases in order', () => {
    expect(game.manifest.id).toBe('blanks');
    expect(game.phases).toEqual([
      'intro',
      'pick',
      'answer',
      'reveal',
      'judge',
      'result',
      'final',
      'done',
    ]);
    expect(game.manifest.settings.map((s) => s.key)).toEqual([
      'decks',
      'judge',
      'rounds',
      'timed',
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

  it('the top of every hand carries one of each kind (the first screenful on a phone)', () => {
    // A phone shows about four cards without scrolling: every kind has to be up there, not just
    // somewhere in the ten (review-loop #195).
    for (const decks of ['mild', 'adults', 'wild'] as const) {
      let s = start({ players: 6, decks, seed: 3, rounds: 6 });
      for (let round = 1; round <= 6; round++) {
        for (const id of Object.keys(s.players)) {
          // `name` is only ever a card's second reading, so three kinds lead the hand.
          const top = (s.hands[id] ?? []).slice(0, 3).map(whiteKind);
          expect(new Set(top).size, `${decks} r${round} ${id} ${top.join()}`).toBe(3);
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

  it('a wild hand holds at least five tier-3 cards, round after round (the quality floor)', () => {
    let s = start({ players: 8, decks: 'wild-only', seed: 11, rounds: 8 });
    for (let round = 1; round <= 8; round++) {
      for (const id of Object.keys(s.players)) {
        const good = (s.hands[id] ?? []).filter((c) => whiteTier(c) === 3).length;
        expect(good, `r${round} ${id}`).toBeGreaterThanOrEqual(GOOD_FLOOR);
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
            expect(c[kind], `${decks} r${round} ${kind}`).toBeGreaterThanOrEqual(KIND_FLOOR);
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

describe('fill', () => {
  it('drops whites into blanks, dropping a trailing period inside the sentence', () => {
    expect(fillText('I got 99 problems but ____ ain’t one.', ['Puppies.'])).toBe(
      'I got 99 problems but Puppies ain’t one.',
    );
    expect(fillText('Coming soon: ____.', ['A windmill.'])).toBe('Coming soon: A windmill.');
    expect(fillText('Nothing beats ____', ['Bees?'])).toBe('Nothing beats Bees?');
  });

  it('takes an opening quote or bracket onto the card with the answer', () => {
    // A quoted answer should read as one piece of paper, not an orphan quote against the black
    // text (review-loop #330).
    const quoted = fill('The lawn sign says "____."', ['A raccoon in a tiny sweater.']);
    expect(quoted.segments.map((x) => `${x.kind}:${x.text}`)).toEqual([
      'text:The lawn sign says ',
      'fill:"A raccoon in a tiny sweater."',
    ]);
    // Brackets behave the same, and a card that opens on the blank keeps its quote too.
    expect(fillText('She said (____) and left.', ['A hot mic at a funeral.'])).toBe(
      'She said (A hot mic at a funeral) and left.',
    );
    const opening = fill('"____" is my ringtone.', ['Yodeling.']);
    expect(opening.segments[0]).toEqual({ kind: 'fill', text: '"Yodeling"' });
    // An apostrophe in the middle of a word is not an opening quote.
    expect(fillText('I got 99 problems but ____ ain’t one.', ['Puppies.'])).toBe(
      'I got 99 problems but Puppies ain’t one.',
    );
  });

  it('never doubles a full stop after a card that ends inside its own quotes', () => {
    // '…meaning "soup.".' on a results screen (review-loop #391).
    expect(fillText('The reality show’s twist: ____.', ['A tattoo meaning "soup."'])).toBe(
      'The reality show’s twist: A tattoo meaning "soup."',
    );
    expect(fillText('____ is my motto.', ['Calling the teacher "mom."'])).toBe(
      'Calling the teacher "mom" is my motto.',
    );
    expect(fillText('Nothing beats ____', ['A boat named "Boaty."'])).toBe(
      'Nothing beats A boat named "Boaty."',
    );
    expect(fillText('I said ____, and left.', ['A weather app that just says "maybe."'])).toBe(
      'I said A weather app that just says "maybe", and left.',
    );
  });

  it('keeps an abbreviation’s own period inside the sentence', () => {
    // "2 a.m." lost its period mid-sentence and read "2 a.m," (review-loop #201); at the end of the
    // sentence the black card's own full stop still wins, so it never doubles up.
    expect(fillText('My routine: ____, ____.', ['Dancing at 2 a.m.', 'Coffee.'])).toBe(
      'My routine: Dancing at 2 a.m., Coffee.',
    );
    expect(fillText('I heard ____ and left.', ['The stairs at 2 a.m.'])).toBe(
      'I heard The stairs at 2 a.m. and left.',
    );
    expect(fillText('What woke me? ____.', ['Bagpipes at 6 a.m.'])).toBe(
      'What woke me? Bagpipes at 6 a.m.',
    );
    // A word that merely ends in "st." is not an abbreviation.
    expect(fillText('I trust ____ with this.', ['A dentist.'])).toBe(
      'I trust A dentist with this.',
    );
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

  it('glues a short first word to its neighbour for rendering; labels keep plain spaces', () => {
    expect(glue('A soggy sandwich.')).toBe('A soggy sandwich.');
    expect(glue('The pull-out method.')).toBe('The pull-out method.');
    expect(glue('Naps.')).toBe('Naps.');
    expect(glue('Being too drunk.')).toBe('Being too drunk.');
    expect(fillText('I love ____.', ['A nap'])).toBe('I love A nap.');
  });

  it('a question card lists the whites underneath (extra)', () => {
    const { segments, extra } = fill("What's that smell?", ['Grandma.', 'The Force.']);
    expect(segments).toEqual([{ kind: 'text', text: "What's that smell?" }]);
    expect(extra).toEqual(['Grandma.', 'The Force.']);
    expect(fillText("What's that smell?", ['Grandma.'])).toBe("What's that smell? Grandma.");
  });

  it('reveal time grows with length and is clamped', () => {
    expect(revealMs('Hi ____.', ['Yo.'])).toBe(
      REVEAL_MIN_MS + 'Hi Yo.'.length * REVEAL_PER_CHAR_MS,
    );
    expect(revealMs('x'.repeat(200), ['y'.repeat(100)])).toBe(REVEAL_MAX_MS);
    // A big room reads faster: twelve cards stay under a minute.
    expect(revealMs('Hi ____.', ['Yo.'], 12)).toBe(
      BIG_REVEAL_MIN_MS + 'Hi Yo.'.length * BIG_REVEAL_PER_CHAR_MS,
    );
    expect(revealMs('x'.repeat(200), ['y'.repeat(100)], 12)).toBe(BIG_REVEAL_MAX_MS);
    expect(revealMs('x'.repeat(200), ['y'.repeat(100)], 8)).toBe(REVEAL_MAX_MS);
  });
});

describe('content', () => {
  it('every deck has the promised counts and pick ≥ blanks on every black card', () => {
    expect(DECKS.mild.black.length).toBeGreaterThanOrEqual(320);
    expect(DECKS.mild.white.length).toBeGreaterThanOrEqual(1115);
    expect(DECKS.crude.black.length).toBeGreaterThanOrEqual(220);
    expect(DECKS.crude.white.length).toBeGreaterThanOrEqual(830);
    expect(DECKS.wild.black.length).toBeGreaterThanOrEqual(275);
    expect(DECKS.wild.white.length).toBeGreaterThanOrEqual(1220);
    for (const deck of Object.values(DECKS))
      for (const card of deck.black)
        expect(card.pick, card.text).toBeGreaterThanOrEqual(card.text.split('____').length - 1);
  });

  it('no text appears twice across the three decks (the same string in two hands would leak)', () => {
    const seen = new Map<string, string>();
    for (const deck of Object.values(DECKS))
      for (const card of [...deck.black, ...deck.white]) {
        const key = card.text.trim().toLowerCase().replace(/\s+/g, ' ');
        expect(seen.get(key), `${card.id} duplicates ${seen.get(key)}`).toBeUndefined();
        seen.set(key, card.id);
      }
  });

  it('white ids are unique across all three decks', () => {
    const all = whitePool('wild');
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('card of the night', () => {
  // The best-liked card of the game is kept for the final board: the most votes any one card took.
  it('keeps the round with the most votes and shows it on the final board', () => {
    let s = start({ rounds: 2 });
    s = playRound(s, () => 0); // everyone piles onto the first slot
    const best = s.stats.best;
    expect(best?.round).toBe(1);
    expect(best?.votes).toBe(3);
    expect(best?.cards.length).toBeGreaterThan(0);

    s = timer(s); // result → intro of round 2
    s = playRound(s, (id) => Object.keys(s.players).sort().indexOf(id) % 2); // votes split
    expect(s.stats.best?.round).toBe(1); // round 2 never beat it
    expect(s.stats.best?.votes).toBe(3);

    while (s.phase.id !== 'final') {
      s = timer(s); // result → intro of the next round, or the final board
      if (s.phase.id === 'intro') s = playRound(s, () => 1);
    }
    const view = tv(s);
    expect(view.bestCard?.votes).toBe(3);
    expect(view.bestCard?.black).toMatch(/____|\?$/); // a blank, or a question card
    expect(view.bestCard?.name).toBeTruthy();
  });

  it('has no card of the night when nobody was voted for', () => {
    const s = start({ rounds: 1 });
    expect(s.stats.best).toBeNull();
    expect(tv(s).bestCard).toBeNull();
  });
});

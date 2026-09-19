// The bot's taste (owner, 2026-09-18): it answers a "…do?" with a doing, a "Who…?" with a person,
// and votes for the submission that reads best — not at random.
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { bestCards, botInput } from '../server/bot';
import { start, toAnswer } from './helpers';

const DOING = 'wb267'; // "What did the sex robot refuse to do?"
const THING = 'wb8'; // "What's in my nightstand drawer?"
const GERUND = 'ww484'; // "Farting during a prostate exam."
const NOUN = 'ww3'; // "A dick so big it has its own zip code." (tier 3, as the others)
const PERSON = 'ww383'; // "A nun with a strap-on."

describe('bestCards', () => {
  it('a doing prompt takes the gerund; a thing prompt takes a thing', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const rng = createRng(seed);
      expect(bestCards(['doing'], [NOUN, GERUND, PERSON], rng)).toEqual([GERUND]);
      expect(bestCards(['thing'], [GERUND, NOUN, PERSON], rng)[0]).not.toBe(GERUND);
      expect(bestCards(['person'], [NOUN, GERUND, PERSON], rng)).toEqual([PERSON]);
      // A Pick 2 wanting a person then a doing takes them in blank order.
      expect(bestCards(['person', 'doing'], [NOUN, GERUND, PERSON], rng)).toEqual([PERSON, GERUND]);
    }
  });
});

describe('botInput', () => {
  it('plays the fitting card in answer and votes for the fitting submission in judge', () => {
    let s = toAnswer(start({ players: 4, decks: 'wild-only', seed: 3 }));
    s = { ...s, blackId: DOING, hands: { ...s.hands, ben: [NOUN, GERUND, PERSON] } };
    const played = botInput(s, 'ben', createRng(5));
    expect(played).toEqual({ type: 'play', cards: [GERUND] });
    // A judge phase by hand: ana (a noun) and ben (the gerund) submitted; cleo votes.
    const judge = {
      ...s,
      phase: { ...s.phase, id: 'judge' as const },
      submissions: { ana: [NOUN], ben: [GERUND] },
      slots: ['ana', 'ben'],
      votes: {},
    };
    for (let seed = 1; seed <= 10; seed += 1) {
      expect(botInput(judge, 'cleo', createRng(seed))).toEqual({ type: 'vote', slot: 1 });
    }
    // The thing prompt goes the other way.
    const judge2 = { ...judge, blackId: THING };
    let nounVotes = 0;
    for (let seed = 1; seed <= 10; seed += 1)
      if (botInput(judge2, 'cleo', createRng(seed))?.type === 'vote')
        nounVotes +=
          (botInput(judge2, 'cleo', createRng(seed)) as { slot: number }).slot === 0 ? 1 : 0;
    expect(nounVotes).toBeGreaterThanOrEqual(8);
  });
});

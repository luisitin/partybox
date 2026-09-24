// The end-of-game awards (README "Scoring"): Crowd favourite, Card of the night, Quick draw.
import { describe, expect, it } from 'vitest';
import { awardsFor } from '../server/scoring';
import { RANDO } from '../server/types';
import type { State } from '../server/types';
import { playRound, start } from './helpers';

describe('card of the night award', () => {
  it('names the author and quotes the card', () => {
    // Everyone piles onto the first slot, so that card is the night's best by a mile.
    const s = playRound(start({ rounds: 3 }), () => 0);
    const best = s.stats.best;
    expect(best).not.toBeNull();
    const award = awardsFor(s).find((a) => a.id === 'card-of-the-night');
    expect(award?.playerId).toBe(best?.submitterId);
    expect(award?.title).toBe('Card of the night');
    // `“<the filled sentence>” · n votes`, short enough for one line of the results screen.
    expect(award?.description).toMatch(/^“.+” · \d+ votes?$/);
    expect((award?.description ?? '').length).toBeLessThan(140);
  });

  it('cuts a long sentence on a word boundary', () => {
    const s = playRound(start({ rounds: 3, decks: 'wild', seed: 9 }), () => 0);
    const long: State = {
      ...s,
      stats: {
        ...s.stats,
        best: {
          submitterId: Object.keys(s.players)[0] ?? '',
          blackId: 'wb361',
          cards: ['ww287', 'ww108', 'ww1211'],
          votes: 4,
          round: 1,
        },
      },
    };
    const award = awardsFor(long).find((a) => a.id === 'card-of-the-night');
    expect(award?.description).toContain('…');
    expect((award?.description ?? '').length).toBeLessThan(140);
    expect(award?.description).not.toMatch(/ …/); // trimmed before the ellipsis
  });

  it('is absent before anyone is voted for, and for Rando', () => {
    const fresh = start({ rounds: 3 });
    expect(awardsFor(fresh).some((a) => a.id === 'card-of-the-night')).toBe(false);
    const rando: State = {
      ...fresh,
      stats: {
        ...fresh.stats,
        best: { submitterId: RANDO, blackId: fresh.blackId, cards: [], votes: 3, round: 1 },
      },
    };
    expect(awardsFor(rando).some((a) => a.id === 'card-of-the-night')).toBe(false);
  });
});

describe('count awards', () => {
  it('say "1 card" and "1 vote", not "1 cards" (seen on a three-round walkover night, #345)', () => {
    const fresh = start({ rounds: 3 });
    const [a, b] = Object.keys(fresh.players) as [string, string];
    const one: State = {
      ...fresh,
      stats: { ...fresh.stats, fastPlays: { [a]: 1 }, votesReceived: { [b]: 1 } },
    };
    const awards = awardsFor(one);
    expect(awards.find((x) => x.id === 'quick-draw')?.description).toBe('1 card in under 30 s');
    expect(awards.find((x) => x.id === 'crowd-favourite')?.description).toBe(
      '1 vote across the night',
    );
    const three: State = {
      ...fresh,
      stats: { ...fresh.stats, fastPlays: { [a]: 3 }, votesReceived: { [b]: 4 } },
    };
    expect(awardsFor(three).find((x) => x.id === 'quick-draw')?.description).toBe(
      '3 cards in under 30 s',
    );
    expect(awardsFor(three).find((x) => x.id === 'crowd-favourite')?.description).toBe(
      '4 votes across the night',
    );
  });
});

describe('awards with a judge (czar mode)', () => {
  it('names the round on the card of the night and hands out no crowd favourite', () => {
    const s = playRound(start({ rounds: 3, judge: 'czar' }), () => 0);
    const best = s.stats.best;
    expect(best?.votes).toBe(1);
    const awards = awardsFor(s);
    expect(awards.find((a) => a.id === 'card-of-the-night')?.description).toMatch(
      /^“.+” · round 1$/,
    );
    expect(awards.some((a) => a.id === 'crowd-favourite')).toBe(false);
    // The vote-mode line keeps its count.
    const v = playRound(start({ rounds: 3 }), () => 0);
    expect(awardsFor(v).find((a) => a.id === 'card-of-the-night')?.description).toMatch(
      /^“.+” · \d+ votes?$/,
    );
  });
});

describe('awards are for people (I-154)', () => {
  it('skips a bot for Quick draw and Crowd favourite, and drops the award with no person in it', () => {
    const fresh = start({ rounds: 3 });
    const [a, b] = Object.keys(fresh.players) as [string, string];
    const withBot: State = {
      ...fresh,
      players: { ...fresh.players, [a]: { ...fresh.players[a]!, bot: true } },
      stats: {
        ...fresh.stats,
        fastPlays: { [a]: 5, [b]: 1 },
        votesReceived: { [a]: 6, [b]: 2 },
      },
    };
    const awards = awardsFor(withBot);
    expect(awards.find((x) => x.id === 'quick-draw')?.playerId).toBe(b);
    expect(awards.find((x) => x.id === 'crowd-favourite')?.playerId).toBe(b);
    const botOnly: State = {
      ...withBot,
      stats: { ...withBot.stats, fastPlays: { [a]: 5 }, votesReceived: { [a]: 6 } },
    };
    expect(awardsFor(botOnly).some((x) => x.id === 'quick-draw')).toBe(false);
    expect(awardsFor(botOnly).some((x) => x.id === 'crowd-favourite')).toBe(false);
  });

  it('gives no speed award in an untimed room, and names the bar it measured in a timed one', () => {
    const timed = start({ rounds: 3, timed: true, answerSeconds: 90 });
    const [a] = Object.keys(timed.players) as [string];
    const fast = (s: State): State => ({ ...s, stats: { ...s.stats, fastPlays: { [a]: 2 } } });
    expect(awardsFor(fast(timed)).find((x) => x.id === 'quick-draw')?.description).toBe(
      '2 cards in under 45 s',
    );
    const untimed = start({ rounds: 3, timed: false });
    expect(awardsFor(fast(untimed)).some((x) => x.id === 'quick-draw')).toBe(false);
  });
});

describe('per-round votes (I-155 C)', () => {
  it('keeps one entry per player per round, summing to the votes received', () => {
    const one = playRound(start({ rounds: 3 }), () => 0);
    const ids = Object.keys(one.players);
    for (const id of ids) expect(one.stats.roundVotes[id]).toHaveLength(1);
    const total = ids.reduce((n, id) => n + (one.stats.roundVotes[id]?.[0] ?? 0), 0);
    const received = ids.reduce((n, id) => n + (one.stats.votesReceived[id] ?? 0), 0);
    expect(total).toBe(received);
    expect(total).toBeGreaterThan(0);
  });
});

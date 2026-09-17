// Pins the multi-card rules: cards per player, one BINGO! for the closest card, a failed claim
// wiping only that card; and bingos per round — the caller carrying on with the winning card locked.
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { game, readSettings } from '../server/index';
import { looksComplete } from '../server/patterns';
import { sampleInput } from '../server/bot';
import { callUntil, daubAll, input, start, timer } from './helpers';

describe('several cards per player', () => {
  it("deals the setting's number of cards, all legal and distinct, with empty daubs each", () => {
    const s = start({ cards: 3 });
    expect(s.settings.cards).toBe(3);
    expect(readSettings({ cards: 9 }).cards).toBe(4);
    expect(readSettings({}).cards).toBe(1);
    for (const id of ['a', 'b', 'c']) {
      expect(s.round.cards[id]).toHaveLength(3);
      expect(s.round.daubs[id]).toEqual([[], [], []]);
      const flat = s.round.cards[id]?.map((c) => c.join(',')) ?? [];
      expect(new Set(flat).size).toBe(3);
    }
    expect(game.tvView(s).cardsPerPlayer).toBe(3);
    expect(game.controllerView(s, 'a').cards).toHaveLength(3);
  });

  it('daubs land on the card named; BINGO! checks the closest card and wipes only that one', () => {
    let s = callUntil(start({ cards: 2 }), 'a', [10, 11, 13, 14], 1);
    s = daubAll(s, 'a', [10, 11, 13, 14], 1);
    s = daubAll(s, 'a', [0, 1], 0);
    expect(s.round.daubs['a']).toEqual([
      [0, 1],
      [10, 11, 13, 14],
    ]);
    s = input(s, 'a', { type: 'bingo' });
    expect(s.phase.id).toBe('bingo');
    expect(s.round.claim?.cardIndex).toBe(1);
    expect(game.tvView(s).claim?.card).toEqual(s.round.cards['a']?.[1]);
    expect(game.tvView(s).claim?.cardCount).toBe(2);
    // A wrong claim: the nearer card (one square short) goes up, and only it is wiped.
    let t = callUntil(start({ cards: 2 }, 5), 'b', [0, 1, 2, 3], 1);
    t = daubAll(t, 'b', [0, 1, 2, 3], 1);
    t = daubAll(t, 'b', [20], 0);
    t = input(t, 'b', { type: 'bingo' });
    expect(t.phase.id).toBe('check');
    expect(t.round.claim?.cardIndex).toBe(1);
    expect(t.round.claim?.missing).toEqual([4]);
    expect(t.round.daubs['b']).toEqual([[20], []]);
  });

  it('the bot works every card and claims when any looks complete', () => {
    const rng = createRng(11);
    let s = callUntil(start({ cards: 2 }), 'a', [0, 1, 2, 3, 4], 1);
    for (let i = 0; i < 200 && !looksComplete('line', s.round.daubs['a']?.[1] ?? []); i++) {
      const move = sampleInput(s, 'a', rng);
      if (!move || move.type !== 'daub') continue;
      const called = s.round.deck.slice(0, s.round.drawn);
      const n = s.round.cards['a']?.[move.card]?.[move.index] ?? -1;
      if (called.includes(n)) s = input(s, 'a', move);
    }
    expect(sampleInput(s, 'a', createRng(1))).toEqual({ type: 'bingo' });
  });
});

describe('bingos per round', () => {
  it('with winners 2 the caller carries on after a bingo; the winning card is locked, the rest play on', () => {
    let s = callUntil(start({ cards: 2, winners: 2, rounds: 1 }), 'a', [0, 1, 2, 3, 4], 0);
    s = daubAll(s, 'a', [0, 1, 2, 3, 4], 0);
    s = input(s, 'a', { type: 'bingo' });
    expect(s.phase.id).toBe('bingo');
    expect(s.wins['a']).toBe(1);
    expect(s.round.won['a']).toEqual([0]);
    expect(game.tvView(s).roundContinues).toBe(true);
    expect(game.tvView(s).bingosSoFar).toBe(1);
    const drawn = s.round.drawn;
    s = timer(s);
    expect(s.phase.id).toBe('play'); // not the scoreboard
    expect(s.round.drawn).toBe(drawn + 1);
    expect(s.round.pattern).toBe('line');
    // The locked card cannot claim again even though it still completes the line...
    const a = game.controllerView(s, 'a');
    expect(a.won).toEqual([0]);
    expect(a.doneForRound).toBe(false);
    expect(a.canClaim).toBe(true); // ...but card 2 is live, so the button stays on
    // ...and BINGO! now checks card 2 (nothing daubed: a check, not a second win).
    s = input(s, 'a', { type: 'bingo' });
    expect(s.phase.id).toBe('check');
    expect(s.round.claim?.cardIndex).toBe(1);
    expect(s.round.daubs['a']?.[0]).toEqual([0, 1, 2, 3, 4]); // the winning card keeps its daubs
    s = timer(s);
    // A second bingo (another player) ends the round: history lists both, done after the last round.
    s = callUntil(s, 'b', [0, 4, 20, 24, 6, 8, 16, 18], 0);
    s = daubAll(s, 'b', [0, 6, 18, 24], 0);
    s = input(s, 'b', { type: 'bingo' });
    expect(s.phase.id).toBe('bingo');
    expect(game.tvView(s).roundContinues).toBe(false);
    expect(game.tvView(s).roundWinners).toEqual(['Ana', 'Ben']);
    s = timer(s);
    expect(s.phase.id).toBe('done');
    expect(s.history).toEqual([{ round: 1, winnerIds: ['a', 'b'], calls: s.round.drawn }]);
    expect(game.results(s)?.scores).toEqual({ a: 1, b: 1, c: 0 });
  });

  it('a one-card player who won is done for the round: no claim, status submitted, bot idle', () => {
    let s = callUntil(start({ winners: 3, rounds: 1 }), 'c', [20, 21, 22, 23, 24]);
    s = daubAll(s, 'c', [20, 21, 22, 23, 24]);
    s = input(s, 'c', { type: 'bingo' });
    s = timer(s);
    expect(s.phase.id).toBe('play');
    const c = game.controllerView(s, 'c');
    expect(c.doneForRound).toBe(true);
    expect(c.canClaim).toBe(false);
    expect(input(s, 'c', { type: 'bingo' })).toBe(s);
    expect(game.tvView(s).players.find((p) => p.id === 'c')?.status).toBe('submitted');
    expect(sampleInput(s, 'c', createRng(2))).toBeNull();
    // The same card can win twice only across rounds: the deck running out ends this one.
    while (s.phase.id === 'play') s = timer(s);
    expect(s.phase.id).toBe('bingo');
    expect(s.round.winnerId).toBeNull();
    expect(game.tvView(s).roundContinues).toBe(false);
    s = timer(s);
    expect(s.phase.id).toBe('done');
    expect(s.history[0]?.winnerIds).toEqual(['c']);
  });

  it('winners 1 (the default) ends the round at the first bingo, as before', () => {
    let s = callUntil(start(), 'a', [0, 1, 2, 3, 4]);
    s = daubAll(s, 'a', [0, 1, 2, 3, 4]);
    s = input(s, 'a', { type: 'bingo' });
    expect(game.tvView(s).roundContinues).toBe(false);
    expect(timer(s).phase.id).toBe('scoreboard');
    expect(readSettings({ winners: 7 }).winners).toBe(4);
  });
});

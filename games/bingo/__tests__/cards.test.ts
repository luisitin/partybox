// Pins the multi-card rules: cards per player, one BINGO! for the closest card, a failed claim
// wiping only that card; and bingos per round — the caller carrying on with the winning card locked.
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { game, readSettings } from '../server/index';
import { looksComplete } from '../server/patterns';
import { sampleInput } from '../server/bot';
import { after, callUntil, claim, daubAll, choose, input, start, timer } from './helpers';

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

  it('daubs land on the card named; BINGO! checks the card named and wipes only that one', () => {
    let s = callUntil(start({ cards: 2 }), 'a', [10, 11, 13, 14], 1);
    s = daubAll(s, 'a', [10, 11, 13, 14], 1);
    s = daubAll(s, 'a', [0, 1], 0);
    expect(s.round.daubs['a']).toEqual([
      [0, 1],
      [10, 11, 13, 14],
    ]);
    expect(claim(s, 'a', 0).phase.id).toBe('check'); // the card you name, never your best one
    s = claim(s, 'a', 1);
    expect(s.phase.id).toBe('bingo');
    expect(s.round.claim?.cardIndex).toBe(1);
    expect(game.tvView(s).claim?.card).toEqual(s.round.cards['a']?.[1]);
    expect(game.tvView(s).claim?.cardCount).toBe(2);
    // A wrong claim: the nearer card (one square short) goes up, and only it is wiped.
    let t = callUntil(start({ cards: 2 }, 5), 'b', [0, 1, 2, 3], 1);
    t = daubAll(t, 'b', [0, 1, 2, 3], 1);
    t = daubAll(t, 'b', [20], 0);
    t = claim(t, 'b', 1);
    expect(t.phase.id).toBe('check');
    expect(t.round.claim?.cardIndex).toBe(1);
    expect(t.round.claim?.missing).toEqual([4]);
    expect(t.round.daubs['b']).toEqual([[20], [0, 1, 2, 3]]); // I-435 B: nothing wrong to wipe
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
    expect(sampleInput(s, 'a', createRng(1))).toEqual({ type: 'bingo', card: 1 });
  });
});

describe('keep going with several cards', () => {
  it('after a bingo the round carries on for the same pattern: the card that won is locked, the rest play on', () => {
    let s = callUntil(start({ cards: 2, rounds: 1 }), 'a', [0, 1, 2, 3, 4], 0);
    s = daubAll(s, 'a', [0, 1, 2, 3, 4], 0);
    s = claim(s, 'a');
    expect(s.phase.id).toBe('bingo');
    expect(s.wins['a']).toBe(3); // the first bingo of a pattern
    expect(s.round.won['a']).toEqual([0]);
    expect(game.tvView(s).bingosThisRound).toBe(1);
    expect(game.tvView(s).decide).toEqual({ same: true, blackout: true });
    const drawn = s.round.drawn;
    s = choose(s, 'b', { type: 'continue', pattern: 'same' }, after(s));
    expect(s.phase.id).toBe('play');
    expect(s.round.drawn).toBe(drawn); // the number that was up repeats
    // The locked card cannot claim again even though it still completes the line...
    const a = game.controllerView(s, 'a');
    expect(a.won).toEqual([0]);
    expect(a.doneForRound).toBe(false);
    expect(a.canClaim).toBe(true); // ...but card 2 is live, so the button stays on
    // ...and BINGO! on card 2 (nothing daubed) is a check, not a second win; card 1 is ignored.
    expect(claim(s, 'a', 0)).toBe(s);
    s = claim(s, 'a', 1);
    expect(s.phase.id).toBe('check');
    expect(s.round.claim?.cardIndex).toBe(1);
    expect(s.round.daubs['a']?.[0]).toEqual([0, 1, 2, 3, 4]); // the winning card keeps its daubs
    s = timer(s);
    // Another bingo in the continued round is another point; the history lists each.
    s = callUntil(s, 'b', [0, 4, 20, 24, 6, 8, 16, 18], 0);
    s = daubAll(s, 'b', [0, 6, 18, 24], 0);
    s = claim(s, 'b');
    expect(s.phase.id).toBe('bingo');
    expect(game.tvView(s).bingosThisRound).toBe(2);
    expect(s.history.map((h) => h.winnerId)).toEqual(['a', 'b']);
    s = choose(s, 'a', { type: 'next' }, after(s));
    expect(s.phase.id).toBe('final'); // the drumroll, then done
    s = timer(s);
    expect(s.phase.id).toBe('done');
    expect(game.results(s)?.scores).toEqual({ a: 3, b: 2, c: 0 }); // 1st and 2nd bingo of the pattern;
  });

  it('a one-card player who won is done for the pattern: no claim, status submitted, bot idle; blackout reopens the card', () => {
    let s = callUntil(start({ rounds: 1 }), 'c', [20, 21, 22, 23, 24]);
    s = daubAll(s, 'c', [20, 21, 22, 23, 24]);
    s = claim(s, 'c');
    const atBingo = s;
    s = choose(s, 'a', { type: 'continue', pattern: 'same' }, after(s));
    expect(s.phase.id).toBe('play');
    const c = game.controllerView(s, 'c');
    expect(c.doneForRound).toBe(true);
    expect(c.canClaim).toBe(false);
    expect(claim(s, 'c')).toBe(s);
    expect(game.tvView(s).players.find((p) => p.id === 'c')?.status).toBe('submitted');
    expect(sampleInput(s, 'c', createRng(2))).toBeNull();
    // A blackout on the same cards puts every card back in.
    const black = choose(atBingo, 'a', { type: 'continue', pattern: 'blackout' }, after(atBingo));
    expect(black.round.won).toEqual({});
    expect(game.controllerView(black, 'c').canClaim).toBe(true);
    // With every card in the room locked there is nothing left to win for the same pattern.
    let all = atBingo;
    for (const id of ['a', 'b'])
      all = { ...all, round: { ...all.round, won: { ...all.round.won, [id]: [0] } } };
    expect(game.tvView(all).decide).toEqual({ same: false, blackout: true });
    expect(choose(all, 'a', { type: 'continue', pattern: 'same' }, after(all))).toBe(all);
  });
});

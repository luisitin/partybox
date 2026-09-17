// Pins the README rules with hand-built events: dealing, free daubing, the check (green / red /
// missing, the wipe, the one-number wait), the call loop, deck exhaustion, per-round patterns,
// VIP actions and results.
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { game, readSettings } from '../server/index';
import { dealCard, letterOf } from '../server/cards';
import { evaluate, looksComplete } from '../server/patterns';
import { sampleInput } from '../server/bot';
import type { Input, State } from '../server/types';

const T0 = 1_000_000;
const PLAYERS = [
  { id: 'a', name: 'Ana', avatarId: 'fox', connected: true },
  { id: 'b', name: 'Ben', avatarId: 'owl', connected: true },
  { id: 'c', name: 'Cleo', avatarId: 'frog', connected: true },
];

function start(settings: Record<string, number | string | boolean> = {}, seed = 1): State {
  return game.init({
    players: PLAYERS,
    settings: { rounds: 2, round1: 'line', round2: 'corners', callSeconds: 6, ...settings },
    seed,
    now: T0,
  });
}

function input(
  state: State,
  playerId: string,
  value: Input,
  now = state.phase.startedAt + 500,
): State {
  return game.reduce(state, { type: 'input', now, playerId, input: value });
}

function timer(state: State): State {
  const now = state.phase.deadline ?? state.phase.startedAt;
  return game.reduce(state, {
    type: 'timer',
    now,
    phaseId: state.phase.id,
    startedAt: state.phase.startedAt,
  });
}

function vip(state: State, action: 'skip' | 'pause' | 'resume' | 'end', now?: number): State {
  return game.reduce(state, { type: 'vip', now: now ?? state.phase.startedAt + 500, action });
}

/** Calls numbers until every index in `cells` of `playerId`'s card has been called. */
function callUntil(state: State, playerId: string, cells: number[], cardIndex = 0): State {
  let s = state.phase.id === 'intro' ? timer(state) : state;
  const card = s.round.cards[playerId]?.[cardIndex] as number[];
  const need = new Set(cells.map((i) => card[i] as number).filter((n) => n !== 0));
  for (let guard = 0; guard < 80 && s.phase.id === 'play'; guard++) {
    const called = new Set(s.round.deck.slice(0, s.round.drawn));
    if ([...need].every((n) => called.has(n))) return s;
    s = timer(s);
  }
  throw new Error('deck ran out');
}

function daubAll(state: State, playerId: string, cells: number[], card = 0): State {
  let s = state;
  for (const i of cells) if (i !== 12) s = input(s, playerId, { type: 'daub', card, index: i });
  return s;
}

describe('setup', () => {
  it('deals a legal card: columns B/I/N/G/O from their 15-number ranges, FREE centre, no repeats', () => {
    const rng = createRng(7);
    const [card] = dealCard(rng.state());
    expect(card).toHaveLength(25);
    expect(card[12]).toBe(0);
    for (let i = 0; i < 25; i++) {
      if (i === 12) continue;
      const col = i % 5;
      expect(card[i]).toBeGreaterThanOrEqual(col * 15 + 1);
      expect(card[i]).toBeLessThanOrEqual(col * 15 + 15);
    }
    expect(new Set(card.filter((n) => n !== 0)).size).toBe(24);
    expect(letterOf(1)).toBe('B');
    expect(letterOf(30)).toBe('I');
    expect(letterOf(45)).toBe('N');
    expect(letterOf(46)).toBe('G');
    expect(letterOf(75)).toBe('O');
  });

  it('starts in intro with a card per player, a 75-card deck and nothing drawn', () => {
    const s = start();
    expect(s.phase.id).toBe('intro');
    expect(Object.keys(s.round.cards).sort()).toEqual(['a', 'b', 'c']);
    expect([...s.round.deck].sort((x, y) => x - y)).toEqual(
      Array.from({ length: 75 }, (_, i) => i + 1),
    );
    expect(s.round.drawn).toBe(0);
    expect(game.tvView(s).current).toBeNull();
    expect(game.results(s)).toBeNull();
  });

  it('reads one pattern per round from round1..round5 and ignores the rest', () => {
    const s = readSettings({ rounds: 2, round1: 'x', round2: 'blackout', round3: 'corners' });
    expect(s.patterns).toEqual(['x', 'blackout']);
    expect(readSettings({ rounds: 1, round1: 'nonsense' }).patterns).toEqual(['line']);
    expect(start({ rounds: 2, round1: 'x', round2: 'corners' }).round.pattern).toBe('x');
  });
});

describe('play', () => {
  it('the intro timer makes the first call; each play timer draws the next number', () => {
    let s = timer(start());
    expect(s.phase.id).toBe('play');
    expect(s.round.drawn).toBe(1);
    const first = s.round.deck[0];
    expect(game.tvView(s).current?.number).toBe(first);
    expect(game.tvView(s).previous).toBeNull();
    s = timer(s);
    expect(s.round.drawn).toBe(2);
    expect(game.tvView(s).previous?.number).toBe(first);
    expect(game.tvView(s).current?.number).toBe(s.round.deck[1]);
    expect(s.phase.deadline).toBe(s.phase.startedAt + 6000);
  });

  it('daubs toggle freely, called or not; FREE and spectators are ignored', () => {
    let s = timer(start());
    s = input(s, 'a', { type: 'daub', card: 0, index: 3 });
    expect(s.round.daubs['a']).toEqual([[3]]);
    s = input(s, 'a', { type: 'daub', card: 0, index: 0 });
    expect(s.round.daubs['a']).toEqual([[0, 3]]);
    s = input(s, 'a', { type: 'daub', card: 0, index: 3 });
    expect(s.round.daubs['a']).toEqual([[0]]);
    expect(input(s, 'a', { type: 'daub', card: 0, index: 12 })).toBe(s);
    expect(input(s, 'a', { type: 'daub', card: 1, index: 1 })).toBe(s); // not dealt a second card
    expect(input(s, 'ghost', { type: 'daub', card: 0, index: 1 })).toBe(s);
  });

  it('a valid line claim wins the round: bingo phase, +1, the card on the TV all green', () => {
    let s = callUntil(start(), 'a', [0, 1, 2, 3, 4]);
    s = daubAll(s, 'a', [0, 1, 2, 3, 4]);
    s = input(s, 'a', { type: 'bingo' });
    expect(s.phase.id).toBe('bingo');
    expect(s.round.winnerId).toBe('a');
    expect(s.wins['a']).toBe(1);
    const claim = game.tvView(s).claim;
    expect(claim?.valid).toBe(true);
    expect(claim?.green.sort()).toEqual([0, 1, 2, 3, 4]);
    expect(claim?.red).toEqual([]);
    expect(s.history).toEqual([{ round: 1, winnerId: 'a', calls: s.round.drawn }]);
  });

  it('an invalid claim pauses the caller, shows reds and misses, wipes the card, and blocks a re-claim until the next number', () => {
    let s = callUntil(start(), 'b', [5, 6, 7, 8]); // row 2 minus one square
    const card = s.round.cards['b']?.[0] as number[];
    const uncalled = card.findIndex(
      (n, i) => i !== 12 && !s.round.deck.slice(0, s.round.drawn).includes(n),
    );
    s = daubAll(s, 'b', [5, 6, 7, 8, uncalled]);
    const before = s.round.drawn;
    s = input(s, 'b', { type: 'bingo' });
    expect(s.phase.id).toBe('check');
    expect(s.round.drawn).toBe(before); // the caller stopped
    const claim = s.round.claim;
    expect(claim?.valid).toBe(false);
    expect(claim?.playerId).toBe('b');
    expect(claim?.red).toEqual([uncalled]);
    expect(claim?.cells).toEqual([5, 6, 7, 8, 9]);
    expect(claim?.missing).toEqual([9]);
    expect(s.round.daubs['b']).toEqual([[]]); // wiped
    expect(s.round.waitForCall['b']).toBe(before + 1);
    // Daubing continues during the check; claims do not.
    s = input(s, 'b', { type: 'daub', card: 0, index: 5 });
    expect(s.round.daubs['b']).toEqual([[5]]);
    expect(input(s, 'a', { type: 'bingo' }).phase.id).toBe('check');
    // The check's timer resumes the caller with the next number.
    s = timer(s);
    expect(s.phase.id).toBe('play');
    expect(s.round.drawn).toBe(before + 1);
    expect(game.controllerView(s, 'b').canClaim).toBe(true);
  });

  it('right after your own failed claim you cannot claim again until the next number', () => {
    let s = callUntil(start(), 'a', [0, 1]);
    s = daubAll(s, 'a', [0, 1]);
    s = input(s, 'a', { type: 'bingo' }); // invalid
    expect(s.phase.id).toBe('check');
    const view = game.controllerView(s, 'a');
    expect(view.canClaim).toBe(false);
    expect(view.waitingForCall).toBe(true);
    // VIP skip during the check = next number now; the wait is over.
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('play');
    expect(game.controllerView(s, 'a').canClaim).toBe(true);
  });

  it('the 75th call with no winner ends the round with no winner', () => {
    let s = timer(start({ rounds: 1 }));
    for (let i = 1; i < 75; i++) s = timer(s);
    expect(s.round.drawn).toBe(75);
    expect(s.phase.id).toBe('play');
    s = timer(s);
    expect(s.phase.id).toBe('bingo');
    expect(s.round.winnerId).toBeNull();
    expect(game.tvView(s).claim).toBeNull();
    s = timer(s);
    expect(s.phase.id).toBe('done');
    expect(game.results(s)?.scores).toEqual({ a: 0, b: 0, c: 0 });
    expect(game.results(s)?.winnerIds.sort()).toEqual(['a', 'b', 'c']);
  });
});

describe('patterns', () => {
  const card = Array.from({ length: 25 }, (_, i) => (i === 12 ? 0 : i + 1));
  it('corners, x and blackout need exactly their squares; stray reds do not spoil a valid pattern', () => {
    const called = card.filter((n) => n !== 0);
    expect(evaluate('p', 0, card, [0, 4, 20, 24], called, 'corners').valid).toBe(true);
    expect(evaluate('p', 0, card, [0, 4, 20], called, 'corners').valid).toBe(false);
    expect(evaluate('p', 0, card, [0, 6, 18, 24, 4, 8, 16, 20], called, 'x').valid).toBe(true);
    expect(evaluate('p', 0, card, [0, 6, 18, 24, 4, 8, 16], called, 'x').missing).toEqual([20]);
    const all = card.map((_, i) => i).filter((i) => i !== 12);
    expect(evaluate('p', 0, card, all, called, 'blackout').valid).toBe(true);
    // A full row plus two daubs that were never called: still a line, with two reds shown.
    const partial = called.filter((n) => n !== 22 && n !== 23);
    const claim = evaluate('p', 0, card, [0, 1, 2, 3, 4, 21, 22], partial, 'line');
    expect(claim.valid).toBe(true);
    expect(claim.red).toEqual([21, 22]);
  });

  it('looksComplete is what the bot sees: FREE counts, nothing else is known', () => {
    expect(looksComplete('line', [10, 11, 13, 14])).toBe(true);
    expect(looksComplete('line', [10, 11, 13])).toBe(false);
    expect(looksComplete('corners', [0, 4, 20, 24])).toBe(true);
  });
});

describe('rounds and results', () => {
  it('scoreboard between rounds, the next round uses its own pattern and fresh cards; done after the last', () => {
    let s = callUntil(
      start({ rounds: 2, round1: 'line', round2: 'corners' }),
      'c',
      [20, 21, 22, 23, 24],
    );
    s = daubAll(s, 'c', [20, 21, 22, 23, 24]);
    s = input(s, 'c', { type: 'bingo' });
    expect(s.phase.id).toBe('bingo');
    const oldCard = s.round.cards['a'];
    s = timer(s);
    expect(s.phase.id).toBe('scoreboard');
    expect(game.tvView(s).standings.find((r) => r.playerId === 'c')?.wins).toBe(1);
    s = timer(s);
    expect(s.phase.id).toBe('intro');
    expect(s.round.number).toBe(2);
    expect(s.round.pattern).toBe('corners');
    expect(s.round.cards['a']).not.toEqual(oldCard);
    expect(s.round.daubs['c']).toEqual([[]]);
    s = callUntil(s, 'a', [0, 4, 20, 24]);
    s = daubAll(s, 'a', [0, 4, 20, 24]);
    s = input(s, 'a', { type: 'bingo' });
    expect(s.phase.id).toBe('bingo');
    s = timer(s);
    expect(s.phase.id).toBe('done');
    const results = game.results(s);
    expect(results?.scores).toEqual({ a: 1, b: 0, c: 1 });
    expect(results?.winnerIds.sort()).toEqual(['a', 'c']);
    expect(results?.awards).toEqual([]);
  });

  it('VIP skip: intro → first call, play → next number, bingo → scoreboard/done; end → done anywhere', () => {
    let s = vip(start(), 'skip');
    expect(s.phase.id).toBe('play');
    expect(s.round.drawn).toBe(1);
    s = vip(s, 'skip');
    expect(s.round.drawn).toBe(2);
    expect(s.phase.id).toBe('play');
    const ended = vip(s, 'end');
    expect(ended.phase.id).toBe('done');
    expect(game.results(ended)?.scores).toEqual({ a: 0, b: 0, c: 0 });
    expect(vip(ended, 'skip')).toEqual(ended);
  });

  it('pause holds the caller: inputs and timers wait, resume shifts the deadline', () => {
    let s = timer(start());
    const deadline = s.phase.deadline as number;
    s = vip(s, 'pause', s.phase.startedAt + 1000);
    expect(input(s, 'a', { type: 'daub', card: 0, index: 0 })).toBe(s);
    expect(timer(s)).toBe(s);
    s = vip(s, 'resume', s.phase.startedAt + 4000);
    expect(s.phase.deadline).toBe(deadline + 3000);
    expect(s.phase.paused).toBeUndefined();
  });

  it('a stale timer (previous call instance) is ignored', () => {
    let s = timer(start());
    s = timer(s);
    const stale = game.reduce(s, {
      type: 'timer',
      now: s.phase.deadline as number,
      phaseId: 'play',
      startedAt: s.phase.startedAt - 6000,
    });
    expect(stale).toBe(s);
  });
});

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

describe('views and bot', () => {
  it('the TV never shows the deck ahead of the current call; phones get only their own card', () => {
    let s = timer(start());
    s = timer(s);
    const tv = JSON.stringify(game.tvView(s));
    expect(tv).not.toContain('"deck"');
    expect(tv).not.toContain('"cards"');
    const mine = game.controllerView(s, 'a');
    expect(mine.cards).toEqual(s.round.cards['a']);
    expect(JSON.stringify(mine)).not.toContain(JSON.stringify(s.round.cards['b']?.[0]));
    expect(mine.called).toEqual([]);
    const spectator = game.controllerView(s, 'ghost');
    expect(spectator.cards).toBeNull();
    expect(spectator.called).toEqual(s.round.deck.slice(0, 2));
  });

  it('the bot daubs called squares, claims when its card looks complete, and stays quiet otherwise', () => {
    const rng = createRng(3);
    let s = callUntil(start(), 'a', [10, 11, 13, 14]);
    // Only called squares get daubed (a mis-tap is possible but rare; force the honest path).
    for (let i = 0; i < 40 && !looksComplete('line', s.round.daubs['a']?.[0] ?? []); i++) {
      const move = sampleInput(s, 'a', rng);
      if (!move) continue;
      expect(move.type).toBe('daub');
      s = input(s, 'a', move);
    }
    const claim = sampleInput(s, 'a', createRng(1));
    expect(claim).toEqual({ type: 'bingo' });
    expect(sampleInput(start(), 'a', rng)).toBeNull(); // intro
    expect(sampleInput(s, 'ghost', rng)).toBeNull();
  });
});

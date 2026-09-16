// Pins the README rules with hand-built events: routing for every N × passes, the parity rule,
// never-spoil views, placeholders at the deadline, the show's page turns, verdicts and results.
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { game } from '../server/index';
import { authorOfPage, bookInHands, isIntact, normalizeText } from '../server/books';
import { decodePoints, encodePoints, inkCost } from '../server/encoding';
import type { Input, State } from '../server/types';

const T0 = 1_000_000;

function players(n: number): { id: string; name: string; avatarId: string; connected: boolean }[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: `P${i + 1}`,
    avatarId: 'fox',
    connected: true,
  }));
}

function start(n = 4, settings: Record<string, number | string | boolean> = {}, seed = 1): State {
  return game.init({
    players: players(n),
    settings: {
      passes: 15,
      drawSeconds: 60,
      guessSeconds: 30,
      customWords: true,
      spicy: false,
      ...settings,
    },
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

const DOT: Input = { type: 'draw', strokes: [{ c: 0, w: 1, p: encodePoints([10, 10]) }] };

/** Everyone picks option 1, then plays every step with a dot / the given guess. Ends in `show`. */
function playThrough(state: State, guessFor: (playerId: string, step: number) => string): State {
  let s = state;
  for (const id of s.seats) s = input(s, id, { type: 'pick', option: 1 });
  expect(s.phase.id).toBe(s.pageCount > 1 ? (s.ownerDraws === 1 ? 'draw' : 'draw') : 'show');
  let guard = 0;
  while ((s.phase.id === 'draw' || s.phase.id === 'guess') && guard++ < 40) {
    for (const id of s.seats) {
      if (s.phase.id === 'draw') s = input(s, id, DOT);
      else if (s.phase.id === 'guess')
        s = input(s, id, { type: 'guess', text: guessFor(id, s.step) });
    }
  }
  expect(s.phase.id).toBe('show');
  return s;
}

describe('setup and routing', () => {
  it('shuffles seats, deals three distinct offers per player, and starts in pick', () => {
    const s = start(5);
    expect(s.phase.id).toBe('pick');
    expect([...s.seats].sort()).toEqual(['p1', 'p2', 'p3', 'p4', 'p5']);
    const all = s.seats.flatMap((id) => s.offers[id] ?? []);
    expect(all).toHaveLength(15);
    expect(new Set(all).size).toBe(15);
    expect(s.books.map((b) => b.ownerId)).toEqual(s.seats);
  });

  it('caps passes at N − 1 and keeps every book ending on a guess (parity rule)', () => {
    expect(start(8)).toMatchObject({ passes: 7, ownerDraws: 1, pageCount: 9 });
    expect(start(3)).toMatchObject({ passes: 2, ownerDraws: 0, pageCount: 3 });
    expect(start(8, { passes: 3 })).toMatchObject({ passes: 3, ownerDraws: 1, pageCount: 5 });
    expect(start(8, { passes: 4 })).toMatchObject({ passes: 4, ownerDraws: 0, pageCount: 5 });
    expect(start(2)).toMatchObject({ passes: 1, ownerDraws: 1, pageCount: 3 });
  });

  it('every player holds exactly one book per step and never the same book twice (N 2–8 × passes 1–15)', () => {
    for (let n = 2; n <= 8; n++)
      for (let passes = 1; passes <= 15; passes++) {
        const s0 = start(n, { passes }, n * 100 + passes);
        const seen = new Map<string, Set<number>>();
        for (let step = 1; step < s0.pageCount; step++) {
          const s = { ...s0, step };
          const held = s.seats.map((id) => bookInHands(s, id));
          expect(
            [...held].sort((a, b) => a - b),
            `n=${n} passes=${passes} step=${step}`,
          ).toEqual(Array.from({ length: n }, (_, i) => i));
          s.seats.forEach((id, k) => {
            const b = held[k] as number;
            expect(authorOfPage(s, b, step)).toBe(id);
            const books = seen.get(id) ?? new Set<number>();
            expect(books.has(b), `${id} touches book ${b} twice`).toBe(false);
            books.add(b);
            seen.set(id, books);
          });
        }
        // The owner's own page 1 iff the owner draws first.
        const s1 = { ...s0, step: 1 };
        expect(bookInHands(s1, s0.seats[0] as string) === 0).toBe(s0.ownerDraws === 1);
      }
  });
});

describe('pick', () => {
  it('locks one word per player (offer or custom), closes when everyone picked, fills the rest at the deadline', () => {
    let s = start(3);
    const [a, b, c] = s.seats as [string, string, string];
    s = input(s, a, { type: 'pick', option: 2 });
    expect(s.books[0]?.pages[0]).toEqual({ kind: 'word', authorId: a, text: s.offers[a]?.[2] });
    expect(input(s, a, { type: 'pick', option: 0 })).toBe(s); // once
    s = input(s, b, { type: 'pickCustom', text: '  a haunted toaster ' });
    expect(s.books[1]?.pages[0]).toMatchObject({ text: 'a haunted toaster' });
    expect(input(s, 'ghost', { type: 'pick', option: 0 })).toBe(s);
    s = timer(s); // c never picked → medium word, and step 1 begins
    expect(s.books[2]?.pages[0]).toMatchObject({ text: s.offers[c]?.[1] });
    expect(s.step).toBe(1);
    expect(s.phase.id).toBe('draw');
  });

  it('custom words are refused when the setting is off', () => {
    const s = start(3, { customWords: false });
    const a = s.seats[0] as string;
    expect(input(s, a, { type: 'pickCustom', text: 'nope' })).toBe(s);
  });
});

describe('draw and guess steps', () => {
  it('a phone sees only the previous page of the book in its hands; the TV sees no page at all', () => {
    let s = start(4);
    for (const id of s.seats) s = input(s, id, { type: 'pick', option: 0 });
    expect(s.phase.id).toBe('draw'); // 4 players → P = 3 (odd) → owners draw their own word first
    const a = s.seats[0] as string;
    const mine = game.controllerView(s, a);
    expect(mine.prompt).toEqual({ kind: 'text', text: s.offers[a]?.[0] });
    expect(mine.bookOwnerName).toBe('P' + a.slice(1));
    const json = JSON.stringify(mine);
    for (const other of s.seats.slice(1))
      expect(json).not.toContain(JSON.stringify(s.offers[other]?.[0]));
    const tv = JSON.stringify(game.tvView(s));
    for (const id of s.seats) expect(tv).not.toContain(JSON.stringify(s.offers[id]?.[0]));
    expect(game.tvView(s).showing).toBeNull();
  });

  it('accepts one page per player per step, closes on all-sent, and hands the book to the next seat', () => {
    let s = start(3); // P = 2, owner writes the word, seat+1 draws, seat+2 guesses
    for (const id of s.seats) s = input(s, id, { type: 'pick', option: 0 });
    expect(s.phase.id).toBe('draw');
    const [a, b, c] = s.seats as [string, string, string];
    expect(bookInHands(s, b)).toBe(0); // b draws a's word
    s = input(s, b, DOT);
    expect(s.books[0]?.pages[1]).toEqual({
      kind: 'draw',
      authorId: b,
      drawing: { strokes: DOT.type === 'draw' ? DOT.strokes : [] },
    });
    expect(input(s, b, DOT)).toBe(s); // once per step
    expect(game.controllerView(s, b).submitted).toBe(true);
    expect(game.controllerView(s, b).nextName).toBe('P' + c.slice(1));
    expect(input(s, a, { type: 'guess', text: 'wrong phase' })).toBe(s);
    s = input(s, c, DOT);
    s = input(s, a, DOT);
    expect(s.phase.id).toBe('guess');
    expect(s.step).toBe(2);
    expect(bookInHands(s, c)).toBe(0); // c guesses b's drawing of a's word
    expect(game.controllerView(s, c).prompt).toEqual({
      kind: 'drawing',
      drawing: { strokes: DOT.type === 'draw' ? DOT.strokes : [] },
    });
  });

  it('the deadline fills missing pages with placeholders authored by whoever owed them', () => {
    let s = start(3);
    for (const id of s.seats) s = input(s, id, { type: 'pick', option: 0 });
    const [a, b, c] = s.seats as [string, string, string];
    s = input(s, b, DOT);
    s = timer(s);
    expect(s.phase.id).toBe('guess');
    expect(s.books[1]?.pages[1]).toEqual({ kind: 'draw', authorId: c, drawing: null });
    expect(s.books[2]?.pages[1]).toEqual({ kind: 'draw', authorId: a, drawing: null });
    s = timer(s);
    expect(s.phase.id).toBe('show');
    expect(s.books[0]?.pages[2]).toEqual({ kind: 'guess', authorId: c, text: null });
    expect(game.controllerView(s, c).prompt).toBeNull();
  });

  it('disconnected players are not waited for', () => {
    let s = start(3);
    const [a, b, c] = s.seats as [string, string, string];
    s = game.reduce(s, { type: 'player', now: T0 + 1, playerId: c, connected: false });
    s = input(s, a, { type: 'pick', option: 0 });
    s = input(s, b, { type: 'pick', option: 0 });
    expect(s.phase.id).toBe('draw'); // closed without c; c got the medium word
    expect(s.books[2]?.pages[0]).toMatchObject({ text: s.offers[c]?.[1] });
  });
});

describe('the show', () => {
  it('turns pages on the timer and on VIP skip, book by book, and shows only pages up to the current one', () => {
    let s = playThrough(start(3), () => 'a thing');
    expect(s.showing).toEqual({ book: 0, page: 0, verdict: null, line: null });
    expect(s.phase.deadline).toBe(s.phase.startedAt + 6000);
    let tv = game.tvView(s);
    expect(tv.showing?.pages).toHaveLength(1);
    const later = JSON.stringify(tv);
    expect(later).not.toContain('a thing');
    s = vip(s, 'skip'); // Next ▸
    expect(s.showing).toMatchObject({ book: 0, page: 1 });
    expect(s.phase.deadline).toBe(s.phase.startedAt + 12000);
    s = timer(s);
    expect(s.showing).toMatchObject({ book: 0, page: 2, verdict: 'broken' });
    tv = game.tvView(s);
    expect(tv.showing?.pages).toHaveLength(3);
    expect(tv.showing?.verdictLine).toBeTruthy();
    s = timer(s);
    expect(s.showing).toMatchObject({ book: 1, page: 0 });
    for (let i = 0; i < 5; i++) s = timer(s);
    expect(s.phase.id).toBe('show');
    expect(s.showing).toMatchObject({ book: 2, page: 2 });
    s = timer(s);
    expect(s.phase.id).toBe('summary');
    expect(game.tvView(s).summary).toHaveLength(3);
    expect(game.results(s)).toBeNull();
    s = timer(s);
    expect(s.phase.id).toBe('done');
  });

  it('a book is intact when the last guess matches the word (normalised); results award it', () => {
    let s = start(3);
    const words: Record<string, string> = {};
    for (const id of s.seats) words[id] = s.offers[id]?.[1] as string;
    // Seat k guesses the book of seat (k − 2) mod 3 at step 2: answer with that owner's word.
    s = playThrough(s, (id, step) => {
      const b = bookInHands({ ...s, step }, id);
      const owner = s.seats[b] as string;
      return id === s.seats[0] ? `The ${words[owner]}!` : 'nonsense';
    });
    while (s.phase.id === 'show' || s.phase.id === 'summary') s = vip(s, 'skip');
    const results = game.results(s);
    expect(results?.awards).toHaveLength(1);
    expect(results?.awards[0]).toMatchObject({ title: 'Unbroken', playerId: s.seats[1] });
    expect(game.tvView(s).intactBooks).toBe(1);
    expect(results?.scores).toEqual({ p1: 0, p2: 0, p3: 0 });
    expect(results?.winnerIds.sort()).toEqual(['p1', 'p2', 'p3']);
    expect(normalizeText('A Cat, wearing   a Crown!')).toBe('cat wearing a crown');
    expect(isIntact({ ownerId: 'x', pages: [] })).toBe(false);
    expect(isIntact({ ownerId: 'x', pages: [{ kind: 'word', authorId: 'x', text: 'cat' }] })).toBe(
      false,
    );
  });

  it('VIP end from pick leaves empty books; views and results still render', () => {
    const s = vip(start(4), 'end');
    expect(s.phase.id).toBe('done');
    expect(game.tvView(s).summary?.every((b) => b.word === '—' && !b.intact)).toBe(true);
    expect(game.controllerView(s, 'p1').myBook).toMatchObject({ word: '—', last: '—' });
    expect(game.results(s)?.awards).toEqual([]);
  });

  it('pause holds the page; resume shifts its deadline', () => {
    let s = playThrough(start(3), () => 'x');
    const deadline = s.phase.deadline as number;
    s = vip(s, 'pause', s.phase.startedAt + 1000);
    expect(timer(s)).toBe(s);
    s = vip(s, 'resume', s.phase.startedAt + 5000);
    expect(s.phase.deadline).toBe(deadline + 4000);
  });
});

describe('encoding and bot', () => {
  it('round-trips points, pads dots correctly, and costs what the ink meter counts', () => {
    const pts = [0, 255, 128, 64, 7, 200];
    const text = encodePoints(pts);
    expect(text.length % 4).toBe(0);
    expect(decodePoints(text)).toEqual(pts);
    expect(decodePoints(encodePoints([10, 10]))).toEqual([10, 10]);
    expect(encodePoints([10, 10])).toHaveLength(4);
    expect(inkCost(1)).toBe(4);
    expect(inkCost(3)).toBe(8);
    expect(
      game.inputSchema.safeParse({
        type: 'draw',
        strokes: [{ c: 0, w: 0, p: encodePoints([1, 1]) }],
      }).success,
    ).toBe(true);
    expect(
      game.inputSchema.safeParse({ type: 'draw', strokes: [{ c: 0, w: 0, p: 'not base64!' }] })
        .success,
    ).toBe(false);
  });

  it('the bot picks, draws varied doodles and guesses from its list; never acts twice or in the show', () => {
    const rng = createRng(9);
    let s = start(3);
    const a = s.seats[0] as string;
    const pick = game.bot.sampleInput(s, a, rng);
    expect(pick && (pick.type === 'pick' || pick.type === 'pickCustom')).toBe(true);
    s = input(s, a, pick as Input);
    expect(game.bot.sampleInput(s, a, rng)).toBeNull();
    for (const id of s.seats.slice(1)) s = input(s, id, { type: 'pick', option: 0 });
    const d1 = game.bot.sampleInput(s, a, rng);
    const d2 = game.bot.sampleInput(s, a, rng);
    expect(d1?.type).toBe('draw');
    expect(JSON.stringify(d1)).not.toBe(JSON.stringify(d2));
    expect(game.inputSchema.safeParse(d1).success).toBe(true);
    s = input(s, a, d1 as Input);
    expect(game.bot.sampleInput(s, a, rng)).toBeNull();
    for (const id of s.seats.slice(1)) s = input(s, id, DOT);
    const g = game.bot.sampleInput(s, a, rng);
    expect(g?.type).toBe('guess');
    for (const id of s.seats) s = input(s, id, { type: 'guess', text: 'x' });
    expect(s.phase.id).toBe('show');
    expect(game.bot.sampleInput(s, a, rng)).toBeNull();
  });
});

// Pins the README rules with hand-built events: the draw → pass… → guess routing for every
// N × passes, guess-then-draw inside a pass, never-spoil views, placeholders at the deadline, the
// presenter's page turns, verdicts and results.
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { game } from '../server/index';
import {
  authorOfPage,
  bookInHands,
  isIntact,
  normalizeText,
  owedNow,
  pagesOfStep,
} from '../server/books';
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

/** Everyone picks option 1, then plays every step (dots, and `guessFor` for guesses). Ends in `show`. */
function playThrough(state: State, guessFor: (playerId: string, step: number) => string): State {
  let s = state;
  for (const id of s.seats) s = input(s, id, { type: 'pick', option: 1 });
  expect(s.phase.id).toBe('draw');
  let guard = 0;
  while (s.phase.id !== 'show' && guard++ < 60) {
    for (const id of s.seats) {
      const owed = owedNow(s, id);
      if (owed === 'guess') s = input(s, id, { type: 'guess', text: guessFor(id, s.step) });
      if (owedNow(s, id) === 'draw') s = input(s, id, DOT);
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

  it('caps passes at N − 1; pages = 2P + 1; the last holder only guesses', () => {
    expect(start(4)).toMatchObject({ passes: 3, pageCount: 7 });
    expect(start(8)).toMatchObject({ passes: 7, pageCount: 15 });
    expect(start(3)).toMatchObject({ passes: 2, pageCount: 5 });
    expect(start(2)).toMatchObject({ passes: 1, pageCount: 3 });
    expect(start(8, { passes: 3 })).toMatchObject({ passes: 3, pageCount: 7 });
    const s = start(4);
    expect(pagesOfStep(s, 1)).toEqual([1]);
    expect(pagesOfStep(s, 2)).toEqual([2, 3]);
    expect(pagesOfStep(s, 3)).toEqual([4, 5]);
    expect(pagesOfStep(s, 4)).toEqual([6]);
  });

  it('every player holds exactly one book per step, their own first, never the same book twice (N 2–8 × passes 1–15)', () => {
    for (let n = 2; n <= 8; n++)
      for (let passes = 1; passes <= 15; passes++) {
        const s0 = start(n, { passes }, n * 100 + passes);
        const seen = new Map<string, Set<number>>();
        for (let step = 1; step <= s0.passes + 1; step++) {
          const s = { ...s0, step };
          const held = s.seats.map((id) => bookInHands(s, id));
          expect(
            [...held].sort((a, b) => a - b),
            `n=${n} passes=${passes} step=${step}`,
          ).toEqual(Array.from({ length: n }, (_, i) => i));
          s.seats.forEach((id, k) => {
            const b = held[k] as number;
            for (const i of pagesOfStep(s, step)) expect(authorOfPage(s, b, i)).toBe(id);
            if (step === 1) expect(b).toBe(k); // your own word first
            const books = seen.get(id) ?? new Set<number>();
            expect(books.has(b), `${id} touches book ${b} twice`).toBe(false);
            books.add(b);
            seen.set(id, books);
          });
        }
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

describe('draw, pass, guess', () => {
  it('step 1: everyone draws their own word; the phone shows only that word', () => {
    let s = start(4);
    for (const id of s.seats) s = input(s, id, { type: 'pick', option: 0 });
    expect(s.phase.id).toBe('draw');
    const a = s.seats[0] as string;
    const mine = game.controllerView(s, a);
    expect(mine.stage).toBe('draw');
    expect(mine.prompt).toEqual({ kind: 'text', text: s.offers[a]?.[0] });
    expect(mine.bookOwnerName).toBe('P' + a.slice(1));
    const json = JSON.stringify(mine);
    for (const other of s.seats.slice(1))
      expect(json).not.toContain(JSON.stringify(s.offers[other]?.[0]));
    const tv = JSON.stringify(game.tvView(s));
    for (const id of s.seats) expect(tv).not.toContain(JSON.stringify(s.offers[id]?.[0]));
    expect(game.tvView(s).showing).toBeNull();
    expect(input(s, a, { type: 'guess', text: 'not now' })).toBe(s);
  });

  it('a pass: the next seat guesses the drawing, then draws that guess; the step closes on all done', () => {
    let s = start(3); // P = 2: draw · pass · guess
    for (const id of s.seats) s = input(s, id, { type: 'pick', option: 0 });
    for (const id of s.seats) s = input(s, id, DOT);
    expect(s.phase.id).toBe('pass');
    expect(s.step).toBe(2);
    expect(s.phase.deadline).toBe(s.phase.startedAt + 90_000); // guess + draw
    const [a, b, c] = s.seats as [string, string, string];
    expect(bookInHands(s, b)).toBe(0); // b holds a's book
    let view = game.controllerView(s, b);
    expect(view.stage).toBe('guess');
    expect(view.prompt).toEqual({
      kind: 'drawing',
      drawing: { strokes: DOT.type === 'draw' ? DOT.strokes : [] },
    });
    expect(JSON.stringify(view)).not.toContain(JSON.stringify(s.offers[a]?.[0]));
    expect(input(s, b, DOT)).toBe(s); // must guess first
    s = input(s, b, { type: 'guess', text: 'a hat' });
    expect(s.books[0]?.pages[2]).toEqual({ kind: 'guess', authorId: b, text: 'a hat' });
    view = game.controllerView(s, b);
    expect(view.stage).toBe('draw');
    expect(view.prompt).toEqual({ kind: 'text', text: 'a hat' });
    expect(view.submitted).toBe(false);
    expect(input(s, b, { type: 'guess', text: 'twice' })).toBe(s);
    s = input(s, b, DOT);
    expect(s.books[0]?.pages[3]).toMatchObject({ kind: 'draw', authorId: b });
    view = game.controllerView(s, b);
    expect(view.stage).toBeNull();
    expect(view.submitted).toBe(true);
    expect(view.mine).toEqual({
      text: 'a hat',
      drawing: { strokes: DOT.type === 'draw' ? DOT.strokes : [] },
    });
    expect(view.nextName).toBe('P' + c.slice(1));
    // The other two finish → the last step: guess only.
    for (const id of [c, a]) {
      s = input(s, id, { type: 'guess', text: 'x' });
      s = input(s, id, DOT);
    }
    expect(s.phase.id).toBe('guess');
    expect(s.step).toBe(3);
    expect(bookInHands(s, c)).toBe(0);
    expect(game.controllerView(s, c).stage).toBe('guess');
    s = input(s, c, { type: 'guess', text: 'a cap' });
    expect(game.controllerView(s, c).stage).toBeNull();
    expect(input(s, c, DOT)).toBe(s); // no drawing after the last guess
    for (const id of [a, b]) s = input(s, id, { type: 'guess', text: 'y' });
    expect(s.phase.id).toBe('show');
    expect(s.books[0]?.pages.map((p) => p.kind)).toEqual([
      'word',
      'draw',
      'guess',
      'draw',
      'guess',
    ]);
  });

  it('the deadline fills whatever is missing — a guess, a drawing, or both — by whoever owed it', () => {
    let s = start(3);
    for (const id of s.seats) s = input(s, id, { type: 'pick', option: 0 });
    const [a, b, c] = s.seats as [string, string, string];
    s = input(s, b, DOT);
    s = timer(s); // a and c never drew
    expect(s.phase.id).toBe('pass');
    expect(s.books[0]?.pages[1]).toMatchObject({ kind: 'draw', authorId: a, drawing: null });
    expect(s.books[2]?.pages[1]).toMatchObject({ kind: 'draw', authorId: c, drawing: null });
    s = input(s, c, { type: 'guess', text: 'half done' }); // c guesses b's book but never draws
    s = timer(s);
    expect(s.phase.id).toBe('guess');
    expect(s.books[1]?.pages[2]).toEqual({ kind: 'guess', authorId: c, text: 'half done' });
    expect(s.books[1]?.pages[3]).toEqual({ kind: 'draw', authorId: c, drawing: null });
    expect(s.books[0]?.pages[2]).toEqual({ kind: 'guess', authorId: b, text: null });
    expect(s.books[0]?.pages[3]).toEqual({ kind: 'draw', authorId: b, drawing: null });
    s = timer(s);
    expect(s.phase.id).toBe('show');
    expect(s.books[0]?.pages[4]).toEqual({ kind: 'guess', authorId: c, text: null });
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
  it('the presenter turns pages with `turn`; others cannot; the TV shows only pages up to the current one', () => {
    let s = playThrough(start(3), () => 'a thing');
    expect(s.showing).toEqual({ book: 0, page: 0, verdict: null, line: null });
    const [a, b] = s.seats as [string, string];
    expect(game.controllerView(s, a).showing?.presenting).toBe(true);
    expect(game.controllerView(s, b).showing?.presenting).toBe(false);
    expect(input(s, b, { type: 'turn' })).toBe(s); // not their book
    expect(JSON.stringify(game.tvView(s))).not.toContain('a thing');
    s = input(s, a, { type: 'turn' });
    expect(s.showing).toMatchObject({ book: 0, page: 1 });
    expect(game.tvView(s).showing?.pages).toHaveLength(2);
    s = vip(s, 'skip'); // the TV's Skip / the VIP still work
    expect(s.showing).toMatchObject({ book: 0, page: 2 });
    s = timer(s); // the fallback auto-turn
    s = timer(s);
    expect(s.showing).toMatchObject({ book: 0, page: 4, verdict: 'broken' });
    expect(game.controllerView(s, a).showing).toMatchObject({ lastPage: true, lastBook: false });
    s = input(s, a, { type: 'turn' });
    expect(s.showing).toMatchObject({ book: 1, page: 0 });
    expect(game.controllerView(s, b).showing?.presenting).toBe(true);
    while (s.phase.id === 'show') s = vip(s, 'skip');
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
    // The last holder of book 1 (seat 0 at step 3) guesses its word exactly.
    s = playThrough(s, (id, step) => {
      const b = bookInHands({ ...s, step }, id);
      const owner = s.seats[b] as string;
      return step === 3 && b === 1 ? `The ${words[owner]}!` : 'nonsense';
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
    expect(input(s, s.seats[0] as string, { type: 'turn' })).toBe(s);
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

  it('the bot picks, draws, guesses then draws in a pass, presents its own book, and never acts twice', () => {
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
    for (const id of s.seats) s = input(s, id, DOT);
    expect(s.phase.id).toBe('pass');
    const g = game.bot.sampleInput(s, a, rng);
    expect(g?.type).toBe('guess');
    s = input(s, a, g as Input);
    expect(game.bot.sampleInput(s, a, rng)?.type).toBe('draw');
    s = input(s, a, DOT);
    expect(game.bot.sampleInput(s, a, rng)).toBeNull();
    s = playThrough(start(3), () => 'x');
    const presenter = s.seats[0] as string;
    const other = s.seats[1] as string;
    expect(game.bot.sampleInput(s, other, rng)).toBeNull();
    const turns = Array.from({ length: 30 }, () => game.bot.sampleInput(s, presenter, rng));
    expect(turns.some((t) => t?.type === 'turn')).toBe(true);
  });
});

describe('disconnects', () => {
  it('the drop of the last outstanding player closes the step like their page would have', () => {
    let s = start(3);
    for (const id of s.seats) s = input(s, id, { type: 'pick', option: 0 });
    expect(s.phase.id).toBe('draw');
    const [a, b, c] = s.seats as [string, string, string];
    s = input(s, a, DOT);
    s = input(s, b, DOT);
    expect(s.phase.id).toBe('draw'); // c still owes a drawing
    s = game.reduce(s, {
      type: 'player',
      now: s.phase.startedAt + 1000,
      playerId: c,
      connected: false,
    });
    expect(s.phase.id).toBe('pass');
  });
});

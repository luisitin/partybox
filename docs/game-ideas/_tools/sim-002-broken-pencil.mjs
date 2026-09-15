// Design simulation for idea 002 — Broken Pencil (docs/game-ideas/002-broken-pencil.html §7).
// Headless model of the reducer as specified: seats/routing, pick → draw/guess steps with
// placeholders, the VIP-driven show, results. Checks routing for every (N, D), termination within
// estimatedMinutes × 3, determinism, state/view sizes under the 256 KB cap, and "never spoils".
//
//   node docs/game-ideas/_tools/sim-002-broken-pencil.mjs [quick]

// ─── PRNG + SDK helpers (same as sim-001) ──────────────────────────────────────────────────────
const TWO32 = 4294967296;
function mix(seed, step) {
  let h = (seed ^ Math.imul(step + 0x632be5ab, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0;
  return (h ^ (h >>> 15)) >>> 0;
}
const seedRng = (seed) => ({ seed: seed >>> 0, step: 0 });
const nextFloat = (r) => [mix(r.seed, r.step) / TWO32, { seed: r.seed, step: r.step + 1 }];
function nextInt(r, min, max) {
  const [f, n] = nextFloat(r);
  return [min + Math.floor(f * (max - min + 1)), n];
}
function shuffle(r, items) {
  const out = [...items];
  let s = r;
  for (let i = out.length - 1; i > 0; i--) {
    const [j, n] = nextInt(s, 0, i);
    s = n;
    [out[i], out[j]] = [out[j], out[i]];
  }
  return [out, s];
}
function pick(r, items) {
  const [i, n] = nextInt(r, 0, items.length - 1);
  return [items[i], n];
}
function createRng(seed) {
  let st = seedRng(seed);
  return {
    float: () => {
      const [v, n] = nextFloat(st);
      st = n;
      return v;
    },
    int: (a, b) => {
      const [v, n] = nextInt(st, a, b);
      st = n;
      return v;
    },
    pick: (arr) => {
      const [v, n] = nextInt(st, 0, arr.length - 1);
      st = n;
      return arr[v];
    },
    chance: (p) => {
      const [v, n] = nextFloat(st);
      st = n;
      return v < p;
    },
  };
}
const enterPhase = (s, id, now, ms) => ({
  ...s,
  phase: { id, startedAt: now, deadline: ms === null ? null : now + ms },
});
const isTimerFor = (s, e) =>
  e.type === 'timer' && e.phaseId === s.phase.id && e.startedAt === s.phase.startedAt;
function setConnected(s, e) {
  const p = s.players[e.playerId];
  if (!p || p.connected === e.connected) return s;
  return { ...s, players: { ...s.players, [e.playerId]: { ...p, connected: e.connected } } };
}
function applyVip(s, e, h) {
  if (e.type !== 'vip') return null;
  const ph = s.phase;
  switch (e.action) {
    case 'pause':
      return ph.paused ? s : { ...s, phase: { ...ph, paused: { at: e.now } } };
    case 'resume': {
      if (!ph.paused) return s;
      const shift = Math.max(0, e.now - ph.paused.at);
      return {
        ...s,
        phase: {
          id: ph.id,
          startedAt: ph.startedAt,
          deadline: ph.deadline === null ? null : ph.deadline + shift,
        },
      };
    }
    case 'skip':
      return h.skip(
        ph.paused ? applyVip(s, { type: 'vip', now: e.now, action: 'resume' }, h) : s,
        e.now,
      );
    case 'end':
      return h.end(s, e.now);
  }
}
const connectedIds = (s) =>
  Object.values(s.players)
    .filter((p) => p.connected)
    .map((p) => p.id);
function allConnectedDone(s, done) {
  const set = new Set(done);
  const ids = connectedIds(s);
  return ids.length > 0 && ids.every((id) => set.has(id));
}
function buildResults(s, scores, awards) {
  const complete = {};
  for (const id of Object.keys(s.players))
    complete[id] = Number.isFinite(scores[id]) ? scores[id] : 0;
  const rows = Object.entries(complete)
    .map(([playerId, score]) => ({ playerId, score, rank: 0 }))
    .sort((a, b) => b.score - a.score || a.playerId.localeCompare(b.playerId));
  let last = null,
    lr = 0;
  rows.forEach((r, i) => {
    if (r.score !== last) {
      lr = i + 1;
      last = r.score;
    }
    r.rank = lr;
  });
  return {
    scores: complete,
    ranking: rows,
    winnerIds: rows.filter((r) => r.rank === 1).map((r) => r.playerId),
    awards: awards.filter((a) => a.playerId in s.players),
  };
}

// ─── Encoding (server/encoding.ts): pure base64 of quantised points ────────────────────────────
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function encodePoints(pts) {
  const bytes = [];
  for (const [x, y] of pts) bytes.push(x & 255, y & 255);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i],
      b = bytes[i + 1],
      c = bytes[i + 2];
    out +=
      B64[a >> 2] +
      B64[((a & 3) << 4) | ((b ?? 0) >> 4)] +
      (b === undefined ? '=' : B64[((b & 15) << 2) | ((c ?? 0) >> 6)]) +
      (c === undefined ? '=' : B64[c & 63]);
  }
  return out;
}
export function decodePoints(p) {
  const bytes = [];
  let buf = 0,
    bits = 0;
  for (const ch of p.replace(/=+$/, '')) {
    buf = ((buf << 6) | B64.indexOf(ch)) & 0xffffff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buf >> bits) & 255);
    }
  }
  const pts = [];
  for (let i = 0; i + 1 < bytes.length; i += 2) pts.push([bytes[i], bytes[i + 1]]);
  return pts;
}
export function encodeWalk(rng, n) {
  let x = rng.int(20, 235),
    y = rng.int(20, 235);
  const pts = [];
  for (let i = 0; i < n; i++) {
    x = Math.max(0, Math.min(255, x + rng.int(-12, 12)));
    y = Math.max(0, Math.min(255, y + rng.int(-12, 12)));
    pts.push([x, y]);
  }
  return encodePoints(pts);
}
const STROKE_RE = /^[A-Za-z0-9+/]+={0,2}$/; // a single point (a dot) is 3 chars + "=" — {4,} would reject it
const INK_CHARS = 3000;
function inputOk(i) {
  if (i.type === 'pick') return Number.isInteger(i.option) && i.option >= 0 && i.option <= 2;
  if (i.type === 'pickCustom')
    return typeof i.text === 'string' && i.text.trim().length >= 1 && i.text.length <= 30;
  if (i.type === 'guess')
    return typeof i.text === 'string' && i.text.trim().length >= 1 && i.text.length <= 40;
  if (i.type === 'draw')
    return (
      Array.isArray(i.strokes) &&
      i.strokes.length <= 80 &&
      i.strokes.every(
        (s) =>
          Number.isInteger(s.c) &&
          s.c >= 0 &&
          s.c <= 7 &&
          Number.isInteger(s.w) &&
          s.w >= 0 &&
          s.w <= 2 &&
          STROKE_RE.test(s.p) &&
          s.p.length % 4 === 0,
      ) &&
      i.strokes.reduce((n, s) => n + s.p.length, 0) <= INK_CHARS
    );
  return false;
}

// ─── The game (§6 + §7) ────────────────────────────────────────────────────────────────────────
export const PHASES = ['pick', 'draw', 'guess', 'show', 'done'];
const PICK_MS = 20_000;
const SHOW_MS = { word: 6_000, draw: 12_000, guess: 8_000 };
const WORDS = {
  1: Array.from({ length: 20 }, (_, i) => `easy${i}`),
  2: Array.from({ length: 20 }, (_, i) => `medium${i}`),
  3: Array.from({ length: 20 }, (_, i) => `hard${i}`),
};
const LINES = { intact: ['UNBROKEN!', 'It made it!'], broken: ['CHAIN BROKEN', 'Sideways.'] };
const BOT_GUESSES = [
  'cat',
  'dog',
  'house',
  'sun',
  'car',
  'tree',
  'banana',
  'ghost',
  'robot',
  'fish',
  'hat',
  'boat',
  'cake',
  'king',
  'snake',
  'cloud',
  'pizza',
  'spider',
  'moon',
  'chair',
];
export const norm = (t) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(a|an|the) /, '');
const readSettings = (s) => ({
  drawings: Math.min(4, Math.max(1, Number(s.drawings ?? 3))),
  drawSeconds: Math.min(120, Math.max(30, Number(s.drawSeconds ?? 60))),
  guessSeconds: Math.min(60, Math.max(15, Number(s.guessSeconds ?? 30))),
  customWords: Boolean(s.customWords ?? true),
  spicy: Boolean(s.spicy ?? false),
});
function dealOffers(rng, seats) {
  let r = rng;
  const offers = {};
  const pools = {};
  for (const d of [1, 2, 3]) {
    const [p, r2] = shuffle(r, WORDS[d]);
    pools[d] = p;
    r = r2;
  }
  seats.forEach((id, k) => {
    offers[id] = [pools[1][k % 20], pools[2][k % 20], pools[3][k % 20]];
  });
  return [offers, r];
}
export function init(ctx) {
  const players = {};
  for (const p of ctx.players) players[p.id] = p;
  const settings = readSettings(ctx.settings);
  const N = ctx.players.length;
  const D = Math.max(1, Math.min(settings.drawings, Math.floor(N / 2)));
  let rng = seedRng(ctx.seed);
  const [seats, r1] = shuffle(rng, ctx.players.map((p) => p.id).sort());
  rng = r1;
  const [offers, r2] = dealOffers(rng, seats);
  rng = r2;
  const books = seats.map((id) => ({ ownerId: id, pages: [] }));
  const s = {
    phase: { id: 'pick', startedAt: ctx.now, deadline: null },
    rng,
    players,
    settings: { ...settings, drawings: D },
    seats,
    pageCount: 2 * D + 1,
    step: 0,
    books,
    offers,
    showing: null,
    intactBooks: 0,
  };
  return enterPhase(s, 'pick', ctx.now, PICK_MS);
}
/** Book held by playerId at step i (0-based page index): own book for i ≤ 1; else book b with (b + i − 1) ≡ seat (mod N). */
function bookInHands(s, playerId) {
  const N = s.seats.length;
  const k = s.seats.indexOf(playerId);
  if (k < 0) return -1;
  return s.step <= 1 ? k : (((k - (s.step - 1)) % N) + N) % N;
}
/** Author of page index p (0-based) of book b: pages 0 and 1 are the owner's; page p ≥ 2 → seat (b + p − 1). */
function authorOfPage(s, b, p) {
  const N = s.seats.length;
  return s.seats[p <= 1 ? b : (b + p - 1) % N];
}
function enterStep(s, now) {
  const kind = s.step % 2 === 1 ? 'draw' : 'guess';
  return enterPhase(
    s,
    kind,
    now,
    (kind === 'draw' ? s.settings.drawSeconds : s.settings.guessSeconds) * 1000,
  );
}
function reducePick(s, e) {
  if (e.type === 'input' && (e.input.type === 'pick' || e.input.type === 'pickCustom')) {
    const p = e.playerId;
    const k = s.seats.indexOf(p);
    if (k < 0 || !s.players[p]) return s;
    if (s.books[k].pages.length) return s;
    if (e.input.type === 'pickCustom' && !s.settings.customWords) return s;
    const text = e.input.type === 'pick' ? s.offers[p][e.input.option] : e.input.text.trim();
    const books = s.books.map((bk, i) =>
      i === k ? { ...bk, pages: [{ kind: 'word', authorId: p, text }] } : bk,
    );
    const next = { ...s, books };
    const picked = next.books.filter((bk) => bk.pages.length).map((bk) => bk.ownerId);
    return allConnectedDone(next, picked) ? closePick(next, e.now) : next;
  }
  if (isTimerFor(s, e)) return closePick(s, e.now);
  return s;
}
function closePick(s, now) {
  const books = s.books.map((bk) =>
    bk.pages.length
      ? bk
      : { ...bk, pages: [{ kind: 'word', authorId: bk.ownerId, text: s.offers[bk.ownerId][1] }] },
  );
  return enterStep({ ...s, books, step: 1 }, now);
}
function reduceStep(s, e) {
  if (e.type === 'input' && (e.input.type === 'draw' || e.input.type === 'guess')) {
    if (e.input.type !== s.phase.id) return s;
    if (!s.players[e.playerId]) return s;
    const b = bookInHands(s, e.playerId);
    if (b < 0) return s;
    const book = s.books[b];
    if (book.pages.length !== s.step) return s;
    const page =
      e.input.type === 'draw'
        ? { kind: 'draw', authorId: e.playerId, drawing: { strokes: e.input.strokes } }
        : { kind: 'guess', authorId: e.playerId, text: e.input.text.trim() };
    const books = s.books.map((bk, i) => (i === b ? { ...bk, pages: [...bk.pages, page] } : bk));
    const next = { ...s, books };
    const submitted = next.books
      .filter((bk) => bk.pages.length > s.step)
      .map((bk) => bk.pages[s.step].authorId);
    return allConnectedDone(next, submitted) ? closeStep(next, e.now) : next;
  }
  if (isTimerFor(s, e)) return closeStep(s, e.now);
  return s;
}
function closeStep(s, now) {
  const books = s.books.map((bk, b) => {
    if (bk.pages.length > s.step) return bk;
    const author = authorOfPage(s, b, s.step);
    const page =
      s.step % 2 === 1
        ? { kind: 'draw', authorId: author, drawing: null }
        : { kind: 'guess', authorId: author, text: null };
    return { ...bk, pages: [...bk.pages, page] };
  });
  const next = { ...s, books, step: s.step + 1 };
  return next.step < next.pageCount ? enterStep(next, now) : showPage(next, 0, 0, now);
}
export const isIntact = (book) => {
  if (book.pages.length < 2) return false;
  const last = book.pages[book.pages.length - 1];
  return (
    last.kind === 'guess' && last.text !== null && norm(last.text) === norm(book.pages[0].text)
  );
};
function showPage(s, b, page, now) {
  const book = s.books[b];
  const kind = book.pages[page].kind;
  let verdict = null,
    line = null,
    rng = s.rng,
    intactBooks = s.intactBooks;
  if (page === book.pages.length - 1) {
    const intact = isIntact(book);
    verdict = intact ? 'intact' : 'broken';
    if (intact) intactBooks++;
    [line, rng] = pick(rng, intact ? LINES.intact : LINES.broken);
  }
  return enterPhase(
    { ...s, rng, intactBooks, showing: { book: b, page, verdict, line } },
    'show',
    now,
    SHOW_MS[kind],
  );
}
function turnPage(s, now) {
  const { book, page } = s.showing;
  if (page + 1 < s.books[book].pages.length) return showPage(s, book, page + 1, now);
  return book + 1 < s.books.length ? showPage(s, book + 1, 0, now) : enterDone(s, now);
}
const enterDone = (s, now) => enterPhase(s, 'done', now, null);
export function reduce(state, event) {
  if (event.type === 'player') return setConnected(state, event);
  const vip = applyVip(state, event, {
    skip: (s, now) =>
      s.phase.id === 'pick'
        ? closePick(s, now)
        : s.phase.id === 'draw' || s.phase.id === 'guess'
          ? closeStep(s, now)
          : s.phase.id === 'show'
            ? turnPage(s, now)
            : s,
    end: enterDone,
  });
  if (vip) return vip;
  if (state.phase.paused) return state;
  switch (state.phase.id) {
    case 'pick':
      return reducePick(state, event);
    case 'draw':
    case 'guess':
      return reduceStep(state, event);
    case 'show':
      return isTimerFor(state, event) ? turnPage(state, event.now) : state;
    default:
      return state;
  }
}
export function results(s) {
  if (s.phase.id !== 'done') return null;
  const zero = Object.fromEntries(Object.keys(s.players).map((id) => [id, 0]));
  const awards = s.books.filter(isIntact).map((b) => ({
    id: 'unbroken',
    title: 'Unbroken',
    description: `"${b.pages[0].text}" survived ${s.seats.length} players`,
    playerId: b.ownerId,
  }));
  return buildResults(s, zero, awards);
}
function envelope(s) {
  return {
    gameId: 'broken-pencil',
    phaseId: s.phase.id,
    deadline: s.phase.deadline,
    paused: !!s.phase.paused,
    players: Object.values(s.players)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        avatarId: p.avatarId,
        connected: p.connected,
        status: 'active',
      })),
  };
}
export function tvView(s) {
  const inPlay = ['pick', 'draw', 'guess'].includes(s.phase.id);
  const progress = inPlay
    ? s.seats.map((id) => ({
        playerId: id,
        done:
          s.phase.id === 'pick'
            ? s.books[s.seats.indexOf(id)].pages.length > 0
            : (() => {
                const b = bookInHands(s, id);
                return b >= 0 && s.books[b].pages.length > s.step;
              })(),
      }))
    : [];
  const showing =
    s.phase.id === 'show'
      ? {
          book: s.showing.book,
          ownerId: s.books[s.showing.book].ownerId,
          page: s.showing.page,
          pages: s.books[s.showing.book].pages.slice(0, s.showing.page + 1),
          verdict: s.showing.verdict,
          verdictLine: s.showing.line,
        }
      : null;
  const summary =
    s.phase.id === 'done'
      ? s.books.map((b) => ({
          ownerId: b.ownerId,
          word: b.pages[0]?.text ?? '—',
          last: b.pages.length > 1 ? (b.pages[b.pages.length - 1].text ?? '???') : '—',
          intact: isIntact(b),
        }))
      : null;
  return {
    ...envelope(s),
    step: s.step,
    pageCount: s.pageCount,
    bookCount: s.books.length,
    progress,
    showing,
    summary,
    intactBooks: s.intactBooks,
  };
}
export function controllerView(s, playerId) {
  const me = s.players[playerId];
  const base = {
    ...envelope(s),
    me: { id: playerId, role: me ? 'player' : 'spectator' },
    step: s.step,
    pageCount: s.pageCount,
    bookIndex: null,
    ownerName: null,
    offers: null,
    customWords: s.settings.customWords,
    prompt: null,
    submitted: false,
    mine: null,
    nextName: null,
    showing: null,
    summary: null,
    myBook: null,
    intactBooks: s.intactBooks,
  };
  if (!me || s.seats.indexOf(playerId) < 0) return base;
  if (s.phase.id === 'pick') {
    const k = s.seats.indexOf(playerId);
    return {
      ...base,
      offers: s.offers[playerId],
      submitted: s.books[k].pages.length > 0,
      mine: s.books[k].pages[0] ? { text: s.books[k].pages[0].text } : null,
    };
  }
  if (s.phase.id === 'draw' || s.phase.id === 'guess') {
    const b = bookInHands(s, playerId);
    const book = s.books[b];
    const prev = book.pages[s.step - 1];
    const done = book.pages.length > s.step;
    return {
      ...base,
      bookIndex: b,
      ownerName: s.players[book.ownerId].name,
      prompt:
        prev.kind === 'draw'
          ? { kind: 'drawing', drawing: prev.drawing }
          : { kind: 'text', text: prev.text ?? '???' },
      submitted: done,
      mine: done
        ? book.pages[s.step].kind === 'draw'
          ? { drawing: book.pages[s.step].drawing }
          : { text: book.pages[s.step].text }
        : null,
    };
  }
  if (s.phase.id === 'show') {
    const sh = s.showing;
    const book = s.books[sh.book];
    const myPageAt = book.pages.findIndex((p, i) => i > sh.page && p.authorId === playerId);
    return {
      ...base,
      showing: {
        book: sh.book,
        ownerId: book.ownerId,
        page: sh.page,
        pageCount: book.pages.length,
        pageKind: book.pages[sh.page].kind,
        myPageAt: myPageAt < 0 ? null : myPageAt,
      },
    };
  }
  if (s.phase.id === 'done') {
    const b = s.books[s.seats.indexOf(playerId)];
    return {
      ...base,
      summary: tvView(s).summary,
      myBook: {
        word: b.pages[0]?.text ?? '—',
        last: b.pages.length > 1 ? (b.pages[b.pages.length - 1].text ?? '???') : '—',
        intact: isIntact(b),
      },
    };
  }
  return base;
}
export const bot = {
  sampleInput(state, playerId, rng) {
    const me = state.players[playerId];
    if (!me || state.seats.indexOf(playerId) < 0) return null;
    switch (state.phase.id) {
      case 'pick':
        return state.books[state.seats.indexOf(playerId)].pages.length
          ? null
          : rng.chance(0.2) && state.settings.customWords
            ? { type: 'pickCustom', text: 'my own thing' }
            : { type: 'pick', option: rng.int(0, 2) };
      case 'draw': {
        const b = bookInHands(state, playerId);
        if (state.books[b].pages.length > state.step) return null;
        const strokes = [];
        const n = rng.int(2, 7);
        for (let i = 0; i < n; i++)
          strokes.push({ c: rng.int(0, 7), w: rng.int(0, 2), p: encodeWalk(rng, rng.int(6, 40)) });
        return { type: 'draw', strokes };
      }
      case 'guess': {
        const b = bookInHands(state, playerId);
        if (state.books[b].pages.length > state.step) return null;
        // 20 % of the time the bot "reads" the word through the chain (so some books survive)
        return {
          type: 'guess',
          text: rng.chance(0.2) ? state.books[b].pages[0].text : rng.pick(BOT_GUESSES),
        };
      }
      default:
        return null;
    }
  },
};
/** Max-ink bot: every drawing at the byte cap, to measure the largest possible state. */
const fatBot = {
  sampleInput(state, playerId, rng) {
    if (state.phase.id !== 'draw') return bot.sampleInput(state, playerId, rng);
    const me = state.players[playerId];
    if (!me || state.seats.indexOf(playerId) < 0) return null;
    const b = bookInHands(state, playerId);
    if (state.books[b].pages.length > state.step) return null;
    const strokes = [];
    let chars = 0;
    while (strokes.length < 80) {
      const p = encodeWalk(rng, 14);
      if (chars + p.length > INK_CHARS) break;
      strokes.push({ c: rng.int(0, 7), w: rng.int(0, 2), p });
      chars += p.length;
    }
    return { type: 'draw', strokes };
  },
};

// ─── Harness ───────────────────────────────────────────────────────────────────────────────────
const ESTIMATED_MINUTES = 15;
function play({ seed, players, settings, strategy, vipEvery = 0 }) {
  const rng = createRng(seed * 104729 + 3);
  const ids = Array.from({ length: players }, (_, i) => `p${i + 1}`);
  const ctx = {
    players: ids.map((id, i) => ({ id, name: `P${i + 1}`, avatarId: `a${i}`, connected: true })),
    settings,
    seed,
    now: 2_000_000,
  };
  let state = init(ctx);
  let now = ctx.now;
  const T0 = now;
  const events = [];
  const firedFor = new Set();
  let maxState = 0,
    maxView = 0,
    spoils = 0,
    routingBad = 0;
  const b = strategy === 'fat' ? fatBot : bot;
  let stuck = false,
    vipCounter = 0;
  const textsOf = (s) => {
    const t = new Set();
    for (const bk of s.books)
      for (const pg of bk.pages) if (pg.kind !== 'draw' && pg.text) t.add(pg.text);
    return t;
  };
  const apply = (e) => {
    state = reduce(state, e);
    events.push(e);
    const sz = JSON.stringify(state).length;
    if (sz > maxState) maxState = sz;
    if (events.length % 5 === 0) {
      const tv = tvView(state);
      const tvStr = JSON.stringify(tv);
      maxView = Math.max(maxView, tvStr.length);
      if (['pick', 'draw', 'guess'].includes(state.phase.id))
        for (const t of textsOf(state))
          if (tvStr.includes(JSON.stringify(t))) {
            spoils++;
            break;
          }
      if (state.phase.id === 'show' && tv.showing.pages.length !== state.showing.page + 1) spoils++;
      for (const id of [...ids, 'ghost']) {
        const cv = controllerView(state, id);
        const cvStr = JSON.stringify(cv);
        maxView = Math.max(maxView, cvStr.length);
        if (['draw', 'guess'].includes(state.phase.id) && cv.prompt) {
          const allowed = new Set();
          if (cv.prompt.kind === 'text') allowed.add(cv.prompt.text);
          if (cv.mine?.text) allowed.add(cv.mine.text);
          for (const bk of state.books)
            for (const pg of bk.pages)
              if (
                pg.kind !== 'draw' &&
                pg.text &&
                pg.authorId !== id &&
                !allowed.has(pg.text) &&
                cvStr.includes(JSON.stringify(pg.text))
              )
                spoils++;
        }
        if (state.phase.id === 'show' && cvStr.includes('"strokes"')) spoils++;
      }
    }
  };
  const phaseKey = () => `${state.phase.id}:${state.phase.startedAt}`;
  while (results(state) === null) {
    if (events.length > 100_000 || now - T0 > ESTIMATED_MINUTES * 3 * 60_000 * 4) {
      stuck = true;
      break;
    }
    let acted = false;
    if (strategy !== 'idle') {
      for (const id of ids.slice().sort(() => rng.float() - 0.5)) {
        if (results(state) !== null) break;
        const before = phaseKey();
        const input = b.sampleInput(state, id, rng);
        if (input === null) continue;
        if (!inputOk(input)) {
          routingBad++;
          continue;
        }
        const delta = strategy === 'fast' ? 100 : rng.int(200, 2500);
        const dl = state.phase.deadline;
        now = dl !== null && now + delta >= dl ? Math.max(now, dl - 1) : now + delta;
        apply({ type: 'input', now, playerId: id, input });
        acted = true;
        if (phaseKey() !== before) break;
      }
    }
    if (results(state) !== null) break;
    if (vipEvery && ++vipCounter % vipEvery === 0) {
      const action = rng.pick(['pause', 'skip', 'skip']);
      now += 500;
      apply({ type: 'vip', now, action });
      if (action === 'pause') {
        now += 4000;
        apply({ type: 'vip', now, action: 'resume' });
      }
      const who = rng.pick(ids);
      apply({ type: 'player', now, playerId: who, connected: false });
      apply({ type: 'player', now: now + 1500, playerId: who, connected: true });
      continue;
    }
    if (acted) continue;
    const dl = state.phase.deadline;
    if (dl !== null && !state.phase.paused && !firedFor.has(phaseKey())) {
      now = Math.max(now, dl);
      firedFor.add(phaseKey());
      apply({ type: 'timer', now, phaseId: state.phase.id, startedAt: state.phase.startedAt });
      continue;
    }
    stuck = true;
    break;
  }
  const N = ids.length;
  for (const bk of state.books) {
    if (bk.pages.length !== state.pageCount) routingBad++;
    const authors = bk.pages.slice(1).map((p) => p.authorId);
    if (new Set(authors).size !== authors.length) routingBad++;
    if (bk.pages[bk.pages.length - 1].kind !== 'guess') routingBad++;
  }
  for (let p = 1; p < state.pageCount; p++) {
    const authors = state.books.map((bk) => bk.pages[p].authorId);
    if (new Set(authors).size !== N) routingBad++;
  }
  const res = results(state);
  return {
    stuck,
    minutes: (now - T0) / 60_000,
    events: events.length,
    maxState,
    maxView,
    spoils,
    routingBad,
    intact: state.intactBooks,
    res,
    ctx,
    eventsLog: events,
    state,
  };
}
function replayHash(ctx, events) {
  let s = init(ctx);
  let h = 0;
  for (const e of events) {
    s = reduce(s, e);
    const str = JSON.stringify(s);
    for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  }
  return h;
}
function fuzz(runs) {
  let bad = 0;
  const rng = createRng(99);
  for (let k = 0; k < runs; k++) {
    const ctx = {
      players: ['p1', 'p2', 'p3'].map((id) => ({ id, name: id, avatarId: 'a', connected: true })),
      settings: {},
      seed: k,
      now: 5,
    };
    let s = init(ctx);
    for (let i = 0; i < 300; i++) {
      const now = 5 + i * 1000;
      const kind = rng.int(0, 3);
      const inputs = [
        { type: 'pick', option: rng.int(0, 2) },
        { type: 'pickCustom', text: 'x' },
        { type: 'guess', text: 'y' },
        { type: 'draw', strokes: [{ c: 1, w: 1, p: encodeWalk(rng, 5) }] },
      ];
      const e =
        kind === 0
          ? {
              type: 'input',
              now,
              playerId: rng.pick(['p1', 'p2', 'p3', 'ghost', '']),
              input: rng.pick(inputs),
            }
          : kind === 1
            ? {
                type: 'timer',
                now,
                phaseId: rng.pick(PHASES),
                startedAt: rng.chance(0.5) ? s.phase.startedAt : 1,
              }
            : kind === 2
              ? {
                  type: 'player',
                  now,
                  playerId: rng.pick(['p1', 'ghost']),
                  connected: rng.chance(0.5),
                }
              : { type: 'vip', now, action: rng.pick(['skip', 'pause', 'resume', 'end']) };
      try {
        const n = reduce(s, e);
        JSON.stringify(n);
        tvView(n);
        controllerView(n, 'p1');
        controllerView(n, 'ghost');
        bot.sampleInput(n, 'p1', rng);
        bot.sampleInput(n, 'ghost', rng);
        s = n;
      } catch (err) {
        bad++;
        if (bad < 4) console.error('fuzz threw:', err.message, JSON.stringify(e).slice(0, 120));
      }
    }
  }
  return bad;
}

// ─── Suite ─────────────────────────────────────────────────────────────────────────────────────
const quick = process.argv[2] === 'quick';
const log = (s) => console.log(s);
{
  const rng = createRng(1);
  let bad = 0;
  for (let k = 0; k < 500; k++) {
    const pts = [];
    const n = rng.int(1, 60);
    for (let i = 0; i < n; i++) pts.push([rng.int(0, 255), rng.int(0, 255)]);
    const p = encodePoints(pts);
    if (!STROKE_RE.test(p) || p.length % 4 !== 0) bad++;
    const back = decodePoints(p);
    if (JSON.stringify(back) !== JSON.stringify(pts)) bad++;
  }
  log(
    `encoding: 500 random stroke round-trips → ${bad === 0 ? 'all pass' : bad + ' failures'}; ${INK_CHARS} chars ≈ ${Math.floor(((INK_CHARS / 4) * 3) / 2)} points`,
  );
}
{
  const cases = [
    ['The Snail Race!', 'a snail race', true],
    ['Hiccups', 'hiccups', true],
    ['royal cat', 'a cat wearing a crown', false],
    ['toaster ', 'Toaster', true],
    ['an egg', 'egg', true],
  ];
  const bad = cases.filter(([a, b, ok]) => (norm(a) === norm(b)) !== ok).length;
  log(`norm(): ${cases.length - bad}/${cases.length} cases pass`);
}
{
  let bad = 0,
    total = 0;
  for (let N = 3; N <= 10; N++)
    for (let D = 1; D <= 4; D++) {
      total++;
      const r = play({
        seed: N * 10 + D,
        players: N,
        settings: { drawings: D, drawSeconds: 30, guessSeconds: 15 },
        strategy: 'fast',
      });
      if (r.routingBad || r.stuck) {
        bad++;
        console.error('routing', N, D, r.routingBad, r.stuck);
      }
    }
  log(
    `routing: ${total - bad}/${total} (N 3–10 × D 1–4) — every player one page per step, no book touched twice, books end with a guess`,
  );
}
{
  const bad = fuzz(quick ? 20 : 100);
  log(
    `fuzz: ${quick ? 20 : 100} × 300 arbitrary events → ${bad === 0 ? 'reduce/views/bot never threw' : bad + ' throws'}`,
  );
}
const configs = [
  { name: 'defaults (D3, 60/30 s)', settings: { drawings: 3, drawSeconds: 60, guessSeconds: 30 } },
  { name: 'variant A (D1)', settings: { drawings: 1, drawSeconds: 60, guessSeconds: 30 } },
  {
    name: 'variant B (D4, 30/15 s, no custom)',
    settings: { drawings: 4, drawSeconds: 30, guessSeconds: 15, customWords: false, spicy: true },
  },
  { name: 'slowest (D4, 120/60 s)', settings: { drawings: 4, drawSeconds: 120, guessSeconds: 60 } },
];
let totalRuns = 0,
  allStuck = 0,
  allSpoils = 0,
  allRouting = 0,
  maxStateAll = 0,
  maxViewAll = 0,
  maxStateFat = 0;
for (const cfg of configs)
  for (const strategy of ['random', 'fast', 'idle', 'fat', 'vip']) {
    const runs = strategy === 'idle' ? 6 : quick ? 6 : 30;
    const mins = [];
    let stuck = 0,
      spoils = 0,
      routing = 0,
      intact = 0;
    for (let k = 0; k < runs; k++) {
      const players = [3, 4, 5, 6, 8, 10][k % 6];
      const r = play({
        seed: k + 11,
        players,
        settings: cfg.settings,
        strategy: strategy === 'vip' ? 'random' : strategy,
        vipEvery: strategy === 'vip' ? 12 : 0,
      });
      totalRuns++;
      if (r.stuck) stuck++;
      spoils += r.spoils;
      routing += r.routingBad;
      intact += r.intact;
      mins.push(r.minutes);
      maxStateAll = Math.max(maxStateAll, r.maxState);
      maxViewAll = Math.max(maxViewAll, r.maxView);
      if (strategy === 'fat') maxStateFat = Math.max(maxStateFat, r.maxState);
      if (r.res) {
        const ids = Object.keys(r.state.players);
        if (ids.some((id) => r.res.scores[id] !== 0) || r.res.winnerIds.length !== ids.length)
          routing++;
      }
      if (
        strategy === 'random' &&
        k < 2 &&
        replayHash(r.ctx, r.eventsLog) !== replayHash(r.ctx, r.eventsLog)
      )
        routing++;
    }
    const sorted = [...mins].sort((a, b) => a - b);
    const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))].toFixed(1);
    log(
      `${cfg.name} · ${strategy.padEnd(6)} · ${runs} runs (3–10 players): minutes median ${q(0.5)} / max ${sorted[sorted.length - 1].toFixed(1)} (bound ${ESTIMATED_MINUTES * 3}) · intact books avg ${(intact / runs).toFixed(1)} · stuck ${stuck} · spoils ${spoils} · routing/results violations ${routing}`,
    );
    allStuck += stuck;
    allSpoils += spoils;
    allRouting += routing;
  }
log(
  `sizes: largest state ${(maxStateAll / 1024).toFixed(0)} KB (fat bot, every drawing at the ink cap: ${(maxStateFat / 1024).toFixed(0)} KB; cap 256) · largest view ${(maxViewAll / 1024).toFixed(1)} KB`,
);
log(
  `TOTAL: ${totalRuns} runs · stuck ${allStuck} · spoils ${allSpoils} · violations ${allRouting}`,
);

// Design simulation for idea 001 — Bingo (docs/game-ideas/001-bingo.html §7). A headless model of the
// reducer exactly as specified, driven by contract-shaped events (input / timer / player / vip) and
// the game's own bot, plus an idle and a hostile "spam" strategy. Checks termination within
// estimatedMinutes × 3, determinism, state/view sizes and the rule invariants. No dependencies.
//
//   node docs/game-ideas/_tools/sim-001-bingo.mjs            # full suite (~10 s)
//   node docs/game-ideas/_tools/sim-001-bingo.mjs quick      # fewer runs
//
// This file is a reference for the implementer, not the implementation: the real game must be
// written against @partybox/game-sdk. Any divergence between this file and §7 is a doc bug.

// ─── PRNG (same shape as shared/rng: {seed, step}, pure) ───────────────────────────────────────
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
/** Mutable rng for bots (never stored in state). */
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
    pick: (arr) =>
      arr[
        (() => {
          const [v, n] = nextInt(st, 0, arr.length - 1);
          st = n;
          return v;
        })()
      ],
    chance: (p) => {
      const [v, n] = nextFloat(st);
      st = n;
      return v < p;
    },
  };
}

// ─── SDK helpers (timer.ts / scoring.ts equivalents) ───────────────────────────────────────────
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
function rank(scores) {
  const rows = Object.entries(scores)
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
  return rows;
}
function buildResults(s, scores) {
  const complete = {};
  for (const id of Object.keys(s.players))
    complete[id] = Number.isFinite(scores[id]) ? scores[id] : 0;
  const ranking = rank(complete);
  return {
    scores: complete,
    ranking,
    winnerIds: ranking.filter((r) => r.rank === 1).map((r) => r.playerId),
    awards: [],
  };
}

// ─── The game (§6 + §7) ────────────────────────────────────────────────────────────────────────
export const PHASES = ['intro', 'play', 'check', 'bingo', 'scoreboard', 'done'];
const INTRO_MS = 5_000,
  CHECK_MS = 5_000,
  BINGO_MS = 10_000,
  SCOREBOARD_MS = 6_000,
  DECK = 75;
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const LINES = [];
for (let r = 0; r < 5; r++) LINES.push([0, 1, 2, 3, 4].map((c) => r * 5 + c));
for (let c = 0; c < 5; c++) LINES.push([0, 1, 2, 3, 4].map((r) => r * 5 + c));
LINES.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
export function completions(pattern) {
  switch (pattern) {
    case 'line':
      return LINES;
    case 'corners':
      return [[0, 4, 20, 24]];
    case 'x':
      return [[0, 6, 12, 18, 24, 4, 8, 16, 20]];
    case 'blackout':
      return [range(0, 24)];
    default:
      throw new Error('pattern');
  }
}
export function dealCard(rng) {
  const card = new Array(25).fill(0);
  let r = rng;
  for (let c = 0; c < 5; c++) {
    const [col, r2] = shuffle(r, range(c * 15 + 1, c * 15 + 15));
    r = r2;
    for (let row = 0; row < 5; row++) card[row * 5 + c] = col[row];
  }
  card[12] = 0;
  return [card, r];
}
export function evaluate(playerId, card, daubs, called, pattern) {
  const d = new Set([...daubs, 12]);
  const c = new Set([...called, 0]);
  const red = card.map((n, i) => i).filter((i) => d.has(i) && !c.has(card[i]));
  let best = null,
    bestScore = -1;
  for (const cells of completions(pattern)) {
    const green = cells.filter((i) => d.has(i) && c.has(card[i]));
    if (green.length > bestScore) {
      bestScore = green.length;
      best = { cells, green };
    }
  }
  const missing = best.cells.filter((i) => !d.has(i));
  return {
    playerId,
    cells: best.cells,
    green: best.green,
    red,
    missing,
    valid: best.green.length === best.cells.length,
  };
}
const readSettings = (s) => ({
  rounds: Math.min(5, Math.max(1, Number(s.rounds ?? 3))),
  pattern: ['line', 'corners', 'x', 'blackout'].includes(s.pattern) ? s.pattern : 'line',
  callSeconds: Math.min(12, Math.max(3, Number(s.callSeconds ?? 6))),
  spicy: Boolean(s.spicy ?? false),
});
export function init(ctx) {
  const players = {};
  for (const p of ctx.players) players[p.id] = p;
  const wins = {};
  for (const p of ctx.players) wins[p.id] = 0;
  const s = {
    phase: { id: 'intro', startedAt: ctx.now, deadline: null },
    rng: seedRng(ctx.seed),
    players,
    settings: readSettings(ctx.settings),
    wins,
    history: [],
    round: null,
  };
  return enterIntro(s, 1, ctx.now);
}
function enterIntro(s, number, now) {
  let rng = s.rng;
  const [deck, r1] = shuffle(rng, range(1, 75));
  rng = r1;
  const cards = {},
    daubs = {};
  for (const id of Object.keys(s.players).sort()) {
    const [card, r2] = dealCard(rng);
    cards[id] = card;
    daubs[id] = [];
    rng = r2;
  }
  const round = {
    number,
    deck,
    drawn: 0,
    cards,
    daubs,
    claim: null,
    waitForCall: {},
    winnerId: null,
  };
  return enterPhase({ ...s, rng, round }, 'intro', now, INTRO_MS);
}
function nextCall(s, now) {
  const r = s.round;
  return enterPhase(
    { ...s, round: { ...r, drawn: r.drawn + 1, claim: null } },
    'play',
    now,
    s.settings.callSeconds * 1000,
  );
}
const nextCallOrEnd = (s, now) =>
  s.round.drawn >= DECK ? enterBingo(s, now, null, null) : nextCall(s, now);
function toggleDaub(s, p, i) {
  const r = s.round;
  if (i === 12) return s;
  const has = r.daubs[p].includes(i);
  const mine = has ? r.daubs[p].filter((x) => x !== i) : [...r.daubs[p], i].sort((a, b) => a - b);
  return { ...s, round: { ...r, daubs: { ...r.daubs, [p]: mine } } };
}
function reducePlay(s, e) {
  const r = s.round;
  if (e.type === 'input') {
    const p = e.playerId;
    if (!s.players[p] || !r.cards[p]) return s;
    if (e.input.type === 'daub') return toggleDaub(s, p, e.input.index);
    if (e.input.type !== 'bingo') return s;
    if (r.drawn < (r.waitForCall[p] ?? 0)) return s;
    const claim = evaluate(p, r.cards[p], r.daubs[p], r.deck.slice(0, r.drawn), s.settings.pattern);
    if (claim.valid) return enterBingo(s, e.now, p, claim);
    const cleaned = r.daubs[p].filter((i) => !claim.red.includes(i));
    const round = {
      ...r,
      claim,
      daubs: { ...r.daubs, [p]: cleaned },
      waitForCall: { ...r.waitForCall, [p]: r.drawn + 1 },
    };
    return enterPhase({ ...s, round }, 'check', e.now, CHECK_MS);
  }
  if (isTimerFor(s, e)) return nextCallOrEnd(s, e.now);
  return s;
}
function reduceCheck(s, e) {
  if (
    e.type === 'input' &&
    e.input.type === 'daub' &&
    s.players[e.playerId] &&
    s.round.cards[e.playerId]
  )
    return toggleDaub(s, e.playerId, e.input.index);
  if (isTimerFor(s, e)) return nextCallOrEnd(s, e.now);
  return s;
}
function enterBingo(s, now, winnerId, claim) {
  const wins = winnerId ? { ...s.wins, [winnerId]: (s.wins[winnerId] ?? 0) + 1 } : s.wins;
  const history = [...s.history, { round: s.round.number, winnerId, calls: s.round.drawn }];
  return enterPhase(
    { ...s, wins, history, round: { ...s.round, winnerId, claim } },
    'bingo',
    now,
    BINGO_MS,
  );
}
const afterBingo = (s, now) =>
  s.round.number < s.settings.rounds
    ? enterPhase(s, 'scoreboard', now, SCOREBOARD_MS)
    : enterDone(s, now);
const enterDone = (s, now) => enterPhase(s, 'done', now, null);
function skipCurrent(s, now) {
  switch (s.phase.id) {
    case 'intro':
      return nextCall(s, now);
    case 'play':
      return enterBingo(s, now, null, null);
    case 'check':
      return nextCallOrEnd(s, now);
    case 'bingo':
      return afterBingo(s, now);
    case 'scoreboard':
      return enterIntro(s, s.round.number + 1, now);
    default:
      return s;
  }
}
export function reduce(state, event) {
  if (event.type === 'player') return setConnected(state, event);
  const vip = applyVip(state, event, { skip: skipCurrent, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state;
  switch (state.phase.id) {
    case 'intro':
      return isTimerFor(state, event) ? nextCall(state, event.now) : state;
    case 'play':
      return reducePlay(state, event);
    case 'check':
      return reduceCheck(state, event);
    case 'bingo':
      return isTimerFor(state, event) ? afterBingo(state, event.now) : state;
    case 'scoreboard':
      return isTimerFor(state, event)
        ? enterIntro(state, state.round.number + 1, event.now)
        : state;
    default:
      return state;
  }
}
export const results = (s) => (s.phase.id === 'done' ? buildResults(s, s.wins) : null);
const LETTER = (n) => 'BINGO'[Math.floor((n - 1) / 15)];
const callView = (n) => (n ? { number: n, letter: LETTER(n), call: 'phrase' } : null);
function claimView(s) {
  const c = s.round.claim;
  if (!c) return null;
  return {
    ...c,
    name: s.players[c.playerId].name,
    card: s.round.cards[c.playerId],
    daubs: s.round.daubs[c.playerId],
  };
}
export function tvView(s) {
  const r = s.round;
  const called = r.deck.slice(0, r.drawn);
  const inRound = ['play', 'check', 'bingo'].includes(s.phase.id);
  return {
    gameId: 'bingo',
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
    round: r.number,
    totalRounds: s.settings.rounds,
    pattern: s.settings.pattern,
    patternCells: completions(s.settings.pattern)[0],
    current: inRound ? callView(called[called.length - 1]) : null,
    previous: inRound ? called.slice(-4, -1).reverse().map(callView) : [],
    callIndex: r.drawn,
    claim: s.phase.id === 'check' || s.phase.id === 'bingo' ? claimView(s) : null,
    winnerId: r.winnerId,
    standings:
      s.phase.id === 'scoreboard' || s.phase.id === 'done'
        ? rank(s.wins).map((x) => ({ playerId: x.playerId, wins: x.score, rank: x.rank }))
        : null,
  };
}
export function controllerView(s, playerId) {
  const tv = tvView(s);
  const r = s.round;
  const me = s.players[playerId];
  return {
    ...tv,
    me: { id: playerId, role: me ? 'player' : 'spectator' },
    called: r.deck.slice(0, r.drawn),
    card: me ? r.cards[playerId] : null,
    daubs: me ? r.daubs[playerId] : [],
    canClaim: !!me && s.phase.id === 'play' && r.drawn >= (r.waitForCall[playerId] ?? 0),
  };
}
export const bot = {
  sampleInput(state, playerId, rng) {
    const r = state.round;
    const card = r.cards[playerId];
    if (!state.players[playerId] || !card) return null;
    if (state.phase.id !== 'play' && state.phase.id !== 'check') return null;
    const called = new Set(r.deck.slice(0, r.drawn));
    const daubs = new Set(r.daubs[playerId]);
    const looksDone = completions(state.settings.pattern).some((cells) =>
      cells.every((i) => i === 12 || daubs.has(i)),
    );
    if (looksDone && state.phase.id === 'play' && r.drawn >= (r.waitForCall[playerId] ?? 0))
      return { type: 'bingo' };
    const todo = card
      .map((n, i) => i)
      .filter((i) => i !== 12 && called.has(card[i]) && !daubs.has(i));
    if (todo.length && rng.chance(0.7)) return { type: 'daub', index: rng.pick(todo) };
    if (!looksDone && rng.chance(0.05)) return { type: 'daub', index: rng.int(0, 24) };
    return null;
  },
};
/** Hostile: daubs random squares and presses BINGO! whenever allowed. */
const spamBot = {
  sampleInput(state, playerId, rng) {
    const r = state.round;
    if (!state.players[playerId] || !r.cards[playerId]) return null;
    if (!rng.chance(0.5)) return null; // a bot that ALWAYS acts starves the timer in the contract harness (play.ts caps time at deadline-1 while inputs keep coming)
    if (state.phase.id === 'play' && r.drawn >= (r.waitForCall[playerId] ?? 0) && rng.chance(0.6))
      return { type: 'bingo' };
    if (state.phase.id === 'play' || state.phase.id === 'check')
      return { type: 'daub', index: rng.int(0, 24) };
    return null;
  },
};
const inputOk = (i) =>
  (i.type === 'daub' && Number.isInteger(i.index) && i.index >= 0 && i.index <= 24) ||
  i.type === 'bingo';

// ─── Harness (mirrors game-sdk contract-tests/play.ts) ─────────────────────────────────────────
const ESTIMATED_MINUTES = 10;
function play({ seed, players, settings, strategy, vipEvery = 0 }) {
  const rng = createRng(seed * 7919 + 17);
  const ids = Array.from({ length: players }, (_, i) => `p${i + 1}`);
  const ctx = {
    players: ids.map((id, i) => ({ id, name: `P${i + 1}`, avatarId: `a${i}`, connected: true })),
    settings,
    seed,
    now: 1_000_000,
  };
  let state = init(ctx);
  let now = ctx.now;
  const T0 = now;
  const events = [];
  const firedFor = new Set();
  let checks = 0,
    validClaims = 0,
    invalidClaims = 0,
    maxState = 0,
    maxView = 0,
    ignoredBingo = 0;
  const invariants = [];
  const b = strategy === 'spam' ? spamBot : bot;
  const apply = (e) => {
    const before = state;
    state = reduce(state, e);
    events.push(e);
    if (e.type === 'input' && e.input.type === 'bingo') {
      if (state.phase.id === 'check' && before.phase.id === 'play') {
        checks++;
        invalidClaims++;
      } else if (state.phase.id === 'bingo' && before.phase.id !== 'bingo') validClaims++;
      else ignoredBingo++;
    }
    // invariants after every event
    const r = state.round;
    if (state.phase.id === 'bingo' && r.winnerId) {
      const c = r.claim;
      if (!c || !c.valid || c.playerId !== r.winnerId)
        invariants.push('bingo phase without a valid claim for the winner');
      const called = new Set(r.deck.slice(0, r.drawn));
      if (
        !c.cells.every(
          (i) =>
            i === 12 || (r.daubs[c.playerId].includes(i) && called.has(r.cards[c.playerId][i])),
        )
      )
        invariants.push('winner cells not all daubed+called');
    }
    if (state.phase.id === 'check' && before.phase.id === 'play') {
      // on entry only: daubing during a check is allowed
      const c = r.claim;
      if (!c || c.valid) invariants.push('check phase with a valid/missing claim');
      const called = new Set(r.deck.slice(0, r.drawn));
      for (const i of c.red)
        if (called.has(r.cards[c.playerId][i])) invariants.push('red cell was called');
      for (const i of c.red)
        if (r.daubs[c.playerId].includes(i)) invariants.push('red cell not wiped');
    }
    for (const id of ids)
      for (const i of r.daubs[id]) if (i === 12) invariants.push('FREE in daubs');
    if (r.drawn > DECK) invariants.push('drawn > 75');
    const sz = JSON.stringify(state).length;
    if (sz > maxState) maxState = sz;
    if (events.length % 7 === 0) {
      const v = JSON.stringify(tvView(state)).length;
      const cv = Math.max(
        ...ids.map((id) => JSON.stringify(controllerView(state, id)).length),
        JSON.stringify(controllerView(state, 'ghost')).length,
      );
      maxView = Math.max(maxView, v, cv);
    }
  };
  const phaseKey = () => `${state.phase.id}:${state.phase.startedAt}`;
  let stuck = false;
  let vipCounter = 0;
  while (results(state) === null) {
    if (events.length > 200_000 || now - T0 > ESTIMATED_MINUTES * 3 * 60_000 * 4) {
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
          invariants.push('bot produced invalid input');
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
      const action = rng.pick(['pause', 'resume', 'skip']);
      now += 500;
      apply({ type: 'vip', now, action });
      if (action === 'pause') {
        now += 3000;
        apply({ type: 'vip', now, action: 'resume' });
      }
      // occasional disconnect / reconnect
      const who = rng.pick(ids);
      apply({ type: 'player', now, playerId: who, connected: false });
      apply({ type: 'player', now: now + 1000, playerId: who, connected: true });
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
  const res = results(state);
  if (res) {
    for (const id of ids)
      if (!(id in res.scores) || !Number.isFinite(res.scores[id]))
        invariants.push('results missing player');
  }
  return {
    stuck,
    minutes: (now - T0) / 60_000,
    events: events.length,
    checks,
    validClaims,
    invalidClaims,
    ignoredBingo,
    maxState,
    maxView,
    invariants,
    history: state.history,
    state,
    eventsLog: events,
    ctx,
  };
}

// ─── Determinism: replay the same events twice, compare hashes ─────────────────────────────────
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

// ─── Fuzz: every event type in every phase, from spectators / unknown ids / stale timers ──────
function fuzz(runs) {
  let bad = 0;
  const rng = createRng(4242);
  for (let k = 0; k < runs; k++) {
    const ctx = {
      players: [
        { id: 'p1', name: 'A', avatarId: 'a', connected: true },
        { id: 'p2', name: 'B', avatarId: 'b', connected: true },
      ],
      settings: { rounds: 1 },
      seed: k,
      now: 5,
    };
    let s = init(ctx);
    for (let i = 0; i < 300; i++) {
      const kind = rng.int(0, 3);
      const now = 5 + i * 1000;
      const e =
        kind === 0
          ? {
              type: 'input',
              now,
              playerId: rng.pick(['p1', 'p2', 'ghost', '']),
              input: rng.chance(0.5) ? { type: 'bingo' } : { type: 'daub', index: rng.int(0, 24) },
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
                  playerId: rng.pick(['p1', 'p2', 'ghost']),
                  connected: rng.chance(0.5),
                }
              : { type: 'vip', now, action: rng.pick(['skip', 'pause', 'resume', 'end']) };
      try {
        const n = reduce(s, e);
        JSON.stringify(n);
        tvView(n);
        controllerView(n, 'p1');
        controllerView(n, 'ghost');
        controllerView(n, '');
        bot.sampleInput(n, 'p1', rng);
        bot.sampleInput(n, 'ghost', rng);
        s = n;
      } catch (err) {
        bad++;
        if (bad < 4) console.error('fuzz threw:', err.message, JSON.stringify(e));
      }
    }
  }
  return bad;
}

// ─── Suite ─────────────────────────────────────────────────────────────────────────────────────
const quick = process.argv[2] === 'quick';
const RUNS = quick ? 40 : 160;
const out = [];
const log = (s) => {
  console.log(s);
  out.push(s);
};

// 1. evaluate() unit checks
{
  const card = [
    3, 22, 44, 47, 62, 11, 17, 31, 59, 74, 7, 29, 0, 52, 66, 14, 16, 38, 46, 70, 1, 25, 40, 55, 61,
  ];
  const called = [7, 52, 29, 66, 44, 59, 3];
  const ok = evaluate('p', card, [10, 11, 13, 14], called, 'line');
  const redOne = evaluate('p', card, [10, 11, 13, 14, 20], called, 'line'); // 1 (idx 20) never called → red, still valid
  const missing = evaluate('p', card, [10, 11, 13], called, 'line'); // 66 called but not daubed → invalid, missing
  const uncalled = evaluate('p', card, [0, 5, 10, 15, 20], called, 'line'); // column B: 3 called, 11/7? 7 called; 14, 1 not → red, invalid
  const blackout = evaluate(
    'p',
    card,
    range(0, 24).filter((i) => i !== 12),
    range(1, 75),
    'blackout',
  );
  const cornersFail = evaluate('p', card, [0, 4, 20, 24], called, 'corners');
  const checks = [
    ['valid line', ok.valid && ok.red.length === 0 && ok.missing.length === 0],
    ['stray red outside a valid line is still valid', redOne.valid && redOne.red.length === 1],
    [
      'un-daubed called square → missing, invalid',
      !missing.valid && missing.missing.length === 1 && missing.missing[0] === 14,
    ],
    ['uncalled daubs → red, invalid', !uncalled.valid && uncalled.red.length === 3],
    ['blackout with everything called', blackout.valid],
    ['corners with uncalled numbers', !cornersFail.valid && cornersFail.red.length === 3],
  ];
  const fails = checks.filter(([, v]) => !v);
  log(
    `evaluate(): ${checks.length - fails.length}/${checks.length} unit checks pass${fails.length ? ' — FAILED: ' + fails.map(([n]) => n).join(', ') : ''}`,
  );
}
// 2. dealCard column ranges
{
  let bad = 0;
  for (let k = 0; k < 2000; k++) {
    const [card] = dealCard(seedRng(k));
    for (let i = 0; i < 25; i++) {
      const c = i % 5;
      if (i === 12) {
        if (card[i] !== 0) bad++;
        continue;
      }
      if (card[i] < c * 15 + 1 || card[i] > c * 15 + 15) bad++;
    }
    for (let c = 0; c < 5; c++) {
      const col = [0, 1, 2, 3, 4].map((r) => card[r * 5 + c]).filter((n) => n);
      if (new Set(col).size !== col.length) bad++;
    }
  }
  log(
    `dealCard(): 2000 cards, column ranges + uniqueness + FREE → ${bad === 0 ? 'all pass' : bad + ' violations'}`,
  );
}
// 3. fuzz
{
  const bad = fuzz(quick ? 20 : 100);
  log(
    `fuzz: ${quick ? 20 : 100} × 300 arbitrary events (spectators, unknown ids, stale timers, VIP) → ${bad === 0 ? 'reduce/views/bot never threw' : bad + ' throws'}`,
  );
}
// 4. termination / durations per strategy and settings
const configs = [
  {
    name: 'defaults (3 line rounds, 6 s)',
    settings: { rounds: 3, pattern: 'line', callSeconds: 6 },
  },
  {
    name: 'variant A (1 blackout round, 3 s)',
    settings: { rounds: 1, pattern: 'blackout', callSeconds: 3 },
  },
  {
    name: 'variant B (2 corners rounds, 3 s)',
    settings: { rounds: 2, pattern: 'corners', callSeconds: 3 },
  },
  { name: 'x pattern (3 rounds, 6 s)', settings: { rounds: 3, pattern: 'x', callSeconds: 6 } },
];
let allStuck = 0,
  allInv = 0,
  maxStateAll = 0,
  maxViewAll = 0;
for (const cfg of configs) {
  for (const strategy of ['random', 'fast', 'idle', 'spam', 'vip']) {
    const mins = [],
      evs = [],
      checks = [],
      valid = [],
      noWinner = [];
    let stuck = 0,
      inv = 0;
    const runs = strategy === 'idle' ? 6 : quick ? 12 : RUNS / 4;
    for (let k = 0; k < runs; k++) {
      const players = [1, 2, 4, 6, 8, 12, 16][k % 7];
      const r = play({
        seed: k + 1,
        players,
        settings: cfg.settings,
        strategy: strategy === 'vip' ? 'random' : strategy,
        vipEvery: strategy === 'vip' ? 25 : 0,
      });
      if (r.stuck) stuck++;
      inv += r.invariants.length;
      if (r.invariants.length && inv <= 3)
        console.error('invariant:', r.invariants.slice(0, 3), cfg.name, strategy, players, k);
      mins.push(r.minutes);
      evs.push(r.events);
      checks.push(r.checks);
      valid.push(r.validClaims);
      noWinner.push(r.history.filter((h) => !h.winnerId).length);
      maxStateAll = Math.max(maxStateAll, r.maxState);
      maxViewAll = Math.max(maxViewAll, r.maxView);
      if (strategy === 'random' && k < 3) {
        const h1 = replayHash(r.ctx, r.eventsLog),
          h2 = replayHash(r.ctx, r.eventsLog);
        if (h1 !== h2) {
          inv++;
          console.error('non-deterministic replay');
        }
      }
    }
    const sorted = [...mins].sort((a, b) => a - b);
    const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))].toFixed(1);
    const avg = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
    log(
      `${cfg.name} · ${strategy.padEnd(6)} · ${runs} runs (1–16 players): minutes median ${q(0.5)} / p90 ${q(0.9)} / max ${sorted[sorted.length - 1].toFixed(1)} (bound ${ESTIMATED_MINUTES * 3}) · checks/game avg ${avg(checks)} · valid bingos avg ${avg(valid)} · rounds with no winner avg ${avg(noWinner)} · stuck ${stuck} · invariant violations ${inv}`,
    );
    allStuck += stuck;
    allInv += inv;
  }
}
log(
  `sizes: largest state ${(maxStateAll / 1024).toFixed(1)} KB (cap 256) · largest view ${(maxViewAll / 1024).toFixed(1)} KB`,
);
log(`TOTAL: stuck ${allStuck} · invariant violations ${allInv}`);
if (process.argv[2] === 'json') console.log(JSON.stringify(out));

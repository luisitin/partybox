// Idea 001 — Bingo. Built into 001-bingo.html by _tools/build.mjs.
import {
  T,
  TV,
  PH,
  tv,
  phone,
  text,
  lines,
  rect,
  circle,
  line,
  avatar,
  chip,
  chipRow,
  button,
  tag,
  callout,
  bar,
  svg,
  node,
  arrow,
} from '../_tools/svg.mjs';

export const meta = {
  title: 'Bingo',
  pitch:
    'The TV is the caller, your phone is your card. Daub fast, shout first — and pay for a bogus bingo.',
  players: { min: 1, max: 16, sweet: '5–12' },
  duration: '≈10 min (3 rounds)',
  rounds: '3 by default (1–5); pattern escalates line → X → blackout',
  interaction: ['tap', 'timing'],
  tone: ['cozy', 'chaotic'],
  contentRating: 'Family by default; optional "cheeky caller" pack (PG-13 innuendo, no profanity)',
  difficulty: 'M',
  status: 'idea',
  version: '0.1.0',
  date: '2026-09-15',
  axes: {
    interaction: ['tap', 'timing'],
    players: ['4–8', '9–16'],
    duration: ['5–10', '10–20'],
    structure: 'free-for-all',
    skill: ['speed', 'luck'],
    tone: ['cozy', 'chaotic'],
  },
};

// ─── Sample data used by every mockup (round 1, line pattern, call 13 of the deck) ──────────────
const PLAYERS = [
  { name: 'Ana', i: 0 },
  { name: 'Bo', i: 1 },
  { name: 'Cy', i: 2 },
  { name: 'Dee', i: 3 },
  { name: 'Eli', i: 4 },
  { name: 'Fay', i: 5 },
];
// Ana's card, row-major, index 12 = FREE (0).
const CARD = [
  3, 22, 44, 47, 62, 11, 17, 31, 59, 74, 7, 29, 0, 52, 66, 14, 16, 38, 46, 70, 1, 25, 40, 55, 61,
];
const CALLED = [7, 52, 29, 13, 61, 22, 3, 70, 47, 19, 44, 59, 38]; // 13 calls, 1 number each
const DAUBED = new Set([12, 10, 13, 11, 1, 0, 3, 17]); // Ana found 7,52,29,22,3,47,38 (+FREE); missed 44 and 59
const WIN_LINE = [10, 11, 12, 13, 14];
const LETTER = (n) => 'BINGO'[Math.floor((n - 1) / 15)];
const CALLS = {
  38: 'Christmas cake',
  66: 'Clickety click',
  59: 'Brighton line',
  44: 'All the fours',
  19: 'Goodbye teens',
};

// ─── Drawing helpers specific to this game ───────────────────────────────────────────────────────
/** 5x5 card. cell = size px; opts: daubed Set, called Set (assist ring), winLine [], dim. */
function cardGrid(x, y, cell, gap, card, o = {}) {
  const {
    daubed = new Set(),
    called = null,
    winLine = null,
    dim = false,
    letters = true,
    numSize = cell * 0.36,
  } = o;
  let out = `<g opacity="${dim ? 0.5 : 1}">`;
  if (letters) {
    'BINGO'.split('').forEach((L, c) => {
      out += text(x + c * (cell + gap) + cell / 2, y - 8, L, {
        size: cell * 0.34,
        weight: 800,
        fill: T.accent2,
        anchor: 'middle',
      });
    });
  }
  for (let i = 0; i < 25; i++) {
    const r = Math.floor(i / 5);
    const c = i % 5;
    const cx = x + c * (cell + gap);
    const cy = y + r * (cell + gap);
    const n = card[i];
    const isFree = n === 0;
    const isDaub = daubed.has(i) || isFree;
    const onLine = winLine && winLine.includes(i);
    const isCalled = called && called.has(n);
    out += rect(cx, cy, cell, cell, {
      fill: onLine ? T.accent : isDaub ? T.accent3 : T.surface,
      r: cell * 0.18,
      stroke: !isDaub && isCalled ? T.accent2 : onLine ? T.accent2 : null,
      sw: 3,
    });
    if (isDaub && !onLine)
      out += circle(cx + cell / 2, cy + cell / 2, cell * 0.36, { fill: T.bg, opacity: 0.18 });
    out += text(cx + cell / 2, cy + cell / 2 + numSize * 0.36, isFree ? 'FREE' : String(n), {
      size: isFree ? numSize * 0.7 : numSize,
      weight: 800,
      fill: isDaub || onLine ? T.bg : T.text,
      anchor: 'middle',
    });
  }
  out += '</g>';
  return out;
}

/** The 75-number call board on the TV: 5 rows (B..O) × 15. */
function board(x, y, cell, gap, called, current) {
  let out = '';
  const set = new Set(called);
  for (let row = 0; row < 5; row++) {
    out += text(x - 14, y + row * (cell + gap) + cell * 0.72, 'BINGO'[row], {
      size: cell * 0.6,
      weight: 800,
      fill: T.accent2,
      anchor: 'end',
    });
    for (let k = 0; k < 15; k++) {
      const n = row * 15 + k + 1;
      const cx = x + k * (cell + gap);
      const cy = y + row * (cell + gap);
      const isCur = current.includes(n);
      const isCalled = set.has(n);
      out += rect(cx, cy, cell, cell, {
        fill: isCur ? T.accent2 : isCalled ? T.accent : T.surface,
        r: 6,
        stroke: isCur ? T.text : null,
        sw: 2,
      });
      out += text(cx + cell / 2, cy + cell * 0.68, String(n), {
        size: cell * 0.46,
        weight: isCalled || isCur ? 800 : 500,
        fill: isCalled || isCur ? T.bg : T.muted,
        anchor: 'middle',
      });
    }
  }
  return out;
}

/** Small pattern icon (5x5 dots) for a pattern. */
function patternIcon(x, y, cell, pattern) {
  const on = new Set(patternCells(pattern));
  let out = '';
  for (let i = 0; i < 25; i++) {
    const r = Math.floor(i / 5);
    const c = i % 5;
    out += rect(x + c * (cell + 2), y + r * (cell + 2), cell, cell, {
      fill: on.has(i) ? T.accent2 : T.surface2,
      r: 2,
    });
  }
  return out;
}
function patternCells(p) {
  if (p === 'line') return [10, 11, 12, 13, 14];
  if (p === 'x') return [0, 6, 12, 18, 24, 4, 8, 16, 20];
  if (p === 'corners') return [0, 4, 20, 24];
  return [...Array(25).keys()];
}

function fig(svgStr, caption, callouts = [], cls = 'tv') {
  const co = callouts.length
    ? `<ol class="callouts">${callouts.map((c, i) => `<li><b class="n">${i + 1}</b>${c}</li>`).join('')}</ol>`
    : '';
  return `<figure class="${cls}">${svgStr}<figcaption>${caption}</figcaption>${co}</figure>`;
}
function phones(items) {
  return `<div class="phones">${items.map(([s, cap]) => `<figure>${s}<figcaption>${cap}</figcaption></figure>`).join('')}</div>`;
}

// ─── TV mockups ─────────────────────────────────────────────────────────────────────────────────
const chipsPlaying = PLAYERS.map((p) => ({ ...p, status: 'active' }));

const tvIntro = tv(
  text(TV.W / 2, 150, 'Round 1 of 3', {
    size: TV.h2,
    weight: 700,
    fill: T.muted,
    anchor: 'middle',
  }) +
    text(TV.W / 2, 215, 'LINE', { size: TV.display, weight: 800, anchor: 'middle' }) +
    patternIcon(TV.W / 2 - 60, 240, 22, 'line') +
    text(TV.W / 2, 400, 'Any row, column or diagonal · 1 number per call · a call every 6 s', {
      size: TV.body,
      fill: T.muted,
      anchor: 'middle',
    }) +
    text(
      TV.W / 2,
      436,
      'New cards are on your phones. Daub what you hear. Shout BINGO with the button.',
      { size: TV.body, anchor: 'middle' },
    ) +
    callout(TV.W / 2 + 90, 200, 1) +
    callout(TV.W / 2 + 80, 300, 2) +
    callout(890, 60, 3),
  { kicker: 'BINGO', timer: { seconds: 6 }, chips: chipsPlaying, phaseLabel: 'phase: intro' },
);

const tvPlay = tv(
  // current call, left column
  rect(TV.padX, 70, 300, 210, { fill: T.surface, r: 20 }) +
    text(TV.padX + 150, 110, 'CALL 13', {
      size: TV.caption,
      weight: 700,
      fill: T.muted,
      anchor: 'middle',
    }) +
    text(TV.padX + 150, 215, 'N 38', { size: 96, weight: 800, fill: T.accent2, anchor: 'middle' }) +
    text(TV.padX + 150, 258, '“Christmas cake”', {
      size: TV.h2,
      weight: 600,
      anchor: 'middle',
      italic: true,
    }) +
    // recent calls strip
    text(TV.padX, 316, 'RECENT', { size: TV.caption, weight: 700, fill: T.muted }) +
    [59, 44, 19, 47, 70]
      .map(
        (n, k) =>
          rect(TV.padX + k * 60, 326, 52, 40, { fill: T.surface2, r: 10 }) +
          text(TV.padX + k * 60 + 26, 354, `${LETTER(n)}${n}`, {
            size: 18,
            weight: 700,
            anchor: 'middle',
            opacity: 1 - k * 0.15,
          }),
      )
      .join('') +
    // closeness ticker
    rect(TV.padX, 384, 300, 60, { fill: T.surface, r: 14 }) +
    text(TV.padX + 14, 408, '1 AWAY', { size: TV.caption, weight: 800, fill: T.accent3 }) +
    avatar(TV.padX + 100, 414, 16, 0, 'Ana') +
    text(TV.padX + 122, 420, 'Ana', { size: 18, weight: 700 }) +
    avatar(TV.padX + 190, 414, 16, 3, 'Dee') +
    text(TV.padX + 212, 420, 'Dee', { size: 18, weight: 700 }) +
    // board on the right
    text(400, 128, 'Round 1 of 3 · LINE', { size: TV.body, weight: 700, fill: T.muted }) +
    patternIcon(640, 110, 5, 'line') +
    board(400, 144, 30, 4, CALLED, [38]) +
    text(400, 344, '13 of 75 called · next call at the top-right timer', {
      size: TV.caption,
      fill: T.muted,
    }) +
    callout(TV.padX + 290, 80, 1) +
    callout(TV.padX + 290, 330, 2) +
    callout(TV.padX + 290, 392, 3) +
    callout(905, 140, 4) +
    callout(830, 40, 5) +
    callout(640, 480, 6),
  { timer: { seconds: 4 }, chips: chipsPlaying, phaseLabel: 'phase: play (call 13)' },
);

const tvPlayFalse = tv(
  rect(TV.padX, 70, 300, 210, { fill: T.surface, r: 20 }) +
    text(TV.padX + 150, 110, 'CALL 13', {
      size: TV.caption,
      weight: 700,
      fill: T.muted,
      anchor: 'middle',
    }) +
    text(TV.padX + 150, 215, 'N 38', { size: 96, weight: 800, fill: T.accent2, anchor: 'middle' }) +
    text(TV.padX + 150, 258, '“Christmas cake”', {
      size: TV.h2,
      weight: 600,
      anchor: 'middle',
      italic: true,
    }) +
    board(400, 144, 30, 4, CALLED, [38]) +
    text(400, 128, 'Round 1 of 3 · LINE', { size: TV.body, weight: 700, fill: T.muted }) +
    // toast
    rect(200, 330, 560, 120, { fill: T.danger, r: 20 }) +
    text(TV.W / 2, 378, 'BOGUS BINGO!', {
      size: TV.h1,
      weight: 800,
      fill: T.bg,
      anchor: 'middle',
    }) +
    avatar(300, 418, 16, 1, 'Bo') +
    text(TV.W / 2 + 10, 425, 'Bo — “Count again, Bo.” · −1 · locked for 2 calls', {
      size: TV.body,
      weight: 700,
      fill: T.bg,
      anchor: 'middle',
    }) +
    callout(750, 340, 1) +
    callout(300, 470, 2),
  {
    timer: { seconds: 2 },
    chips: PLAYERS.map((p) => ({ ...p, status: p.name === 'Bo' ? 'waiting' : 'active' })),
    phaseLabel: 'phase: play (false bingo toast, 3 s)',
  },
);

const tvBingo = tv(
  text(TV.padX, 96, 'BINGO!', { size: TV.display, weight: 800, fill: T.accent2 }) +
    avatar(TV.padX + 24, 150, 24, 0, 'Ana') +
    text(TV.padX + 60, 160, 'Ana — “Ana shouted first!”', { size: TV.h2, weight: 700 }) +
    text(TV.padX, 200, 'On call 14 · O 66 “Clickety click” · +5 points', {
      size: TV.body,
      fill: T.muted,
    }) +
    // Ana's card, winning line highlighted
    cardGrid(TV.padX, 250, 44, 5, CARD, { daubed: new Set([...DAUBED, 14]), winLine: WIN_LINE }) +
    // right column: also had it + so close
    rect(420, 230, 492, 110, { fill: T.surface, r: 16 }) +
    text(436, 262, 'ALSO HAD IT (press BINGO now, +3)', {
      size: TV.caption,
      weight: 800,
      fill: T.accent3,
    }) +
    chipRow(436, 280, [{ name: 'Cy', i: 2, status: 'submitted' }], { scale: 1 }) +
    rect(420, 356, 492, 130, { fill: T.surface, r: 16 }) +
    text(436, 388, 'SO CLOSE', { size: TV.caption, weight: 800, fill: T.accent2 }) +
    text(436, 420, '1 away · +2', { size: TV.body, fill: T.muted }) +
    chipRow(560, 400, [{ name: 'Dee', i: 3 }], {}) +
    text(436, 462, '2 away · +1', { size: TV.body, fill: T.muted }) +
    chipRow(
      560,
      442,
      [
        { name: 'Bo', i: 1 },
        { name: 'Fay', i: 5 },
      ],
      {},
    ) +
    callout(360, 70, 1) +
    callout(330, 280, 2) +
    callout(900, 240, 3) +
    callout(900, 366, 4),
  { timer: { seconds: 12 }, chips: null, phaseLabel: 'phase: bingo' },
);

const standings = [
  { name: 'Ana', i: 0, total: 7, delta: '+3' },
  { name: 'Cy', i: 2, total: 7, delta: '+5' },
  { name: 'Dee', i: 3, total: 7, delta: '+1' },
  { name: 'Bo', i: 1, total: 6, delta: '+2' },
  { name: 'Eli', i: 4, total: 3, delta: '+0' },
  { name: 'Fay', i: 5, total: 2, delta: '+1' },
];
function standingsRows(x, y, rows, w = 620) {
  return rows
    .map((r, k) => {
      const yy = y + k * 52;
      return (
        rect(x, yy, w, 44, { fill: k === 0 ? T.surface2 : T.surface, r: 12 }) +
        text(x + 30, yy + 30, String(k + 1), {
          size: TV.body,
          weight: 800,
          fill: T.accent2,
          anchor: 'middle',
        }) +
        avatar(x + 70, yy + 22, 16, r.i, r.name) +
        text(x + 98, yy + 30, r.name, { size: TV.body, weight: 700 }) +
        text(x + w - 110, yy + 30, r.delta, {
          size: TV.body,
          weight: 700,
          fill: T.accent3,
          anchor: 'end',
        }) +
        text(x + w - 24, yy + 30, String(r.total), { size: TV.h2, weight: 800, anchor: 'end' })
      );
    })
    .join('');
}
const tvScoreboard = tv(
  text(TV.padX, 96, 'After round 2 of 3', { size: TV.h1, weight: 800 }) +
    text(TV.padX, 130, 'Dee took round 2 (X) on call 24 · next: BLACKOUT, 3 numbers per call', {
      size: TV.body,
      fill: T.muted,
    }) +
    standingsRows(TV.padX, 150, [
      { name: 'Dee', i: 3, total: 6, delta: '+5' },
      { name: 'Ana', i: 0, total: 4, delta: '+2' },
      { name: 'Bo', i: 1, total: 4, delta: '−1' },
      { name: 'Cy', i: 2, total: 2, delta: '+0' },
      { name: 'Eli', i: 4, total: 2, delta: '+1' },
      { name: 'Fay', i: 5, total: 1, delta: '+0' },
    ]) +
    rect(700, 150, 212, 200, { fill: T.surface, r: 16 }) +
    text(806, 182, 'NEXT PATTERN', {
      size: TV.caption,
      weight: 800,
      fill: T.muted,
      anchor: 'middle',
    }) +
    patternIcon(806 - 62, 196, 22, 'blackout') +
    text(806, 340, 'BLACKOUT', { size: TV.h2, weight: 800, anchor: 'middle' }) +
    callout(680, 300, 1) +
    callout(700, 140, 2),
  { timer: { seconds: 8 }, phaseLabel: 'phase: scoreboard' },
);

const tvDone = tv(
  text(TV.padX, 96, 'Final standings', { size: TV.h1, weight: 800 }) +
    text(TV.padX, 130, 'Cy and Dee share the win (7 points, 1 round each, no bogus calls)', {
      size: TV.body,
      fill: T.muted,
    }) +
    standingsRows(TV.padX, 150, [
      { name: 'Cy', i: 2, total: 7, delta: '+5' },
      { name: 'Dee', i: 3, total: 7, delta: '+1' },
      { name: 'Ana', i: 0, total: 7, delta: '+3' },
      { name: 'Bo', i: 1, total: 6, delta: '+2' },
      { name: 'Eli', i: 4, total: 3, delta: '+1' },
      { name: 'Fay', i: 5, total: 2, delta: '+1' },
    ]) +
    rect(700, 150, 212, 320, { fill: T.surface, r: 16 }) +
    text(716, 182, 'AWARDS', { size: TV.caption, weight: 800, fill: T.accent2 }) +
    lines(716, 212, ['🏠 Full House', 'Cy'], { size: 18, weight: 700 }) +
    lines(716, 272, ['📣 Caller’s Nightmare', 'Bo · 2 bogus calls'], { size: 18, weight: 700 }) +
    lines(716, 332, ['⚡ Quick Daub', 'Dee · 1.9 s average'], { size: 18, weight: 700 }) +
    callout(690, 160, 1) +
    callout(60, 140, 2),
  { phaseLabel: 'phase: done (engine results screen follows)' },
);

// ─── Phone mockups ──────────────────────────────────────────────────────────────────────────────
const callHeader = (n, callIdx, nick) =>
  rect(PH.pad, 96, PH.W - 2 * PH.pad, 92, { fill: T.surface, r: 16 }) +
  text(PH.pad + 14, 120, `CALL ${callIdx}`, { size: 12, weight: 800, fill: T.muted }) +
  text(PH.pad + 14, 168, `${LETTER(n)} ${n}`, { size: PH.display, weight: 800, fill: T.accent2 }) +
  text(PH.W - PH.pad - 14, 150, `“${nick}”`, {
    size: 16,
    italic: true,
    fill: T.muted,
    anchor: 'end',
  }) +
  text(PH.W - PH.pad - 14, 172, 'prev: G59 · N44 · B19', {
    size: 12,
    fill: T.muted,
    anchor: 'end',
  });

const bingoBtn = (o = {}) =>
  button(PH.pad, PH.H - 96 + 16, PH.W - 2 * PH.pad, o.label ?? 'BINGO!', { h: 64, ...o });

const phIntro = phone(
  text(PH.pad, 130, 'Line', { size: PH.h1, weight: 800 }) +
    patternIcon(PH.W - PH.pad - 70, 100, 12, 'line') +
    text(PH.pad, 158, 'Any row, column or diagonal. 1 number per call.', {
      size: PH.caption,
      fill: T.muted,
    }) +
    text(PH.pad, 200, 'YOUR NEW CARD', { size: 12, weight: 800, fill: T.muted }) +
    cardGrid(PH.pad, 236, 60, 7, CARD, {}) +
    text(PH.W / 2, 620, 'Daub the numbers the TV calls.', { size: PH.body, anchor: 'middle' }) +
    text(PH.W / 2, 648, 'Tap BINGO! when your line is complete.', {
      size: PH.body,
      anchor: 'middle',
    }) +
    callout(PH.W - 30, 116, 1) +
    callout(40, 246, 2),
  { kicker: 'ROUND 1 OF 3', timer: { seconds: 6 } },
);

const phPlay = phone(
  callHeader(38, 13, 'Christmas cake') +
    cardGrid(PH.pad, 236, 60, 7, CARD, { daubed: DAUBED }) +
    text(PH.pad, 590, '1 away — you need O 66', {
      size: PH.caption,
      fill: T.accent3,
      weight: 700,
    }) +
    callout(PH.W - 34, 108, 1) +
    callout(40, 246, 2) +
    callout(PH.W - 30, 600, 3),
  { kicker: 'ROUND 1 · LINE', timer: { seconds: 4 }, footer: bingoBtn() + callout(40, 700, 4) },
);

const phPlayAssist = phone(
  callHeader(38, 13, 'Christmas cake') +
    cardGrid(PH.pad, 236, 60, 7, CARD, { daubed: DAUBED, called: new Set(CALLED) }) +
    text(PH.pad, 590, 'Assist on: called numbers you haven’t daubed glow', {
      size: PH.caption,
      fill: T.accent2,
      weight: 700,
    }) +
    callout(PH.pad + 134, 246, 1),
  { kicker: 'ROUND 1 · LINE', timer: { seconds: 4 }, footer: bingoBtn() },
);

const phPlayLocked = phone(
  callHeader(38, 13, 'Christmas cake') +
    cardGrid(PH.pad, 236, 60, 7, CARD, { daubed: new Set([12, 10, 13, 1, 0]) }) +
    text(PH.pad, 590, 'That wasn’t a bingo. −1. Keep daubing.', {
      size: PH.caption,
      fill: T.danger,
      weight: 700,
    }) +
    callout(PH.W - 40, 52, 1),
  {
    kicker: 'ROUND 1 · LINE',
    timer: { seconds: 4 },
    banner: '✕  Bogus bingo — button locked for 2 calls',
    footer:
      bingoBtn({ label: 'Locked · 2 calls', disabled: true, variant: 'secondary' }) +
      callout(40, 700, 2),
  },
);

const phPlayReconnect = phone(
  callHeader(38, 13, 'Christmas cake') +
    cardGrid(PH.pad, 236, 60, 7, CARD, { daubed: DAUBED, dim: true }) +
    text(PH.pad, 590, 'Your daubs are saved on the server.', { size: PH.caption, fill: T.muted }) +
    callout(PH.W - 40, 52, 1),
  { kicker: 'ROUND 1 · LINE', banner: 'reconnecting', footer: bingoBtn({ disabled: true }) },
);

const phPlayPaused = phone(
  callHeader(38, 13, 'Christmas cake') +
    cardGrid(PH.pad, 236, 60, 7, CARD, { daubed: DAUBED, dim: true }) +
    callout(PH.W - 40, 52, 1),
  {
    kicker: 'ROUND 1 · LINE',
    banner: 'paused',
    footer: bingoBtn({ disabled: true, label: 'Paused' }),
  },
);

const phPlaySpectator = phone(
  callHeader(38, 13, 'Christmas cake') +
    text(PH.pad, 230, 'You’re watching this one', { size: PH.h2, weight: 800 }) +
    text(PH.pad, 258, 'You joined after the cards were dealt. You’ll be in the next game.', {
      size: PH.caption,
      fill: T.muted,
    }) +
    text(PH.pad, 310, 'CALLED SO FAR', { size: 12, weight: 800, fill: T.muted }) +
    CALLED.slice()
      .reverse()
      .map(
        (n, k) =>
          rect(PH.pad + (k % 5) * 66, 324 + Math.floor(k / 5) * 46, 58, 38, {
            fill: T.surface2,
            r: 10,
          }) +
          text(PH.pad + (k % 5) * 66 + 29, 350 + Math.floor(k / 5) * 46, `${LETTER(n)}${n}`, {
            size: 16,
            weight: 700,
            anchor: 'middle',
          }),
      )
      .join('') +
    text(PH.pad, 520, '1 AWAY', { size: 12, weight: 800, fill: T.accent3 }) +
    chipRow(
      PH.pad,
      532,
      [
        { name: 'Ana', i: 0 },
        { name: 'Dee', i: 3 },
      ],
      {},
    ) +
    callout(PH.W - 30, 236, 1),
  { kicker: 'ROUND 1 · LINE · SPECTATING', timer: { seconds: 4 } },
);

const phBingoWinner = phone(
  text(PH.pad, 130, 'BINGO!', { size: PH.display, weight: 800, fill: T.accent2 }) +
    text(PH.pad, 160, 'You shouted first · +5', { size: PH.body, weight: 700, fill: T.accent3 }) +
    cardGrid(PH.pad, 210, 60, 7, CARD, { daubed: new Set([...DAUBED, 14]), winLine: WIN_LINE }) +
    text(PH.pad, 560, 'On call 14 · O 66 “Clickety click”', { size: PH.caption, fill: T.muted }) +
    callout(140, 116, 1) +
    callout(PH.pad + 320, 350, 2),
  { kicker: 'ROUND 1 · LINE', timer: { seconds: 12 } },
);

const CY_CARD = [
  2, 21, 33, 48, 63, 9, 18, 38, 50, 72, 13, 19, 0, 52, 61, 5, 27, 41, 57, 66, 15, 30, 35, 46, 69,
];
const phBingoAlso = phone(
  text(PH.pad, 130, 'Ana got there first', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 160, 'But your line is complete too — say so for +3', {
      size: PH.caption,
      fill: T.muted,
    }) +
    cardGrid(PH.pad, 210, 60, 7, CY_CARD, {
      daubed: new Set([10, 11, 12, 13, 14, 3, 7]),
      winLine: WIN_LINE,
    }) +
    callout(PH.W - 30, 116, 1),
  {
    kicker: 'ROUND 1 · LINE',
    timer: { seconds: 9 },
    footer: bingoBtn({ label: 'I had it too!', variant: 'success' }) + callout(40, 700, 2),
  },
);
const phBingoAlsoDone = phone(
  text(PH.pad, 130, 'Counted!', { size: PH.h1, weight: 800, fill: T.accent3 }) +
    text(PH.pad, 160, 'Shared bingo · +3', { size: PH.body, weight: 700 }) +
    cardGrid(PH.pad, 210, 60, 7, CY_CARD, {
      daubed: new Set([10, 11, 12, 13, 14, 3, 7]),
      winLine: WIN_LINE,
    }),
  {
    kicker: 'ROUND 1 · LINE',
    timer: { seconds: 7 },
    footer: bingoBtn({ label: 'Counted', done: true, disabled: true }) + callout(40, 700, 1),
  },
);
const phBingoWait = phone(
  text(PH.pad, 130, 'Ana got bingo', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 160, 'You were 1 away · +2', { size: PH.body, weight: 700, fill: T.accent3 }) +
    cardGrid(PH.pad, 210, 60, 7, CARD, { daubed: new Set([12, 10, 13, 11, 1]) }) +
    text(PH.pad, 560, 'Next round starts in a moment.', { size: PH.caption, fill: T.muted }) +
    callout(PH.W - 30, 150, 1),
  { kicker: 'ROUND 1 · LINE', timer: { seconds: 12 } },
);

function phoneStandings(x, y, rows, meName) {
  return rows
    .map((r, k) => {
      const yy = y + k * 50;
      const me = r.name === meName;
      return (
        rect(x, yy, PH.W - 2 * PH.pad, 44, {
          fill: me ? T.surface2 : T.surface,
          r: 12,
          stroke: me ? T.accent2 : null,
        }) +
        text(x + 22, yy + 29, String(k + 1), {
          size: 16,
          weight: 800,
          fill: T.accent2,
          anchor: 'middle',
        }) +
        avatar(x + 56, yy + 22, 15, r.i, r.name) +
        text(x + 80, yy + 29, r.name + (me ? ' (you)' : ''), { size: 16, weight: 700 }) +
        text(x + PH.W - 2 * PH.pad - 70, yy + 29, r.delta, {
          size: 15,
          weight: 700,
          fill: T.accent3,
          anchor: 'end',
        }) +
        text(x + PH.W - 2 * PH.pad - 16, yy + 29, String(r.total), {
          size: 18,
          weight: 800,
          anchor: 'end',
        })
      );
    })
    .join('');
}
const sb2 = [
  { name: 'Dee', i: 3, total: 6, delta: '+5' },
  { name: 'Ana', i: 0, total: 4, delta: '+2' },
  { name: 'Bo', i: 1, total: 4, delta: '−1' },
  { name: 'Cy', i: 2, total: 2, delta: '+0' },
  { name: 'Eli', i: 4, total: 2, delta: '+1' },
  { name: 'Fay', i: 5, total: 1, delta: '+0' },
];
const phScoreboard = phone(
  text(PH.pad, 130, 'After round 2', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 158, 'You scored +2 (1 away). Next: BLACKOUT, 3 numbers per call.', {
      size: PH.caption,
      fill: T.muted,
    }) +
    phoneStandings(PH.pad, 180, sb2, 'Ana') +
    patternIcon(PH.W / 2 - 40, 500, 14, 'blackout') +
    text(PH.W / 2, 600, 'Get ready — new cards coming.', { size: PH.body, anchor: 'middle' }) +
    callout(PH.W - 30, 150, 1),
  { kicker: 'ROUND 2 OF 3 · DONE', timer: { seconds: 8 } },
);
const phScoreboardSpec = phone(
  text(PH.pad, 130, 'After round 2', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 158, 'You’re spectating. You’ll be dealt in next game.', {
      size: PH.caption,
      fill: T.muted,
    }) +
    phoneStandings(PH.pad, 180, sb2, null),
  { kicker: 'SPECTATING', timer: { seconds: 8 } },
);
const phDone = phone(
  text(PH.pad, 130, 'You finished 3rd', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 158, '7 points · lost the tie-break (no round wins)', {
      size: PH.caption,
      fill: T.muted,
    }) +
    phoneStandings(
      PH.pad,
      180,
      [
        { name: 'Cy', i: 2, total: 7, delta: '+5' },
        { name: 'Dee', i: 3, total: 7, delta: '+1' },
        { name: 'Ana', i: 0, total: 7, delta: '+3' },
        { name: 'Bo', i: 1, total: 6, delta: '+2' },
        { name: 'Eli', i: 4, total: 3, delta: '+1' },
        { name: 'Fay', i: 5, total: 2, delta: '+1' },
      ],
      'Ana',
    ) +
    text(PH.pad, 520, 'AWARDS', { size: 12, weight: 800, fill: T.accent2 }) +
    lines(
      PH.pad,
      546,
      ['🏠 Full House — Cy', '📣 Caller’s Nightmare — Bo', '⚡ Quick Daub — Dee'],
      { size: 16, weight: 600 },
    ) +
    callout(PH.W - 30, 150, 1),
  { kicker: 'FINAL' },
);

// ─── State diagram ──────────────────────────────────────────────────────────────────────────────
const stateDiagram = svg(
  960,
  330,
  node(30, 120, 130, 60, 'intro', { sub: '8 s' }) +
    node(230, 120, 150, 60, 'play', { sub: 'callSeconds per call' }) +
    node(460, 120, 150, 60, 'bingo', { sub: '12 s' }) +
    node(690, 120, 150, 60, 'scoreboard', { sub: '8 s' }) +
    node(690, 240, 150, 50, 'done', { sub: 'terminal', terminal: true, stroke: T.accent3 }) +
    arrow(160, 150, 228, 150, 'timer | skip', { dy: -34 }) +
    arrow(380, 150, 458, 150, 'BINGO | cap | skip', { dy: -34 }) +
    arrow(610, 150, 688, 150, 'timer | skip · round < N', { dy: -34 }) +
    arrow(535, 180, 700, 250, 'timer|skip, last round', { curve: 60 }) +
    // play self-loop
    `<path d="M305,120 C260,40 350,40 305,118" fill="none" stroke="${T.muted}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    rect(240, 62, 130, 22, { fill: T.bg, r: 11 }) +
    text(305, 77, 'timer → next call', { size: 12, fill: T.muted, anchor: 'middle' }) +
    // scoreboard → intro
    `<path d="M765,120 C765,20 95,20 95,118" fill="none" stroke="${T.muted}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    rect(370, 14, 170, 22, { fill: T.bg, r: 11 }) +
    text(455, 29, 'next round: deal new cards', { size: 12, fill: T.muted, anchor: 'middle' }) +
    text(
      30,
      300,
      'VIP end from any phase → done (scores as they stand). Pause/resume handled by applyVip in every phase.',
      { size: 13, fill: T.muted },
    ),
  { label: 'Bingo state diagram' },
);

// ─── Content ────────────────────────────────────────────────────────────────────────────────────
const FAMILY_CALLS = [
  "Kelly's eye",
  'One little duck',
  'Cup of tea',
  'Knock at the door',
  'Man alive',
  'Half a dozen',
  'Lucky seven',
  'Garden gate',
  "Doctor's orders",
  'Perfect ten',
  'Legs eleven',
  'One dozen',
  'Unlucky for some',
  "Valentine's Day",
  'Young and keen',
  'Sweet sixteen',
  'Dancing queen',
  'Coming of age',
  'Goodbye teens',
  'One score',
  'Key of the door',
  'Two little ducks',
  'Thee and me',
  'Two dozen',
  'Duck and dive',
  'Pick and mix',
  'Gateway to heaven',
  'Over the gate',
  'Rise and shine',
  'Speed limit',
  'Get up and run',
  'Buckle my shoe',
  'All the threes',
  'Ask for more',
  'Jump and jive',
  'Three dozen',
  'More than eleven',
  'Christmas cake',
  'Steps',
  'Life begins',
  'Time for fun',
  'Six times seven',
  'Down on your knees',
  'All the fours',
  'Halfway there',
  'Up to tricks',
  'Four and seven',
  'Four dozen',
  'Feeling fine',
  'Half a century',
  'Tweak of the thumb',
  'Weeks in a year',
  'Stuck in the tree',
  'Clean the floor',
  'Snakes alive',
  'Pick up sticks',
  'Sunny seven',
  'Make them wait',
  'Brighton line',
  'Five dozen',
  "Baker's bun",
  'Tickety-boo',
  'Tickle me',
  'Almost retired',
  'Retirement age',
  'Clickety click',
  'Stairway to heaven',
  'Pick a mate',
  'Any way up',
  'Three score and ten',
  'Bang on the drum',
  'Six dozen',
  'Queen bee',
  'Hit the floor',
  'Top of the shop',
];
const SPICY_CALLS = [
  [9, "Doctor's orders — take two and call me"],
  [11, 'Legs eleven — wolf whistle'],
  [13, 'Unlucky for some — you know who you are'],
  [17, 'Old enough to know better'],
  [21, 'Just old enough — behave'],
  [27, 'Gateway to heaven — not tonight'],
  [30, 'Dirty Gertie'],
  [34, 'Ask for more — you always do'],
  [40, 'Naughty forty'],
  [44, 'Droopy drawers'],
  [51, 'Tweak of the thumb — ouch'],
  [52, 'Weeks in a year — and you wasted every one'],
  [56, 'Was she worth it?'],
  [60, "Grandma's getting frisky"],
  [64, 'Almost retired — like your jokes'],
  [65, 'Old age pension — spend it wisely'],
  [69, 'Meal for two'],
  [73, "Queen bee — and don't you forget it"],
  [74, 'Hit the floor — after last night'],
  [75, 'Top of the shop — last orders'],
];
const FALSE_LINES = [
  'Bogus bingo!',
  'Nice try, {name}.',
  "That's a no from the caller.",
  '{name} has been watching too many game shows.',
  'Count again, {name}.',
  'The daubers are not amused.',
  'Premature celebration from {name}.',
  '{name} — that card says no.',
  'Somebody get {name} some glasses.',
  'Sit down, {name}.',
  'False alarm. Carry on, everyone.',
  '{name} is in the naughty corner for 2 calls.',
];
const WIN_LINES = [
  'BINGO! {name} takes it!',
  '{name} shouted first!',
  "That's a full pattern for {name}!",
  'Stamp it — {name} wins the round!',
  'Winner winner: {name}!',
  '{name} — lucky, or listening?',
  'Cards down, {name} has it!',
  'Ding ding ding: {name}!',
];
const NO_BINGO_LINES = [
  'The caller ran out of breath. No bingo this round!',
  'Deck’s empty, cards are quiet. On we go.',
  'Nobody? Really? Next round.',
  'A round with no winner — the house thanks you.',
];

const contentList = (items) =>
  `<ol class="content-list">${items.map((s) => `<li>${s}</li>`).join('')}</ol>`;

// ─── Sections ───────────────────────────────────────────────────────────────────────────────────
export const sections = [
  { title: 'Header card', html: '' },
  {
    title: 'The hook',
    html: `
<p>Everybody already knows how to play, so the room is loud within thirty seconds: the TV calls a number with a cheeky nickname, phones light up, thumbs hunt, and somebody yells "wait, wait, WAIT". The button that says <b>BINGO!</b> is always there, always tempting, and a bogus press costs you a point and two calls of humiliation on the big screen — which is exactly what people will do to each other on purpose. Rounds escalate from a simple line to a three-numbers-per-call blackout, so the last round is a frantic daub-fest where the winner is whoever can read fastest, not whoever is luckiest.</p>`,
  },
  {
    title: "A round from a player's seat",
    html: `
<p><b>Ana</b> is playing with five friends. The TV says <i>Round 1 of 3 — LINE</i> with a five-dot row lit up on a little grid; her phone shows the same pattern and a fresh 5×5 card with the B-I-N-G-O letters across the top and FREE in the middle. A six-second countdown runs out and the TV booms <b>B 7 — "Lucky seven"</b>. She has a 7 in the B column, taps it, it turns green with a satisfying thunk from her phone. The TV's board fills in 7 in pink.</p>
<p>Calls keep coming every six seconds. <b>G 52 "Weeks in a year"</b> — got it. <b>I 29 "Rise and shine"</b> — got it, and now her middle row reads 7 · 29 · FREE · 52 · ▢. The phone quietly notes <i>1 away — you need O 66</i>; on the TV a little "1 AWAY" ticker shows her avatar next to Dee's. Bo, across the room, mashes BINGO! with nothing close to a line. The TV flashes a red <b>BOGUS BINGO! — "Count again, Bo."</b>, Bo's chip goes grey, his phone shows a locked button for two calls, and the room roars.</p>
<p><b>N 38 "Christmas cake"</b> — Ana daubs it but it doesn't help her row. Four seconds. Three. <b>O 66 "Clickety click"</b>. She taps 66, sees the row go solid, and hammers BINGO! before Dee can. The TV cuts to a gold <b>BINGO! Ana — "Ana shouted first!"</b> with her card blown up and the winning row outlined; <i>+5</i>. Cy's phone says <i>Ana got there first — but your line is complete too</i> with a green <b>I had it too!</b> button; he presses it and the TV adds him under "Also had it, +3". Dee's phone says <i>You were 1 away · +2</i>. Twelve seconds later the scoreboard slides in, then round 2 deals new cards with an X pattern and <i>two numbers per call</i>.</p>`,
  },
  {
    title: 'Complete rules',
    html: `
<h3>Setup</h3>
<ol>
<li>The game plays <code>rounds</code> rounds (default 3). Each round every player is dealt a fresh 5×5 card: column B holds 5 distinct numbers from 1–15, I from 16–30, N from 31–45 (4 numbers, centre square is FREE), G from 46–60, O from 61–75. Cards are dealt from <code>state.rng</code> and differ per player.</li>
<li>Each round has a <b>pattern</b>. With the default <code>pattern = classic</code>, round r uses <code>[line, x, blackout][(r − 1) mod 3]</code>. Otherwise every round uses the chosen pattern.
  <ul>
    <li><b>line</b>: any full row, column or diagonal (12 lines; FREE counts). 1 number per call. Round cap: 60 calls.</li>
    <li><b>x</b>: both diagonals (8 numbers + FREE). 2 numbers per call. Cap: 38 calls (the deck).</li>
    <li><b>corners</b>: the four corner squares. 2 numbers per call. Cap: 38 calls.</li>
    <li><b>blackout</b>: all 24 numbers. 3 numbers per call. Cap: 25 calls (the deck).</li>
  </ul></li>
<li>Each round shuffles a fresh deck of 1–75 from <code>state.rng</code>.</li>
</ol>
<h3>Play</h3>
<ol start="4">
<li><b>Intro (8 s)</b>: the TV shows the round number, pattern and cadence; phones show the pattern and their new card. Nothing can be daubed yet.</li>
<li><b>Calls</b>: the first call happens the instant play starts, then one call every <code>callSeconds</code> (default 6). A call reveals the next 1, 2 or 3 numbers of the deck (per the pattern) with their letter and a caller nickname from the content pack. All called numbers stay visible on the TV board.</li>
<li><b>Daubing</b>: a player may daub any square on their own card whose number <em>has been called</em> (in any earlier call, not only the latest). Daubing an uncalled number is rejected silently by the server (the phone greys those squares out only if <code>assist</code> is on). Daubs cannot be undone. FREE is pre-daubed.</li>
<li><b>Calling bingo</b>: pressing <b>BINGO!</b> claims that the pattern is completely <em>daubed</em> (called-but-undaubed squares do not count).
  <ul>
    <li>Valid claim → the round ends immediately in favour of that player (the "winner"), +5 points. The TV shows their card with the winning squares highlighted for 12 s.</li>
    <li>Invalid claim → <b>bogus bingo</b>: −1 point, the button is locked until 2 further calls have happened, the TV shows a 3-second taunt with the player's name. Daubing still works while locked.</li>
  </ul></li>
<li><b>Also had it</b>: during the 12-second bingo reveal, any other player whose pattern is fully daubed may press BINGO! for +3 ("shared bingo"). A bogus press here counts as a bogus bingo (−1) but with no lockout (the round is over anyway).</li>
<li><b>Closeness points</b>: when the round ends, every player who is neither the winner nor a shared bingo is scored by the fewest <em>undaubed</em> squares on any completion of the pattern: 1 away → +2, 2 away → +1, otherwise 0. For blackout, "away" is the count of undaubed numbers on the card.</li>
<li><b>No bingo</b>: if the call cap is reached with no valid claim, the round ends with no winner; closeness points still apply. The VIP's <b>skip</b> during play ends the round the same way.</li>
<li><b>Between rounds</b>: an 8-second scoreboard shows totals, this round's deltas and the next pattern. After the last round the game goes straight to the final standings.</li>
</ol>
<h3>Winning</h3>
<ol start="12">
<li>Highest total wins. Ties are broken by (a) most round wins, then (b) fewest bogus bingos; players still tied share the rank.</li>
<li>Awards (only when earned): <b>Full House</b> (won a blackout round), <b>Caller's Nightmare</b> (most bogus bingos, at least 2), <b>Quick Daub</b> (lowest mean daub reaction time with at least 10 daubs), <b>So Close</b> (most rounds finished exactly 1 away without a bingo, at least 2).</li>
</ol>
<h3>Referee's notes</h3>
<ul>
<li>Late joiners spectate: they see the TV board mirrored on their phone and the "1 away" ticker, and get dealt in next game.</li>
<li>A disconnected player's card and daubs persist; they can reconnect and continue. Their card still earns closeness points at round end.</li>
<li>Pause freezes the call timer; daubs and BINGO! presses are ignored while paused.</li>
</ul>`,
  },
  {
    title: 'Phase flow table',
    html: `
<div class="scroll"><table>
<thead><tr><th>Phase id</th><th>TV shows</th><th>Player phone</th><th>Spectator phone</th><th>Inputs accepted</th><th>Exit</th><th>Default timer</th><th>Allowed range</th></tr></thead>
<tbody>
<tr><td><code>intro</code></td><td>Round n of N, pattern name + icon, cadence text, countdown</td><td>Pattern icon + new card (not tappable)</td><td>Pattern + "you're watching"</td><td>none</td><td>deadline · VIP skip</td><td>8 s</td><td>fixed</td></tr>
<tr><td><code>play</code></td><td>Current call (big), nickname, recent-calls strip, 75-board, pattern, "1 away" ticker, bogus-bingo toast; timer = next call</td><td>Current call header, tappable card, own closeness line, BINGO! button (locked state after a bogus call)</td><td>Current call, called list, 1-away ticker</td><td><code>daub</code>, <code>bingo</code></td><td>valid <code>bingo</code> · call cap reached · VIP skip. <b>Timer does not exit</b>: it draws the next call and re-enters <code>play</code> with a new <code>startedAt</code></td><td><code>callSeconds</code> = 6 s per call</td><td>3–12 s</td></tr>
<tr><td><code>bingo</code></td><td>Winner (or "no bingo"), win line, their card with pattern highlighted, "also had it" chips, "so close" lists</td><td>Winner: BINGO! +5 with card. Others with complete pattern: "I had it too!" button. Others: "you were n away · +p"</td><td>Same as TV summary</td><td><code>bingo</code> (shared claim)</td><td>deadline · VIP skip</td><td>12 s</td><td>fixed</td></tr>
<tr><td><code>scoreboard</code></td><td>Totals with deltas, round summary line, next pattern</td><td>Compact standings (you highlighted), your delta, next pattern</td><td>Compact standings</td><td>none</td><td>deadline · VIP skip → <code>intro</code> of next round</td><td>8 s</td><td>fixed</td></tr>
<tr><td><code>done</code></td><td>Final standings + awards (then the engine's results screen)</td><td>Your final rank + awards</td><td>Final standings</td><td>none</td><td>terminal (<code>results()</code> non-null)</td><td>none</td><td>—</td></tr>
</tbody></table></div>
<div class="note"><b>VIP end</b> from any phase jumps to <code>done</code> with scores as they stand (a round in progress awards nothing). <b>VIP skip</b> in <code>play</code> ends the round with no winner (closeness points apply) rather than forcing a call — "advance past the phase" is the contract's meaning of skip.</div>`,
  },
  {
    title: 'Screens',
    html: `
<p>TV mockups are 960×540 (half of 1080p — double every size for real pixels). Phone mockups are 360×780 at CSS pixels. The shell renders the envelope (player chips strip, timer, VIP badge, paused curtain); the game's own timer treatment is the <b>quiet</b> mode requested in §13.</p>
<h3>intro</h3>
${fig(
  tvIntro,
  '<b>TV · intro.</b> One focal point: the pattern name at display size with the 5×5 pattern icon under it.',
  [
    'Pattern name at 128 px (display) — the only thing the room needs to read.',
    'Pattern icon: 25 dots, lit cells are the target; the same icon appears on every phone and in the play header.',
    'Shell timer counting the 8-second intro; chips strip along the bottom is rendered by the shell.',
  ],
)}
${phones([[phIntro, '<b>Player · intro.</b> ① pattern icon mirrors the TV; ② the fresh card is shown but not tappable (no footer button yet).']])}
<h3>play</h3>
${fig(tvPlay, '<b>TV · play (call 13, N 38).</b> Left: the call; right: the 75-board.', [
  'Current call at 192 px real (96 here) in accent-2, the caller nickname in italics beneath. This block is the focal point; it animates (300 ms rise) on each call.',
  'Recent-calls strip: last five numbers, fading — what you missed while looking at your phone.',
  '"1 AWAY" ticker: avatars of players one square from the pattern (computed from daubs). Never shows cards.',
  '75-board: called numbers in accent, the current call in accent-2 with a ring; rows are the B-I-N-G-O ranges.',
  'Shell timer = seconds to the next call; rendered in quiet mode (no red/tick, see §13).',
  'Shell chips strip; a locked-out player shows the "waiting" glyph for the lockout.',
])}
${fig(
  tvPlayFalse,
  '<b>TV · play, bogus bingo toast (3 s).</b> Danger-coloured toast over the board, then it fades and play continues.',
  [
    'Toast: "BOGUS BINGO!" at h1, the taunt line with the player’s name, the penalty and the lockout in body size.',
    'The offending player’s avatar; their chip in the shell strip shows the waiting glyph until the lockout lifts.',
  ],
)}
${phones([
  [
    phPlay,
    '<b>Player · play, active.</b> ① current call header with the previous three; ② tappable 60 px cells, daubed = green with a ring; ③ own closeness line (only when 1 or 2 away); ④ sticky BINGO! button (64 px).',
  ],
  [
    phPlayAssist,
    '<b>Player · play, <code>assist</code> on.</b> ① called-but-undaubed cells get an accent-2 outline. Default off.',
  ],
  [
    phPlayLocked,
    '<b>Player · play, locked after a bogus bingo.</b> ① banner explains the lockout; ② the button is disabled and says how many calls remain. Daubing still works.',
  ],
  [
    phPlayReconnect,
    '<b>Player · play, reconnecting.</b> ① quiet banner; the card dims and the button disables until the socket is back. Daubs live on the server.',
  ],
  [phPlayPaused, '<b>Player · play, paused by the VIP.</b> ① banner; no input accepted.'],
  [
    phPlaySpectator,
    '<b>Spectator · play.</b> ① explains why there is no card; below, the called list newest-first and the 1-away ticker.',
  ],
])}
<h3>bingo</h3>
${fig(
  tvBingo,
  '<b>TV · bingo reveal.</b> The winner’s card is public now; the shared-bingo window is open for 12 s.',
  [
    '"BINGO!" at display size with the winner’s avatar, name and a win line from the content pack.',
    'Winner’s card with the winning squares in accent and outlined — the room can verify it.',
    '"Also had it" chips appear as other players press BINGO! (each +3).',
    '"So close" lists 1-away (+2) and 2-away (+1) players; computed from daubs.',
  ],
)}
${phones([
  [
    phBingoWinner,
    '<b>Winner · bingo.</b> ① confirmation and points; ② their own card with the line highlighted. No button.',
  ],
  [
    phBingoAlso,
    '<b>Non-winner with a complete pattern · bingo.</b> ① states who won; ② the green "I had it too!" button (+3).',
  ],
  [
    phBingoAlsoDone,
    '<b>After pressing "I had it too!".</b> ① button becomes done/disabled, points shown.',
  ],
  [
    phBingoWait,
    '<b>Non-winner, pattern incomplete · bingo.</b> ① closeness points explained; no button.',
  ],
])}
<h3>scoreboard</h3>
${fig(tvScoreboard, '<b>TV · scoreboard between rounds.</b>', [
  'Ranked rows with round delta (accent-3) and total; the leader’s row is raised.',
  'Next pattern panel: name + icon so people know what to hunt for before the cards arrive.',
])}
${phones([
  [
    phScoreboard,
    '<b>Player · scoreboard.</b> ① your delta and the next pattern; your row is outlined.',
  ],
  [phScoreboardSpec, '<b>Spectator · scoreboard.</b> Same standings, no highlighted row.'],
])}
<h3>done</h3>
${fig(
  tvDone,
  '<b>TV · done (final standings).</b> The engine’s results screen follows; this phase is the game’s own summary.',
  [
    'Awards panel — only awards actually earned are listed.',
    'The tie-break sentence explains why players on equal points are ordered as they are.',
  ],
)}
${phones([[phDone, '<b>Player · done.</b> ① rank sentence includes the tie-break reason; awards listed below.']])}`,
  },
  {
    title: 'Data model',
    html: `
<pre><code>// games/bingo/server/types.ts
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = ['intro', 'play', 'bingo', 'scoreboard', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export type Pattern = 'line' | 'x' | 'corners' | 'blackout';
export type PatternSetting = 'classic' | Pattern;

export interface Settings {
  rounds: number;            // 1..5, default 3
  pattern: PatternSetting;   // default 'classic'
  callSeconds: number;       // 3..12, default 6
  assist: boolean;           // default false — glow called-but-undaubed cells on the phone
  spicy: boolean;            // default false — cheeky caller pack overrides
}

export interface RoundState {
  number: number;                       // 1-based
  pattern: Pattern;
  deck: number[];                       // 75 numbers shuffled at round start
  drawn: number;                        // deck.slice(0, drawn) has been called
  calls: number;                        // call counter (drawn / perCall, rounded up)
  calledAt: number[];                   // ms timestamp of each call (length === calls); for Quick Daub
  cards: Record&lt;string, number[]&gt;;      // playerId -&gt; 25 numbers row-major, [12] === 0 (FREE)
  daubs: Record&lt;string, number[]&gt;;      // playerId -&gt; sorted daubed indices (always contains 12)
  lockedUntilCall: Record&lt;string, number&gt;; // playerId -&gt; 'bingo' ignored while round.calls &lt; this
  winnerId: string | null;
  winningCells: number[] | null;        // the completed pattern cells (for the reveal)
  alsoBingo: string[];                  // shared-bingo claimants, in claim order
  falseCalls: Record&lt;string, number&gt;;   // this round
  points: Record&lt;string, number&gt;;       // this round's points (incl. −1s), applied to scores at round end
  endedBy: 'bingo' | 'cap' | 'skip' | null;
  toast: { kind: 'false'; playerId: string; line: string; untilCall: number } | null; // TV taunt, cleared by the next call
  winLine: string | null;               // chosen win/no-bingo sentence (drawn from rng at round end)
}

export interface State extends GameStateBase {
  settings: Settings;
  round: RoundState;
  scores: Record&lt;string, number&gt;;       // totals after completed rounds
  roundWins: Record&lt;string, number&gt;;
  totalFalse: Record&lt;string, number&gt;;
  oneAwayFinishes: Record&lt;string, number&gt;;
  blackoutWins: Record&lt;string, number&gt;;
  daubStats: Record&lt;string, { count: number; totalMs: number }&gt;; // reaction time = daub.now − calledAt[call that revealed it]
  history: { round: number; pattern: Pattern; winnerId: string | null; calls: number }[];
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('daub'), index: z.number().int().min(0).max(24) }),
  z.object({ type: z.literal('bingo') }),
]);
export type Input = z.infer&lt;typeof inputSchema&gt;;

export const INTRO_MS = 8_000;
export const BINGO_MS = 12_000;
export const SCOREBOARD_MS = 8_000;
export const TOAST_CALLS = 1;      // toast shown until the next call
export const LOCKOUT_CALLS = 2;
export const PER_CALL: Record&lt;Pattern, number&gt; = { line: 1, x: 2, corners: 2, blackout: 3 };
export const MAX_CALLS: Record&lt;Pattern, number&gt; = { line: 60, x: 38, corners: 38, blackout: 25 };
export const POINTS = { win: 5, shared: 3, oneAway: 2, twoAway: 1, bogus: -1 } as const;</code></pre>

<h4>Views</h4>
<pre><code>export interface CallView { number: number; letter: 'B' | 'I' | 'N' | 'G' | 'O'; call: string }

export interface BingoTvView extends TvView {
  round: number; totalRounds: number; pattern: Pattern; patternCells: number[]; perCall: number;
  current: CallView[];                 // numbers of the latest call (1–3); [] in intro
  called: number[];                    // every called number, in call order
  callIndex: number; maxCalls: number;
  closeness: { playerId: string; away: number }[];   // away ∈ {1, 2}, sorted by away then name
  toast: { playerId: string; line: string } | null;
  reveal: null | {                      // bingo/scoreboard/done only
    winnerId: string | null; winLine: string; card: number[] | null; daubs: number[] | null; winningCells: number[] | null;
    alsoBingo: string[]; soClose: { playerId: string; away: number; points: number }[]; endedBy: 'bingo' | 'cap' | 'skip';
  };
  standings: { playerId: string; total: number; delta: number; rank: number }[] | null; // scoreboard/done
  nextPattern: Pattern | null;         // scoreboard
  awards: { id: string; title: string; description: string; playerId: string }[]; // done
}

export interface BingoControllerView extends ControllerView {
  round: number; totalRounds: number; pattern: Pattern; patternCells: number[]; perCall: number;
  current: CallView[]; recent: CallView[]; called: number[]; callIndex: number;
  card: number[] | null;               // null for spectators
  daubs: number[];                     // own daubed indices
  away: number | null;                 // own closeness (1 or 2), else null
  lockedCalls: number;                 // calls remaining in lockout (0 = free)
  canClaim: boolean;                   // play: not locked; bingo: pattern complete and not yet claimed
  claimed: 'winner' | 'shared' | null;
  roundPoints: number | null;          // bingo/scoreboard: own round points
  standings: BingoTvView['standings'];
  nextPattern: Pattern | null;
  awards: BingoTvView['awards'];
}</code></pre>
<p><code>ControllerView</code> never includes other players' cards or daubs; the TV includes a card only in <code>reveal</code> (the winner's). Contract-test hints: <code>hiddenFromController = other players' card numbers as strings is NOT viable</code> (numbers collide with called numbers), so the config instead asserts <code>view.card</code> equals the requesting player's card and that <code>view.daubs</code> ⊆ own daubs; <code>hiddenFromTv</code> = <code>[]</code> (cards are not secret per se, just not shown).</p>

<h4>Sample mid-game state (round 1, after call 13, Bo locked out)</h4>
<pre><code>{
  "phase": { "id": "play", "startedAt": 1758000078000, "deadline": 1758000084000 },
  "rng": { "seed": 913422, "step": 218 },
  "players": {
    "p1": { "id": "p1", "name": "Ana", "avatarId": "a03", "connected": true },
    "p2": { "id": "p2", "name": "Bo",  "avatarId": "a07", "connected": true },
    "p3": { "id": "p3", "name": "Cy",  "avatarId": "a11", "connected": true },
    "p4": { "id": "p4", "name": "Dee", "avatarId": "a02", "connected": false }
  },
  "settings": { "rounds": 3, "pattern": "classic", "callSeconds": 6, "assist": false, "spicy": false },
  "round": {
    "number": 1, "pattern": "line",
    "deck": [7, 52, 29, 13, 61, 22, 3, 70, 47, 19, 44, 59, 38, 66, 9, 41, 75, 1, 33, 18, 56, 64, 27, 2, 50, 71, 15, 36, 45, 68, 4, 60, 31, 20, 55, 74, 12, 49, 26, 63, 8, 39, 17, 72, 5, 34, 58, 24, 43, 69, 11, 30, 53, 65, 6, 42, 21, 73, 14, 37, 48, 62, 10, 25, 46, 67, 16, 32, 51, 35, 54, 57, 28, 23, 40],
    "drawn": 13, "calls": 13,
    "calledAt": [1758000006000, 1758000012000, 1758000018000, 1758000024000, 1758000030000, 1758000036000, 1758000042000, 1758000048000, 1758000054000, 1758000060000, 1758000066000, 1758000072000, 1758000078000],
    "cards": {
      "p1": [3, 22, 44, 47, 62, 11, 17, 31, 59, 74, 7, 29, 0, 52, 66, 14, 16, 38, 46, 70, 1, 25, 40, 55, 61],
      "p2": [8, 19, 35, 49, 63, 2, 28, 44, 58, 71, 13, 24, 0, 51, 69, 6, 21, 39, 46, 75, 15, 30, 33, 54, 62],
      "p3": [2, 21, 33, 48, 63, 9, 18, 38, 50, 72, 13, 19, 0, 52, 61, 5, 27, 41, 57, 66, 15, 30, 35, 46, 69],
      "p4": [12, 16, 34, 55, 65, 4, 23, 45, 47, 70, 10, 26, 0, 59, 61, 1, 29, 32, 53, 67, 14, 20, 43, 48, 73]
    },
    "daubs": { "p1": [0, 1, 3, 10, 11, 12, 13, 17], "p2": [10, 12, 16], "p3": [3, 7, 10, 11, 12, 13, 14], "p4": [12] },
    "lockedUntilCall": { "p2": 15 },
    "winnerId": null, "winningCells": null, "alsoBingo": [],
    "falseCalls": { "p2": 1 }, "points": { "p2": -1 },
    "endedBy": null,
    "toast": { "kind": "false", "playerId": "p2", "line": "Count again, Bo.", "untilCall": 14 },
    "winLine": null
  },
  "scores": { "p1": 0, "p2": 0, "p3": 0, "p4": 0 },
  "roundWins": {}, "totalFalse": { "p2": 1 }, "oneAwayFinishes": {}, "blackoutWins": {},
  "daubStats": { "p1": { "count": 7, "totalMs": 15400 }, "p2": { "count": 2, "totalMs": 5100 }, "p3": { "count": 6, "totalMs": 9800 } },
  "history": []
}</code></pre>
<p>Size: deck 75 + 16 cards × 25 + daubs ≈ 6 KB at 16 players — far under 256 KB. Note Cy (p3) already has a complete middle row in this sample: he simply has not pressed BINGO! yet.</p>`,
  },
  {
    title: 'Reducer logic',
    html: `
${fig(stateDiagram, '<b>State diagram.</b> <code>play</code> loops on its own timer; every other transition is a deadline, a VIP skip, or a valid claim.', [], 'tv')}
<h3>Per-phase transition rules</h3>
<table>
<thead><tr><th>Phase</th><th>Event</th><th>Rule</th></tr></thead>
<tbody>
<tr><td>any</td><td><code>player</code></td><td><code>setConnected</code>. Nothing else changes; cards persist.</td></tr>
<tr><td>any</td><td><code>vip pause/resume</code></td><td><code>applyVip</code> shifts the deadline. Inputs/timers ignored while paused.</td></tr>
<tr><td>any</td><td><code>vip end</code></td><td><code>enterDone</code>: totals as they stand (an unfinished round's <code>points</code> are discarded).</td></tr>
<tr><td><code>intro</code></td><td>timer · skip</td><td><code>enterPlay</code> → first call immediately.</td></tr>
<tr><td><code>play</code></td><td><code>input daub</code></td><td>Ignore unless: player in <code>state.players</code>, <code>index ≠ 12</code>, not already daubed, <code>card[index] ∈ called</code>. Then add index (keep sorted), record reaction time (<code>now − calledAt[callThatRevealed(card[index])]</code>). No transition.</td></tr>
<tr><td><code>play</code></td><td><code>input bingo</code></td><td>Ignore if not a player or <code>calls &lt; lockedUntilCall[p]</code>. If <code>completedCells(card, daubs, pattern)</code> is non-null → <code>endRound('bingo', p, cells)</code>. Else: <code>points[p] −= 1</code>, <code>falseCalls[p]++</code>, <code>totalFalse[p]++</code>, <code>lockedUntilCall[p] = calls + 2</code>, <code>toast = {…, line: pick(rng, FALSE_LINES)}</code>.</td></tr>
<tr><td><code>play</code></td><td>timer (current instance)</td><td>If <code>calls ≥ MAX_CALLS[pattern]</code> or <code>drawn ≥ 75</code> → <code>endRound('cap')</code>. Else <code>nextCall</code>: <code>drawn = min(75, drawn + perCall)</code>, <code>calls++</code>, push <code>now</code> to <code>calledAt</code>, clear toast if <code>calls ≥ toast.untilCall</code>, then <code>enterPhase(state, 'play', now, callSeconds × 1000)</code> (new <code>startedAt</code> ⇒ a new timer instance; the old one is stale by construction).</td></tr>
<tr><td><code>play</code></td><td>skip</td><td><code>endRound('skip')</code>.</td></tr>
<tr><td><code>bingo</code></td><td><code>input bingo</code></td><td>Ignore if not a player, is the winner, or already in <code>alsoBingo</code>. If pattern complete → push to <code>alsoBingo</code>, <code>points[p] = 3</code> (replaces any closeness points). Else <code>points[p] −= 1</code>, <code>falseCalls[p]++</code> (no lockout).</td></tr>
<tr><td><code>bingo</code></td><td>timer · skip</td><td><code>commitRound</code> (add <code>points</code> to <code>scores</code>, update wins/stats/history), then <code>round.number &lt; settings.rounds ? enterScoreboard : enterDone</code>.</td></tr>
<tr><td><code>scoreboard</code></td><td>timer · skip</td><td><code>enterIntro(round + 1)</code>: deal cards, shuffle deck, reset round state.</td></tr>
<tr><td><code>done</code></td><td>anything</td><td>state unchanged.</td></tr>
</tbody></table>

<h3>Pseudocode</h3>
<pre><code>// server/index.ts
function init(ctx) {
  const settings = readSettings(ctx.settings);
  let s = { ...base(ctx), settings, scores: zeros(ctx.players), roundWins: {}, totalFalse: {}, oneAwayFinishes: {}, blackoutWins: {}, daubStats: {}, history: [], round: emptyRound() };
  return enterIntro(s, 1, ctx.now);
}

function reduce(state, event) {
  if (event.type === 'player') return setConnected(state, event);
  const vip = applyVip(state, event, { skip: skipCurrent, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state;
  switch (state.phase.id) {
    case 'intro':      return reduceIntro(state, event);
    case 'play':       return reducePlay(state, event);
    case 'bingo':      return reduceBingo(state, event);
    case 'scoreboard': return reduceScoreboard(state, event);
    default:           return state;
  }
}

function skipCurrent(s, now) {
  switch (s.phase.id) {
    case 'intro':      return enterPlay(s, now);
    case 'play':       return endRound(s, now, 'skip', null, null);
    case 'bingo':      return afterBingo(s, now);
    case 'scoreboard': return enterIntro(s, s.round.number + 1, now);
    default:           return s;
  }
}

// server/phases/intro.ts
export function enterIntro(s, number, now) {
  let rng = s.rng;
  const pattern = patternFor(s.settings, number);
  const [deck, r1] = shuffle(rng, range(1, 75)); rng = r1;
  const cards = {};
  for (const id of Object.keys(s.players).sort()) { const [card, r2] = dealCard(rng); cards[id] = card; rng = r2; }  // sorted ids ⇒ deterministic
  const daubs = mapValues(cards, () => [12]);
  const round = { number, pattern, deck, drawn: 0, calls: 0, calledAt: [], cards, daubs, lockedUntilCall: {}, winnerId: null, winningCells: null, alsoBingo: [], falseCalls: {}, points: {}, endedBy: null, toast: null, winLine: null };
  return enterPhase({ ...s, rng, round }, 'intro', now, INTRO_MS);
}
export function dealCard(rng) {           // column c draws 5 distinct numbers from c*15+1 .. c*15+15
  const card = new Array(25).fill(0); let r = rng;
  for (let c = 0; c &lt; 5; c++) { const [col, r2] = shuffle(r, range(c * 15 + 1, c * 15 + 15)); r = r2; for (let row = 0; row &lt; 5; row++) card[row * 5 + c] = col[row]; }
  card[12] = 0; return [card, r];
}
export function reduceIntro(s, e) { return isTimerFor(s, e) ? enterPlay(s, e.now) : s; }

// server/phases/play.ts
export function enterPlay(s, now) { return nextCall(s, now); }
function nextCall(s, now) {
  const r = s.round; const per = PER_CALL[r.pattern];
  const drawn = Math.min(75, r.drawn + per);
  const calls = r.calls + 1;
  const toast = r.toast &amp;&amp; calls &gt;= r.toast.untilCall ? null : r.toast;
  return enterPhase({ ...s, round: { ...r, drawn, calls, calledAt: [...r.calledAt, now], toast } }, 'play', now, s.settings.callSeconds * 1000);
}
export function reducePlay(s, e) {
  if (e.type === 'input') {
    const p = e.playerId; const r = s.round; if (!s.players[p] || !r.cards[p]) return s;
    if (e.input.type === 'daub') {
      const i = e.input.index; const n = r.cards[p][i];
      if (i === 12 || r.daubs[p].includes(i)) return s;
      const callIdx = callIndexOf(r, n);            // index in calledAt of the call that revealed n, or -1
      if (callIdx &lt; 0) return s;                    // not called yet → silently ignored
      const daubs = { ...r.daubs, [p]: [...r.daubs[p], i].sort((a, b) =&gt; a - b) };
      const st = s.daubStats[p] ?? { count: 0, totalMs: 0 };
      const daubStats = { ...s.daubStats, [p]: { count: st.count + 1, totalMs: st.totalMs + Math.max(0, e.now - r.calledAt[callIdx]) } };
      return { ...s, daubStats, round: { ...r, daubs } };
    }
    // bingo
    if (r.calls &lt; (r.lockedUntilCall[p] ?? 0)) return s;
    const cells = completedCells(r.cards[p], r.daubs[p], r.pattern);
    if (cells) return endRound(s, e.now, 'bingo', p, cells);
    const [line, rng] = pick(s.rng, FALSE_LINES);
    return { ...s, rng, totalFalse: bump(s.totalFalse, p), round: { ...r,
      points: { ...r.points, [p]: (r.points[p] ?? 0) + POINTS.bogus }, falseCalls: bump(r.falseCalls, p),
      lockedUntilCall: { ...r.lockedUntilCall, [p]: r.calls + LOCKOUT_CALLS },
      toast: { kind: 'false', playerId: p, line: line.replaceAll('{name}', s.players[p].name), untilCall: r.calls + TOAST_CALLS } } };
  }
  if (isTimerFor(s, e)) {
    const r = s.round;
    if (r.calls &gt;= MAX_CALLS[r.pattern] || r.drawn &gt;= 75) return endRound(s, e.now, 'cap', null, null);
    return nextCall(s, e.now);
  }
  return s;
}

// server/phases/bingo.ts
export function endRound(s, now, endedBy, winnerId, cells) {
  let r = { ...s.round, endedBy, winnerId, winningCells: cells };
  const points = { ...r.points };
  if (winnerId) points[winnerId] = (points[winnerId] ?? 0) + POINTS.win;
  for (const id of Object.keys(r.cards)) {                       // closeness for everyone else
    if (id === winnerId) continue;
    const away = cellsAway(r.cards[id], r.daubs[id], r.pattern); // min over completions of undaubed cells
    points[id] = (points[id] ?? 0) + (away === 1 ? POINTS.oneAway : away === 2 ? POINTS.twoAway : 0);
  }
  const [winLine, rng] = pick(s.rng, winnerId ? WIN_LINES : NO_BINGO_LINES);
  r = { ...r, points, winLine: winLine.replaceAll('{name}', winnerId ? s.players[winnerId].name : ''), toast: null };
  return enterPhase({ ...s, rng, round: r }, 'bingo', now, BINGO_MS);
}
export function reduceBingo(s, e) {
  if (e.type === 'input' &amp;&amp; e.input.type === 'bingo') {
    const p = e.playerId; const r = s.round;
    if (!s.players[p] || !r.cards[p] || p === r.winnerId || r.alsoBingo.includes(p)) return s;
    if (completedCells(r.cards[p], r.daubs[p], r.pattern)) {
      const away = cellsAway(r.cards[p], r.daubs[p], r.pattern); // 0 here; closeness already granted was 0
      return { ...s, round: { ...r, alsoBingo: [...r.alsoBingo, p], points: { ...r.points, [p]: (r.points[p] ?? 0) + POINTS.shared } } };
    }
    return { ...s, totalFalse: bump(s.totalFalse, p), round: { ...r, falseCalls: bump(r.falseCalls, p), points: { ...r.points, [p]: (r.points[p] ?? 0) + POINTS.bogus } } };
  }
  if (isTimerFor(s, e)) return afterBingo(s, e.now);
  return s;
}
export function afterBingo(s, now) {
  const c = commitRound(s);                                       // scores += points; roundWins, blackoutWins, oneAwayFinishes, history
  return c.round.number &lt; c.settings.rounds ? enterPhase(c, 'scoreboard', now, SCOREBOARD_MS) : enterDone(c, now);
}

// server/phases/scoreboard.ts
export function reduceScoreboard(s, e) { return isTimerFor(s, e) ? enterIntro(s, s.round.number + 1, e.now) : s; }
export function enterDone(s, now) { return enterPhase(s.phase.id === 'bingo' ? commitRound(s) : s, 'done', now, null); }</code></pre>
<p><b>Note on <code>enterDone</code> via VIP end</b>: a round in <code>play</code> is discarded (its <code>points</code> are not committed) — the rule in §3; from <code>bingo</code> the finished round is committed first.</p>

<h3>Pattern helpers (<code>server/patterns.ts</code>)</h3>
<pre><code>export const LINES: number[][] = [ ...rows(5), ...cols(5), [0,6,12,18,24], [4,8,16,20,12] ];
export function completions(pattern: Pattern): number[][] {
  switch (pattern) { case 'line': return LINES; case 'x': return [[0,6,12,18,24,4,8,16,20]]; case 'corners': return [[0,4,20,24]]; case 'blackout': return [range(0,24)]; }
}
/** Undaubed count on the best completion (12 is always daubed). */
export function cellsAway(card, daubs, pattern): number {
  const d = new Set(daubs); d.add(12);
  return Math.min(...completions(pattern).map((cells) =&gt; cells.filter((i) =&gt; !d.has(i)).length));
}
export function completedCells(card, daubs, pattern): number[] | null {
  const d = new Set(daubs); d.add(12);
  return completions(pattern).find((cells) =&gt; cells.every((i) =&gt; d.has(i))) ?? null;
}
export function callIndexOf(round, n): number {                   // which call revealed n (−1 if uncalled)
  const pos = round.deck.indexOf(n); if (pos &lt; 0 || pos &gt;= round.drawn) return -1;
  return Math.floor(pos / PER_CALL[round.pattern]);
}</code></pre>

<h3>Where randomness is drawn</h3>
<ul>
<li><code>enterIntro</code>: deck shuffle (one <code>shuffle</code>), then one <code>shuffle</code> per column per player, in sorted player-id order.</li>
<li>Bogus bingo: one <code>pick</code> for the taunt line. Round end: one <code>pick</code> for the win / no-bingo line.</li>
<li>Nothing else. Views and scoring draw no randomness.</li>
</ul>

<h3><code>bot.sampleInput</code></h3>
<pre><code>sampleInput(state, playerId, rng) {
  const r = state.round; const card = r.cards[playerId];
  if (!state.players[playerId] || !card) return null;
  if (state.phase.id === 'play') {
    if (completedCells(card, r.daubs[playerId], r.pattern) &amp;&amp; r.calls &gt;= (r.lockedUntilCall[playerId] ?? 0)) return { type: 'bingo' };
    const called = new Set(r.deck.slice(0, r.drawn));
    const todo = card.map((n, i) =&gt; i).filter((i) =&gt; i !== 12 &amp;&amp; called.has(card[i]) &amp;&amp; !r.daubs[playerId].includes(i));
    if (todo.length &amp;&amp; rng.chance(0.7)) return { type: 'daub', index: rng.pick(todo) };
    if (rng.chance(0.02)) return { type: 'bingo' };            // the occasional bogus call keeps the taunt path covered
    return null;
  }
  if (state.phase.id === 'bingo') {
    if (playerId !== r.winnerId &amp;&amp; !r.alsoBingo.includes(playerId) &amp;&amp; completedCells(card, r.daubs[playerId], r.pattern)) return { type: 'bingo' };
    return null;
  }
  return null;
}</code></pre>
<p>The sim's <code>random</code> strategy will also send <code>daub</code> with arbitrary indices and <code>bingo</code> at any time; both paths are ignore-or-penalise, never throw.</p>`,
  },
  {
    title: 'Scoring',
    html: `
<h3>Formulas</h3>
<table>
<thead><tr><th>Event</th><th>Points</th><th>When</th></tr></thead>
<tbody>
<tr><td>Valid bingo (first)</td><td><b>+5</b></td><td>Ends the round; counts as a round win.</td></tr>
<tr><td>Shared bingo ("I had it too!")</td><td><b>+3</b></td><td>During the 12-second reveal; pattern must be fully daubed. Replaces closeness points (they would be 0 anyway).</td></tr>
<tr><td>1 away at round end</td><td><b>+2</b></td><td>Fewest undaubed cells on any completion = 1.</td></tr>
<tr><td>2 away at round end</td><td><b>+1</b></td><td>= 2.</td></tr>
<tr><td>Bogus bingo</td><td><b>−1</b> each</td><td>Any invalid claim in <code>play</code> or <code>bingo</code>. Totals may go negative.</td></tr>
</tbody></table>
<p><code>total = Σ rounds (win + shared + closeness + bogus)</code>. Settings change nothing about the point values; <code>pattern</code> and <code>rounds</code> change how many points are on the table (≈5–8 per round).</p>

<h3>Worked example — Ana, Bo, Cy, Dee · 3 rounds · classic</h3>
<table>
<thead><tr><th>Round (pattern)</th><th>Ana</th><th>Bo</th><th>Cy</th><th>Dee</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>1 (line)</td><td>bogus −1, shared +3 = <b>+2</b></td><td>win <b>+5</b></td><td>1 away <b>+2</b></td><td>2 away <b>+1</b></td><td>Bo claims on call 17; Ana had pressed early on call 9, then had it too during the reveal.</td></tr>
<tr><td><i>totals</i></td><td>2</td><td>5</td><td>2</td><td>1</td><td></td></tr>
<tr><td>2 (x)</td><td>1 away <b>+2</b></td><td>bogus ×2 −2, 2 away +1 = <b>−1</b></td><td>3 away <b>0</b></td><td>win <b>+5</b></td><td>Dee claims on call 24.</td></tr>
<tr><td><i>totals</i></td><td>4</td><td>4</td><td>2</td><td>6</td><td></td></tr>
<tr><td>3 (blackout)</td><td>shared <b>+3</b></td><td>1 away <b>+2</b></td><td>win <b>+5</b></td><td>2 away <b>+1</b></td><td>Cy blacks out on call 22; Ana's card was also full and she pressed in the reveal.</td></tr>
<tr><td><i>totals</i></td><td><b>7</b></td><td><b>6</b></td><td><b>7</b></td><td><b>7</b></td><td></td></tr>
</tbody></table>
<p><b>Tie-break</b>: Ana, Cy and Dee all have 7. Round wins: Ana 0, Cy 1, Dee 1 → Cy and Dee ahead of Ana. Bogus calls: Cy 0, Dee 0 → still tied → they <b>share rank 1</b>; Ana is rank 3; Bo rank 4.</p>
<pre><code>ranking = players sorted by (score desc, roundWins desc, totalFalse asc); rank shared only when all three keys are equal
winnerIds = every player with rank 1                                    // ['p3', 'p4']</code></pre>
<p>Implementation note: <code>buildResults</code> ranks on score alone, so <code>results()</code> builds the ranking itself with the composite key and passes it through (still using <code>rank()</code>'s shared-rank convention: "1, 1, 3, 4").</p>

<h3>Awards</h3>
<table>
<thead><tr><th>id</th><th>Title</th><th>Condition</th><th>Example</th></tr></thead>
<tbody>
<tr><td><code>full-house</code></td><td>Full House</td><td>Won a blackout round (most blackout wins; tie → lowest player id)</td><td>Cy</td></tr>
<tr><td><code>callers-nightmare</code></td><td>Caller's Nightmare</td><td>Most bogus bingos, ≥ 2</td><td>Bo (2)</td></tr>
<tr><td><code>quick-daub</code></td><td>Quick Daub</td><td>Lowest <code>totalMs / count</code> with <code>count ≥ 10</code></td><td>Dee (1.9 s)</td></tr>
<tr><td><code>so-close</code></td><td>So Close</td><td>Most rounds finished exactly 1 away without a bingo, ≥ 2</td><td>nobody in the example (each had one)</td></tr>
</tbody></table>
<p>Awards are independent of rank and never affect scores. Ties on an award go to the lowest player id (deterministic, replay-safe).</p>`,
  },
  {
    title: 'Content',
    html: `
<h3>Packs</h3>
<pre><code>// content/schema.ts
import { z } from '@partybox/game-sdk';
export const callsPack = z.object({
  pack: z.enum(['family', 'spicy']),
  calls: z.array(z.object({ number: z.number().int().min(1).max(75), call: z.string().min(1).max(48) })).min(1),
}).refine((p) =&gt; p.pack !== 'family' || new Set(p.calls.map((c) =&gt; c.number)).size === 75, { message: 'family pack must cover 1..75' });
export const linesPack = z.object({
  falseCall: z.array(z.string().min(1).max(80)).min(8),   // may contain {name}
  win: z.array(z.string().min(1).max(80)).min(6),
  noBingo: z.array(z.string().min(1).max(80)).min(3),
});
export const packs = { calls: callsPack, callsSpicy: callsPack, lines: linesPack };
// files: content/calls.json (family, all 75), content/calls-spicy.json (overrides for a subset), content/lines.json</code></pre>
<p><b>Resolution</b>: <code>callFor(n, spicy)</code> = the spicy override if <code>spicy</code> and one exists for n, else the family call. The letter is derived (<code>'BINGO'[⌊(n−1)/15⌋]</code>), never stored.</p>
<h3>Authoring guidelines</h3>
<ul>
<li>Calls are ≤ 5 words, read aloud by a human in one breath. Rhymes and shape-of-the-digit jokes ("two little ducks") travel best; avoid brand names, people, and anything time-sensitive.</li>
<li>Family = fine for a ten-year-old. Spicy = innuendo and teasing, no profanity, no body-shaming, nothing sexual beyond a wink.</li>
<li>Taunt/win lines take <code>{name}</code>; keep them under 60 characters so they fit the TV toast at body size.</li>
<li>Source: the family calls are the traditional British bingo-caller lingo (public-domain folk phrases), adapted to 75-ball numbering; a few (57) are original where the traditional call referenced a brand.</li>
</ul>
<h3>calls.json — family (75)</h3>
${contentList(FAMILY_CALLS.map((c, i) => `<b>${'BINGO'[Math.floor(i / 15)]} ${i + 1}</b> — ${c}`))}
<h3>calls-spicy.json — cheeky overrides (20)</h3>
${contentList(SPICY_CALLS.map(([n, c]) => `<b>${'BINGO'[Math.floor((n - 1) / 15)]} ${n}</b> — ${c}`))}
<h3>lines.json</h3>
<h4>falseCall (12)</h4>${contentList(FALSE_LINES)}
<h4>win (8)</h4>${contentList(WIN_LINES)}
<h4>noBingo (4)</h4>${contentList(NO_BINGO_LINES)}
<p>Total: 119 items. The game burns none — calls are keyed by number, so longevity is unlimited; variety comes from cards and patterns.</p>`,
  },
  {
    title: 'Edge cases',
    html: `
<table>
<thead><tr><th>Case</th><th>Behaviour</th></tr></thead>
<tbody>
<tr><td>1 player</td><td>Works as solitaire. Line rounds usually end by call ~42; the 60-call cap ends the rest ("no bingo", closeness applies). <code>minPlayers = 1</code>.</td></tr>
<tr><td>Min / max players</td><td>Cards for 16 players ≈ 4 KB; the TV "1 away" ticker truncates to 8 avatars + "+n". Shared-bingo chips wrap.</td></tr>
<tr><td>Disconnect in <code>intro</code></td><td>Card already dealt; nothing lost.</td></tr>
<tr><td>Disconnect in <code>play</code></td><td>Daubs live in state; the phone dims its card and disables BINGO! until reconnected (banner). Calls continue — nobody is waited for. The card still earns closeness points.</td></tr>
<tr><td>Disconnect in <code>bingo</code></td><td>Cannot claim a shared bingo unless back within 12 s. Winner status is unaffected.</td></tr>
<tr><td>Disconnect in <code>scoreboard</code>/<code>done</code></td><td>Nothing to do; view on reconnect is current.</td></tr>
<tr><td>VIP leaves</td><td>Engine reassigns VIP; the game never knows who the VIP is. No phase depends on the VIP.</td></tr>
<tr><td>Everyone idle</td><td>Rounds run to their cap (line 60 calls × 6 s = 6 min; x 38; blackout 25) with no winner and 0 closeness (nobody daubed). Defaults worst case ≈ 14 min &lt; <code>estimatedMinutes × 3 = 30</code>. Extreme settings (5 line rounds at 12 s) can exceed the bound — see §14.</td></tr>
<tr><td>Empty / duplicate submissions</td><td>Duplicate <code>daub</code> → ignored. <code>daub 12</code> → ignored. Uncalled number → ignored (assist off means the phone can't tell you it was rejected; the cell simply doesn't fill — the phone plays no <code>submit</code> cue because no view change arrives; see §11). Duplicate <code>bingo</code> in <code>bingo</code> phase → ignored.</td></tr>
<tr><td>Two players press BINGO! on the same call</td><td>First input processed wins (+5); the second gets the shared-bingo button in the reveal (+3). Nobody is punished for phone latency.</td></tr>
<tr><td>Bogus bingo, then a valid one before the lockout lifts</td><td>Ignored until 2 calls have passed — the lockout is the penalty. The phone shows the remaining calls.</td></tr>
<tr><td>Ties everywhere</td><td>Final: score → round wins → fewest bogus → shared rank (possibly everyone rank 1 with 0 points). Awards: lowest player id.</td></tr>
<tr><td>Late joiners</td><td>Spectators (engine). <code>controllerView</code> gives them <code>card: null</code> and the called list; <code>bot.sampleInput</code> returns null for them.</td></tr>
<tr><td>VIP skip mid-phase</td><td><code>intro</code> → play now. <code>play</code> → round ends, no winner, closeness applies. <code>bingo</code> → commit and continue. <code>scoreboard</code> → next round now.</td></tr>
<tr><td>VIP end mid-round</td><td>Unfinished round discarded; totals from completed rounds; <code>results()</code> lists every player (0 for those with no completed round).</td></tr>
<tr><td>Spicy off (default)</td><td>Only <code>calls.json</code> is used. Toggling spicy mid-game is impossible (settings are fixed at init).</td></tr>
<tr><td>Unspent timers</td><td>A valid bingo mid-countdown abandons the <code>play</code> timer (stale by <code>startedAt</code>). Skips likewise. The <code>bingo</code> timer always runs its 12 s unless skipped.</td></tr>
<tr><td>Pause during <code>play</code></td><td>Deadline shifts; the TV shows the shell's paused curtain over the board; daubs are ignored (the phone disables the card).</td></tr>
<tr><td>Deck exhausted mid-call</td><td>x/corners: call 38 reveals 1 number; blackout: exactly 25 calls. <code>drawn</code> is clamped to 75.</td></tr>
<tr><td>Player who never daubs but has a called line</td><td>Not a bingo — "daubed" is the rule; their phone's closeness line stays silent until they daub.</td></tr>
</tbody></table>`,
  },
  {
    title: 'Art & sound direction',
    html: `
<h3>Palette (design-system tokens only)</h3>
<div class="swatches">
${[
  ['#0f1020', '--pb-bg · stage'],
  ['#1c1e3a', '--pb-surface · call card, board cells'],
  ['#272a52', '--pb-surface-2 · recent strip'],
  ['#ffd166', '--pb-accent-2 · current call, BINGO letters'],
  ['#ff5d8f', '--pb-accent · called numbers, winning cells, BINGO! button'],
  ['#06d6a0', '--pb-accent-3 · daubed cells, shared-bingo button'],
  ['#ef476f', '--pb-danger · bogus toast, locked banner'],
  ['#b3b7d9', '--pb-text-muted · uncalled numbers'],
]
  .map(
    ([hex, label]) =>
      `<div class="swatch"><div style="background:${hex}"></div><span>${hex}<br>${label}</span></div>`,
  )
  .join('')}
</div>
<h3>Typography</h3>
<ul>
<li>Current call: display 128 px real (bold) in accent-2, letter and number as one word with a thin space ("N 38"). Nickname: h2 italic.</li>
<li>Board numbers: caption 28 px real; called numbers bold on accent. Card cells on the phone: 22 px bold in 60 px cells; FREE at 15 px.</li>
<li>"BINGO!" on the reveal: display; win line: h2.</li>
</ul>
<h3>Motion (all ≤ 600 ms, easing <code>cubic-bezier(0.2, 0.8, 0.2, 1)</code>)</h3>
<table>
<thead><tr><th>Moment</th><th>Animation</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>New call</td><td>Call card: opacity 0→1 + 12 px rise (transform only). Previous number slides into the recent strip.</td><td>300 ms (<code>--pb-motion-base</code>)</td></tr>
<tr><td>Board cell called</td><td>Background swap + scale 1→1.15→1</td><td>150 ms (<code>--pb-motion-fast</code>)</td></tr>
<tr><td>Phone daub</td><td>Cell fills accent-3 with a scale pop 0.9→1</td><td>150 ms</td></tr>
<tr><td>Bogus toast</td><td>Scale 0.95→1 + fade in; auto-fades after 3 s (client-side timer on the view's <code>toast</code> presence — the toast is removed from state at the next call regardless)</td><td>300 ms in / 300 ms out</td></tr>
<tr><td>Bingo reveal</td><td>"BINGO!" fades in; winning cells light one by one (5–25 cells, 60 ms apart, capped at 600 ms total)</td><td>≤ 600 ms (<code>--pb-motion-slow</code>)</td></tr>
<tr><td>Scoreboard</td><td><code>Scoreboard</code> primitive's own +n animation</td><td>primitive default</td></tr>
</tbody></table>
<p>Reduced motion: every duration 0; the reveal shows all winning cells at once.</p>
<h3>Sound (design-system cues)</h3>
<table>
<thead><tr><th>Moment</th><th>Cue</th><th>Trigger</th></tr></thead>
<tbody>
<tr><td>Round intro / phase change</td><td><code>phase</code></td><td>TV shell (phase id changes)</td></tr>
<tr><td>New call</td><td><code>reveal</code></td><td>Game TV component when <code>callIndex</code> increments — needs the game-triggered cue API (§13)</td></tr>
<tr><td>Own daub accepted</td><td><code>submit</code></td><td>Controller shell? Today the shell plays <code>submit</code> only for accepted inputs it knows about; a daub is an input, so this should already fire — verify in review</td></tr>
<tr><td>Bogus bingo</td><td><code>error</code> on the offender's phone; TV: <code>error</code> via game cue API</td><td>controller shell (rejected input? no — it is accepted and penalised, so the game must trigger it)</td></tr>
<tr><td>Bingo</td><td><code>win</code> on the TV (game cue), <code>submit</code> on the winner's phone</td><td>game cue API</td></tr>
<tr><td>Last-5-seconds tick</td><td><code>countdown</code></td><td><b>Suppressed</b> in <code>play</code> (quiet timer, §13); normal in <code>intro</code>/<code>bingo</code>/<code>scoreboard</code></td></tr>
</tbody></table>
<h3>Asset list</h3>
<p>No raster assets are required — every visual is CSS/SVG. Optional decorative assets if the polish pass wants them:</p>
<table>
<thead><tr><th>File</th><th>Size</th><th>Image-generation prompt</th></tr></thead>
<tbody>
<tr><td><code>games/bingo/client/assets/ball.svg</code></td><td>256×256, vector</td><td>"Flat vector bingo ball, glossy dark navy sphere (#1c1e3a) with a warm yellow (#ffd166) circular label, no number, subtle rim light, no background, no text."</td></tr>
<tr><td><code>games/bingo/client/assets/dauber.svg</code></td><td>128×128, vector</td><td>"Flat icon of a bingo dauber marker pen tilted 30°, pink (#ff5d8f) cap and ink dot, minimal line style, no background."</td></tr>
<tr><td><code>games/bingo/client/assets/confetti.svg</code></td><td>960×540, vector</td><td>"Sparse confetti scatter in #ff5d8f, #ffd166, #06d6a0, #4cc9f0 on transparent background, small rectangles and circles, no gradients, no shadows." (used once on the reveal, opacity 0.6, animated with transform only)</td></tr>
</tbody></table>`,
  },
  {
    title: 'Accessibility & TV readability',
    html: `
<ul>
<li><b>Sizes at 1080p</b>: current call 192 px, nickname 48 px, board numbers 28 px (the smallest TV text; the board is 15 columns × 60 px cells = 900 px wide, well inside overscan), "1 away" ticker names 36 px, toast body 36 px.</li>
<li><b>Colour is never alone</b>: called cells are bold + filled; the current call also has a ring and a larger cell; daubed phone cells get a filled circle behind the number and (in the reveal) an outline; the pattern is shown as a dot-grid <em>and</em> named. Bogus toast has the ✕ word "BOGUS" not just red.</li>
<li><b>Colour-blind safety</b>: accent (pink) vs accent-3 (green) vs accent-2 (yellow) are separated by lightness (L* ≈ 62 / 78 / 87), so called/daubed/current remain distinct in deuteranopia; the phone additionally uses fill vs outline.</li>
<li><b>Screen readers (controller)</b>: the card is a <code>grid</code> role with 25 <code>gridcell</code> buttons labelled "B 7, daubed" / "N 38, not daubed" / "FREE"; the call header is an <code>aria-live="polite"</code> region announcing "N 38, Christmas cake"; BINGO! is a button with <code>aria-disabled</code> and the lockout text in its accessible name ("Bingo, locked for 2 calls"); the banner is <code>role="status"</code>.</li>
<li><b>Touch</b>: 60 × 60 px cells with 7 px gaps (≥ 44 / ≥ 8); BINGO! button 64 px tall in the sticky footer; nothing else is tappable in play, so mis-taps are impossible.</li>
<li><b>Reduced motion</b>: no call-card rise, no cell pop, reveal all-at-once, toast without scale.</li>
<li><b>Cadence accessibility</b>: <code>callSeconds</code> up to 12 s and <code>assist</code> exist precisely for players who read slowly; the VIP can also pause.</li>
</ul>`,
  },
  {
    title: 'Implementation plan',
    html: `
<h3>Files under <code>games/bingo/</code></h3>
<table>
<thead><tr><th>File</th><th>Contents</th></tr></thead>
<tbody>
<tr><td><code>manifest.json</code></td><td>id <code>bingo</code>, name "Bingo", tagline "The TV calls. You daub. Don't bluff.", minPlayers 1, maxPlayers 16, estimatedMinutes 10, tags ["classic","tap","luck","speed"], settings: <code>rounds</code> (number 1–5, default 3), <code>pattern</code> (select classic/line/x/corners/blackout), <code>callSeconds</code> (number 3–12 step 1, default 6; description “3 = fast, 6 = hall pace, 9+ = relaxed”), <code>assist</code> (boolean false), <code>spicy</code> (boolean false).</td></tr>
<tr><td><code>README.md</code></td><td>The spec — §3, §4, §8, §10 of this document condensed under the required headings.</td></tr>
<tr><td><code>CLAUDE.md</code></td><td>Local rules: "play re-enters itself per call; never add a second timer; daub validity = called ∧ own card".</td></tr>
<tr><td><code>server/types.ts</code></td><td>§6 types, <code>inputSchema</code>, constants.</td></tr>
<tr><td><code>server/patterns.ts</code></td><td><code>completions</code>, <code>cellsAway</code>, <code>completedCells</code>, <code>callIndexOf</code>, <code>dealCard</code>, <code>patternFor</code>.</td></tr>
<tr><td><code>server/phases/intro.ts</code></td><td><code>enterIntro</code>, <code>reduceIntro</code>.</td></tr>
<tr><td><code>server/phases/play.ts</code></td><td><code>enterPlay</code>, <code>nextCall</code>, <code>reducePlay</code>.</td></tr>
<tr><td><code>server/phases/bingo.ts</code></td><td><code>endRound</code>, <code>reduceBingo</code>, <code>afterBingo</code>, <code>commitRound</code>.</td></tr>
<tr><td><code>server/phases/scoreboard.ts</code></td><td><code>reduceScoreboard</code>, <code>enterDone</code>.</td></tr>
<tr><td><code>server/scoring.ts</code></td><td><code>closenessPoints</code>, composite ranking, <code>awards</code>, <code>results</code>.</td></tr>
<tr><td><code>server/content.ts</code></td><td><code>callFor(n, spicy)</code>, <code>FALSE_LINES</code>, <code>WIN_LINES</code>, <code>NO_BINGO_LINES</code> (validated at import).</td></tr>
<tr><td><code>server/views.ts</code></td><td><code>tvView</code>, <code>controllerView</code> (kept out of index.ts to respect the 300-line limit).</td></tr>
<tr><td><code>server/index.ts</code></td><td>manifest parse, <code>init</code>, <code>reduce</code>, <code>skipCurrent</code>, bot, <code>game</code> export.</td></tr>
<tr><td><code>content/schema.ts</code>, <code>content/calls.json</code>, <code>content/calls-spicy.json</code>, <code>content/lines.json</code></td><td>§9.</td></tr>
<tr><td><code>client/index.ts</code></td><td><code>clientModule</code> with <code>sounds: { call: 'reveal', bingo: 'win', bogus: 'error' }</code>.</td></tr>
<tr><td><code>client/Tv.tsx</code></td><td>Switch on <code>phaseId</code>: <code>IntroTv</code>, <code>PlayTv</code> (CallCard + Board + Ticker + Toast), <code>RevealTv</code>, <code>ScoreboardTv</code> (uses <code>Scoreboard</code>), <code>DoneTv</code>.</td></tr>
<tr><td><code>client/Controller.tsx</code></td><td><code>CardGrid</code> (25 buttons), <code>CallHeader</code>, states per §5; footer <code>PrimaryButton</code> "BINGO!" / "I had it too!".</td></tr>
<tr><td><code>client/Board.tsx</code>, <code>client/CardGrid.tsx</code>, <code>client/PatternIcon.tsx</code></td><td>Small presentational components shared by TV and controller.</td></tr>
<tr><td><code>client/bingo.module.css</code></td><td>Tokens only; grid layouts; transform/opacity animations.</td></tr>
<tr><td><code>fixtures/intro.json</code>, <code>play.json</code>, <code>bingo.json</code>, <code>scoreboard.json</code>, <code>done.json</code></td><td>Dump from <code>pnpm sim --game bingo --players 6 --runs 1 --dump-fixtures</code>; hand-edit <code>play.json</code> to include a toast and a locked player, <code>bingo.json</code> to include one shared bingo.</td></tr>
<tr><td><code>__tests__/patterns.test.ts</code></td><td><code>dealCard</code> column ranges + uniqueness + FREE; <code>cellsAway</code>/<code>completedCells</code> for every pattern; <code>callIndexOf</code> with perCall 1/2/3.</td></tr>
<tr><td><code>__tests__/scoring.test.ts</code></td><td>The §8 worked example end-to-end (four players, three rounds, final ranking [p3,p4]=1, p1=3, p2=4; awards).</td></tr>
<tr><td><code>__tests__/phases.test.ts</code></td><td>"play timer draws next call and rotates startedAt", "stale timer ignored", "cap ends round with closeness", "daub of uncalled number ignored", "bogus bingo penalises and locks for 2 calls", "locked bingo ignored", "valid bingo ends round", "shared bingo +3 replaces closeness", "VIP skip in play ends round", "VIP end discards unfinished round", "pause blocks daubs".</td></tr>
<tr><td><code>__tests__/views.test.ts</code></td><td>Controller never contains another player's card; TV contains a card only in bingo/scoreboard/done and only the winner's; spectator view has <code>card: null</code>.</td></tr>
<tr><td><code>__tests__/contract.config.ts</code></td><td><code>settingsVariants: [{ rounds: 1, pattern: 'blackout', callSeconds: 3 }, { rounds: 2, pattern: 'line', callSeconds: 3, assist: true, spicy: true }]</code>; custom <code>hiddenFromController</code> asserting <code>view.card === state.round.cards[me]</code>.</td></tr>
</tbody></table>
<h3>Effort</h3>
<p><b>M</b> — ≈ 700 lines TypeScript + 400 lines TSX + content. Two days for one session including the sim/e2e loop. The card grid and board are the only bespoke UI; everything else composes primitives.</p>
<h3>SDK gaps (also appended to <code>sdk-requests.md</code>)</h3>
<ol>
<li><b>Quiet timer mode.</b> The shells' <code>Timer</code> turns red, scales and plays <code>countdown</code> in the last 5 s of every deadline. A 6-second call cadence would tick five of every six seconds. Request: an optional envelope field <code>timer?: 'normal' | 'quiet' | 'hidden'</code> (contract change → ADR) honoured by <code>TvPlaying</code> and the controller shell. Workaround until then: the game sets <code>callSeconds</code> default to 6 and accepts the noise in review builds, or the shell suppresses urgency when <code>deadline − startedAt &lt; 15 s</code> (needs <code>startedAt</code> in the envelope, also a contract change).</li>
<li><b>Game-triggered sound cues.</b> <code>GameClientModule.sounds</code> exists but <code>GameTvProps</code>/<code>GameControllerProps</code> carry no way to play one. Request: a <code>useSound()</code> hook from <code>@partybox/game-sdk/ui</code> (context provided by both shells) returning <code>(moment: string) =&gt; void</code> that maps through <code>clientModule.sounds</code>. Needed for the call, bingo and bogus cues.</li>
<li><b>Chip status for "locked out".</b> <code>PlayerStatus</code> has no negative state; the design reuses <code>waiting</code>. Nice-to-have: a <code>'penalty'</code> status with a distinct glyph.</li>
</ol>`,
  },
  {
    title: 'Open questions',
    html: `
<ol>
<li><b>Closeness by daubs or by calls?</b> Recommended: <b>daubs</b> (as specified) — idle players earn nothing and the phone's "1 away" line rewards attention. Alternative: by called numbers, which is kinder to slow readers but makes doing nothing profitable.</li>
<li><b>Should a bogus bingo cost −1 or just the lockout?</b> Recommended: <b>−1 + lockout</b>. The negative number on the TV is half the joke.</li>
<li><b>Termination bound for extreme settings.</b> 5 line rounds at 12 s with nobody daubing ≈ 60 min &gt; 30. Recommended: keep the settings, keep <code>estimatedMinutes = 10</code>, and rely on the contract test using defaults + the listed variants (all under the bound); note in the README that the VIP can skip a dead round. Alternative: cap line rounds at 45 calls (solo line rounds would then end without bingo ~40 % of the time).</li>
<li><b>New cards every round, or one card for the game?</b> Recommended: <b>new cards</b> (as specified) — a bad card only hurts for one round and blackout needs a fresh deck anyway.</li>
<li><b>Auto-daub setting for accessibility?</b> Not specified. Recommended: no — <code>assist</code> + <code>callSeconds = 12</code> covers it without making the phone play itself. Revisit after the accessibility pass (BL-008).</li>
<li><b>Points per daub (Skillz-style)?</b> Blackout Bingo pays 100 per correct daub + up to 75 for speed and −25 for a wrong tap, which keeps every player scoring every call. Recommended: <b>no</b> for v1 — it inflates scores into the hundreds, makes the scoreboard unreadable from the couch and rewards mashing; the Quick Daub award and closeness points cover the same instinct. Revisit as a <code>daubPoints</code> boolean if idle rounds feel dead in playtests.</li>
<li><b>Multiple cards per player?</b> Every commercial app sells 4–8 cards per player. Recommended: <b>one card</b> — 60 px cells only fit once on a phone, and one card keeps the bogus-bingo bluff honest. A “2 cards” setting could come later with 48 px cells.</li>
<li><b>Hall rule: must claim before the next call?</b> Halls void a “sleeper” bingo announced after the next number. Recommended: <b>no</b> — phone latency and kids; a claim is valid whenever the daubs are.</li>
<li><b>Show the "1 away" ticker at all?</b> It reveals who to heckle. Recommended: <b>yes</b>, default on, no setting (fewer settings, more shouting).</li>
</ol>`,
  },
  {
    title: 'Self-review scorecard',
    html: `
<div class="score">
<span>Fun</span><b class="v">5</b><span>Zero learning curve, a shout button with a real penalty, and an escalating cadence that turns the last round into a scramble.</span>
<span>Clarity</span><b class="v">5</b><span>§3 is refereeable; the only subtle rule (daubed, not called) is stated three times.</span>
<span>Implementability</span><b class="v">5</b><span>Every transition is enumerated; the play-loop-on-timer pattern uses <code>enterPhase</code> exactly as the contract intends; pseudocode covers every branch.</span>
<span>Novelty</span><b class="v">2</b><span>It is bingo, by request. The bogus-bingo lockout, shared-bingo window and multi-number calls are the only new mechanics. Accepted for idea 001; the matrix will be balanced by 002+.</span>
<span>TV spectacle</span><b class="v">4</b><span>The call card, the filling board and the taunt toast carry the room; no drawing or text reveals to read out.</span>
<span>Phone ergonomics</span><b class="v">5</b><span>Twenty-five 60 px cells and one 64 px button; nothing else to touch.</span>
<span>Content longevity</span><b class="v">5</b><span>Cards are procedural; calls are per number and never repeat within a round.</span>
<span>Pacing</span><b class="v">4</b><span>≈10 min at defaults; solo line rounds can drag to six minutes (cap), which is why <code>callSeconds</code> goes down to 3.</span>
<span>Edge-case coverage</span><b class="v">5</b><span>§10 covers every case in the brief plus latency ties, lockout overlap and deck exhaustion.</span>
</div>
<p class="note">Novelty scores 2 against a bar of 3 — this is the one score below threshold. It is a deliberate exception: the owner asked for a recreation of bingo. The revision pass instead pushed novelty into the mechanics (bogus penalty, shared window, per-call multi-draw, closeness scoring) and into the caller content.</p>`,
  },
  {
    title: 'Prior art & references',
    html: `
<p>What other platforms do, and what this design takes or rejects from each. Researched 2026-09-15.</p>
<table>
<thead><tr><th>Platform</th><th>What it does</th><th>Taken / rejected here</th></tr></thead>
<tbody>
<tr><td><b>Bingo Party: Host &amp; Play</b> (Android/iOS, TV + QR)</td><td>One player is the Game Master: calls manually or auto at Slow/Medium/Fast; picks patterns (lines, X, four corners, diamond, blackout); toggles <em>allow multiple winners</em>, <em>late joining</em>, <em>verify BINGO claims</em>; “Single” mode (first valid bingo wins) vs “Progressive” mode (several patterns per session, ordered or auto-sorted by difficulty, fresh winner each stage). Projector view: full 1–75 master board, latest number as an animated ball, call history, active patterns. Auto-mark is a paid feature; 4–8 cards per player.</td><td><b>Taken</b>: the projector layout (board + latest ball + history + pattern) is essentially §5's play screen; “Progressive” = our <code>classic</code> escalation; “multiple winners” = the shared-bingo window, but time-boxed (12 s) rather than a toggle. <b>Rejected</b>: a human Game Master — PartyBox's VIP only skips/pauses; the server calls, so nobody is stuck hosting. Manual claim verification is replaced by server-side validation with a penalty.</td></tr>
<tr><td><b>Crowdpurr Bingo</b> (events, projector + phones)</td><td>Manual, automatic or 24/7 calling; players score points for every marked square <em>and</em> for bingos; live leaderboard on the presentation view; team and quiz modes; branding.</td><td><b>Taken</b>: everybody earns something each round (our closeness points, their per-square points). <b>Rejected</b>: per-square scoring as the main economy (see §14) and rounds that never end — a party round needs a shout and a stop.</td></tr>
<tr><td><b>Bingo Buddies</b> (browser, 1–20 players)</td><td>No login; randomised cards; tap to mark; a BINGO button with instant server verification; custom text squares; 2×2 to 5×5 grids.</td><td><b>Taken</b>: tap-to-mark + a big BINGO button with instant verification. <b>Not now</b>: text-square (“icebreaker”) bingo — a natural content-pack extension (prompts instead of numbers) once the numeric game ships.</td></tr>
<tr><td><b>Skillz Blackout Bingo</b> (competitive mobile)</td><td>Timed 1-card blackout; 100 points per correct daub + up to 75 speed bonus; −25 for a wrong tap; −100 for a false bingo; 1 000 per bingo with escalating bonuses; power-ups.</td><td><b>Taken</b>: a false bingo <em>must cost something</em> (ours: −1 + 2-call lockout), and reaction time matters (Quick Daub award). <b>Rejected</b>: hundreds-of-points economies and power-ups; the TV scoreboard needs single-digit deltas.</td></tr>
<tr><td><b>Bingo Blitz</b> (social casino)</td><td>Auto-daub optional; power-up meter charges after 3 daubs; multi-card multipliers; daubing duels.</td><td><b>Rejected</b> wholesale (monetisation loops), but it confirms that 3-per-call blackout rounds are readable when the latest numbers stay pinned at the top of the card — hence the phone's call header.</td></tr>
<tr><td><b>Bingo halls</b> (etiquette guides, US state regulations)</td><td>Callers pace 4–6 s between numbers; a bingo must be claimed before the next call (“sleeper” bingos are void); the game stops for verification; false calls are corrected politely; ties split the prize; hosts open with quick patterns and play 2–3 rounds with different patterns.</td><td><b>Taken</b>: the 6 s default cadence, three rounds with escalating patterns, ties handled by the shared window. <b>Rejected</b>: the sleeper rule (§14) and “stop everything to verify” — validation is instant, so the game only stops for the celebration.</td></tr>
</tbody></table>
<h3>Design decisions informed by the research</h3>
<ul>
<li>Default cadence 6 s sits at the top of the hall range; 3 s is the “Fast” preset every host app offers; 12 s exists for accessibility, not for hosts.</li>
<li>Escalating patterns (line → X → blackout) mirror “Progressive / difficulty-sorted” modes, which hosts consistently describe as the format that keeps a room for three rounds.</li>
<li>Multi-number calls in the harder rounds are this design's answer to a problem the apps solve by speeding the caller up: a Monte Carlo (2 000 runs per pattern) shows X needs a median 53–61 numbers and blackout 68–71 for 4–16 players, which at one number per 6 s would be 6–7 minutes a round; at 2–3 numbers per call they land at 2–3 minutes with an unchanged reading pace. Line needs a median 23–31 numbers (42 solo).</li>
<li>Server-validated claims with a visible penalty replace the “verify claim” toggle — the joke is only funny if the machine is the referee.</li>
<li>Assist (glow called numbers) is the free middle ground between the apps' paid auto-mark and hunting unaided; auto-mark itself is deliberately absent because marking <em>is</em> the game on a phone.</li>
</ul>
<h3>Links</h3>
<ul>
<li>Bingo Party: Host &amp; Play — <a href="https://play.google.com/store/apps/details?id=com.bingoparty.android">Google Play listing</a>, <a href="https://apkpure.com/bingo-party-host-play/com.bingoparty.android">description mirror</a>, <a href="https://www.bingopartyapp.com/">site</a></li>
<li>Crowdpurr Bingo — <a href="https://www.crowdpurr.com/bingo">crowdpurr.com/bingo</a></li>
<li>Bingo Buddies — <a href="https://gamebuddies.io/games/bingo">gamebuddies.io/games/bingo</a></li>
<li>Skillz, “How to Play Blackout Bingo: Rules, Scoring &amp; Tips” — <a href="https://play.skillz.com/guides/bingo/blackout-bingo/">play.skillz.com</a></li>
<li>Bingo Blitz power-ups — <a href="https://www.bingoblitz.com/support/power-ups/">bingoblitz.com</a></li>
<li>BingoStamp, “How to Play Bingo: Rules, Variants &amp; Win Patterns” (4–6 s pacing, hosting tips) — <a href="https://bingostamp.com/guides/how-to-play-bingo">bingostamp.com</a></li>
<li>Bingo Maker, 75-ball card rules and patterns — <a href="https://www.bingomaker.com/how-to-play-bingo/">bingomaker.com</a></li>
<li>Arizona Admin. Code R15-7-209, “Method of Call and Announcement of Bingo” (claim before the next call) — <a href="https://www.law.cornell.edu/regulations/arizona/Ariz-Admin-Code-SS-R15-7-209">law.cornell.edu</a></li>
<li>Jackpotjoy, “Bingo Etiquette Guide: Online &amp; Hall Rules” (false-call etiquette) — <a href="https://www.jackpotjoy.com/uk/blog/bingo/bingo-etiquette-online-and-hall-rules">jackpotjoy.com</a></li>
<li>Galaxy4Games, “Bingo Game Development: Features, Mechanics &amp; Monetization” — <a href="https://galaxy4games.com/en/knowledgebase/blog/bingo-game-development-features-mechanics-and-monetization">galaxy4games.com</a></li>
<li>Traditional bingo calls (family pack source) — <a href="https://www.leovegas.com/en-nz/blog/bingo/bingo-calls">LeoVegas “Bingo Calls List”</a></li>
</ul>`,
  },
];

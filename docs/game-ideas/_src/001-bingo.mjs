// Idea 001 — Bingo (simple). Built into 001-bingo.html by _tools/build.mjs.
import {
  T,
  TV,
  PH,
  tv,
  phone,
  text,
  rect,
  circle,
  avatar,
  button,
  callout,
  svg,
  node,
  arrow,
  fig,
  phones,
  contentList,
} from '../_tools/svg.mjs';

export const meta = {
  title: 'Bingo',
  pitch:
    'The TV calls the numbers, your phone is your card. Daub what you like — but press BINGO! and the caller stops while the whole room checks your card.',
  players: { min: 1, max: 16, sweet: '4–12' },
  duration: '≈10 min (3 line rounds)',
  rounds: '3 by default (1–5), one pattern per game',
  interaction: ['tap'],
  tone: ['cozy', 'silly'],
  contentRating:
    'Family by default; optional "cheeky caller" phrases (PG-13 innuendo, no profanity)',
  difficulty: 'S',
  status: 'idea',
  version: '0.3.0',
  date: '2026-09-15',
  axes: {
    interaction: ['tap'],
    players: ['4–8', '9–16'],
    duration: ['5–10', '10–20'],
    structure: 'free-for-all',
    skill: ['luck', 'speed'],
    tone: ['cozy', 'silly'],
  },
};

// ─── Sample data used by every mockup (round 1, line, call 13) ──────────────────────────────────
const PLAYERS = [
  { name: 'Ana', i: 0 },
  { name: 'Bo', i: 1 },
  { name: 'Cy', i: 2 },
  { name: 'Dee', i: 3 },
  { name: 'Eli', i: 4 },
  { name: 'Fay', i: 5 },
];
const CARD = [
  3, 22, 44, 47, 62, 11, 17, 31, 59, 74, 7, 29, 0, 52, 66, 14, 16, 38, 46, 70, 1, 25, 40, 55, 61,
];
const BO_CARD = [
  8, 19, 35, 49, 63, 2, 28, 44, 58, 71, 13, 24, 0, 51, 69, 6, 21, 39, 46, 75, 15, 30, 33, 54, 62,
];
const CALLED = [7, 52, 29, 13, 61, 22, 3, 70, 47, 19, 44, 59, 38];
const ANA_DAUBS = [0, 1, 2, 3, 8, 10, 11, 13, 17];
const WIN_LINE = [10, 11, 12, 13, 14];
const LETTER = (n) => 'BINGO'[Math.floor((n - 1) / 15)];

/** 5x5 card. marks: Map index → 'daub' | 'green' | 'red' | 'missing' */
function cardGrid(x, y, cell, gap, card, marks = new Map(), o = {}) {
  const { dim = false, letters = true } = o;
  const numSize = cell * 0.36;
  let out = `<g opacity="${dim ? 0.5 : 1}">`;
  if (letters)
    'BINGO'.split('').forEach((L, c) => {
      out += text(x + c * (cell + gap) + cell / 2, y - 8, L, {
        size: cell * 0.34,
        weight: 800,
        fill: T.accent2,
        anchor: 'middle',
      });
    });
  for (let i = 0; i < 25; i++) {
    const r = Math.floor(i / 5);
    const c = i % 5;
    const cx = x + c * (cell + gap);
    const cy = y + r * (cell + gap);
    const n = card[i];
    const isFree = n === 0;
    const m = isFree ? (marks.has(i) ? marks.get(i) : 'daub') : (marks.get(i) ?? null);
    const fill =
      m === 'green' ? T.accent3 : m === 'red' ? T.danger : m === 'daub' ? T.accent : T.surface;
    out += rect(cx, cy, cell, cell, {
      fill,
      r: cell * 0.18,
      stroke: m === 'missing' ? T.accent2 : null,
      sw: 3,
      dash: m === 'missing' ? '6 4' : null,
    });
    if (m === 'daub' || m === 'green' || m === 'red')
      out += circle(cx + cell / 2, cy + cell / 2, cell * 0.36, { fill: T.bg, opacity: 0.16 });
    out += text(cx + cell / 2, cy + cell / 2 + numSize * 0.36, isFree ? 'FREE' : String(n), {
      size: isFree ? numSize * 0.7 : numSize,
      weight: 800,
      fill: m && m !== 'missing' ? T.bg : T.text,
      anchor: 'middle',
    });
    if (m === 'red')
      out += text(cx + cell - 5, cy + 13, '✕', {
        size: cell * 0.22,
        weight: 800,
        fill: T.bg,
        anchor: 'end',
      });
    if (m === 'green')
      out += text(cx + cell - 5, cy + 13, '✓', {
        size: cell * 0.22,
        weight: 800,
        fill: T.bg,
        anchor: 'end',
      });
  }
  out += '</g>';
  return out;
}
const marksOf = (daubs, o = {}) => {
  const m = new Map();
  for (const i of daubs) m.set(i, 'daub');
  for (const [k, v] of Object.entries(o)) for (const i of v) m.set(Number(i), k);
  return m;
};

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
const prevStrip = (cx, y, nums) =>
  text(cx, y, 'PREVIOUS', { size: TV.caption, weight: 700, fill: T.muted, anchor: 'middle' }) +
  nums
    .map(
      (n, k) =>
        rect(cx - 96 + k * 64, y + 10, 56, 40, { fill: T.surface2, r: 10 }) +
        text(cx - 96 + k * 64 + 28, y + 38, `${LETTER(n)}${n}`, {
          size: 18,
          weight: 700,
          anchor: 'middle',
          opacity: 1 - k * 0.2,
        }),
    )
    .join('');

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
    text(TV.W / 2, 410, 'Any row, column or diagonal. FREE counts.', {
      size: TV.body,
      fill: T.muted,
      anchor: 'middle',
    }) +
    text(TV.W / 2, 446, 'Your card is on your phone. Daub what you hear, then press BINGO!', {
      size: TV.body,
      anchor: 'middle',
    }) +
    callout(TV.W / 2 + 90, 200, 1) +
    callout(TV.W / 2 + 80, 300, 2),
  { kicker: 'BINGO', timer: { seconds: 5 }, chips: chipsPlaying, phaseLabel: 'phase: intro' },
);

const tvPlay = tv(
  text(TV.W / 2, 130, 'CALL 13 OF 75', {
    size: TV.caption,
    weight: 700,
    fill: T.muted,
    anchor: 'middle',
  }) +
    text(TV.W / 2, 280, 'N 38', { size: 150, weight: 800, fill: T.accent2, anchor: 'middle' }) +
    text(TV.W / 2, 330, '“Christmas cake”', {
      size: TV.h2,
      weight: 600,
      anchor: 'middle',
      italic: true,
    }) +
    prevStrip(TV.W / 2, 400, [59, 44, 19]) +
    text(TV.padX, 84, 'Round 1 of 3 · LINE', { size: TV.body, weight: 700, fill: T.muted }) +
    patternIcon(TV.padX + 220, 66, 5, 'line') +
    callout(TV.W / 2 + 190, 230, 1) +
    callout(TV.W / 2 + 120, 420, 2) +
    callout(TV.padX + 270, 60, 3),
  { timer: { seconds: 4 }, chips: chipsPlaying, phaseLabel: 'phase: play (call 13)' },
);

const BO_DAUBS = [2, 7, 10, 11, 13, 14, 21];
// Bo claims the middle row 13·24·FREE·51·69: 13 called; 24, 51, 69 never called → red. 35 and 33 (uncalled) → red. 44 (idx 7, called) → plain daub.
const boMarks = marksOf(BO_DAUBS, { green: [10, 12], red: [2, 11, 13, 14, 21] });
const tvCheck = tv(
  text(TV.padX, 84, 'Round 1 of 3 · LINE · caller paused', {
    size: TV.body,
    weight: 700,
    fill: T.muted,
  }) +
    avatar(TV.padX + 24, 150, 24, 1, 'Bo') +
    text(TV.padX + 60, 160, 'Bo says BINGO!', { size: TV.h1, weight: 800 }) +
    text(TV.padX, 200, 'Checking the card against the 14 numbers called…', {
      size: TV.body,
      fill: T.muted,
    }) +
    rect(TV.padX, 230, 380, 120, { fill: T.surface, r: 16, stroke: T.danger, sw: 3 }) +
    text(TV.padX + 20, 274, 'NOT A BINGO', { size: TV.h2, weight: 800, fill: T.danger }) +
    text(TV.padX + 20, 306, '5 daubs were never called.', { size: TV.body }) +
    text(TV.padX + 20, 334, 'Card goes back to Bo. Next number in 5 s.', {
      size: TV.caption,
      fill: T.muted,
    }) +
    cardGrid(500, 130, 62, 7, BO_CARD, boMarks) +
    callout(TV.padX + 350, 140, 1) +
    callout(870, 140, 2) +
    callout(TV.padX + 360, 240, 3),
  { timer: { seconds: 5 }, chips: chipsPlaying, phaseLabel: 'phase: check (invalid)' },
);

const anaWinMarks = marksOf([...ANA_DAUBS, 14], { green: WIN_LINE });
const tvBingo = tv(
  text(TV.padX, 96, 'BINGO!', { size: TV.display, weight: 800, fill: T.accent3 }) +
    avatar(TV.padX + 24, 150, 24, 0, 'Ana') +
    text(TV.padX + 60, 160, 'Ana wins round 1', { size: TV.h2, weight: 700 }) +
    text(TV.padX, 200, 'On call 14 · O 66 “Clickety click”', { size: TV.body, fill: T.muted }) +
    rect(TV.padX, 230, 380, 60, { fill: T.surface, r: 14 }) +
    text(TV.padX + 16, 254, 'ROUNDS WON', { size: TV.caption, weight: 800, fill: T.muted }) +
    text(TV.padX + 16, 280, 'Ana 1 · everyone else 0', { size: TV.body, weight: 700 }) +
    cardGrid(500, 130, 62, 7, CARD, anaWinMarks) +
    callout(340, 70, 1) +
    callout(870, 140, 2),
  { timer: { seconds: 10 }, chips: null, phaseLabel: 'phase: bingo' },
);

const standings = (rows, x = TV.padX, y = 150, w = 520) =>
  rows
    .map(([n, i, wins], k) => {
      const yy = y + k * 52;
      return (
        rect(x, yy, w, 44, { fill: k === 0 ? T.surface2 : T.surface, r: 12 }) +
        text(x + 30, yy + 30, String(k + 1), {
          size: TV.body,
          weight: 800,
          fill: T.accent2,
          anchor: 'middle',
        }) +
        avatar(x + 70, yy + 22, 16, i, n) +
        text(x + 98, yy + 30, n, { size: TV.body, weight: 700 }) +
        text(x + w - 24, yy + 30, `${wins} ${wins === 1 ? 'round' : 'rounds'}`, {
          size: TV.body,
          weight: 800,
          anchor: 'end',
        })
      );
    })
    .join('');

const tvScoreboard = tv(
  text(TV.padX, 96, 'After round 2 of 3', { size: TV.h1, weight: 800 }) +
    text(TV.padX, 130, 'Dee took round 2 on call 31. One more round.', {
      size: TV.body,
      fill: T.muted,
    }) +
    standings([
      ['Ana', 0, 1],
      ['Dee', 3, 1],
      ['Bo', 1, 0],
      ['Cy', 2, 0],
      ['Eli', 4, 0],
      ['Fay', 5, 0],
    ]) +
    rect(640, 150, 272, 200, { fill: T.surface, r: 16 }) +
    text(776, 182, 'NEXT: ROUND 3 · LINE', {
      size: TV.caption,
      weight: 800,
      fill: T.muted,
      anchor: 'middle',
    }) +
    patternIcon(776 - 62, 196, 22, 'line') +
    callout(600, 300, 1),
  { timer: { seconds: 6 }, phaseLabel: 'phase: scoreboard' },
);

const tvDone = tv(
  text(TV.padX, 96, 'That’s bingo!', { size: TV.h1, weight: 800 }) +
    text(TV.padX, 130, 'Ana, Dee and Cy share the win with a round each', {
      size: TV.body,
      fill: T.muted,
    }) +
    standings([
      ['Ana', 0, 1],
      ['Cy', 2, 1],
      ['Dee', 3, 1],
      ['Bo', 1, 0],
      ['Eli', 4, 0],
      ['Fay', 5, 0],
    ]) +
    callout(600, 160, 1),
  { phaseLabel: 'phase: done (engine results screen follows)' },
);

// ─── Phone mockups ──────────────────────────────────────────────────────────────────────────────
const callHeader = (n, callIdx, phrase, prev) =>
  rect(PH.pad, 96, PH.W - 2 * PH.pad, 92, { fill: T.surface, r: 16 }) +
  text(PH.pad + 14, 120, `CALL ${callIdx}`, { size: 12, weight: 800, fill: T.muted }) +
  text(PH.pad + 14, 168, `${LETTER(n)} ${n}`, { size: PH.display, weight: 800, fill: T.accent2 }) +
  text(PH.W - PH.pad - 14, 150, `“${phrase}”`, {
    size: 15,
    italic: true,
    fill: T.muted,
    anchor: 'end',
  }) +
  text(PH.W - PH.pad - 14, 172, `prev: ${prev.map((p) => `${LETTER(p)}${p}`).join(' · ')}`, {
    size: 12,
    fill: T.muted,
    anchor: 'end',
  });

const bingoBtn = (o = {}) =>
  button(PH.pad, PH.H - 96 + 16, PH.W - 2 * PH.pad, o.label ?? 'BINGO!', { h: 64, ...o });

const phIntro = phone(
  text(PH.pad, 130, 'Line', { size: PH.h1, weight: 800 }) +
    patternIcon(PH.W - PH.pad - 70, 100, 12, 'line') +
    text(PH.pad, 158, 'Any row, column or diagonal. FREE counts.', {
      size: PH.caption,
      fill: T.muted,
    }) +
    text(PH.pad, 200, 'YOUR CARD', { size: 12, weight: 800, fill: T.muted }) +
    cardGrid(PH.pad, 236, 60, 7, CARD) +
    text(PH.W / 2, 620, 'Tap a square to daub it. Tap again to undo.', {
      size: PH.body,
      anchor: 'middle',
    }) +
    text(PH.W / 2, 648, 'Press BINGO! when your line is done.', {
      size: PH.body,
      anchor: 'middle',
    }) +
    callout(PH.W - 30, 116, 1) +
    callout(40, 246, 2),
  { kicker: 'ROUND 1 OF 3', timer: { seconds: 5 } },
);

const phPlay = phone(
  callHeader(38, 13, 'Christmas cake', [59, 44, 19]) +
    cardGrid(PH.pad, 236, 60, 7, CARD, marksOf(ANA_DAUBS)) +
    callout(PH.W - 34, 108, 1) +
    callout(40, 246, 2),
  { kicker: 'ROUND 1 · LINE', timer: { seconds: 4 }, footer: bingoBtn() + callout(40, 700, 3) },
);

const phCheckClaimant = phone(
  text(PH.pad, 130, 'Checking your card…', { size: PH.h2, weight: 800 }) +
    text(PH.pad, 156, 'The caller is paused. Everyone is looking at the TV.', {
      size: PH.caption,
      fill: T.muted,
    }) +
    cardGrid(PH.pad, 200, 60, 7, BO_CARD, boMarks) +
    rect(PH.pad, 548, PH.W - 2 * PH.pad, 70, { fill: T.surface, r: 12, stroke: T.danger }) +
    text(PH.pad + 14, 576, 'NOT A BINGO', { size: 16, weight: 800, fill: T.danger }) +
    text(PH.pad + 14, 600, '5 daubs were never called. They’ve been cleared.', {
      size: 13,
      fill: T.muted,
    }) +
    callout(PH.W - 34, 300, 1) +
    callout(PH.W - 30, 560, 2),
  {
    kicker: 'ROUND 1 · LINE · CHECK',
    timer: { seconds: 5 },
    footer:
      bingoBtn({ label: 'Wait for the next number', disabled: true, variant: 'secondary' }) +
      callout(40, 700, 3),
  },
);

const phCheckOther = phone(
  rect(PH.pad, 96, PH.W - 2 * PH.pad, 92, { fill: T.surface, r: 16 }) +
    avatar(PH.pad + 34, 142, 20, 1, 'Bo') +
    text(PH.pad + 64, 136, 'Bo says BINGO!', { size: 18, weight: 800 }) +
    text(PH.pad + 64, 160, 'Look at the TV — the caller is paused.', { size: 13, fill: T.muted }) +
    cardGrid(PH.pad, 236, 60, 7, CARD, marksOf(ANA_DAUBS)) +
    callout(PH.W - 34, 108, 1),
  {
    kicker: 'ROUND 1 · LINE · CHECK',
    timer: { seconds: 5 },
    footer: bingoBtn({ disabled: true, label: 'Checking Bo’s card…', variant: 'secondary' }),
  },
);

const phPlayReconnect = phone(
  callHeader(38, 13, 'Christmas cake', [59, 44, 19]) +
    cardGrid(PH.pad, 236, 60, 7, CARD, marksOf(ANA_DAUBS), { dim: true }) +
    text(PH.pad, 590, 'Your daubs are saved on the server.', { size: PH.caption, fill: T.muted }) +
    callout(PH.W - 40, 52, 1),
  { kicker: 'ROUND 1 · LINE', banner: 'reconnecting', footer: bingoBtn({ disabled: true }) },
);

const phPlayPaused = phone(
  callHeader(38, 13, 'Christmas cake', [59, 44, 19]) +
    cardGrid(PH.pad, 236, 60, 7, CARD, marksOf(ANA_DAUBS), { dim: true }) +
    callout(PH.W - 40, 52, 1),
  {
    kicker: 'ROUND 1 · LINE',
    banner: 'paused',
    footer: bingoBtn({ disabled: true, label: 'Paused' }),
  },
);

const phPlaySpectator = phone(
  callHeader(38, 13, 'Christmas cake', [59, 44, 19]) +
    text(PH.pad, 240, 'You’re watching this one', { size: PH.h2, weight: 800 }) +
    text(PH.pad, 268, 'Cards were dealt before you joined. You’re in next game.', {
      size: PH.caption,
      fill: T.muted,
    }) +
    text(PH.pad, 320, 'CALLED SO FAR', { size: 12, weight: 800, fill: T.muted }) +
    CALLED.slice()
      .reverse()
      .map(
        (n, k) =>
          rect(PH.pad + (k % 5) * 66, 334 + Math.floor(k / 5) * 46, 58, 38, {
            fill: T.surface2,
            r: 10,
          }) +
          text(PH.pad + (k % 5) * 66 + 29, 360 + Math.floor(k / 5) * 46, `${LETTER(n)}${n}`, {
            size: 16,
            weight: 700,
            anchor: 'middle',
          }),
      )
      .join('') +
    callout(PH.W - 30, 246, 1),
  { kicker: 'ROUND 1 · LINE · SPECTATING', timer: { seconds: 4 } },
);

const phBingoWinner = phone(
  text(PH.pad, 130, 'BINGO!', { size: PH.display, weight: 800, fill: T.accent3 }) +
    text(PH.pad, 160, 'You win round 1', { size: PH.body, weight: 700 }) +
    cardGrid(PH.pad, 210, 60, 7, CARD, anaWinMarks) +
    text(PH.pad, 560, 'On call 14 · O 66 “Clickety click”', { size: PH.caption, fill: T.muted }) +
    callout(140, 116, 1) +
    callout(PH.W - 30, 350, 2),
  { kicker: 'ROUND 1 · LINE', timer: { seconds: 10 } },
);

const phBingoOther = phone(
  text(PH.pad, 130, 'Ana has bingo!', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 160, 'Round 1 goes to Ana. New cards in a moment.', {
      size: PH.caption,
      fill: T.muted,
    }) +
    cardGrid(PH.pad, 210, 60, 7, BO_CARD, marksOf([7, 10])) +
    callout(PH.W - 30, 150, 1),
  { kicker: 'ROUND 1 · LINE', timer: { seconds: 10 } },
);

function phoneStandings(x, y, rows, meName) {
  return rows
    .map(([n, i, wins], k) => {
      const yy = y + k * 50;
      const me = n === meName;
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
        avatar(x + 56, yy + 22, 15, i, n) +
        text(x + 80, yy + 29, n + (me ? ' (you)' : ''), { size: 16, weight: 700 }) +
        text(x + PH.W - 2 * PH.pad - 16, yy + 29, `${wins}`, {
          size: 18,
          weight: 800,
          anchor: 'end',
        })
      );
    })
    .join('');
}
const phScoreboard = phone(
  text(PH.pad, 130, 'After round 2', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 158, 'Rounds won. One more to play.', { size: PH.caption, fill: T.muted }) +
    phoneStandings(
      PH.pad,
      180,
      [
        ['Ana', 0, 1],
        ['Dee', 3, 1],
        ['Bo', 1, 0],
        ['Cy', 2, 0],
        ['Eli', 4, 0],
        ['Fay', 5, 0],
      ],
      'Ana',
    ) +
    text(PH.W / 2, 540, 'New cards coming.', { size: PH.body, anchor: 'middle' }),
  { kicker: 'ROUND 2 OF 3 · DONE', timer: { seconds: 6 } },
);
const phDone = phone(
  text(PH.pad, 130, 'That’s bingo!', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 158, 'You share the win with Cy and Dee — a round each.', {
      size: PH.caption,
      fill: T.muted,
    }) +
    phoneStandings(
      PH.pad,
      180,
      [
        ['Ana', 0, 1],
        ['Cy', 2, 1],
        ['Dee', 3, 1],
        ['Bo', 1, 0],
        ['Eli', 4, 0],
        ['Fay', 5, 0],
      ],
      'Ana',
    ),
  { kicker: 'FINAL' },
);

// ─── State diagram ──────────────────────────────────────────────────────────────────────────────
const stateDiagram = svg(
  960,
  330,
  node(20, 130, 110, 60, 'intro', { sub: '5 s' }) +
    node(200, 130, 150, 60, 'play', { sub: 'callSeconds per call' }) +
    node(420, 130, 130, 60, 'check', { sub: '5 s' }) +
    node(620, 130, 120, 60, 'bingo', { sub: '10 s' }) +
    node(800, 130, 140, 60, 'scoreboard', { sub: '6 s' }) +
    node(800, 240, 140, 50, 'done', { sub: 'terminal', terminal: true, stroke: T.accent3 }) +
    arrow(130, 160, 198, 160, 'timer | skip', { dy: -34 }) +
    arrow(350, 150, 418, 150, 'BINGO! pressed', { dy: -30 }) +
    `<path d="M420,172 C400,215 370,215 350,172" fill="none" stroke="${T.muted}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    rect(330, 200, 110, 22, { fill: T.bg, r: 11 }) +
    text(385, 215, 'not a bingo', { size: 12, fill: T.muted, anchor: 'middle' }) +
    arrow(550, 160, 618, 160, 'valid', { dy: -34 }) +
    `<path d="M275,190 C275,260 680,260 680,192" fill="none" stroke="${T.muted}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    rect(400, 236, 160, 22, { fill: T.bg, r: 11 }) +
    text(480, 251, 'deck empty | skip: no winner', { size: 12, fill: T.muted, anchor: 'middle' }) +
    arrow(740, 160, 798, 160, 'more rounds', { dy: -34 }) +
    arrow(700, 190, 800, 258, 'last round', { curve: 40 }) +
    `<path d="M275,120 C230,50 320,50 275,128" fill="none" stroke="${T.muted}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    rect(210, 66, 130, 22, { fill: T.bg, r: 11 }) +
    text(275, 81, 'timer → next call', { size: 12, fill: T.muted, anchor: 'middle' }) +
    `<path d="M870,120 C870,20 75,20 75,128" fill="none" stroke="${T.muted}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    rect(390, 14, 170, 22, { fill: T.bg, r: 11 }) +
    text(475, 29, 'next round: deal new cards', { size: 12, fill: T.muted, anchor: 'middle' }) +
    text(
      20,
      312,
      'The caller pauses for every check. VIP skip in check → next number now. VIP end → done.',
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

// ─── Sections ───────────────────────────────────────────────────────────────────────────────────
export const sections = [
  { title: 'Header card', html: '' },
  {
    title: 'The hook',
    html: `
<p>Everybody already knows how to play, so the room is loud within thirty seconds: the TV calls a number with a cheeky nickname, thumbs hunt, somebody yells "wait, WAIT". The button that says <b>BINGO!</b> is always there. Press it and the caller stops: your card goes up on the TV for everyone to see — the winning line in green, every square you daubed that was never called in red. Get it right and the round is yours. Get it wrong and the whole room just watched exactly where you cheated, your bad daubs are wiped, and the caller clears their throat and carries on.</p>`,
  },
  {
    title: "A round from a player's seat",
    html: `
<p><b>Ana</b> is playing with five friends. The TV says <i>Round 1 of 3 — LINE</i> with a five-dot row lit up on a little grid; her phone shows the same pattern and a fresh 5×5 card with B-I-N-G-O across the top and FREE in the middle. Five seconds later the TV fills with <b>B 7 — "Lucky seven"</b> in giant yellow digits. She has a 7 in the B column; she taps it and it turns pink. Six seconds later: <b>G 52 "Weeks in a year"</b>. Tap. <b>I 29 "Rise and shine"</b>. Tap. Her middle row reads 7 · 29 · FREE · 52 · ▢.</p>
<p>The calls keep coming every six seconds; the TV shows only the current one, huge, with the last three in small boxes underneath. Ana taps what she hears and once taps the wrong square by mistake — she taps it again and it clears. Bo, across the room, slams BINGO! The caller stops. The TV becomes Bo's card: two green squares, five <b>red</b> ones with little ✕ marks, and the words <b>NOT A BINGO — 5 daubs were never called. Card goes back to Bo.</b> Everyone turns to look at Bo. Bo's phone shows the same card, wipes the red squares, and its button says <i>Wait for the next number</i>. Five seconds later the caller resumes: <b>N 38 "Christmas cake"</b>.</p>
<p><b>O 66 "Clickety click"</b>. Ana taps 66, sees her row complete, and hits BINGO! The caller stops again — this time the TV goes green: <b>BINGO! Ana wins round 1</b>, her card big with the middle row glowing green and a tick on every square. The room cheers at her, not the TV. Ten seconds later the scoreboard shows "Ana — 1 round", then round 2 deals everyone a new card.</p>`,
  },
  {
    title: 'Complete rules',
    html: `
<h3>Setup</h3>
<ol>
<li>The game plays <code>rounds</code> rounds (default 3), all with the same <code>pattern</code> (default <b>line</b>). Each round every player is dealt a fresh 5×5 card: column B holds 5 distinct numbers from 1–15, I from 16–30, N from 31–45 (4 numbers, the centre is FREE), G from 46–60, O from 61–75. Cards come from <code>state.rng</code> and differ per player.</li>
<li>Patterns: <b>line</b> — any full row, column or diagonal (12 lines; FREE counts). <b>corners</b> — the four corner squares. <b>x</b> — both diagonals. <b>blackout</b> — every square.</li>
<li>Each round shuffles a fresh deck of 1–75 from <code>state.rng</code>.</li>
</ol>
<h3>Play</h3>
<ol start="4">
<li><b>Intro (5 s)</b>: the TV shows the round number and the pattern; phones show the pattern and their new card.</li>
<li><b>Calls</b>: the first number is called the instant play starts, then one every <code>callSeconds</code> (default 6). The TV shows the current letter and number, huge, with its caller nickname, and the previous three numbers small. Nothing else.</li>
<li><b>Daubing is free</b>: tap any square on your own card to daub it; tap again to un-daub. The server accepts every daub — called, uncalled, right or wrong. FREE is always daubed.</li>
<li><b>Claiming</b>: press <b>BINGO!</b>. <b>The caller stops.</b> The TV shows your card next to your name for everyone to check:
  <ul>
    <li>pattern squares you daubed whose numbers <em>were</em> called are <b>green ✓</b>;</li>
    <li>every daubed square on the card whose number was <em>never</em> called is <b>red ✕</b>;</li>
    <li>pattern squares you did not daub are outlined.</li>
  </ul>
  The claim is <b>valid</b> when some completion of the pattern is entirely green.</li>
<li><b>Valid</b> → "BINGO! You win round n" for 10 s, then the next round (or the final standings).</li>
<li><b>Invalid</b> → "NOT A BINGO" for 5 s; your red squares are wiped; then the caller continues with the next number. You may claim again once that next number has been called. Other players cannot claim while a card is being checked; they can right after.</li>
<li><b>Deck empty</b>: after 75 calls with no valid claim the round ends with no winner.</li>
<li><b>Between rounds</b>: a 6-second scoreboard shows rounds won. After the last round the game goes to the final standings.</li>
</ol>
<h3>Winning</h3>
<ol start="12">
<li>One round won = 1 point. Most rounds won wins the game; ties share the rank. No other scoring.</li>
</ol>
<h3>Referee's notes</h3>
<ul>
<li>Late joiners spectate: they see the current call on their phone and get dealt in next game.</li>
<li>A disconnected player's card and daubs persist; they can reconnect and continue.</li>
<li>Pause freezes the caller (and a running check); daubs and claims are ignored while paused.</li>
<li>VIP skip: in play → the round ends with no winner; in a check → the next number now; elsewhere → move on.</li>
</ul>`,
  },
  {
    title: 'Phase flow table',
    html: `
<div class="scroll"><table>
<thead><tr><th>Phase id</th><th>TV shows</th><th>Player phone</th><th>Spectator phone</th><th>Inputs accepted</th><th>Exit</th><th>Default timer</th><th>Allowed range</th></tr></thead>
<tbody>
<tr><td><code>intro</code></td><td>Round n of N, pattern name + icon</td><td>Pattern icon + new card (not tappable)</td><td>Pattern + "you're watching"</td><td>none</td><td>deadline · VIP skip</td><td>5 s</td><td>fixed</td></tr>
<tr><td><code>play</code></td><td>Current letter + number (huge), caller phrase, previous three</td><td>Current call header, tappable card (toggle), BINGO! button (disabled with "wait for the next number" right after your own failed check)</td><td>Current call, called list</td><td><code>daub</code>, <code>bingo</code></td><td><code>bingo</code> → <code>check</code> · 75th call's timer → <code>bingo</code> (no winner) · VIP skip → <code>bingo</code> (no winner). <b>Timer does not exit</b>: it draws the next call and re-enters <code>play</code> with a new <code>startedAt</code></td><td><code>callSeconds</code> = 6 s per call</td><td>3–12 s</td></tr>
<tr><td><code>check</code></td><td>"X says BINGO!", their card with green ✓ / red ✕ / outlined squares, the verdict, "next number in n s"</td><td>Claimant: same card + verdict, button disabled. Others: "X says BINGO! — look at the TV", own card still tappable, button disabled</td><td>Same as TV summary</td><td><code>daub</code> (still allowed; claims ignored)</td><td>deadline · VIP skip → <code>play</code> (next number). A valid claim never enters <code>check</code>: it goes straight to <code>bingo</code></td><td>5 s</td><td>fixed</td></tr>
<tr><td><code>bingo</code></td><td>"BINGO! X wins round n" with their card, pattern green (or "No bingo this round — deck's empty")</td><td>Winner: "BINGO! You win round n" + card. Others: "X has bingo" + own card</td><td>Same as TV summary</td><td>none</td><td>deadline · VIP skip → <code>scoreboard</code> (more rounds) or <code>done</code></td><td>10 s</td><td>fixed</td></tr>
<tr><td><code>scoreboard</code></td><td>Rounds won per player, next round's pattern</td><td>Compact standings (you highlighted)</td><td>Compact standings</td><td>none</td><td>deadline · VIP skip → <code>intro</code> of the next round</td><td>6 s</td><td>fixed</td></tr>
<tr><td><code>done</code></td><td>Final standings (then the engine's results screen)</td><td>Your final rank</td><td>Final standings</td><td>none</td><td>terminal (<code>results()</code> non-null)</td><td>none</td><td>—</td></tr>
</tbody></table></div>
<div class="note"><b>Why a valid claim skips <code>check</code></b>: the green card <em>is</em> the celebration, so it is shown in <code>bingo</code> for 10 s rather than for 5 s and then again. Both phases render the same card component. <b>VIP end</b> from any phase → <code>done</code> with rounds won as they stand.</div>`,
  },
  {
    title: 'Screens',
    html: `
<p>TV mockups are 960×540 (half of 1080p — double every size for real pixels). Phone mockups are 360×780. The shell renders the envelope (player chips strip, timer, VIP badge, paused curtain).</p>
<h3>intro</h3>
${fig(
  tvIntro,
  '<b>TV · intro.</b> One focal point: the pattern name at display size with the 5×5 pattern icon under it.',
  [
    'Pattern name at 128 px real — the only thing the room needs to read.',
    'Pattern icon: 25 dots, lit cells are the target; the same icon is on every phone.',
  ],
)}
${phones([[phIntro, '<b>Player · intro.</b> ① pattern icon mirrors the TV; ② the fresh card, not tappable yet (no footer button).']])}
<h3>play</h3>
${fig(tvPlay, '<b>TV · play (call 13, N 38).</b> Just the current letter and number.', [
  'Current call at 300 px real in accent-2 with the caller nickname beneath — the whole screen is this.',
  'Previous three calls, fading, for anyone who looked at their phone at the wrong moment.',
  'Round and pattern, small, top-left. The shell adds chips (bottom) and the call timer (top-right, quiet mode — §13).',
])}
${phones([
  [
    phPlay,
    '<b>Player · play.</b> ① current call with the previous three; ② tappable 60 px cells, tap toggles; ③ sticky BINGO! (64 px), enabled.',
  ],
  [
    phPlayReconnect,
    '<b>Player · play, reconnecting.</b> ① quiet banner; card dims and the button disables until the socket is back.',
  ],
  [phPlayPaused, '<b>Player · play, paused by the VIP.</b> ① banner; no input accepted.'],
  [
    phPlaySpectator,
    '<b>Spectator · play.</b> ① explains why there is no card; called list newest-first.',
  ],
])}
<h3>check</h3>
${fig(
  tvCheck,
  "<b>TV · check (Bo's claim, invalid).</b> The caller is paused; the card is the whole screen.",
  [
    'Claimant\'s avatar and "says BINGO!" at h1 — the room looks at Bo.',
    'Their card at 132 px cells real: green ✓ = daubed and called on the best pattern line; red ✕ = daubed but never called (anywhere on the card); dashed outline = pattern squares not daubed.',
    'Verdict in words and colour, what happens next, and the shell timer counting the 5 s.',
  ],
)}
${phones([
  [
    phCheckClaimant,
    '<b>Claimant · check.</b> ① the same green/red card the TV shows; ② the verdict; ③ button disabled until the next number is called.',
  ],
  [
    phCheckOther,
    '<b>Everyone else · check.</b> ① who claimed and where to look; own card stays tappable; button disabled for the 5 s.',
  ],
])}
<h3>bingo</h3>
${fig(tvBingo, "<b>TV · bingo.</b> The winner's card, all green on the line, is the whole story.", ['"BINGO!" in accent-3 with the winner and the round.', 'Their card with the winning line green and ticked; stray red daubs elsewhere are shown too (they do not matter once a line is fully green).'])}
${phones([
  [phBingoWinner, '<b>Winner · bingo.</b> ① confirmation; ② own card as the TV shows it.'],
  [
    phBingoOther,
    '<b>Everyone else · bingo.</b> ① who won; own card stays visible until new cards arrive.',
  ],
])}
<h3>scoreboard</h3>
${fig(tvScoreboard, '<b>TV · scoreboard between rounds.</b> Rounds won, nothing else.', ["Next round's pattern (always the same pattern — shown so the room knows it has not changed)."])}
${phones([[phScoreboard, '<b>Player · scoreboard.</b> Your row outlined.']])}
<h3>done</h3>
${fig(tvDone, '<b>TV · done.</b> Final rounds-won table; shared wins are stated in words.', ["The engine's results screen follows with the same ranking."])}
${phones([[phDone, '<b>Player · done.</b> Rank sentence and the table.']])}`,
  },
  {
    title: 'Data model',
    html: `
<pre><code>// games/bingo/server/types.ts
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = ['intro', 'play', 'check', 'bingo', 'scoreboard', 'done'] as const;
export type Pattern = 'line' | 'corners' | 'x' | 'blackout';

export interface Settings {
  rounds: number;        // 1..5, default 3
  pattern: Pattern;      // default 'line'
  callSeconds: number;   // 3..12, default 6
  spicy: boolean;        // default false — cheeky caller phrases
}

export interface Claim {
  playerId: string;
  cells: number[];       // the best completion of the pattern (most green cells)
  green: number[];       // cells of that completion that are daubed AND called
  red: number[];         // every daubed cell on the card whose number was never called
  missing: number[];     // cells of that completion not daubed
  valid: boolean;
}

export interface RoundState {
  number: number;                       // 1-based
  deck: number[];                       // 75 numbers shuffled at round start
  drawn: number;                        // deck.slice(0, drawn) has been called; current call = deck[drawn − 1]
  cards: Record&lt;string, number[]&gt;;      // playerId → 25 numbers row-major, [12] === 0 (FREE)
  daubs: Record&lt;string, number[]&gt;;      // playerId → sorted daubed indices (never contains 12; FREE is implicit)
  claim: Claim | null;                  // the card on the TV (check: invalid; bingo: the winner's)
  waitForCall: Record&lt;string, number&gt;;  // playerId → may claim again once drawn ≥ this
  winnerId: string | null;
}

export interface State extends GameStateBase {
  settings: Settings;
  round: RoundState;
  wins: Record&lt;string, number&gt;;         // rounds won
  history: { round: number; winnerId: string | null; calls: number }[];
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('daub'), index: z.number().int().min(0).max(24) }),   // toggles
  z.object({ type: z.literal('bingo') }),
]);
export type Input = z.infer&lt;typeof inputSchema&gt;;

export const INTRO_MS = 5_000, CHECK_MS = 5_000, BINGO_MS = 10_000, SCOREBOARD_MS = 6_000, DECK = 75;</code></pre>

<h4>Views</h4>
<pre><code>export interface CallView { number: number; letter: 'B' | 'I' | 'N' | 'G' | 'O'; call: string }
export interface ClaimView { playerId: string; name: string; card: number[]; daubs: number[]; green: number[]; red: number[]; missing: number[]; valid: boolean }

export interface BingoTvView extends TvView {
  round: number; totalRounds: number; pattern: Pattern; patternCells: number[];
  current: CallView | null; previous: CallView[]; callIndex: number;    // previous = up to 3, newest first
  claim: ClaimView | null;                                              // check: the card being checked; bingo: the winner's card
  winnerId: string | null;                                              // bingo/scoreboard: last round's winner (null = deck ran out)
  standings: { playerId: string; wins: number; rank: number }[] | null; // scoreboard/done
}

export interface BingoControllerView extends ControllerView {
  round: number; totalRounds: number; pattern: Pattern; patternCells: number[];
  current: CallView | null; previous: CallView[]; callIndex: number;
  called: number[];                     // for the spectator list
  card: number[] | null;                // null for spectators
  daubs: number[];                      // own daubed indices
  claim: ClaimView | null;              // check/bingo: the card on the TV (everyone sees it — it is on the TV anyway)
  canClaim: boolean;                    // play: true unless waiting for the next number; false in every other phase
  winnerId: string | null;
  standings: BingoTvView['standings'];
}</code></pre>
<p>Nothing is secret in this game: a card only reaches the TV when its owner claims, and then everyone may see it. Contract-test hints: <code>hiddenFromTv = []</code>; the config asserts <code>view.card === state.round.cards[me]</code> for every player and <code>view.claim === null</code> outside <code>check</code>/<code>bingo</code>.</p>

<h4>Sample mid-game state (round 1, call 14, Bo's invalid claim on screen)</h4>
<pre><code>{
  "phase": { "id": "check", "startedAt": 1758000086000, "deadline": 1758000091000 },
  "rng": { "seed": 913422, "step": 41 },
  "players": {
    "p1": { "id": "p1", "name": "Ana", "avatarId": "a03", "connected": true },
    "p2": { "id": "p2", "name": "Bo",  "avatarId": "a07", "connected": true },
    "p3": { "id": "p3", "name": "Cy",  "avatarId": "a11", "connected": true },
    "p4": { "id": "p4", "name": "Dee", "avatarId": "a02", "connected": false }
  },
  "settings": { "rounds": 3, "pattern": "line", "callSeconds": 6, "spicy": false },
  "round": {
    "number": 1,
    "deck": [7, 52, 29, 13, 61, 22, 3, 70, 47, 19, 44, 59, 38, 66, 9, 41, 75, 1, 33, 18, 56, 64, 27, 2, 50, 71, 15, 36, 45, 68, 4, 60, 31, 20, 55, 74, 12, 49, 26, 63, 8, 39, 17, 72, 5, 34, 58, 24, 43, 69, 11, 30, 53, 65, 6, 42, 21, 73, 14, 37, 48, 62, 10, 25, 46, 67, 16, 32, 51, 35, 54, 57, 28, 23, 40],
    "drawn": 14,
    "cards": {
      "p1": [3, 22, 44, 47, 62, 11, 17, 31, 59, 74, 7, 29, 0, 52, 66, 14, 16, 38, 46, 70, 1, 25, 40, 55, 61],
      "p2": [8, 19, 35, 49, 63, 2, 28, 44, 58, 71, 13, 24, 0, 51, 69, 6, 21, 39, 46, 75, 15, 30, 33, 54, 62],
      "p3": [2, 21, 33, 48, 63, 9, 18, 38, 50, 72, 13, 19, 0, 52, 61, 5, 27, 41, 57, 66, 15, 30, 35, 46, 69],
      "p4": [12, 16, 34, 55, 65, 4, 23, 45, 47, 70, 10, 26, 0, 59, 61, 1, 29, 32, 53, 67, 14, 20, 43, 48, 73]
    },
    "daubs": { "p1": [0, 1, 2, 3, 8, 10, 11, 13, 14, 17], "p2": [7, 10], "p3": [3, 7, 10, 11, 13, 14], "p4": [] },
    "claim": { "playerId": "p2", "cells": [10, 11, 12, 13, 14], "green": [10, 12], "red": [2, 11, 13, 14, 21], "missing": [], "valid": false },
    "waitForCall": { "p2": 15 },
    "winnerId": null
  },
  "wins": { "p1": 0, "p2": 0, "p3": 0, "p4": 0 },
  "history": []
}</code></pre>
<p>Bo's daubs are already cleaned (<code>[7, 10]</code> — 44 and 13, both called); the claim still shows what he pressed with. Ana has a full middle row after call 14 — she gets her turn when the check ends and call 15 is made. Size: deck 75 + 16 cards × 25 + daubs ≈ 5 KB at 16 players.</p>`,
  },
  {
    title: 'Reducer logic',
    html: `
${fig(stateDiagram, '<b>State diagram.</b> <code>play</code> loops on its own timer; a claim pauses the caller in <code>check</code>; every other transition is a deadline, a VIP skip, or a valid claim.', [], 'tv')}
<h3>Per-phase transition rules</h3>
<table>
<thead><tr><th>Phase</th><th>Event</th><th>Rule</th></tr></thead>
<tbody>
<tr><td>any</td><td><code>player</code></td><td><code>setConnected</code>. Cards and daubs persist.</td></tr>
<tr><td>any</td><td><code>vip pause/resume</code></td><td><code>applyVip</code> shifts the deadline. Inputs/timers ignored while paused.</td></tr>
<tr><td>any</td><td><code>vip end</code></td><td><code>enterDone</code>: rounds won as they stand.</td></tr>
<tr><td><code>intro</code></td><td>timer · skip</td><td><code>nextCall</code> → first call.</td></tr>
<tr><td><code>play</code>, <code>check</code></td><td><code>input daub</code></td><td>Ignore unless the player is in <code>state.players</code>, has a card, and <code>index ≠ 12</code>. Toggle the index in <code>daubs[p]</code> (keep sorted). No validation against calls. No transition.</td></tr>
<tr><td><code>play</code></td><td><code>input bingo</code></td><td>Ignore unless a player with a card and <code>drawn ≥ (waitForCall[p] ?? 0)</code>. <code>claim = evaluate(…)</code>. Valid → <code>enterBingo(p, claim)</code>. Invalid → wipe <code>claim.red</code> from <code>daubs[p]</code>, <code>waitForCall[p] = drawn + 1</code>, <code>enterPhase('check', now, CHECK_MS)</code> with the claim stored.</td></tr>
<tr><td><code>play</code></td><td>timer (current instance)</td><td>If <code>drawn ≥ 75</code> → <code>enterBingo(null)</code> (no winner). Else <code>nextCall</code>: <code>drawn++</code>, <code>claim = null</code>, <code>enterPhase('play', now, callSeconds × 1000)</code> (new <code>startedAt</code> ⇒ new timer instance).</td></tr>
<tr><td><code>play</code></td><td>skip</td><td><code>enterBingo(null)</code> — the round ends with no winner.</td></tr>
<tr><td><code>check</code></td><td><code>input bingo</code></td><td>Ignored — one check at a time.</td></tr>
<tr><td><code>check</code></td><td>timer · skip</td><td><code>nextCall</code> (or <code>enterBingo(null)</code> if the deck is empty).</td></tr>
<tr><td><code>bingo</code></td><td>timer · skip</td><td><code>round.number &lt; settings.rounds ? enterScoreboard : enterDone</code>.</td></tr>
<tr><td><code>scoreboard</code></td><td>timer · skip</td><td><code>enterIntro(round + 1)</code>: deal cards, shuffle deck, reset round state.</td></tr>
<tr><td><code>done</code></td><td>anything</td><td>state unchanged.</td></tr>
</tbody></table>

<h3>Pseudocode</h3>
<pre><code>// server/index.ts
function init(ctx) {
  const settings = readSettings(ctx.settings);
  const s = { ...base(ctx), settings, wins: zeros(ctx.players), history: [], round: emptyRound() };
  return enterIntro(s, 1, ctx.now);
}
function reduce(state, event) {
  if (event.type === 'player') return setConnected(state, event);
  const vip = applyVip(state, event, { skip: skipCurrent, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state;
  switch (state.phase.id) {
    case 'intro':      return isTimerFor(state, event) ? nextCall(state, event.now) : state;
    case 'play':       return reducePlay(state, event);
    case 'check':      return reduceCheck(state, event);
    case 'bingo':      return isTimerFor(state, event) ? afterBingo(state, event.now) : state;
    case 'scoreboard': return isTimerFor(state, event) ? enterIntro(state, state.round.number + 1, event.now) : state;
    default:           return state;
  }
}
function skipCurrent(s, now) {
  switch (s.phase.id) {
    case 'intro':      return nextCall(s, now);
    case 'play':       return enterBingo(s, now, null, null);
    case 'check':      return nextCallOrEnd(s, now);
    case 'bingo':      return afterBingo(s, now);
    case 'scoreboard': return enterIntro(s, s.round.number + 1, now);
    default:           return s;
  }
}

// server/phases/intro.ts
export function enterIntro(s, number, now) {
  let rng = s.rng;
  const [deck, r1] = shuffle(rng, range(1, 75)); rng = r1;
  const cards = {}, daubs = {};
  for (const id of Object.keys(s.players).sort()) { const [card, r2] = dealCard(rng); cards[id] = card; daubs[id] = []; rng = r2; }
  const round = { number, deck, drawn: 0, cards, daubs, claim: null, waitForCall: {}, winnerId: null };
  return enterPhase({ ...s, rng, round }, 'intro', now, INTRO_MS);
}
export function dealCard(rng) {           // column c draws 5 distinct numbers from c*15+1 .. c*15+15
  const card = new Array(25).fill(0); let r = rng;
  for (let c = 0; c &lt; 5; c++) { const [col, r2] = shuffle(r, range(c * 15 + 1, c * 15 + 15)); r = r2; for (let row = 0; row &lt; 5; row++) card[row * 5 + c] = col[row]; }
  card[12] = 0; return [card, r];
}

// server/phases/play.ts
export function nextCall(s, now) {
  const r = s.round;
  return enterPhase({ ...s, round: { ...r, drawn: r.drawn + 1, claim: null } }, 'play', now, s.settings.callSeconds * 1000);
}
export function nextCallOrEnd(s, now) { return s.round.drawn &gt;= DECK ? enterBingo(s, now, null, null) : nextCall(s, now); }
function toggleDaub(s, p, i) {
  const r = s.round; if (i === 12) return s;
  const has = r.daubs[p].includes(i);
  const mine = has ? r.daubs[p].filter((x) =&gt; x !== i) : [...r.daubs[p], i].sort((a, b) =&gt; a - b);
  return { ...s, round: { ...r, daubs: { ...r.daubs, [p]: mine } } };
}
export function reducePlay(s, e) {
  const r = s.round;
  if (e.type === 'input') {
    const p = e.playerId; if (!s.players[p] || !r.cards[p]) return s;
    if (e.input.type === 'daub') return toggleDaub(s, p, e.input.index);
    if (r.drawn &lt; (r.waitForCall[p] ?? 0)) return s;                                 // "wait for the next number"
    const claim = evaluate(p, r.cards[p], r.daubs[p], r.deck.slice(0, r.drawn), s.settings.pattern);
    if (claim.valid) return enterBingo(s, e.now, p, claim);
    const cleaned = r.daubs[p].filter((i) =&gt; !claim.red.includes(i));              // "card goes back" without the bad daubs
    const round = { ...r, claim, daubs: { ...r.daubs, [p]: cleaned }, waitForCall: { ...r.waitForCall, [p]: r.drawn + 1 } };
    return enterPhase({ ...s, round }, 'check', e.now, CHECK_MS);
  }
  if (isTimerFor(s, e)) return nextCallOrEnd(s, e.now);
  return s;
}

// server/phases/check.ts
export function reduceCheck(s, e) {
  if (e.type === 'input' &amp;&amp; e.input.type === 'daub' &amp;&amp; s.players[e.playerId] &amp;&amp; s.round.cards[e.playerId]) return toggleDaub(s, e.playerId, e.input.index);
  if (isTimerFor(s, e)) return nextCallOrEnd(s, e.now);
  return s;                                                                          // 'bingo' inputs ignored during a check
}

// server/patterns.ts
export function completions(pattern) { /* line: 12 arrays of 5; corners: [[0,4,20,24]]; x: [[0,6,12,18,24,4,8,16,20]]; blackout: [range(0,24)] */ }
export function evaluate(playerId, card, daubs, called, pattern) {
  const d = new Set([...daubs, 12]); const c = new Set([...called, 0]);              // FREE (0) counts as called
  const red = card.map((n, i) =&gt; i).filter((i) =&gt; d.has(i) &amp;&amp; !c.has(card[i]));
  let best = null, bestScore = -1;
  for (const cells of completions(pattern)) {                                        // best = most green cells
    const green = cells.filter((i) =&gt; d.has(i) &amp;&amp; c.has(card[i]));
    if (green.length &gt; bestScore) { bestScore = green.length; best = { cells, green }; }
  }
  const missing = best.cells.filter((i) =&gt; !d.has(i));
  return { playerId, cells: best.cells, green: best.green, red, missing, valid: best.green.length === best.cells.length };
}

// server/phases/bingo.ts
export function enterBingo(s, now, winnerId, claim) {
  const wins = winnerId ? { ...s.wins, [winnerId]: (s.wins[winnerId] ?? 0) + 1 } : s.wins;
  const history = [...s.history, { round: s.round.number, winnerId, calls: s.round.drawn }];
  return enterPhase({ ...s, wins, history, round: { ...s.round, winnerId, claim } }, 'bingo', now, BINGO_MS);
}
export function afterBingo(s, now) {
  return s.round.number &lt; s.settings.rounds ? enterPhase(s, 'scoreboard', now, SCOREBOARD_MS) : enterDone(s, now);
}
export function enterDone(s, now) { return enterPhase(s, 'done', now, null); }

// server/scoring.ts
export function results(state) { return state.phase.id === 'done' ? buildResults(state, state.wins) : null; }</code></pre>
<p><b>VIP end during play or check</b> discards the unfinished round (nobody wins it); from <code>bingo</code> the win is already recorded.</p>

<h3>Where randomness is drawn</h3>
<ul>
<li><code>enterIntro</code>: one <code>shuffle</code> for the deck, then one <code>shuffle</code> per column per player in sorted player-id order.</li>
<li>Nothing else. Caller phrases are looked up by number.</li>
</ul>

<h3><code>bot.sampleInput</code></h3>
<pre><code>sampleInput(state, playerId, rng) {
  const r = state.round; const card = r.cards[playerId];
  if (!state.players[playerId] || !card) return null;
  if (state.phase.id !== 'play' &amp;&amp; state.phase.id !== 'check') return null;
  const called = new Set(r.deck.slice(0, r.drawn));
  const daubs = new Set(r.daubs[playerId]);
  const looksDone = completions(state.settings.pattern).some((cells) =&gt; cells.every((i) =&gt; i === 12 || daubs.has(i)));
  if (looksDone &amp;&amp; state.phase.id === 'play' &amp;&amp; r.drawn &gt;= (r.waitForCall[playerId] ?? 0)) return { type: 'bingo' };   // claims whatever looks complete — sometimes wrongly
  const todo = card.map((n, i) =&gt; i).filter((i) =&gt; i !== 12 &amp;&amp; called.has(card[i]) &amp;&amp; !daubs.has(i));
  if (todo.length &amp;&amp; rng.chance(0.7)) return { type: 'daub', index: rng.pick(todo) };
  if (!looksDone &amp;&amp; rng.chance(0.05)) return { type: 'daub', index: rng.int(0, 24) };   // a stray tap now and then → red squares in checks
  return null;
}</code></pre>
<p>The contract's <code>random</code>/<code>fast</code> strategies drive this bot with random timing (they do not invent inputs), so checks happen only when a card looks complete; after a failed check the reds are wiped and the bot cannot re-claim until the next number. The separate fuzz test sends arbitrary events, which the reducer ignores or evaluates without throwing. Verified in §13.</p>`,
  },
  {
    title: 'Scoring',
    html: `
<table>
<thead><tr><th>Event</th><th>Points</th></tr></thead>
<tbody>
<tr><td>Valid bingo</td><td><b>+1</b> round won. The round ends.</td></tr>
<tr><td>Anything else</td><td>0. Invalid claims cost nothing but embarrassment and one number's wait.</td></tr>
</tbody></table>
<p><code>score = rounds won</code>. Ties share the rank (<code>buildResults</code>). No awards. No setting changes scoring; <code>rounds</code> only changes how many points exist.</p>
<h3>Worked example — Ana, Bo, Cy, Dee · 3 rounds</h3>
<table>
<thead><tr><th>Round</th><th>What happened</th><th>Ana</th><th>Bo</th><th>Cy</th><th>Dee</th></tr></thead>
<tbody>
<tr><td>1</td><td>Bo claims on call 9 with three uncalled daubs → NOT A BINGO (5 s), reds wiped, caller resumes. Ana claims on call 14, valid.</td><td>1</td><td>0</td><td>0</td><td>0</td></tr>
<tr><td>2</td><td>Dee claims on call 31, valid. Cy pressed 300 ms later — the input arrived in <code>bingo</code> and was ignored.</td><td>1</td><td>0</td><td>0</td><td>1</td></tr>
<tr><td>3</td><td>Cy claims on call 40 with one un-daubed called square → invalid; daubs it during the check; claims again after call 41 → valid.</td><td>1</td><td>0</td><td>1</td><td>1</td></tr>
</tbody></table>
<p><b>Result</b>: <code>scores = { Ana: 1, Bo: 0, Cy: 1, Dee: 1 }</code>; ranking Ana 1, Cy 1, Dee 1, Bo 4; <code>winnerIds = [Ana, Cy, Dee]</code>; <code>awards = []</code>.</p>`,
  },
  {
    title: 'Content',
    html: `
<h3>Packs</h3>
<pre><code>// content/schema.ts
export const callsPack = z.object({
  pack: z.enum(['family', 'spicy']),
  calls: z.array(z.object({ number: z.number().int().min(1).max(75), call: z.string().min(1).max(48) })).min(1),
}).refine((p) =&gt; p.pack !== 'family' || new Set(p.calls.map((c) =&gt; c.number)).size === 75, { message: 'family pack must cover 1..75' });
export const packs = { calls: callsPack, callsSpicy: callsPack };
// files: content/calls.json (family, all 75), content/calls-spicy.json (overrides for a subset)</code></pre>
<p><code>callFor(n, spicy)</code> = the spicy override if <code>spicy</code> and one exists for n, else the family call. The letter is derived (<code>'BINGO'[⌊(n−1)/15⌋]</code>), never stored.</p>
<h3>Authoring guidelines</h3>
<ul>
<li>Calls are ≤ 5 words, read aloud in one breath. Rhymes and shape-of-the-digit jokes travel best; no brands, no people, nothing time-sensitive.</li>
<li>Family = fine for a ten-year-old. Spicy = innuendo and teasing, no profanity, no body-shaming.</li>
<li>Source: traditional British bingo-caller lingo (public-domain folk phrases), adapted to 75-ball numbering; a few are original where the traditional call referenced a brand.</li>
</ul>
<h3>calls.json — family (75)</h3>
${contentList(FAMILY_CALLS.map((c, i) => `<b>${'BINGO'[Math.floor(i / 15)]} ${i + 1}</b> — ${c}`))}
<h3>calls-spicy.json — cheeky overrides (20)</h3>
${contentList(SPICY_CALLS.map(([n, c]) => `<b>${'BINGO'[Math.floor((n - 1) / 15)]} ${n}</b> — ${c}`))}
<p>Total: 95 items. Calls are keyed by number, so the content never runs out; variety comes from cards and the deck order.</p>`,
  },
  {
    title: 'Edge cases',
    html: `
<table>
<thead><tr><th>Case</th><th>Behaviour</th></tr></thead>
<tbody>
<tr><td>1 player</td><td>Works as solitaire (<code>minPlayers = 1</code>). Line rounds end around call 42 on average; the deck bounds it.</td></tr>
<tr><td>16 players</td><td>State ≈ 5 KB; nothing scales with player count except the shell's chips.</td></tr>
<tr><td>Disconnect in any phase</td><td>Card and daubs persist; calls continue — nobody is waited for. A disconnected player cannot claim.</td></tr>
<tr><td>VIP leaves</td><td>Engine reassigns the VIP; the game never references it.</td></tr>
<tr><td>Everyone idle</td><td>Each round runs the whole deck (75 × 6 s = 7.5 min) and ends with no winner; 3 rounds ≈ 23 min &lt; <code>estimatedMinutes × 3 = 30</code>. Extreme settings (5 rounds at 12 s) exceed the bound — §14.</td></tr>
<tr><td>Empty / duplicate submissions</td><td>Duplicate <code>daub</code> toggles back — that is the undo. <code>daub 12</code> → ignored. <code>bingo</code> during a check → ignored; right after your own failed check → ignored until the next number (the phone's button says so).</td></tr>
<tr><td>Claim spam</td><td>One check per claim, one claim per player per number after a failure, claims during checks ignored. Worst case with N spamming humans: N checks per number (N × 5 s). The game's own bots never spam (§7); see §13 for measured worst cases.</td></tr>
<tr><td>Two claims on the same number</td><td>First processed is checked; the second is ignored during the check and can be made right after (if the first was valid the round is over — first to press wins, as in a hall).</td></tr>
<tr><td>Valid pattern plus stray red daubs elsewhere</td><td>Still a bingo — the pattern line is fully green. The reds show in the celebration for laughs.</td></tr>
<tr><td>Claim with an un-daubed pattern square that <em>was</em> called</td><td>Invalid — you must daub it. The square is outlined in the check so the player sees what they missed; they can daub it during the check and claim after the next number.</td></tr>
<tr><td>Ties everywhere</td><td>Rounds won tie → shared rank (everyone rank 1 when nobody won anything).</td></tr>
<tr><td>Late joiners</td><td>Spectators (engine): <code>card: null</code>, they see the current call and the called list; bots return null for them.</td></tr>
<tr><td>VIP skip mid-phase</td><td><code>intro</code> → play now. <code>play</code> → round ends, no winner. <code>check</code> → next number now. <code>bingo</code>/<code>scoreboard</code> → next.</td></tr>
<tr><td>VIP end mid-round</td><td>Unfinished round discarded; <code>results()</code> lists every player with their rounds won.</td></tr>
<tr><td>Spicy off (default)</td><td>Family phrases only. Settings are fixed at init.</td></tr>
<tr><td>Unspent timers</td><td>A claim mid-countdown abandons the <code>play</code> timer (stale by <code>startedAt</code>); the check's own timer then resumes the caller. Skips likewise.</td></tr>
<tr><td>Pause during a check</td><td>The check's deadline shifts; the card stays on screen.</td></tr>
<tr><td>Deck empties during a check</td><td>The check's timer calls <code>nextCallOrEnd</code>, which ends the round with no winner instead of drawing.</td></tr>
<tr><td>Blackout pattern</td><td>One number per call, ~70 calls at 6 s ≈ 7 min a round. The intro text says so; hosts who want it fast set <code>callSeconds</code> to 3.</td></tr>
</tbody></table>`,
  },
  {
    title: 'Art & sound direction',
    html: `
<h3>Palette (design-system tokens only)</h3>
<div class="swatches">
${[
  ['#0f1020', '--pb-bg · stage'],
  ['#1c1e3a', '--pb-surface · cards, verdict panel'],
  ['#ffd166', '--pb-accent-2 · the called number, BINGO letters'],
  ['#ff5d8f', '--pb-accent · daubed squares, BINGO! button'],
  ['#06d6a0', '--pb-accent-3 · green ✓ (verified), the win'],
  ['#ef476f', '--pb-danger · red ✕ (never called), NOT A BINGO'],
  ['#b3b7d9', '--pb-text-muted · previous calls, captions'],
]
  .map(
    ([hex, label]) =>
      `<div class="swatch"><div style="background:${hex}"></div><span>${hex}<br>${label}</span></div>`,
  )
  .join('')}
</div>
<h3>Typography</h3>
<ul>
<li>Current call: 300 px real (bold) in accent-2, letter and number as one word with a space ("N 38"). Nickname: h2 italic.</li>
<li>Card cells on the phone: 22 px bold in 60 px cells; FREE at 15 px. TV check/bingo card: 66 px cells here (132 real) with 24 px numbers (48 real) — legible from the couch.</li>
</ul>
<h3>Motion (all ≤ 600 ms, easing <code>cubic-bezier(0.2, 0.8, 0.2, 1)</code>)</h3>
<table>
<thead><tr><th>Moment</th><th>Animation</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>New call</td><td>Number: opacity 0→1 + 12 px rise; the previous number shrinks into the "previous" strip (transform + opacity only)</td><td>300 ms</td></tr>
<tr><td>Phone daub / undaub</td><td>Cell fills/empties with a scale pop 0.9→1</td><td>150 ms</td></tr>
<tr><td>Check</td><td>Card fades in; green and red squares light one by one (≤ 25 cells, 20 ms apart); the verdict panel appears last</td><td>300 ms + ≤ 500 ms</td></tr>
<tr><td>Bingo</td><td>"BINGO!" fades in; the winning cells pulse once (scale 1→1.08→1)</td><td>600 ms</td></tr>
</tbody></table>
<p>Reduced motion: every duration 0; check squares appear all at once.</p>
<h3>Sound (design-system cues)</h3>
<table>
<thead><tr><th>Moment</th><th>Cue</th><th>Trigger</th></tr></thead>
<tbody>
<tr><td>Round intro / phase change</td><td><code>phase</code></td><td>TV shell</td></tr>
<tr><td>New call</td><td><code>reveal</code></td><td>Game TV component when <code>callIndex</code> increments — needs R-2 (§13)</td></tr>
<tr><td>Own daub</td><td><code>submit</code></td><td>Controller shell (an accepted input)</td></tr>
<tr><td>Check starts</td><td><code>phase</code> (shell, phase id changed to <code>check</code>)</td><td>free</td></tr>
<tr><td>NOT A BINGO</td><td><code>error</code> on the TV</td><td>Game (R-2); or map <code>check</code>'s entry to <code>error</code> via <code>clientModule.sounds</code> since every <code>check</code> is an invalid claim</td></tr>
<tr><td>BINGO</td><td><code>win</code></td><td>Map <code>bingo</code>'s entry via <code>clientModule.sounds</code></td></tr>
<tr><td>Last-5-seconds tick</td><td><code>countdown</code></td><td><b>Suppressed</b> in <code>play</code> and <code>check</code> (quiet timer, R-1); normal elsewhere</td></tr>
</tbody></table>
<h3>Asset list</h3>
<p>None required — everything is CSS/SVG. Optional: <code>client/assets/ball.svg</code> (256×256, "flat vector bingo ball, dark navy sphere with a warm yellow circular label, no number, no background") behind the called number at 20 % opacity.</p>`,
  },
  {
    title: 'Accessibility & TV readability',
    html: `
<ul>
<li><b>Sizes at 1080p</b>: called number 300 px, nickname 48 px, previous calls 36 px, check-card numbers 48 px in 132 px cells, verdict 48 px. Nothing on the TV is below 28 px.</li>
<li><b>Colour is never alone</b>: green cells carry ✓, red cells ✕, missing cells a dashed outline; the verdict is a word; daubed cells on the phone have a filled disc behind the number as well as the colour.</li>
<li><b>Colour-blind safety</b>: green (#06d6a0) vs red (#ef476f) differ strongly in lightness (L* ≈ 78 vs 55) and carry different glyphs; daub-pink vs green differ by glyph (none vs ✓).</li>
<li><b>Screen readers</b>: the card is a <code>grid</code> of 25 toggle buttons labelled "B 7, daubed" / "N 38, not daubed" / "FREE"; the call header is <code>aria-live="polite"</code> ("N 38, Christmas cake"); the check result is <code>role="status"</code> ("Not a bingo: 5 daubs were never called"); the disabled BINGO! button's name says why ("Bingo, wait for the next number").</li>
<li><b>Touch</b>: 60 × 60 px cells with 7 px gaps; BINGO! 64 px tall in the sticky footer; nothing else is tappable.</li>
<li><b>Reduced motion</b>: no rise, no pop, check squares at once.</li>
<li><b>Pace</b>: <code>callSeconds</code> up to 12 s; the VIP can pause; the previous-three strip forgives a glance away; a check is 5 s of everyone catching their breath.</li>
</ul>`,
  },
  {
    title: 'Implementation plan',
    html: `
<h3>Files under <code>games/bingo/</code></h3>
<table>
<thead><tr><th>File</th><th>Contents</th></tr></thead>
<tbody>
<tr><td><code>manifest.json</code></td><td>id <code>bingo</code>, name "Bingo", tagline "The TV calls. You daub. Everyone checks.", minPlayers 1, maxPlayers 16, estimatedMinutes 10, tags ["classic","tap","luck"], settings: <code>rounds</code> (number 1–5, default 3), <code>pattern</code> (select line/corners/x/blackout, default line), <code>callSeconds</code> (number 3–12 step 1, default 6, "seconds between calls"), <code>spicy</code> (boolean false, "cheeky caller phrases").</td></tr>
<tr><td><code>README.md</code></td><td>The spec — §3, §4, §8, §10 condensed under the required headings.</td></tr>
<tr><td><code>CLAUDE.md</code></td><td>Local rules: "play re-enters itself per call; daubs are never validated, claims always are; the caller pauses in check".</td></tr>
<tr><td><code>server/types.ts</code></td><td>§6 types, <code>inputSchema</code>, constants.</td></tr>
<tr><td><code>server/patterns.ts</code></td><td><code>completions</code>, <code>evaluate</code>, <code>dealCard</code>.</td></tr>
<tr><td><code>server/phases/intro.ts</code>, <code>play.ts</code>, <code>check.ts</code>, <code>bingo.ts</code></td><td>§7 (scoreboard needs no file: a one-line timer rule in index).</td></tr>
<tr><td><code>server/scoring.ts</code></td><td><code>results</code> = <code>buildResults(state, state.wins)</code>.</td></tr>
<tr><td><code>server/content.ts</code>, <code>content/schema.ts</code>, <code>content/calls.json</code>, <code>content/calls-spicy.json</code></td><td>§9.</td></tr>
<tr><td><code>server/views.ts</code></td><td><code>tvView</code>, <code>controllerView</code>.</td></tr>
<tr><td><code>server/index.ts</code></td><td>manifest parse, <code>init</code>, <code>reduce</code>, <code>skipCurrent</code>, bot, <code>game</code> export.</td></tr>
<tr><td><code>client/index.ts</code></td><td><code>clientModule</code> with <code>sounds: { call: 'reveal', check: 'error', bingo: 'win' }</code>.</td></tr>
<tr><td><code>client/Tv.tsx</code></td><td><code>IntroTv</code>, <code>PlayTv</code> (BigCall + Previous), <code>CheckTv</code> and <code>BingoTv</code> (both = name + <code>CardGrid</code> with marks + verdict), <code>ScoreboardTv</code> (<code>Scoreboard</code> primitive), <code>DoneTv</code>.</td></tr>
<tr><td><code>client/Controller.tsx</code></td><td><code>CallHeader</code>, <code>CardGrid</code> (25 toggle buttons; marks prop), footer <code>PrimaryButton</code> "BINGO!" with the disabled reasons; states per §5.</td></tr>
<tr><td><code>client/CardGrid.tsx</code>, <code>client/PatternIcon.tsx</code></td><td>Shared by TV and controller.</td></tr>
<tr><td><code>fixtures/intro.json</code>, <code>play.json</code>, <code>check.json</code>, <code>bingo.json</code>, <code>scoreboard.json</code>, <code>done.json</code></td><td>Dump from <code>pnpm sim --game bingo --players 6 --runs 1 --dump-fixtures</code>; <code>check.json</code> must contain an invalid claim with at least one red and one missing square.</td></tr>
<tr><td><code>__tests__/patterns.test.ts</code></td><td><code>dealCard</code> column ranges + uniqueness + FREE; <code>evaluate</code>: valid line, line with an uncalled daub (red, invalid), un-daubed called square (missing, invalid), stray reds outside a valid line (valid), blackout, FREE counts.</td></tr>
<tr><td><code>__tests__/phases.test.ts</code></td><td>"play timer draws next call and rotates startedAt", "stale timer ignored", "deck exhaustion ends round with no winner", "daub toggles", "daub 12 ignored", "invalid claim → check, wipes reds, sets waitForCall", "claim during check ignored", "claim before next number ignored", "check timer → next call", "valid claim → bingo and +1 win", "VIP skip in check → next call", "VIP skip in play → no winner", "VIP end mid-round keeps earlier wins", "pause blocks daubs and claims".</td></tr>
<tr><td><code>__tests__/scoring.test.ts</code></td><td>The §8 example (Ana, Cy, Dee shared rank 1; Bo rank 4).</td></tr>
<tr><td><code>__tests__/views.test.ts</code></td><td>Controller never contains another player's card outside <code>claim</code>; spectator view has <code>card: null</code>; <code>canClaim</code> false in every phase but play.</td></tr>
<tr><td><code>__tests__/contract.config.ts</code></td><td><code>settingsVariants: [{ rounds: 1, pattern: 'blackout', callSeconds: 3 }, { rounds: 2, pattern: 'corners', callSeconds: 3, spicy: true }]</code>.</td></tr>
</tbody></table>
<h3>Effort</h3>
<p><b>S</b> — ≈ 450 lines TypeScript + 300 lines TSX + content. One day including the sim/e2e loop. The card grid is the only bespoke UI.</p>
<h3>Design simulation (run before implementation)</h3>
<p><code>docs/game-ideas/_tools/sim-001-bingo.mjs</code> is a headless model of this exact reducer (cards, deck, toggling daubs, <code>evaluate</code>, the play/check loop, VIP skip/pause/end) driven by contract-shaped events and the bot above plus an <i>idle</i> and a hostile <i>spam</i> strategy. Run: <code>node docs/game-ideas/_tools/sim-001-bingo.mjs</code>. Results, 2026-09-15:</p>
<ul id="sim-001-results">
<li><b>Unit checks</b>: <code>evaluate()</code> 6/6 (valid line; stray red outside a valid line still valid; un-daubed called square → missing, invalid; uncalled daubs → red, invalid; blackout; corners). <code>dealCard()</code>: 2 000 cards, column ranges + uniqueness + FREE all pass.</li>
<li><b>Fuzz</b>: 100 × 300 arbitrary events (inputs from spectators, unknown and empty ids, stale timers, VIP actions in every phase) — <code>reduce</code>, both views and the bot never threw.</li>
<li><b>Defaults (3 line rounds, 6 s), honest bot with random timing, 40 games of 1–16 players</b>: median 9.8 min, p90 13.3, max 15.3 (bound 30). ≈3 checks per game (bots do press early sometimes), 3 valid bingos, no round ran out of deck. Same with the <i>fast</i> strategy. Replays are byte-identical.</li>
<li><b>Idle room</b> (nobody daubs): 23.4 min = three full decks — under the bound, and the VIP can skip. <b>VIP strategy</b> (skip / pause / disconnects every 25 loops): max 12.7 min, 0 violations.</li>
<li><b>Contract variants</b>: 1 blackout round at 3 s → median 3.9 min; 2 corners rounds at 3 s → median 4.9, max 8.0. <b>X pattern at 6 s, 3 rounds</b>: median 19 min, max 22.3 — legal but slow, which is why the intro text warns and 3 s is recommended for X/blackout.</li>
<li><b>Hostile spam</b> (every player false-claims whenever allowed, random daubs): ≈100 checks per game; median 20 min at defaults, and with 12–16 spammers a game exceeds the bound — with N hostile players every number costs up to N × 5 s. This is the price of the friendly pause the owner chose; it needs N humans <em>all</em> trolling. §14 lists the one-line valve if the stress session wants it.</li>
<li><b>Invariants</b> (after every event of every run): a winner's cells are all daubed and called; a check's red cells were never called and are wiped from the card; FREE is never in <code>daubs</code>; <code>drawn ≤ 75</code>; results list every player. <b>0 violations in ~900 games.</b></li>
<li><b>Sizes</b>: largest state 4.2 KB (16 players); largest view 2.4 KB.</li>
<li><b>Harness lesson for the implementer</b>: the contract's play loop caps time at <code>deadline − 1</code> while a bot keeps returning inputs, so a bot that <em>always</em> has something to do starves the timer and the run is reported stuck. <code>sampleInput</code> must return <code>null</code> when there is nothing sensible to do (the bot above does; a first draft of the hostile bot did not).</li>
</ul>
<h3>SDK gaps (in <code>sdk-requests.md</code>)</h3>
<ol>
<li><b>R-1 — quiet timer mode.</b> The shells' <code>Timer</code> turns red, scales and plays <code>countdown</code> in the last 5 s of every deadline; a 6-second call cadence would tick five of every six seconds, and a 5 s check would tick throughout. Request an envelope field <code>timer?: 'normal' | 'quiet' | 'hidden'</code>.</li>
<li><b>R-2 — game-triggered sound cues.</b> Needed for the call sound; the check/bingo sounds can ride on phase entry via <code>clientModule.sounds</code>.</li>
</ol>`,
  },
  {
    title: 'Open questions',
    html: `
<ol>
<li><b>Decided (owner, v0.3)</b>: free daubing; the TV shows only the current call; a claim <em>pauses the caller</em> and shows the card with green/red so the room experiences it together; wrong → card goes back; right → win. The earlier bogus-bingo penalty, lockout, shared-bingo window, closeness points, multi-number calls and awards are gone.</li>
<li><b>Wipe the red daubs on an invalid claim, or leave them?</b> Specified: <b>wipe</b> — "card goes back" clean, so the next claim is honest and the player does not have to hunt for their mistakes. Alternative: leave them and let the player fix it.</li>
<li><b>"Wait for the next number" after a failed claim.</b> Specified: <b>yes</b> — it is what a hall caller says, and it is the only thing standing between the game and a toddler holding the button. Alternative: no wait at all (checks would then chain back-to-back; the sim's <i>spam</i> strategy shows the cost).</li>
<li><b>Safety valve against claim spam?</b> The simulation's hostile strategy (every player false-claiming on every number) can push a 16-player game past the bound because each check pauses the room for 5 s. Recommended: <b>ship without one</b> — it needs a whole room trolling, and the "wait for the next number" rule already stops any single person. If the stress session wants a valve, the cheapest is <em>one check per called number</em> (further claims wait for the next number), which bounds a round to 11 s × 75 regardless of player count.</li>
<li><b>Termination bound for extreme settings.</b> 5 rounds at 12 s with nobody claiming ≈ 75 min &gt; 30. Recommended: keep the settings, rely on the contract test using defaults + the listed variants (both under the bound), and note in the README that the VIP can skip a dead round.</li>
<li><b>Show the previous three calls on the TV?</b> Specified: <b>yes, small</b>. Strictly "just the current number" would punish a glance at the phone; three faded boxes cost nothing. Easy to remove.</li>
<li><b>Escalating patterns per round (line → X → blackout)?</b> Dropped for simplicity; <code>pattern</code> applies to every round. Could return as a fifth select value "classic" later.</li>
</ol>`,
  },
  {
    title: 'Self-review scorecard',
    html: `
<div class="score">
<span>Fun</span><b class="v">5</b><span>Bingo everyone knows, plus one new shared moment: the caller stops and your card is on the big screen with your sins in red.</span>
<span>Clarity</span><b class="v">5</b><span>Twelve rules; a referee needs only §3.6–3.9.</span>
<span>Implementability</span><b class="v">5</b><span>Two inputs, one evaluation function, two self-explanatory phases; simulated end to end before implementation.</span>
<span>Novelty</span><b class="v">2</b><span>It is bingo, by request. The public green/red verification is the one twist.</span>
<span>TV spectacle</span><b class="v">4</b><span>A 300 px number is a good stage; the check is the drama, and it has the room's full attention because the caller is silent.</span>
<span>Phone ergonomics</span><b class="v">5</b><span>Twenty-five 60 px toggles and one 64 px button; nothing else.</span>
<span>Content longevity</span><b class="v">5</b><span>Procedural cards; phrases keyed by number.</span>
<span>Pacing</span><b class="v">4</b><span>≈10 min for three line rounds; every check costs the room 5 s, which is the point; blackout is honest bingo-slow and says so.</span>
<span>Edge-case coverage</span><b class="v">5</b><span>Every phase has a floor timer; claim spam is bounded by the wait rule; simulated.</span>
</div>
<p class="note">Novelty scores 2 against a bar of 3 — a deliberate exception: the owner asked for plain bingo, and the revisions removed mechanics rather than adding them.</p>`,
  },
  {
    title: 'Prior art & references',
    html: `
<p>What other platforms do, and what this design takes or rejects from each. Researched 2026-09-15.</p>
<table>
<thead><tr><th>Platform</th><th>What it does</th><th>Taken / rejected here</th></tr></thead>
<tbody>
<tr><td><b>Bingo Party: Host &amp; Play</b> (Android/iOS, TV + QR)</td><td>One player is the Game Master: calls manually or auto at Slow/Medium/Fast; picks patterns (lines, X, four corners, diamond, blackout); toggles <em>allow multiple winners</em>, <em>late joining</em>, <em>verify BINGO claims</em>; "Single" mode (first valid bingo wins) vs "Progressive" mode. Projector view: full 1–75 master board, latest number as an animated ball, call history, active patterns.</td><td><b>Taken</b>: the pattern list; "Single" mode is exactly a round here; "verify claims" — done by the server and shown to the room. <b>Rejected</b>: a human Game Master (the server calls; the VIP only pauses/skips), the full 75-board on the TV (the owner wants just the number).</td></tr>
<tr><td><b>Crowdpurr Bingo</b> (events)</td><td>Points for every marked square and for bingos; live leaderboard; rounds that run on.</td><td><b>Rejected</b>: per-square economies and leaderboards — one point per round is enough for a living room.</td></tr>
<tr><td><b>Bingo Buddies</b> (browser, 1–20 players)</td><td>No login; randomised cards; tap to mark; a BINGO button with instant server verification.</td><td><b>Taken</b>: tap-to-mark + a big BINGO button with instant verification — and we show the verification to the room.</td></tr>
<tr><td><b>Skillz Blackout Bingo</b> (competitive mobile)</td><td>Points per daub with speed bonus, −25 per wrong tap, −100 per false bingo, power-ups.</td><td><b>Rejected</b> entirely. A false bingo here costs nothing but the room seeing your card and one number's wait.</td></tr>
<tr><td><b>Bingo halls</b> (etiquette guides, US state regulations)</td><td>Callers pace 4–6 s between numbers; <em>the game stops for verification</em>; false calls are corrected politely; ties split the prize.</td><td><b>Taken</b>: the 6 s default cadence; the stop-and-verify moment, made visual on the TV; "wait for the next number" after a false call.</td></tr>
</tbody></table>
<h3>Design decisions informed by the research</h3>
<ul>
<li>Default cadence 6 s sits at the top of the hall range; 3 s is the "Fast" preset every host app offers; 12 s exists for accessibility.</li>
<li>Every app auto-marks or validates daubs; this design deliberately does neither, because the owner wants the verification moment on the TV to carry the game. Free daubing is what makes the red squares possible.</li>
<li>Halls stop everything to verify a claim; so does this design — the owner's call, and the research says it is how bingo has always felt.</li>
<li>Monte Carlo (2 000 runs per pattern): first line among 4–16 players at a median 23–31 numbers (42 solo); corners 37–50; X 53–61; blackout 68–71. At 6 s per call that is ≈ 3 min for a line round and ≈ 7 min for blackout, which is why line is the default and blackout is a choice.</li>
</ul>
<h3>Links</h3>
<ul>
<li>Bingo Party: Host &amp; Play — <a href="https://play.google.com/store/apps/details?id=com.bingoparty.android">Google Play listing</a>, <a href="https://apkpure.com/bingo-party-host-play/com.bingoparty.android">description mirror</a></li>
<li>Crowdpurr Bingo — <a href="https://www.crowdpurr.com/bingo">crowdpurr.com/bingo</a></li>
<li>Bingo Buddies — <a href="https://gamebuddies.io/games/bingo">gamebuddies.io/games/bingo</a></li>
<li>Skillz, "How to Play Blackout Bingo" — <a href="https://play.skillz.com/guides/bingo/blackout-bingo/">play.skillz.com</a></li>
<li>BingoStamp, "How to Play Bingo" (4–6 s pacing, hosting tips) — <a href="https://bingostamp.com/guides/how-to-play-bingo">bingostamp.com</a></li>
<li>Bingo Maker, 75-ball card rules and patterns — <a href="https://www.bingomaker.com/how-to-play-bingo/">bingomaker.com</a></li>
<li>Arizona Admin. Code R15-7-209, "Method of Call and Announcement of Bingo" — <a href="https://www.law.cornell.edu/regulations/arizona/Ariz-Admin-Code-SS-R15-7-209">law.cornell.edu</a></li>
<li>Jackpotjoy, "Bingo Etiquette Guide" — <a href="https://www.jackpotjoy.com/uk/blog/bingo/bingo-etiquette-online-and-hall-rules">jackpotjoy.com</a></li>
<li>Traditional bingo calls (family pack source) — <a href="https://www.leovegas.com/en-nz/blog/bingo/bingo-calls">LeoVegas "Bingo Calls List"</a></li>
</ul>`,
  },
];

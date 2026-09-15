// Idea 002 — Broken Pencil (draw → guess → draw telephone). Built by _tools/build.mjs.
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
  callout,
  bar,
  svg,
  node,
  arrow,
  fig,
  phones,
  contentList,
  doodle,
} from '../_tools/svg.mjs';

export const meta = {
  title: 'Broken Pencil',
  pitch:
    'Telephone with a pencil: your word becomes a drawing, a guess, a drawing again — then every book is shown on the TV first page to last, one picture at a time, with the VIP turning the pages.',
  players: { min: 3, max: 10, sweet: '6–8' },
  duration: '≈12 min at 8 players (5 min play + 7 min show)',
  rounds: '1 book per player; 3 drawings per book by default',
  interaction: ['draw', 'text'],
  tone: ['silly', 'cozy'],
  contentRating:
    'Family by default; optional spicy word pack (PG-13); custom words can be switched off',
  difficulty: 'L',
  status: 'idea',
  version: '0.2.0',
  date: '2026-09-15',
  axes: {
    interaction: ['draw', 'text'],
    players: ['4–8', '9–16'],
    duration: ['10–20'],
    structure: 'co-op',
    skill: ['drawing', 'wit'],
    tone: ['silly', 'cozy'],
  },
};

// ─── Sample data ────────────────────────────────────────────────────────────────────────────────
const PLAYERS = [
  { name: 'Ana', i: 0 },
  { name: 'Bo', i: 1 },
  { name: 'Cy', i: 2 },
  { name: 'Dee', i: 3 },
  { name: 'Eli', i: 4 },
  { name: 'Fay', i: 5 },
  { name: 'Gus', i: 6 },
  { name: 'Hal', i: 7 },
];
const INK = [
  '#0f1020',
  '#ff5d8f',
  '#ffd166',
  '#06d6a0',
  '#4cc9f0',
  '#b388ff',
  '#ff9f43',
  '#f5f6ff',
];
const PAPER = '#f5f6ff';

// A cat wearing a crown, in 0..256 canvas units.
const CAT = [
  {
    color: INK[0],
    w: 5,
    pts: [
      [70, 200],
      [60, 120],
      [80, 70],
      [110, 60],
      [150, 60],
      [180, 70],
      [200, 120],
      [190, 200],
      [70, 200],
    ],
  },
  {
    color: INK[0],
    w: 5,
    pts: [
      [80, 70],
      [70, 30],
      [100, 62],
    ],
  },
  {
    color: INK[0],
    w: 5,
    pts: [
      [180, 70],
      [190, 30],
      [160, 62],
    ],
  },
  {
    color: INK[0],
    w: 4,
    pts: [
      [105, 120],
      [115, 120],
    ],
  },
  {
    color: INK[0],
    w: 4,
    pts: [
      [150, 120],
      [160, 120],
    ],
  },
  {
    color: INK[1],
    w: 4,
    pts: [
      [125, 145],
      [135, 145],
      [130, 155],
      [125, 145],
    ],
  },
  {
    color: INK[0],
    w: 3,
    pts: [
      [60, 140],
      [100, 148],
    ],
  },
  {
    color: INK[0],
    w: 3,
    pts: [
      [200, 140],
      [160, 148],
    ],
  },
  {
    color: INK[2],
    w: 6,
    pts: [
      [90, 55],
      [95, 20],
      [115, 45],
      [130, 10],
      [145, 45],
      [165, 20],
      [170, 55],
    ],
  },
];
// A "hamster king" (the chain's later drawing).
const HAMSTER = [
  {
    color: INK[6],
    w: 6,
    pts: [
      [60, 180],
      [50, 110],
      [90, 70],
      [160, 70],
      [200, 110],
      [190, 180],
      [60, 180],
    ],
  },
  {
    color: INK[0],
    w: 4,
    pts: [
      [100, 115],
      [108, 115],
    ],
  },
  {
    color: INK[0],
    w: 4,
    pts: [
      [150, 115],
      [158, 115],
    ],
  },
  {
    color: INK[0],
    w: 4,
    pts: [
      [120, 140],
      [130, 150],
      [140, 140],
    ],
  },
  {
    color: INK[2],
    w: 6,
    pts: [
      [100, 68],
      [110, 30],
      [130, 55],
      [150, 30],
      [160, 68],
    ],
  },
  {
    color: INK[3],
    w: 4,
    pts: [
      [40, 200],
      [220, 200],
    ],
  },
];

const BOOK = [
  { kind: 'word', author: 0, text: 'a cat wearing a crown' },
  { kind: 'draw', author: 0, drawing: CAT },
  { kind: 'guess', author: 1, text: 'royal cat' },
  { kind: 'draw', author: 2, drawing: CAT },
  { kind: 'guess', author: 3, text: 'hamster king' },
  { kind: 'draw', author: 4, drawing: HAMSTER },
  { kind: 'guess', author: 5, text: 'a fat king' },
];

function canvas(x, y, size, strokes, o = {}) {
  const { r = 12, border = null } = o;
  return (
    rect(x, y, size, size, { fill: PAPER, r, stroke: border, sw: 3 }) + doodle(x, y, size, strokes)
  );
}
function pencilRow(x, y, players, done) {
  return players
    .map((p, k) =>
      chip(
        x + (k % 4) * 200,
        y + Math.floor(k / 4) * 46,
        p.i,
        p.name,
        done.has(p.name) ? 'submitted' : 'active',
        { scale: 1 },
      ),
    )
    .join('');
}

// ─── TV mockups ─────────────────────────────────────────────────────────────────────────────────
const tvPick = tv(
  text(TV.W / 2, 150, 'Pick your secret word', { size: TV.h1, weight: 800, anchor: 'middle' }) +
    text(TV.W / 2, 190, 'Your phone offers three. Or invent your own.', {
      size: TV.body,
      fill: T.muted,
      anchor: 'middle',
    }) +
    rect(TV.padX + 100, 230, 664, 210, { fill: T.surface, r: 20 }) +
    text(TV.W / 2, 266, 'HOW THIS WORKS', {
      size: TV.caption,
      weight: 800,
      fill: T.muted,
      anchor: 'middle',
    }) +
    [
      '① You draw your word.',
      '② The next player guesses what it is.',
      '③ Someone draws that guess. And so on.',
      '④ Then we read every book aloud, one page at a time.',
    ]
      .map((s, k) => text(TV.padX + 130, 305 + k * 32, s, { size: TV.body }))
      .join('') +
    text(TV.W / 2, 476, '5 of 8 picked', {
      size: TV.h2,
      weight: 700,
      fill: T.accent3,
      anchor: 'middle',
    }) +
    callout(TV.padX + 110, 240, 1) +
    callout(TV.W / 2 + 90, 470, 2),
  {
    kicker: 'BROKEN PENCIL · GETTING STARTED',
    timer: { seconds: 14 },
    chips: PLAYERS.slice(0, 8).map((p, k) => ({ ...p, status: k < 5 ? 'submitted' : 'active' })),
    phaseLabel: 'phase: pick',
  },
);

const tvDraw = tv(
  text(TV.W / 2, 130, 'Everyone is drawing…', { size: TV.h1, weight: 800, anchor: 'middle' }) +
    text(TV.W / 2, 168, 'Page 2 of 7 · draw what the last page says · no peeking at phones', {
      size: TV.body,
      fill: T.muted,
      anchor: 'middle',
    }) +
    // pencil progress
    PLAYERS.map((p, k) => {
      const x = TV.padX + 70 + (k % 4) * 210;
      const y = 220 + Math.floor(k / 4) * 120;
      const done = k < 5;
      return (
        rect(x - 60, y - 40, 190, 96, { fill: T.surface, r: 16, stroke: done ? T.accent3 : null }) +
        avatar(x - 30, y + 8, 22, p.i, p.name) +
        text(x + 4, y + 2, p.name, { size: TV.body, weight: 700 }) +
        text(x + 4, y + 28, done ? '✓ done' : '✎ drawing', {
          size: TV.caption,
          weight: 700,
          fill: done ? T.accent3 : T.muted,
        })
      );
    }).join('') +
    text(TV.W / 2, 486, '5 of 8 done — the clock stops when everyone is', {
      size: TV.body,
      fill: T.muted,
      anchor: 'middle',
    }) +
    callout(TV.padX + 20, 190, 1) +
    callout(TV.W / 2 + 250, 486, 2),
  {
    kicker: 'BROKEN PENCIL · PAGE 2 OF 7',
    timer: { seconds: 38 },
    phaseLabel: 'phase: draw (step 1)',
  },
);

const tvGuess = tv(
  text(TV.W / 2, 130, 'Everyone is guessing…', { size: TV.h1, weight: 800, anchor: 'middle' }) +
    text(TV.W / 2, 168, 'Page 3 of 7 · one short guess for the drawing you were handed', {
      size: TV.body,
      fill: T.muted,
      anchor: 'middle',
    }) +
    PLAYERS.map((p, k) => {
      const x = TV.padX + 70 + (k % 4) * 210;
      const y = 220 + Math.floor(k / 4) * 120;
      const done = k % 3 === 0;
      return (
        rect(x - 60, y - 40, 190, 96, { fill: T.surface, r: 16, stroke: done ? T.accent3 : null }) +
        avatar(x - 30, y + 8, 22, p.i, p.name) +
        text(x + 4, y + 2, p.name, { size: TV.body, weight: 700 }) +
        text(x + 4, y + 28, done ? '✓ done' : '… typing', {
          size: TV.caption,
          weight: 700,
          fill: done ? T.accent3 : T.muted,
        })
      );
    }).join('') +
    text(TV.W / 2, 486, '3 of 8 done', { size: TV.body, fill: T.muted, anchor: 'middle' }),
  {
    kicker: 'BROKEN PENCIL · PAGE 3 OF 7',
    timer: { seconds: 21 },
    phaseLabel: 'phase: guess (step 2)',
  },
);

function filmstrip(x, y, book, upto, o = {}) {
  const { cell = 84, gap = 10 } = o;
  let out = '';
  for (let s = 0; s <= upto; s++) {
    const st = book[s];
    const yy = y + s * (cell + gap);
    const cur = s === upto;
    out += rect(x, yy, 300, cell, {
      fill: cur ? T.surface2 : T.surface,
      r: 12,
      stroke: cur ? T.accent2 : null,
    });
    out += avatar(x + 24, yy + cell / 2, 16, PLAYERS[st.author].i, PLAYERS[st.author].name);
    if (st.kind === 'draw') out += canvas(x + 50, yy + 6, cell - 12, st.drawing, { r: 6 });
    else
      out += text(x + 50, yy + cell / 2 + 6, `“${st.text}”`, {
        size: 16,
        weight: st.kind === 'word' ? 800 : 600,
        italic: st.kind !== 'word',
      });
    out += text(x + 290, yy + 18, String(s + 1), { size: 12, fill: T.muted, anchor: 'end' });
  }
  return out;
}

const tvRevealDraw = tv(
  text(TV.padX, 96, 'Ana’s book', { size: TV.h1, weight: 800 }) +
    text(TV.padX, 128, 'Book 1 of 8 · page 6 of 7', { size: TV.body, fill: T.muted }) +
    filmstrip(TV.padX, 150, BOOK, 5, { cell: 50, gap: 6 }) +
    // current step big
    text(640, 150, 'Eli drew', { size: TV.h2, weight: 700, anchor: 'middle' }) +
    canvas(500, 166, 280, HAMSTER, { r: 16 }) +
    avatar(640 - 60, 470, 18, 4, 'Eli') +
    text(640 - 34, 477, '“hamster king”, as drawn by Eli', { size: TV.body, fill: T.muted }) +
    callout(360, 160, 1) +
    callout(790, 176, 2) +
    callout(TV.padX + 310, 460, 3),
  {
    kicker: 'BROKEN PENCIL · THE READING',
    timer: { seconds: 9 },
    phaseLabel: 'phase: reveal (book 0, step 5)',
  },
);

const tvRevealGuess = tv(
  text(TV.padX, 96, 'Ana’s book', { size: TV.h1, weight: 800 }) +
    text(TV.padX, 128, 'Book 1 of 8 · page 7 of 7 · started as “a cat wearing a crown”', {
      size: TV.body,
      fill: T.muted,
    }) +
    filmstrip(TV.padX, 150, BOOK, 6, { cell: 42, gap: 5 }) +
    text(640, 200, 'Fay guessed', { size: TV.h2, weight: 700, anchor: 'middle' }) +
    rect(430, 230, 420, 120, { fill: T.surface, r: 20 }) +
    text(640, 305, '“a fat king”', {
      size: TV.display * 0.7,
      weight: 800,
      fill: T.accent2,
      anchor: 'middle',
    }) +
    rect(430, 380, 420, 70, { fill: T.danger, r: 16 }) +
    text(640, 424, 'CHAIN BROKEN', { size: TV.h2, weight: 800, fill: T.bg, anchor: 'middle' }) +
    text(640, 480, 'Started as “a cat wearing a crown”. No survival bonus this time.', {
      size: TV.caption,
      fill: T.muted,
      anchor: 'middle',
    }) +
    callout(850, 240, 1) +
    callout(850, 390, 2),
  {
    kicker: 'BROKEN PENCIL · THE READING',
    timer: { seconds: 7 },
    phaseLabel: 'phase: reveal (book 0, step 6)',
  },
);

const phPick = phone(
  text(PH.pad, 130, 'Pick your secret word', { size: PH.h2, weight: 800 }) +
    text(PH.pad, 156, 'You will draw it first. Choose wisely.', {
      size: PH.caption,
      fill: T.muted,
    }) +
    [
      ['toaster', 'easy'],
      ['a cat wearing a crown', 'medium'],
      ['a pirate at the gym', 'hard'],
    ]
      .map(([w, d], k) => {
        const y = 180 + k * 74;
        const sel = k === 1;
        return (
          rect(PH.pad, y, PH.W - 2 * PH.pad, 62, {
            fill: sel ? T.surface2 : T.surface,
            r: 14,
            stroke: sel ? T.accent2 : null,
          }) +
          text(PH.pad + 16, y + 30, w, { size: PH.body, weight: 700 }) +
          text(PH.pad + 16, y + 50, d, { size: 12, weight: 700, fill: T.muted }) +
          (sel
            ? text(PH.W - PH.pad - 16, y + 38, '✓', {
                size: 22,
                weight: 800,
                fill: T.accent3,
                anchor: 'end',
              })
            : '')
        );
      })
      .join('') +
    text(PH.pad, 430, 'OR WRITE YOUR OWN', { size: 12, weight: 800, fill: T.muted }) +
    rect(PH.pad, 440, PH.W - 2 * PH.pad, 52, { fill: T.surface, r: 12, stroke: '#2a2d55' }) +
    text(PH.pad + 14, 472, 'something drawable…', { size: 16, fill: T.muted, italic: true }) +
    text(PH.W - PH.pad, 512, '0 / 30', { size: 12, fill: T.muted, anchor: 'end' }) +
    callout(PH.W - 44, 200, 1) +
    callout(PH.W - 44, 452, 2),
  {
    kicker: 'YOUR BOOK · PAGE 1 OF 7',
    timer: { seconds: 14 },
    footer: button(PH.pad, PH.H - 80, PH.W - 2 * PH.pad, 'Lock it in') + callout(40, 700, 3),
  },
);

function toolbar(y, o = {}) {
  const { color = 0, width = 1, ink = 0.42 } = o;
  let out = '';
  INK.forEach((c, k) => {
    const cx = PH.pad + 20 + k * 41;
    out += circle(cx, y, 15, {
      fill: c,
      stroke: k === color ? T.accent2 : k === 7 ? '#2a2d55' : null,
      sw: 3,
    });
  });
  [4, 8, 14].forEach((r, k) => {
    const cx = PH.pad + 20 + k * 44;
    out += rect(cx - 20, y + 26, 40, 40, {
      fill: k === width ? T.surface2 : T.surface,
      r: 10,
      stroke: k === width ? T.accent2 : null,
    });
    out += circle(cx, y + 46, r, { fill: T.text });
  });
  out +=
    rect(PH.pad + 150, y + 26, 84, 40, { fill: T.surface, r: 10 }) +
    text(PH.pad + 192, y + 52, '↶ Undo', { size: 15, weight: 700, anchor: 'middle' });
  out +=
    rect(PH.pad + 242, y + 26, 86, 40, { fill: T.surface, r: 10 }) +
    text(PH.pad + 285, y + 52, '✕ Clear', { size: 15, weight: 700, anchor: 'middle' });
  out +=
    text(PH.pad, y + 90, 'INK', { size: 11, weight: 800, fill: T.muted }) +
    bar(PH.pad + 34, y + 82, PH.W - 2 * PH.pad - 34, 10, ink, {
      fill: ink > 0.85 ? T.danger : T.accent3,
    });
  return out;
}

const phDraw = phone(
  rect(PH.pad, 96, PH.W - 2 * PH.pad, 56, { fill: T.surface, r: 12 }) +
    text(PH.pad + 12, 118, 'DRAW THIS', { size: 11, weight: 800, fill: T.muted }) +
    text(PH.pad + 12, 142, '“a cat wearing a crown”', { size: 18, weight: 800 }) +
    canvas(PH.pad, 162, PH.W - 2 * PH.pad, CAT.slice(0, 6), { r: 12 }) +
    toolbar(520, { color: 0, width: 1, ink: 0.42 }) +
    callout(PH.W - 34, 108, 1) +
    callout(40, 176, 2) +
    callout(PH.W - 34, 522, 3) +
    callout(PH.W - 34, 606, 4),
  {
    kicker: 'ANA’S BOOK · PAGE 2 OF 7',
    timer: { seconds: 38 },
    footer: button(PH.pad, PH.H - 80, PH.W - 2 * PH.pad, 'Done drawing') + callout(40, 700, 5),
  },
);

const phDrawInkOut = phone(
  rect(PH.pad, 96, PH.W - 2 * PH.pad, 56, { fill: T.surface, r: 12 }) +
    text(PH.pad + 12, 118, 'DRAW THIS', { size: 11, weight: 800, fill: T.muted }) +
    text(PH.pad + 12, 142, '“hamster king”', { size: 18, weight: 800 }) +
    canvas(PH.pad, 162, PH.W - 2 * PH.pad, HAMSTER, { r: 12 }) +
    toolbar(520, { color: 6, width: 2, ink: 1 }) +
    text(PH.pad, 622, 'Out of ink — undo a stroke or send it as is.', {
      size: 13,
      weight: 700,
      fill: T.danger,
    }) +
    callout(PH.W - 34, 606, 1),
  {
    kicker: 'HAL’S BOOK · PAGE 6 OF 7',
    timer: { seconds: 12 },
    footer: button(PH.pad, PH.H - 80, PH.W - 2 * PH.pad, 'Done drawing'),
  },
);

const phDrawDone = phone(
  text(PH.W / 2, 150, '✓', { size: 64, weight: 800, fill: T.accent3, anchor: 'middle' }) +
    text(PH.W / 2, 200, 'Sent!', { size: PH.h1, weight: 800, anchor: 'middle' }) +
    text(PH.W / 2, 228, 'Waiting for 3 more artists…', {
      size: PH.body,
      fill: T.muted,
      anchor: 'middle',
    }) +
    canvas(PH.W / 2 - 100, 260, 200, CAT, { r: 12 }) +
    text(PH.W / 2, 500, 'Bo gets this next. Good luck, Bo.', {
      size: PH.caption,
      fill: T.muted,
      anchor: 'middle',
    }) +
    callout(PH.W - 60, 270, 1),
  { kicker: 'ANA’S BOOK · PAGE 2 OF 7', timer: { seconds: 22 } },
);

const phGuess = phone(
  text(PH.pad, 120, 'What is this?', { size: PH.h2, weight: 800 }) +
    canvas(PH.pad, 136, PH.W - 2 * PH.pad, CAT, { r: 12 }) +
    rect(PH.pad, 480, PH.W - 2 * PH.pad, 56, { fill: T.surface, r: 12, stroke: T.accent2 }) +
    text(PH.pad + 14, 514, 'royal cat|', { size: 18 }) +
    text(PH.W - PH.pad, 556, '9 / 40', { size: 12, fill: T.muted, anchor: 'end' }) +
    text(PH.pad, 590, 'Short and literal beats clever. The next player has to draw this.', {
      size: 13,
      fill: T.muted,
    }) +
    callout(PH.W - 34, 146, 1) +
    callout(PH.W - 34, 492, 2),
  {
    kicker: 'ANA’S BOOK · PAGE 3 OF 7',
    timer: { seconds: 21 },
    footer: button(PH.pad, PH.H - 80, PH.W - 2 * PH.pad, 'Send guess') + callout(40, 700, 3),
  },
);

const phGuessDone = phone(
  text(PH.W / 2, 150, '✓', { size: 64, weight: 800, fill: T.accent3, anchor: 'middle' }) +
    text(PH.W / 2, 200, '“royal cat”', { size: PH.h1, weight: 800, anchor: 'middle' }) +
    text(PH.W / 2, 228, 'Waiting for 5 more guesses…', {
      size: PH.body,
      fill: T.muted,
      anchor: 'middle',
    }),
  { kicker: 'ANA’S BOOK · PAGE 3 OF 7', timer: { seconds: 15 } },
);

// ─── replacement mockups (spliced after line 439: tvVote/tvDone/phRevealOwner/phRevealWatch/phVote/phDone/stateDiagram) ───
const tvShowVerdict = tvRevealGuess;

const tvDone = tv(
  text(TV.padX, 96, 'That’s the show', { size: TV.h1, weight: 800 }) +
    text(TV.padX, 130, '3 of 8 books survived the telephone', { size: TV.body, fill: T.muted }) +
    [
      ['Ana', 0, 'a cat wearing a crown', 'a fat king', false],
      ['Bo', 1, 'flat tire', 'flat tire', true],
      ['Cy', 2, 'hiccups', 'screaming man', false],
      ['Dee', 3, 'a snail race', 'the snail race', true],
      ['Eli', 4, 'lighthouse', 'lighthouse', true],
      ['Fay', 5, 'karaoke night', 'angry toaster', false],
      ['Gus', 6, 'zombie wedding', 'a very bad party', false],
      ['Hal', 7, 'lawn mower', 'angry vacuum', false],
    ]
      .map(([n, i, word, last, ok], k) => {
        const yy = 150 + k * 40;
        return (
          rect(TV.padX, yy, 864, 34, {
            fill: ok ? T.surface2 : T.surface,
            r: 10,
            stroke: ok ? T.accent3 : null,
          }) +
          avatar(TV.padX + 22, yy + 17, 13, i, n) +
          text(TV.padX + 44, yy + 24, `“${word}”`, { size: 18, weight: 700 }) +
          text(TV.padX + 400, yy + 24, '→', { size: 18, fill: T.muted, anchor: 'middle' }) +
          text(TV.padX + 430, yy + 24, `“${last}”`, {
            size: 18,
            weight: 700,
            italic: true,
            fill: ok ? T.accent3 : T.text,
          }) +
          text(TV.padX + 850, yy + 24, ok ? '🔗 UNBROKEN' : 'broken', {
            size: 14,
            weight: 800,
            fill: ok ? T.accent3 : T.muted,
            anchor: 'end',
          })
        );
      })
      .join('') +
    callout(TV.padX + 870, 200, 1),
  { phaseLabel: 'phase: done (engine results screen follows: everyone rank 1)' },
);

const phShowVip = phone(
  text(PH.pad, 130, 'You run the show', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 158, 'Ana’s book. Next turns the page; Pause lets it sink in.', {
      size: PH.caption,
      fill: T.muted,
    }) +
    rect(PH.pad, 190, PH.W - 2 * PH.pad, 90, { fill: T.surface, r: 14 }) +
    text(PH.pad + 16, 222, 'PAGE 6 OF 7', { size: 12, weight: 800, fill: T.muted }) +
    text(PH.pad + 16, 254, 'Eli drew “hamster king”', { size: PH.body, weight: 700 }) +
    bar(PH.pad, 300, PH.W - 2 * PH.pad, 8, 6 / 7, { fill: T.accent2 }) +
    text(PH.pad, 340, 'Auto-turns in 9 s if you don’t.', { size: 13, fill: T.muted }) +
    callout(PH.W - 34, 200, 1),
  {
    kicker: 'THE SHOW · ★ VIP',
    timer: { seconds: 9 },
    footer:
      button(PH.pad, PH.H - 80, PH.W - 2 * PH.pad - 110, 'Next ▸') +
      button(PH.W - PH.pad - 100, PH.H - 80, 100, '⏸', { variant: 'secondary' }) +
      callout(40, 700, 2),
  },
);

const phShowWatch = phone(
  text(PH.W / 2, 200, '👀', { size: 56, anchor: 'middle' }) +
    text(PH.W / 2, 250, 'Watch the TV', { size: PH.h1, weight: 800, anchor: 'middle' }) +
    text(PH.W / 2, 280, 'Gus (VIP) is turning the pages of Ana’s book.', {
      size: PH.body,
      fill: T.muted,
      anchor: 'middle',
    }) +
    text(PH.W / 2, 330, 'Book 1 of 8 · page 6 of 7', {
      size: PH.caption,
      fill: T.muted,
      anchor: 'middle',
    }) +
    text(PH.W / 2, 380, 'Your page (5) is coming up.', {
      size: PH.caption,
      weight: 700,
      fill: T.accent2,
      anchor: 'middle',
    }) +
    callout(PH.W - 60, 370, 1),
  { kicker: 'THE SHOW', timer: { seconds: 9 } },
);

const phSpectator = phone(
  text(PH.W / 2, 200, '◎', { size: 56, anchor: 'middle', fill: T.muted }) +
    text(PH.W / 2, 250, 'You’re spectating', { size: PH.h1, weight: 800, anchor: 'middle' }) +
    text(PH.W / 2, 280, 'Books were handed out before you arrived.', {
      size: PH.body,
      fill: T.muted,
      anchor: 'middle',
    }) +
    text(PH.W / 2, 306, 'You’ll be dealt in next game — enjoy the show.', {
      size: PH.body,
      fill: T.muted,
      anchor: 'middle',
    }) +
    text(PH.W / 2, 360, 'Page 2 of 7 · 5 of 8 drawing', {
      size: PH.caption,
      fill: T.muted,
      anchor: 'middle',
    }),
  { kicker: 'SPECTATING', timer: { seconds: 38 } },
);

const phReconnect = phone(
  rect(PH.pad, 106, PH.W - 2 * PH.pad, 56, { fill: T.surface, r: 12 }) +
    text(PH.pad + 12, 128, 'DRAW THIS', { size: 11, weight: 800, fill: T.muted }) +
    text(PH.pad + 12, 152, '“a cat wearing a crown”', { size: 18, weight: 800 }) +
    canvas(PH.pad, 172, PH.W - 2 * PH.pad, CAT.slice(0, 6), { r: 12 }) +
    text(PH.pad, 560, 'Your strokes stay on this phone; Done sends them when you’re back.', {
      size: 13,
      fill: T.muted,
    }) +
    callout(PH.W - 40, 52, 1),
  {
    kicker: 'ANA’S BOOK · PAGE 2 OF 7',
    banner: 'reconnecting',
    footer: button(PH.pad, PH.H - 80, PH.W - 2 * PH.pad, 'Done drawing', { disabled: true }),
  },
);

const phDone = phone(
  text(PH.pad, 130, 'That’s the show', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 158, '3 of 8 books survived.', { size: PH.caption, fill: T.muted }) +
    rect(PH.pad, 190, PH.W - 2 * PH.pad, 150, { fill: T.surface, r: 14 }) +
    text(PH.pad + 16, 220, 'YOUR BOOK', { size: 12, weight: 800, fill: T.muted }) +
    text(PH.pad + 16, 254, '“a cat wearing a crown”', { size: 18, weight: 800 }) +
    text(PH.pad + 16, 282, '↓  6 pages later', { size: 13, fill: T.muted }) +
    text(PH.pad + 16, 316, '“a fat king”', {
      size: 18,
      weight: 800,
      italic: true,
      fill: T.danger,
    }) +
    text(PH.pad, 380, 'No scores. Just the memories.', { size: PH.body, fill: T.muted }),
  { kicker: 'FINAL' },
);

const stateDiagram = svg(
  960,
  330,
  node(20, 130, 120, 60, 'pick', { sub: '20 s' }) +
    node(200, 130, 130, 60, 'draw', { sub: 'drawSeconds' }) +
    node(390, 130, 130, 60, 'guess', { sub: 'guessSeconds' }) +
    node(580, 130, 140, 60, 'show', { sub: 'per page' }) +
    node(790, 135, 120, 50, 'done', { sub: 'terminal', terminal: true, stroke: T.accent3 }) +
    arrow(140, 160, 198, 160, 'all | timer', { dy: -34 }) +
    arrow(330, 160, 388, 160, 'all | timer', { dy: -34 }) +
    `<path d="M455,130 C455,60 265,60 265,128" fill="none" stroke="${T.muted}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    rect(300, 62, 120, 22, { fill: T.bg, r: 11 }) +
    text(360, 77, 'step < L', { size: 12, fill: T.muted, anchor: 'middle' }) +
    arrow(520, 160, 578, 160, 'last step', { dy: -34 }) +
    `<path d="M650,130 C630,70 690,70 652,128" fill="none" stroke="${T.muted}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    rect(580, 44, 160, 22, { fill: T.bg, r: 11 }) +
    text(660, 59, 'VIP skip | timer → next page', { size: 12, fill: T.muted, anchor: 'middle' }) +
    arrow(720, 160, 788, 160, 'last page, last book', { dy: -34 }) +
    text(
      20,
      300,
      'VIP pause holds the page on screen (deadline shifts). VIP skip: pick/draw/guess → close the step with placeholders; show → next page. VIP end → done.',
      { size: 13, fill: T.muted },
    ),
  { label: 'Broken Pencil state diagram' },
);

// ─── Content ────────────────────────────────────────────────────────────────────────────────────
const WORDS = [
  ['toaster', 1],
  ['rainbow', 1],
  ['lighthouse', 1],
  ['volcano', 1],
  ['unicorn', 1],
  ['scarecrow', 1],
  ['telescope', 1],
  ['windmill', 1],
  ['sandcastle', 1],
  ['snail', 1],
  ['hamster wheel', 1],
  ['ice cream truck', 1],
  ['treasure map', 1],
  ['vending machine', 1],
  ['lawn mower', 1],
  ['escalator', 1],
  ['thunderstorm', 1],
  ['beekeeper', 1],
  ['tooth fairy', 1],
  ['detective', 1],
  ['sleepwalking', 2],
  ['a sneeze', 2],
  ['hiccups', 2],
  ['sunburn', 2],
  ['bad haircut', 2],
  ['flat tire', 2],
  ['pillow fight', 2],
  ['karaoke night', 2],
  ['bubble bath', 2],
  ['photo bomb', 2],
  ['lost luggage', 2],
  ['traffic jam', 2],
  ['campfire stories', 2],
  ['yoga class', 2],
  ['first day of school', 2],
  ['moon landing', 2],
  ['a snail race', 2],
  ['a very long scarf', 2],
  ['juggling penguins', 2],
  ['a surfing dog', 2],
  ['a cat wearing a crown', 3],
  ['a giraffe on a skateboard', 3],
  ['a snowman melting', 3],
  ['birthday cake on fire', 3],
  ['a dragon learning to swim', 3],
  ['a robot chef', 3],
  ['a pirate at the gym', 3],
  ['zombie wedding', 3],
  ['a bear on a bicycle', 3],
  ['a mermaid at the office', 3],
  ['washing a whale', 3],
  ['a superhero on laundry day', 3],
  ['a ninja babysitter', 3],
  ['an octopus playing drums', 3],
  ['pizza delivery by helicopter', 3],
  ['a cowboy at the ballet', 3],
  ['a shark with braces', 3],
  ['a haunted vending machine', 3],
  ['grandpa on a rollercoaster', 3],
  ['a cactus hug', 3],
];
const SPICY = [
  ['walk of shame', 2],
  ['hangover breakfast', 2],
  ['a bad first date', 2],
  ['in-laws visiting', 2],
  ['office romance', 2],
  ['mid-life crisis', 3],
  ['speed dating', 2],
  ['questionable tattoo', 2],
  ['the ex at the wedding', 3],
  ['the morning after', 2],
  ['skinny dipping', 2],
  ['awkward hug', 1],
  ['gym selfie', 1],
  ['drunk texting', 2],
  ['bachelor party', 2],
  ['phone in the toilet', 1],
  ['hot yoga gone wrong', 3],
  ['influencer meltdown', 3],
  ['couples therapy', 2],
  ['gas station sushi', 2],
];
const LINES = {
  intact: [
    'UNBROKEN! The word survived.',
    'It made it! Give yourselves a hand.',
    'Telephone: 0. This crew: 1.',
  ],
  broken: ['CHAIN BROKEN', 'Somewhere, this went sideways.', 'Not even close. Perfect.'],
};

// ─── Sections ───────────────────────────────────────────────────────────────────────────────────
export const sections = [
  { title: 'Header card', html: '' },
  {
    title: 'The hook',
    html: `
<p>Everyone knows the telephone game; this one has a pencil in it. You draw your secret word on your phone, the person next to you guesses what it is, the next person draws <em>that</em>, and by the time your book comes home a cat wearing a crown has become "a fat king". The laugh is the show at the end: the TV turns the pages of each book one at a time, first page to last, with the VIP holding the Next button and the room screaming at every turn. No points, no winner — the hamster is its own reward.</p>`,
  },
  {
    title: "A round from a player's seat",
    html: `
<p><b>Ana</b> is one of eight. Her phone offers three words — <i>toaster</i>, <i>a cat wearing a crown</i>, <i>a pirate at the gym</i> — plus a box to write her own. She taps the cat and locks it in; the TV shows "5 of 8 picked". Then her phone becomes a square sheet of paper with the word above it, eight ink colours, three pen sizes, undo, clear and a green ink bar. She draws a lumpy cat, a red nose, a yellow zigzag crown. The ink bar is at 40 %. She hits <b>Done drawing</b>; the phone shows her cat and says "Bo gets this next. Good luck, Bo." The TV shows eight cards with pencils, five ticked.</p>
<p>Next page: her phone shows a drawing she has never seen — Hal's, of what might be a lawn mower — and a text box. She types "angry vacuum" and sends. Then a drawing turn again: she is handed the words "haunted spoon" and has 60 seconds. The room is quiet except for giggling.</p>
<p>After the sixth page the TV says <b>The show</b>, and Ana's book is first. Every phone says <i>Watch the TV</i>; Gus, the VIP, has <b>Next ▸</b> and <b>Pause</b>. The TV shows "a cat wearing a crown", then Ana's drawing (polite applause), then Bo's guess: "royal cat" — fine. Cy's drawing of a royal cat looks a lot like a potato. Dee's guess: <b>"hamster king"</b>. The room loses it; Gus hits Pause so it can sink in. Eli's hamster king is a masterpiece. Fay's final guess: <b>"a fat king"</b> — CHAIN BROKEN in red, with the original word next to it. Gus taps Next and Bo's book begins. Seven more to go, and Ana is already crying laughing.</p>`,
  },
  {
    title: 'Complete rules',
    html: `
<h3>Setup</h3>
<ol>
<li><b>Seats</b>: at start, players are shuffled into a ring of seats <code>0…N−1</code> (from <code>state.rng</code>). Every player owns one <b>book</b>.</li>
<li><b>Pages</b>: a book has <code>L = 2·D + 1</code> pages: page 1 is the <b>word</b>, then <b>drawing</b> and <b>guess</b> pages alternate, ending with a guess. <code>D</code> is the number of drawings per book: <code>min(settings.drawings, ⌊N/2⌋)</code> (default 3 → 7 pages; 3 players → 1 drawing, 4–5 players → 2).</li>
<li><b>Who writes what</b>: page 1 (word) and page 2 (first drawing) are the owner's. Page <code>p ≥ 3</code> of the book owned by seat <code>b</code> is done by seat <code>(b + p − 2) mod N</code>. Every player works exactly one page per step, and no player works the same book twice (guaranteed by the cap on D).</li>
</ol>
<h3>Play</h3>
<ol start="4">
<li><b>Pick (20 s)</b>: each player is offered three words from the pack (one easy, one medium, one hard, none repeated across players) and may instead type their own (1–30 characters, if <code>customWords</code> is on). Nothing picked by the deadline → the medium word is used.</li>
<li><b>Draw (<code>drawSeconds</code>, default 60)</b>: draw the text on the previous page. Tools: 8 colours, 3 pen sizes, undo, clear. <b>Ink</b> is limited (≈1 100 simplified points per drawing); when it runs out the pen stops until you undo. "Done" sends the drawing; you may not edit after sending. No submission by the deadline → the page is an <b>empty canvas</b>.</li>
<li><b>Guess (<code>guessSeconds</code>, default 30)</b>: look at the previous page's drawing and write what it is (1–40 characters). No submission → the page reads <b>"???"</b>.</li>
<li>Steps 5–6 repeat until every book has L pages. A step ends when every connected player has submitted or the deadline passes.</li>
<li><b>Never spoil</b>: while playing you only ever see the single previous page of the book in your hands. The TV shows only progress (who is done).</li>
</ol>
<h3>The show</h3>
<ol start="9">
<li>Books are shown in seat order, each from its first page to its last: the word, then each drawing (with its artist) and each guess (with its author) — one page on the screen at a time.</li>
<li><b>The VIP turns the pages.</b> The VIP's <b>Skip</b> (labelled "Next ▸" during the show) advances one page; <b>Pause</b> holds the current page as long as they like; <b>Resume</b> restarts its timer. Without a VIP action a page auto-turns after 6 s (word), 12 s (drawing) or 8 s (guess). Pages cannot be turned back (contract limitation, §13).</li>
<li>After a book's last page the TV shows the final guess next to the original word and says <b>UNBROKEN</b> if they match (case-insensitive; punctuation and a leading "a/an/the" ignored) or <b>CHAIN BROKEN</b> otherwise. Then the next book, until all have been shown.</li>
</ol>
<h3>Scoring &amp; winning</h3>
<ol start="12">
<li><b>There is no scoring.</b> Nobody wins; the game is the show. <code>results()</code> reports 0 for everyone (all share rank 1) and one honorary <b>Unbroken</b> award per surviving book, to that book's owner.</li>
<li>The final screen shows how many books survived and every book's first word beside its last guess.</li>
</ol>
<h3>Referee's notes</h3>
<ul>
<li>Disconnected players' pages are filled by the deadline rule (empty canvas / "???"); the book carries on. If the VIP is away the auto-turn timers carry the show.</li>
<li>Late joiners spectate the play phases and watch the show like everyone else.</li>
<li>Pause freezes the current step timer; drawing continues locally on phones but cannot be sent until resume.</li>
</ul>`,
  },
  {
    title: 'Phase flow table',
    html: `
<div class="scroll"><table>
<thead><tr><th>Phase id</th><th>TV shows</th><th>Player phone</th><th>Spectator phone</th><th>Inputs accepted</th><th>Exit</th><th>Default timer</th><th>Allowed range</th></tr></thead>
<tbody>
<tr><td><code>pick</code></td><td>"Pick your secret word", the four-line how-to, n of m picked</td><td>Three word options + custom text box + "Lock it in"; locked state</td><td>"You're spectating" + progress</td><td><code>pick</code></td><td>all connected picked · deadline · VIP skip</td><td>20 s</td><td>fixed</td></tr>
<tr><td><code>draw</code></td><td>"Everyone is drawing…", page p of L, per-player pencil cards, n of m done</td><td>Text to draw, canvas, toolbar, ink bar, "Done drawing"; sent state shows own drawing + who gets it next</td><td>Progress only</td><td><code>draw</code></td><td>all connected submitted · deadline · VIP skip</td><td>60 s</td><td>30–120 s, step 10</td></tr>
<tr><td><code>guess</code></td><td>"Everyone is guessing…", same layout</td><td>Previous drawing + text box + "Send guess"; sent state shows the guess</td><td>Progress only</td><td><code>guess</code></td><td>all connected submitted · deadline · VIP skip</td><td>30 s</td><td>15–60 s, step 5</td></tr>
<tr><td><code>show</code></td><td>Book title + filmstrip of the pages shown so far + the current page big; UNBROKEN / CHAIN BROKEN banner on the last page</td><td>"Watch the TV" + book/page counter + "your page is next" hint. The VIP additionally has the shell's VIP overlay: Next ▸ (skip) and Pause</td><td>"Watch the TV"</td><td>none (VIP actions only)</td><td>VIP skip · deadline → next page; after the last page of the last book → <code>done</code>. VIP pause holds a page.</td><td>6 / 12 / 8 s per page kind</td><td>fixed</td></tr>
<tr><td><code>done</code></td><td>"k of N books survived", every book's word → last guess</td><td>Your book's word → last guess</td><td>Same</td><td>none</td><td>terminal</td><td>—</td><td>—</td></tr>
</tbody></table></div>
<div class="note"><b><code>draw</code> and <code>guess</code> re-enter themselves</b> for each step with a new <code>startedAt</code> (the step index lives in state); <code>show</code> re-enters per page. One fixture per phase id is enough. <b>VIP skip means "next page" in <code>show</code></b> — the contract's skip is "advance past the current phase instance", and a page is a phase instance.</div>`,
  },
  {
    title: 'Screens',
    html: `
<p>TV at 960×540 (half of 1080p); phones at 360×780. The canvas is square everywhere: 328 px on the phone, 560 px real on the TV (280 here).</p>
<h3>pick</h3>
${fig(tvPick, '<b>TV · pick.</b> The rules in four lines while people choose; nothing to spoil yet.', ['Four-line how-to at body size — the only tutorial the game has.', 'Progress count; the shell chips show ✓ as players lock in.'])}
${phones([[phPick, '<b>Player · pick.</b> ① three offered words with difficulty labels, one tap selects; ② custom word box (hidden when <code>customWords</code> is off); ③ "Lock it in" in the sticky footer.']])}
<h3>draw</h3>
${fig(tvDraw, '<b>TV · draw.</b> Pure progress — the drawings stay secret until the show.', ['Per-player pencil cards: name, ✓ done / ✎ drawing; card outline turns accent-3 when done.', 'The step ends early when everyone is done (all-submitted rule).'])}
${phones([
  [
    phDraw,
    '<b>Player · draw.</b> ① the text to draw (the previous page); ② 328 px square canvas, paper-white on the dark shell; ③ 8 colours + 3 sizes, undo, clear (44 px targets); ④ ink bar; ⑤ "Done drawing".',
  ],
  [
    phDrawInkOut,
    '<b>Player · draw, out of ink.</b> ① the bar turns danger-red at 85 % and the pen stops at 100 %; undo refunds ink.',
  ],
  [
    phDrawDone,
    '<b>Player · draw, sent.</b> ① own drawing echoed back from the server view (proof it arrived) and who receives it.',
  ],
  [
    phReconnect,
    '<b>Player · draw, reconnecting.</b> ① banner; strokes stay in the phone\'s local state; "Done" is disabled until the socket is back.',
  ],
  [phSpectator, '<b>Spectator · draw/guess.</b> Progress text only.'],
])}
<h3>guess</h3>
${fig(tvGuess, '<b>TV · guess.</b> Same progress layout with "… typing".')}
${phones([
  [
    phGuess,
    '<b>Player · guess.</b> ① the previous page\'s drawing at full width; ② single-line text (1–40 chars) with counter; ③ "Send guess".',
  ],
  [phGuessDone, '<b>Player · guess, sent.</b> Echo of the guess; waiting count.'],
])}
<h3>show</h3>
${fig(
  tvRevealDraw,
  '<b>TV · show, a drawing page.</b> The filmstrip on the left is the book so far; the current page is big on the right.',
  [
    'Filmstrip: every page shown so far with its author avatar; the current one is outlined accent-2. Rows shrink as the book grows.',
    "Current page: the drawing at 560 px real with the artist's name and what they were asked to draw.",
    'The strip keeps the whole book visible so latecomers to the joke can catch up.',
  ],
)}
${fig(tvShowVerdict, '<b>TV · show, the last page.</b> Guess pages show at display size; the last page carries the verdict.', ['Final guess at 90 px real in accent-2.', 'Verdict: UNBROKEN (accent-3) or CHAIN BROKEN (danger) — word and colour, with the original word beside it.'])}
${phones([
  [
    phShowVip,
    '<b>VIP · show.</b> ① page counter and what the TV is showing; ② the shell\'s VIP overlay renders Skip as "Next ▸" here (R-7) and keeps Pause — no game input exists in this phase.',
  ],
  [phShowWatch, '<b>Everyone else · show.</b> ① tells you when your own page is about to come up.'],
])}
<h3>done</h3>
${fig(tvDone, "<b>TV · done.</b> No standings: every book's first word beside its last guess, survivors marked.", ["Survivors outlined in accent-3 with the 🔗 word; the engine's results screen (everyone rank 1) follows."])}
${phones([[phDone, "<b>Player · done.</b> Your own book's journey and the room's survival count."]])}`,
  },
  {
    title: 'Data model',
    html: `
<pre><code>// games/broken-pencil/server/types.ts
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = ['pick', 'draw', 'guess', 'show', 'done'] as const;

export interface Settings {
  drawings: number;      // drawings per book, 1..4, default 3 (capped at floor(N/2) in init)
  drawSeconds: number;   // 30..120 step 10, default 60
  guessSeconds: number;  // 15..60 step 5, default 30
  customWords: boolean;  // default true
  spicy: boolean;        // default false
}

/** One pen stroke. p = base64 of bytes [x0,y0,x1,y1,…], each 0..255 on a 256×256 canvas. */
export interface Stroke { c: number; w: number; p: string }   // c: colour 0..7, w: size 0..2
export interface Drawing { strokes: Stroke[] }

export type Page =
  | { kind: 'word';  authorId: string; text: string }
  | { kind: 'draw';  authorId: string; drawing: Drawing | null }   // null = not submitted (empty canvas)
  | { kind: 'guess'; authorId: string; text: string | null };      // null = not submitted ("???")

export interface Book { ownerId: string; pages: Page[] }

export interface State extends GameStateBase {
  settings: Settings;
  seats: string[];                       // seat index → playerId, shuffled at init
  pageCount: number;                     // L = 2·D + 1
  step: number;                          // play: index of the page being written (1..L−1); 0 during pick
  books: Book[];                         // books[b].ownerId === seats[b]; pages.length grows to L
  offers: Record&lt;string, string[]&gt;;      // playerId → the 3 offered words
  showing: { book: number; page: number; verdict: 'intact' | 'broken' | null; line: string | null } | null;
  intactBooks: number;
}

const stroke = z.object({
  c: z.number().int().min(0).max(7),
  w: z.number().int().min(0).max(2),
  p: z.string().regex(/^[A-Za-z0-9+/]+={0,2}$/).refine((s) =&gt; s.length % 4 === 0 &amp;&amp; s.length &gt;= 4),   // one point (a dot) is "AQI=": 3 chars + padding — do NOT require 4 data chars
});
export const INK_CHARS = 3000;                     // ≈ 1 125 points per drawing → ≤ 4.7 KB JSON
export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('pick'), option: z.number().int().min(0).max(2) }),
  z.object({ type: z.literal('pickCustom'), text: z.string().trim().min(1).max(30) }),
  z.object({ type: z.literal('draw'), strokes: z.array(stroke).max(80).refine((a) =&gt; a.reduce((n, s) =&gt; n + s.p.length, 0) &lt;= INK_CHARS) }),
  z.object({ type: z.literal('guess'), text: z.string().trim().min(1).max(40) }),
]);
export type Input = z.infer&lt;typeof inputSchema&gt;;
// No input exists during the show: page turns are VIP actions (skip = next, pause = hold).

export const PICK_MS = 20_000;
export const SHOW_MS = { word: 6_000, draw: 12_000, guess: 8_000 } as const;</code></pre>
<p><b>Manifest</b>: <code>maxInputBytes: 6144</code> (ADR-002). A full drawing is ≤ 3 000 chars of points + ≤ 80 × ~20 bytes of stroke envelope ≈ 4.7 KB. <b>State budget</b>: 10 books × 4 drawings × 4.7 KB ≈ 190 KB worst case; 8 players × 3 drawings ≈ 115 KB. Under the 256 KB cap with margin — hence <code>maxPlayers = 10</code> and <code>drawings ≤ 4</code>. Verified by the design simulation in §13.</p>

<h4>Views</h4>
<pre><code>export interface PencilTvView extends TvView {
  step: number; pageCount: number; bookCount: number;
  progress: { playerId: string; done: boolean }[];        // pick/draw/guess
  showing: null | {                                       // show
    book: number; ownerId: string; page: number;          // page = index of the page on screen
    pages: Page[];                                        // pages[0..page] ONLY — never the unshown ones
    verdict: 'intact' | 'broken' | null; verdictLine: string | null;
  };
  summary: { ownerId: string; word: string; last: string; intact: boolean }[] | null;   // done
  intactBooks: number;
}

export interface PencilControllerView extends ControllerView {
  step: number; pageCount: number; bookIndex: number | null;   // the book in my hands this step
  ownerName: string | null;
  offers: string[] | null; customWords: boolean;              // pick
  prompt: { kind: 'text'; text: string } | { kind: 'drawing'; drawing: Drawing | null } | null;   // the previous page, and nothing else
  submitted: boolean; mine: { drawing?: Drawing; text?: string } | null; nextName: string | null;
  showing: { book: number; ownerId: string; page: number; pageCount: number; pageKind: 'word' | 'draw' | 'guess'; myPageAt: number | null } | null;
  summary: PencilTvView['summary']; myBook: { word: string; last: string; intact: boolean } | null; intactBooks: number;
}
// The VIP's Next / Pause controls are the shell's VIP overlay (skip / pause) — the game never knows
// who the VIP is (ADR-020), so they are not part of this view.</code></pre>
<p>Contract-test hints: <code>hiddenFromTv(state)</code> = every word/guess text of pages not yet shown (in play: all of them); <code>hiddenFromController(state, me)</code> = every text page except the one in <code>prompt</code> and my own submissions; during the show the controller carries no page content at all (the TV does).</p>

<h4>Sample mid-game state (8 players, step 3 = a guess page, 5 of 8 submitted; two books shown)</h4>
<pre><code>{
  "phase": { "id": "guess", "startedAt": 1758001200000, "deadline": 1758001230000 },
  "rng": { "seed": 4471, "step": 41 },
  "players": { "p1": { "id": "p1", "name": "Ana", "avatarId": "a03", "connected": true }, "p2": { "id": "p2", "name": "Bo", "avatarId": "a07", "connected": true }, "…": "…" },
  "settings": { "drawings": 3, "drawSeconds": 60, "guessSeconds": 30, "customWords": true, "spicy": false },
  "seats": ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"],
  "pageCount": 7, "step": 3,
  "books": [
    { "ownerId": "p1", "pages": [
      { "kind": "word", "authorId": "p1", "text": "a cat wearing a crown" },
      { "kind": "draw", "authorId": "p1", "drawing": { "strokes": [ { "c": 0, "w": 1, "p": "RsgUeFBGbjycrCZGeWdGtPU=" }, { "c": 2, "w": 2, "p": "WjdfFHMtghQ=" } ] } },
      { "kind": "guess", "authorId": "p2", "text": "royal cat" },
      { "kind": "draw", "authorId": "p3", "drawing": { "strokes": [ { "c": 0, "w": 1, "p": "SMRQgVB0nKeM" } ] } }
    ] },
    { "ownerId": "p2", "pages": [
      { "kind": "word", "authorId": "p2", "text": "flat tire" },
      { "kind": "draw", "authorId": "p2", "drawing": null },
      { "kind": "guess", "authorId": "p3", "text": null },
      { "kind": "draw", "authorId": "p4", "drawing": { "strokes": [ { "c": 4, "w": 0, "p": "IiIzM0RE" } ] } }
    ] }
  ],
  "offers": { "p1": ["toaster", "a cat wearing a crown", "a pirate at the gym"], "p2": ["snail", "flat tire", "zombie wedding"], "…": "…" },
  "showing": null, "intactBooks": 0
}</code></pre>
<p>Page 4 (a guess) of each book is being written; pages are appended on submit. Bo's own first drawing is <code>null</code> — he missed the deadline — so Cy saw an empty canvas and did not answer (<code>text: null</code>, shown as "???").</p>`,
  },
  {
    title: 'Reducer logic',
    html: `
${fig(stateDiagram, '<b>State diagram.</b> Three self-loops (draw/guess alternate per step, show per page); everything else is deadline / all-submitted / VIP skip.', [], 'tv')}
<h3>Per-phase transition rules</h3>
<table>
<thead><tr><th>Phase</th><th>Event</th><th>Rule</th></tr></thead>
<tbody>
<tr><td>any</td><td><code>player</code></td><td><code>setConnected</code>; nothing else.</td></tr>
<tr><td>any</td><td><code>vip pause/resume</code></td><td><code>applyVip</code> (in <code>show</code> this is the "hold this page" control).</td></tr>
<tr><td>any</td><td><code>vip end</code></td><td><code>enterDone</code>; the summary is computed from every book's pages regardless of how far the show got. Books may be <em>empty</em> (VIP end during <code>pick</code>): views must render <code>word: pages[0]?.text ?? "—"</code> and <code>isIntact</code> must return false for books with fewer than 2 pages — the fuzz test in §13 hits exactly this.</td></tr>
<tr><td><code>pick</code></td><td><code>input pick / pickCustom</code></td><td>Player only, once. <code>option</code> → <code>offers[p][option]</code>; <code>pickCustom</code> only if <code>settings.customWords</code>. Sets <code>books[seat(p)].pages[0]</code>. All connected picked → <code>closePick</code>.</td></tr>
<tr><td><code>pick</code></td><td>timer · skip</td><td><code>closePick</code>: unpicked players get <code>offers[p][1]</code>; <code>step = 1</code>; <code>enterStep</code>.</td></tr>
<tr><td><code>draw</code></td><td><code>input draw</code></td><td>Player only, once per step, only if the book in their hands has exactly <code>step</code> pages. Append the page. All connected submitted → <code>closeStep</code>.</td></tr>
<tr><td><code>guess</code></td><td><code>input guess</code></td><td>Same, appends a guess page.</td></tr>
<tr><td><code>draw</code>/<code>guess</code></td><td>timer · skip</td><td><code>closeStep</code>: for every book with <code>step</code> pages, append the placeholder page (<code>drawing: null</code> / <code>text: null</code>) authored by the seat that owed it; <code>step++</code>; <code>step &lt; pageCount ? enterStep : enterShow(0)</code>.</td></tr>
<tr><td><code>show</code></td><td>timer · <b>VIP skip</b></td><td><code>turnPage</code>: next page of the book; after a book's last page → first page of the next book; after the last book → <code>enterDone</code>. The verdict is computed when a last page is entered.</td></tr>
<tr><td><code>show</code></td><td>any <code>input</code></td><td>ignored (no inputs exist in this phase).</td></tr>
<tr><td><code>done</code></td><td>anything</td><td>unchanged.</td></tr>
</tbody></table>

<h3>Pseudocode</h3>
<pre><code>// server/index.ts
function init(ctx) {
  const settings = readSettings(ctx.settings);
  const N = ctx.players.length;
  const D = Math.max(1, Math.min(settings.drawings, Math.floor(N / 2)));
  let rng = seedRng(ctx.seed);
  const [seats, r1] = shuffle(rng, ctx.players.map((p) =&gt; p.id).sort()); rng = r1;   // sorted first ⇒ deterministic
  const [offers, r2] = dealOffers(rng, seats, settings.spicy); rng = r2;                // 3 per player, no repeats
  const books = seats.map((id) =&gt; ({ ownerId: id, pages: [] }));
  const s = { ...base(ctx, rng), settings: { ...settings, drawings: D }, seats, pageCount: 2 * D + 1, step: 0, books, offers, showing: null, intactBooks: 0 };
  return enterPhase(s, 'pick', ctx.now, PICK_MS);
}

function reduce(state, event) {
  if (event.type === 'player') return setConnected(state, event);
  const vip = applyVip(state, event, {
    skip: (s, now) =&gt; s.phase.id === 'pick' ? closePick(s, now)
                    : s.phase.id === 'draw' || s.phase.id === 'guess' ? closeStep(s, now)
                    : s.phase.id === 'show' ? turnPage(s, now) : s,
    end: enterDone,
  });
  if (vip) return vip;
  if (state.phase.paused) return state;
  switch (state.phase.id) {
    case 'pick':  return reducePick(state, event);
    case 'draw':
    case 'guess': return reduceStep(state, event);
    case 'show':  return isTimerFor(state, event) ? turnPage(state, event.now) : state;
    default:      return state;
  }
}

/** Which book seat k holds at step i (0-based page index): the owner's own book for i ≤ 1 (word, first drawing);
 *  for i ≥ 2 the book b whose page i is authored by seat (b + i − 1) mod N — i.e. b = k − (i − 1).
 *  (An earlier draft had an off-by-one here; the design simulation caught it: at i = 2 the owner would have
 *  guessed their own drawing.) */
function bookInHands(s, playerId) {
  const N = s.seats.length; const k = s.seats.indexOf(playerId);
  if (k &lt; 0) return -1;
  return s.step &lt;= 1 ? k : (((k - (s.step - 1)) % N) + N) % N;
}
function enterStep(s, now) {
  const kind = s.step % 2 === 1 ? 'draw' : 'guess';
  const ms = (kind === 'draw' ? s.settings.drawSeconds : s.settings.guessSeconds) * 1000;
  return enterPhase(s, kind, now, ms);
}
function reduceStep(s, e) {
  if (e.type === 'input' &amp;&amp; (e.input.type === 'draw' || e.input.type === 'guess')) {
    if (e.input.type !== s.phase.id) return s;
    const b = bookInHands(s, e.playerId); if (b &lt; 0) return s;
    const book = s.books[b]; if (book.pages.length !== s.step) return s;                     // already submitted
    const page = e.input.type === 'draw' ? { kind: 'draw', authorId: e.playerId, drawing: { strokes: e.input.strokes } }
                                         : { kind: 'guess', authorId: e.playerId, text: e.input.text.trim() };
    const books = s.books.map((bk, i) =&gt; (i === b ? { ...bk, pages: [...bk.pages, page] } : bk));
    const next = { ...s, books };
    const submitted = next.books.filter((bk) =&gt; bk.pages.length &gt; s.step).map((bk) =&gt; bk.pages[s.step].authorId);
    return allConnectedDone(next, submitted) ? closeStep(next, e.now) : next;
  }
  if (isTimerFor(s, e)) return closeStep(s, e.now);
  return s;
}
function closeStep(s, now) {
  const N = s.seats.length;
  const books = s.books.map((bk, b) =&gt; {
    if (bk.pages.length &gt; s.step) return bk;
    const author = s.seats[s.step &lt;= 1 ? b : (b + s.step - 1) % N];   // page index i ≥ 2 → seat b + i − 1 (rule 3)
    const page = s.step % 2 === 1 ? { kind: 'draw', authorId: author, drawing: null } : { kind: 'guess', authorId: author, text: null };
    return { ...bk, pages: [...bk.pages, page] };
  });
  const next = { ...s, books, step: s.step + 1 };
  return next.step &lt; next.pageCount ? enterStep(next, now) : showPage(next, 0, 0, now);
}

// server/phases/show.ts — no inputs; VIP skip = turnPage, timer = turnPage, VIP pause = hold
function showPage(s, b, page, now) {
  const book = s.books[b]; const kind = book.pages[page].kind;
  let verdict = null, line = null, rng = s.rng, intactBooks = s.intactBooks;
  if (page === book.pages.length - 1) {                                   // last page: compute the verdict now
    const intact = isIntact(book);
    verdict = intact ? 'intact' : 'broken'; if (intact) intactBooks++;
    [line, rng] = pick(rng, intact ? LINES.intact : LINES.broken);
  }
  return enterPhase({ ...s, rng, intactBooks, showing: { book: b, page, verdict, line } }, 'show', now, SHOW_MS[kind]);
}
function turnPage(s, now) {                                                // timer AND VIP skip
  const { book, page } = s.showing;
  if (page + 1 &lt; s.books[book].pages.length) return showPage(s, book, page + 1, now);
  return book + 1 &lt; s.books.length ? showPage(s, book + 1, 0, now) : enterDone(s, now);
}
export const isIntact = (book) =&gt; { const last = book.pages[book.pages.length - 1]; return last.kind === 'guess' &amp;&amp; last.text !== null &amp;&amp; norm(last.text) === norm(book.pages[0].text); };
export const norm = (t) =&gt; t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\\s+/g, ' ').trim().replace(/^(a|an|the) /, '');

// server/scoring.ts — no scores by design
export function results(state) {
  if (state.phase.id !== 'done') return null;
  const zero = Object.fromEntries(Object.keys(state.players).map((id) =&gt; [id, 0]));
  const awards = state.books.filter(isIntact).map((b) =&gt; ({ id: 'unbroken', title: 'Unbroken', description: '“' + b.pages[0].text + '” survived ' + state.seats.length + ' players', playerId: b.ownerId }));
  return buildResults(state, zero, awards);                                // everyone rank 1, winnerIds = everyone
}</code></pre>

<h3>Where randomness is drawn</h3>
<ul>
<li><code>init</code>: one <code>shuffle</code> for seats; one <code>shuffle</code> per difficulty pool for offers (3 pools), then sequential dealing.</li>
<li><code>showPage</code> on a book's last page: one <code>pick</code> for the verdict line.</li>
<li>Nothing else. Bots use their own <code>rng</code> argument.</li>
</ul>

<h3><code>bot.sampleInput</code></h3>
<pre><code>sampleInput(state, playerId, rng) {
  const me = state.players[playerId];
  switch (state.phase.id) {
    case 'pick':  return me &amp;&amp; !hasPicked(state, playerId) ? { type: 'pick', option: rng.int(0, 2) } : null;
    case 'draw':  { if (!me || submittedThisStep(state, playerId)) return null;
                    const strokes = []; const n = rng.int(2, 7);
                    for (let i = 0; i &lt; n; i++) strokes.push({ c: rng.int(0, 7), w: rng.int(0, 2), p: encodeWalk(rng, rng.int(6, 40)) });   // pure base64 encoder in server/encoding.ts
                    return { type: 'draw', strokes }; }
    case 'guess': return me &amp;&amp; !submittedThisStep(state, playerId) ? { type: 'guess', text: rng.pick(BOT_GUESSES) } : null;
    default:      return null;                       // show/done: nothing to send (the sim's VIP strategy exercises skip/pause)
  }
}</code></pre>
<p><code>encodeWalk</code> is a table-based base64 encoder over a random walk of quantised points — pure, no <code>Buffer</code>, no <code>btoa</code>. The client uses the same module to decode.</p>`,
  },
  {
    title: 'Scoring',
    html: `
<div class="note"><b>Decided by the owner (v0.2): no scoring.</b> Broken Pencil is a show, not a contest. The contract still requires <code>results()</code>, so this section specifies the degenerate results exactly.</div>
<table>
<thead><tr><th>Field</th><th>Value</th></tr></thead>
<tbody>
<tr><td><code>scores</code></td><td>0 for every player from <code>init</code>.</td></tr>
<tr><td><code>ranking</code></td><td>Every player rank 1 (<code>buildResults</code> on all-zero scores does this).</td></tr>
<tr><td><code>winnerIds</code></td><td>Every player. The engine's results screen will show everyone as winners; the game's own <code>done</code> screen (shown first) carries the real content: word → last guess per book.</td></tr>
<tr><td><code>awards</code></td><td>One <code>unbroken</code> award per surviving book, to that book's owner: “toaster” survived 4 players. Zero awards when nothing survived.</td></tr>
</tbody></table>
<h3>Worked example — Ana, Bo, Cy, Dee (4 players → D = 2, 5 pages per book)</h3>
<p>Seats: Ana 0, Bo 1, Cy 2, Dee 3. Page authors of book b: owner, owner, seat b+1, b+2, b+3.</p>
<table>
<thead><tr><th>Book</th><th>Pages (author)</th><th>Verdict</th></tr></thead>
<tbody>
<tr><td>Ana's</td><td>"toaster" (Ana) · draw (Ana) · "toaster" (Bo) · draw (Cy) · "toaster" (Dee)</td><td>intact</td></tr>
<tr><td>Bo's</td><td>"flat tire" (Bo) · draw (Bo) · "sad donut" (Cy) · draw (Dee) · "donut" (Ana)</td><td>broken</td></tr>
<tr><td>Cy's</td><td>"hiccups" (Cy) · draw (Cy) · "screaming" (Dee) · draw (Ana) · "hiccups" (Bo)</td><td>intact — only the last page is compared to the word</td></tr>
<tr><td>Dee's</td><td>"a snail race" (Dee) · draw (Dee) · "snail race" (Ana) · draw (Bo) · "The Snail Race!" (Cy)</td><td>intact — "the" and punctuation are ignored by <code>norm</code></td></tr>
</tbody></table>
<p><b>Results</b>: scores Ana 0, Bo 0, Cy 0, Dee 0; ranking all rank 1; <code>winnerIds = [Ana, Bo, Cy, Dee]</code>; awards: Unbroken → Ana ("toaster"), Unbroken → Cy ("hiccups"), Unbroken → Dee ("a snail race"); <code>intactBooks = 3</code>. No tie-breaks exist because nothing is ranked. No setting changes any of this.</p>`,
  },
  {
    title: 'Content',
    html: `
<h3>Packs</h3>
<pre><code>// content/schema.ts
export const wordsPack = z.object({
  pack: z.enum(['family', 'spicy']),
  words: z.array(z.object({ text: z.string().min(2).max(30), difficulty: z.number().int().min(1).max(3) })).min(30),
});
export const linesPack = z.object({ intact: z.array(z.string()).min(3), broken: z.array(z.string()).min(3), botGuesses: z.array(z.string()).min(20) });
export const packs = { words: wordsPack, wordsSpicy: wordsPack, lines: linesPack };</code></pre>
<p><b>Offers</b>: with <code>spicy</code> on, the two packs are merged. Each player is offered one word of each difficulty; a game with 10 players needs 10 per difficulty, so each pool must hold ≥ 10 (family has 20 / 20 / 20).</p>
<h3>Authoring guidelines</h3>
<ul>
<li>Difficulty 1: a single concrete noun anyone can sketch in 20 s. Difficulty 2: an action or a situation. Difficulty 3: a scene with two ideas that fight each other ("a pirate at the gym") — where the chains break.</li>
<li>Everything must be drawable without text; no brands, no living people, no puns that only work in one language.</li>
<li>Spicy = suggestive or embarrassing, PG-13, nothing explicit, nothing that targets a group.</li>
<li>Bot guesses are short nouns so replays read naturally.</li>
</ul>
<h3>words.json — family (60)</h3>
${contentList(WORDS.map(([w, d]) => `${w} <span style="color:var(--muted)">· ${['', 'easy', 'medium', 'hard'][d]}</span>`))}
<h3>words-spicy.json (20)</h3>
${contentList(SPICY.map(([w, d]) => `${w} <span style="color:var(--muted)">· ${['', 'easy', 'medium', 'hard'][d]}</span>`))}
<h3>lines.json</h3>
<p><b>intact</b>: ${LINES.intact.map((s) => `“${s}”`).join(' · ')}<br><b>broken</b>: ${LINES.broken.map((s) => `“${s}”`).join(' · ')}<br><b>botGuesses</b> (24): cat, dog, house, sun, car, tree, banana, ghost, robot, fish, hat, boat, cake, king, snake, cloud, pizza, spider, moon, chair, dragon, sock, egg, bird.</p>
<p>Total: 80 words + 30 lines. A game burns 3 × N words; 60 family words last a 10-player game twice without repeats — the pack should grow to 150+ before release (§14).</p>`,
  },
  {
    title: 'Edge cases',
    html: `
<table>
<thead><tr><th>Case</th><th>Behaviour</th></tr></thead>
<tbody>
<tr><td>1–2 players</td><td><code>minPlayers = 3</code>; the engine will not start. Defensive: <code>D = max(1, ⌊N/2⌋)</code> → 1 player gets word → draw → guess all by themselves (works, pointless); 2 players: D = 1, the other player guesses.</td></tr>
<tr><td>3 players</td><td>D = 1 (3 pages). Duration ≈ 20 + 60 + 30 + 3 × 26 ≈ 3 min. The <code>drawings</code> setting is silently capped; the pick screen states "3 pages" so nobody is surprised.</td></tr>
<tr><td>10 players (max)</td><td>Show ≈ 10 × (6 + 3 × 12 + 3 × 8) = 11 min if nobody presses Next; VIPs usually go faster. State 185 KB worst case (§13 simulation).</td></tr>
<tr><td>Disconnect in <code>pick</code></td><td>Deadline assigns the medium word. Their first drawing is theirs if they are back before the draw deadline; else an empty canvas.</td></tr>
<tr><td>Disconnect in <code>draw</code>/<code>guess</code></td><td>Not waited for (<code>allConnectedDone</code>); their page becomes the placeholder at the deadline. Back before the deadline: the phone still has the local strokes/draft and can send.</td></tr>
<tr><td>VIP leaves during the show</td><td>The engine reassigns the VIP; the new VIP's overlay has Next/Pause. Meanwhile the auto-turn timers carry the show. The game itself never references the VIP.</td></tr>
<tr><td>VIP pauses and forgets</td><td>The page stays up until resume; the shell shows its paused curtain (R-6 asks for a page-friendly pause).</td></tr>
<tr><td>Everyone idle</td><td>Pick → medium words; every drawing page <code>null</code>, every guess "???"; the show displays empty canvases and ???s; all books broken. Duration at defaults, 8 players ≈ 20 + 3×60 + 3×30 + 8×(6+36+24) ≈ 14 min &lt; 45 (§13 simulation: up to 15.8 min at 10 players).</td></tr>
<tr><td>Empty / whitespace guess or custom word</td><td>Rejected by the schema (<code>trim().min(1)</code>) before <code>reduce</code>.</td></tr>
<tr><td>Duplicate submission</td><td>Second <code>draw</code>/<code>guess</code> in the same step ignored (<code>pages.length !== step</code>).</td></tr>
<tr><td>Drawing too big</td><td>Schema rejects &gt; 3 000 point-chars or &gt; 80 strokes; the client's ink meter makes this unreachable except by a hostile client. Socket payload cap 6 144 B.</td></tr>
<tr><td>Ties everywhere</td><td>Nothing to tie: all scores are 0 and everyone is rank 1 by design.</td></tr>
<tr><td>Late joiners</td><td>Spectate play and watch the show. Never waited for.</td></tr>
<tr><td>VIP skip mid-phase</td><td><code>pick</code>/<code>draw</code>/<code>guess</code>: close the step with placeholders. <code>show</code>: next page (this is the intended control, not an abort). To jump a whole book the VIP taps through its pages.</td></tr>
<tr><td>Skip mashing</td><td>Each skip is one page; a VIP hammering Next flips through a book in seconds. Accepted — it is their party.</td></tr>
<tr><td>VIP end mid-show</td><td><code>done</code> immediately; the summary lists every book, shown or not.</td></tr>
<tr><td>Spicy off</td><td>Family pool only. Custom words are unaffected (a setting of their own).</td></tr>
<tr><td>Unspent timers</td><td>All-submitted exits abandon the step timer (stale by <code>startedAt</code>); a VIP skip abandons the page timer.</td></tr>
<tr><td>Pause</td><td>Timers shift; inputs ignored. Phones keep drawing locally; "Done" waits.</td></tr>
<tr><td>Word equals a later guess by accident</td><td>Only the <em>last</em> page decides intact; intermediate matches are irrelevant (Cy's book in §8).</td></tr>
</tbody></table>`,
  },
  {
    title: 'Art & sound direction',
    html: `
<h3>Palette</h3>
<div class="swatches">
${[
  ['#f5f6ff', 'paper (canvas) · --pb-text'],
  ['#0f1020', 'ink 0 · --pb-bg'],
  ['#ff5d8f', 'ink 1 · accent'],
  ['#ffd166', 'ink 2 · accent-2'],
  ['#06d6a0', 'ink 3 · accent-3'],
  ['#4cc9f0', 'ink 4 · info'],
  ['#b388ff', 'ink 5 · player-5'],
  ['#ff9f43', 'ink 6 · player-6'],
]
  .map(
    ([hex, label]) =>
      `<div class="swatch"><div style="background:${hex}"></div><span>${hex}<br>${label}</span></div>`,
  )
  .join('')}
</div>
<p>Ink 7 is paper-white — it works as an eraser on the paper without an eraser tool. Pen sizes 2 / 6 / 14 canvas units (of 256).</p>
<h3>Typography</h3>
<ul><li>Guess pages on the TV: display × 0.7 (90 px real), accent-2, quoted. Word page: h1. Artist captions: body muted. Phone prompt text: 18 px bold in a surface card above the canvas.</li></ul>
<h3>Motion</h3>
<table>
<thead><tr><th>Moment</th><th>Animation</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>Page turn (show)</td><td>Current page fades + rises 12 px; the previous page shrinks into the filmstrip (transform + opacity only)</td><td>300 ms</td></tr>
<tr><td>Drawing page appears</td><td>Strokes replay in order, capped at 600 ms total; reduced-motion shows the whole drawing at once</td><td>≤ 600 ms</td></tr>
<tr><td>Verdict banner</td><td>Scale 0.95 → 1 + fade</td><td>300 ms</td></tr>
<tr><td>Phone stroke</td><td>Immediate (pointer events → canvas), no animation; the ink bar eases</td><td>150 ms</td></tr>
</tbody></table>
<h3>Sound</h3>
<table>
<thead><tr><th>Moment</th><th>Cue</th><th>Trigger</th></tr></thead>
<tbody>
<tr><td>Phase change</td><td><code>phase</code></td><td>TV shell</td></tr>
<tr><td>Page turn</td><td><code>reveal</code></td><td>Game (needs R-2 game-triggered cues; <code>show</code> re-enters the same phase id, so the shell's <code>phase</code> cue does not fire)</td></tr>
<tr><td>Verdict intact / broken</td><td><code>win</code> / <code>error</code></td><td>Game (R-2)</td></tr>
<tr><td>Own submission accepted</td><td><code>submit</code></td><td>Controller shell</td></tr>
<tr><td>Last 5 s of draw/guess</td><td><code>countdown</code></td><td>Shell — desirable here; show pages should use the <b>quiet</b> timer (R-1)</td></tr>
</tbody></table>
<h3>Assets</h3>
<table>
<thead><tr><th>File</th><th>Size</th><th>Prompt</th></tr></thead>
<tbody>
<tr><td><code>client/assets/pencil.svg</code></td><td>64×64</td><td>"Flat single-colour icon of a broken pencil, two halves at a slight angle, rounded line style, transparent background."</td></tr>
<tr><td><code>client/assets/paper-texture.svg</code></td><td>256×256, tiling</td><td>"Very subtle off-white paper grain, 3 % contrast noise dots, seamless tile, no gradients." (optional; opacity 0.3 under the canvas)</td></tr>
</tbody></table>`,
  },
  {
    title: 'Accessibility & TV readability',
    html: `
<ul>
<li><b>TV sizes at 1080p</b>: current drawing 560 px square (line widths 4 / 13 / 30 px, readable from 3 m); guess text 90 px; filmstrip rows ≥ 84 px with 32 px captions; verdict 48 px on a full-width banner.</li>
<li><b>Colour</b>: verdict is a word plus colour; done/not-done pencil cards use ✓/✎ glyphs; ink bar has a text warning at 85 %. Drawing colours are the artist's choice — the paper is always light so any ink reads.</li>
<li><b>Screen readers</b>: canvas is <code>role="img"</code> with <code>aria-label="drawing canvas, {n} strokes"</code>; toolbar buttons are labelled ("Colour pink", "Pen size large", "Undo last stroke", "Clear drawing"); the prompt card is <code>aria-live="polite"</code>; the show screen's live region announces each page ("Page 4, guess by Dee: hamster king"; "Page 5, drawing by Eli"). A drawing game cannot be fully non-visual — the guess phase and word/guess pages are; drawing pages fall back to "drawing by X".</li>
<li><b>Touch</b>: colour dots 30 px on 41 px centres (≥ 44 px hit areas via padding); size buttons 40 px + spacing; canvas ignores touches that start on the toolbar; <code>touch-action: none</code> on the canvas so the page never scrolls mid-stroke; palm rejection by ignoring a second simultaneous pointer.</li>
<li><b>Reduced motion</b>: no stroke replay, no page-turn slide, verdict without scale.</li>
<li><b>Time</b>: <code>drawSeconds</code> up to 120 and <code>guessSeconds</code> up to 60; page auto-turn is the floor, the VIP can go faster (Next) or hold (Pause).</li>
</ul>`,
  },
  {
    title: 'Implementation plan',
    html: `
<h3>Files under <code>games/broken-pencil/</code></h3>
<table>
<thead><tr><th>File</th><th>Contents</th></tr></thead>
<tbody>
<tr><td><code>manifest.json</code></td><td>id <code>broken-pencil</code>, name "Broken Pencil", tagline "Draw it. Guess it. Watch it fall apart.", minPlayers 3, maxPlayers 10, estimatedMinutes 15, tags ["drawing","telephone","show","no-scores"], <code>maxInputBytes: 6144</code>, settings: <code>drawings</code> (1–4, default 3), <code>drawSeconds</code> (30–120 step 10, default 60), <code>guessSeconds</code> (15–60 step 5, default 30), <code>customWords</code> (true), <code>spicy</code> (false).</td></tr>
<tr><td><code>README.md</code>, <code>CLAUDE.md</code></td><td>Spec (§3/§4/§8/§10) and local rules ("pages append only; step index lives in state; never put unshown pages in a view; the show has no inputs").</td></tr>
<tr><td><code>server/types.ts</code></td><td>§6.</td></tr>
<tr><td><code>server/encoding.ts</code></td><td>Pure base64 encode/decode of point arrays (table-based), <code>pointCount(p)</code>, <code>encodeWalk(rng, n)</code> for bots. Shared with the client via a relative import.</td></tr>
<tr><td><code>server/routing.ts</code></td><td><code>bookInHands</code>, <code>authorOfPage</code>, <code>norm</code>, <code>isIntact</code>.</td></tr>
<tr><td><code>server/phases/pick.ts</code>, <code>step.ts</code> (draw+guess), <code>show.ts</code></td><td>§7.</td></tr>
<tr><td><code>server/scoring.ts</code></td><td><code>results</code>: all-zero scores, honorary Unbroken awards.</td></tr>
<tr><td><code>server/content.ts</code>, <code>content/schema.ts</code>, <code>content/words.json</code>, <code>words-spicy.json</code>, <code>lines.json</code></td><td>§9.</td></tr>
<tr><td><code>server/views.ts</code></td><td><code>tvView</code>, <code>controllerView</code> — the only place that decides what is shown.</td></tr>
<tr><td><code>client/Canvas.tsx</code></td><td>Pointer-event capture, quantisation to 256², Ramer–Douglas–Peucker simplification (ε = 1.5 units) on stroke end, undo stack, ink accounting (<code>INK_CHARS</code>); <code>&lt;canvas&gt;</code> for input, SVG for display.</td></tr>
<tr><td><code>client/DrawingView.tsx</code></td><td>Read-only SVG renderer of a <code>Drawing</code> at any size; optional stroke replay.</td></tr>
<tr><td><code>client/Toolbar.tsx</code>, <code>client/InkBar.tsx</code></td><td>Tools.</td></tr>
<tr><td><code>client/Tv.tsx</code>, <code>client/Controller.tsx</code>, <code>client/index.ts</code></td><td>Phase switches; <code>sounds: { page: 'reveal', intact: 'win', broken: 'error' }</code>.</td></tr>
<tr><td><code>fixtures/pick.json, draw.json, guess.json, show.json, done.json</code></td><td>Sim dump at 6 players; hand-edit <code>show.json</code> to page 5 of a 7-page book with one <code>null</code> drawing.</td></tr>
<tr><td><code>__tests__/routing.test.ts</code></td><td>Every (N, D) in 3…10 × 1…4: every player writes exactly one page per step; nobody touches a book twice; the last page is a guess. (Already verified by the design simulation below.)</td></tr>
<tr><td><code>__tests__/encoding.test.ts</code></td><td>Round-trip; size bound; invalid strings rejected by the schema.</td></tr>
<tr><td><code>__tests__/results.test.ts</code></td><td>The §8 example: all zeros, everyone rank 1, three Unbroken awards to the right owners; <code>norm</code> cases ("The Snail Race!" ≡ "a snail race").</td></tr>
<tr><td><code>__tests__/phases.test.ts</code></td><td>"pick deadline assigns medium word", "draw all-submitted closes early", "deadline fills placeholders", "show: timer turns the page", "show: VIP skip turns the page", "show: VIP pause holds and resume shifts", "verdict computed on the last page only", "last page of last book → done", "inputs during show ignored", "VIP end mid-show → done".</td></tr>
<tr><td><code>__tests__/views.test.ts</code></td><td>No unshown page text/drawing in any view; controller prompt is exactly the previous page; show TV pages ≤ showing.page.</td></tr>
<tr><td><code>__tests__/contract.config.ts</code></td><td><code>settingsVariants: [{ drawings: 1 }, { drawings: 4, drawSeconds: 30, guessSeconds: 15, spicy: true, customWords: false }]</code>; <code>hiddenFromTv</code>/<code>hiddenFromController</code> as in §6.</td></tr>
</tbody></table>
<h3>Effort</h3>
<p><b>L</b> — ≈ 700 lines TS + 700 lines TSX. The canvas (input capture, simplification, ink, undo) is the bulk and is the first drawing surface in the repo; budget 3 days. Server logic is routine once the routing helper is tested.</p>
<h3>Design simulation (run before implementation)</h3>
<p><code>docs/game-ideas/_tools/sim-002-broken-pencil.mjs</code> is a headless model of this reducer (seats and routing, pick, draw/guess steps with placeholders, the VIP-driven show, results, both views) driven by contract-shaped events. Run: <code>node docs/game-ideas/_tools/sim-002-broken-pencil.mjs</code>. Results, 2026-09-15:</p>
<ul>
<li><b>Routing</b>: for every N in 3…10 and D in 1…4 (32 configurations) — every player writes exactly one page per step, no player touches a book twice, every book ends with a guess. <em>The first run of this check found an off-by-one in the pseudocode's <code>bookInHands</code> (the owner would have guessed their own drawing at step 2); §7 is corrected.</em></li>
<li><b>Encoding</b>: 500 random stroke round-trips pass; a one-point stroke (a dot) encodes to 3 chars + padding, which the first draft of the schema regex rejected — §6 is corrected. <code>norm()</code>: 5/5 cases.</li>
<li><b>Fuzz</b>: 100 × 300 arbitrary events never threw — after fixing a second finding: <code>tvView</code> crashed when the VIP ended the game during <code>pick</code> (empty books). Views now tolerate books with 0–1 pages (§7).</li>
<li><b>Termination</b>: 504 games (3–10 players; honest, fast, idle, max-ink and VIP-mashing strategies; defaults, both contract variants and the slowest settings) all reach <code>done</code>. Defaults: median 7.4 min, max 12.8 (bound 45). Slowest settings with an idle room: 26.7 min.</li>
<li><b>Never spoils</b>: in every sampled view of every run, no TV view carried page text during play, no TV view carried pages beyond <code>showing.page</code>, no controller view carried any text page but the prompt and the player's own, and no controller view carried strokes during the show. 0 spoils.</li>
<li><b>Results</b>: every run reports all-zero scores, everyone rank 1, one Unbroken award per intact book. Replays are byte-identical.</li>
<li><b>Sizes</b>: largest state 185 KB with every drawing at the ink cap (10 players, D = 4) — under 256 KB with 28 % margin; typical games 40–90 KB. Largest view 19.3 KB (the show's filmstrip with four full drawings) — larger than the “a few KB” guideline; if the design review objects, send thumbnails (first 20 % of each stroke) for filmstrip pages.</li>
</ul>
<h3>SDK gaps (appended to <code>sdk-requests.md</code>)</h3>
<ol>
<li><b>R-4 — a shared drawing primitive.</b> BL-002 anticipates a drawing game; the canvas + toolbar + ink meter and the SVG renderer belong in <code>@partybox/game-sdk/ui</code> (<code>DrawPad</code>, <code>DrawingView</code>) with the encoding in <code>@partybox/game-sdk</code>. Build inside this game first, then lift.</li>
<li><b>R-6 — VIP "back" and a page-friendly pause.</b> The VIP can only skip (forward), pause, resume, end. Sliding backwards through the show needs a <code>vip: 'back'</code> action (contract change, ADR) or exposing the VIP id to <code>controllerView</code>. Also: the shell's pause curtain covers the stage; during a show the paused page should stay visible with a small ⏸ badge.</li>
<li><b>R-7 — labelling VIP skip.</b> The VIP overlay says "Skip"; here it means "Next page". A per-phase label from the game (view field <code>vipSkipLabel</code>) would make the control self-explanatory.</li>
<li><b>R-2 (existing)</b> — game-triggered sound cues for page turns and verdicts. <b>R-1 (existing)</b> — quiet timer for show pages.</li>
</ol>`,
  },
  {
    title: 'Open questions',
    html: `
<ol>
<li><b>Decided (owner, v0.2)</b>: the VIP turns the pages; no scoring or voting. Implemented via VIP skip/pause because games never learn who the VIP is. <b>Open</b>: going backwards needs R-6 — recommended to ship forward-only first and add "Prev" when the contract allows it.</li>
<li><b>Should everyone be allowed to press Next, not only the VIP?</b> Recommended: <b>no</b> — one driver plus the auto-turn floor; a room full of Next buttons ends the show in a minute.</li>
<li><b>Should the owner draw their own word first?</b> Recommended: <b>yes</b> (Telestrations rule) — it guarantees the last page is a guess for every N and gives the owner skin in the game.</li>
<li><b>Show the "next up" hint on phones?</b> ("Your page is next.") Recommended: <b>yes</b> — it gives every player a reason to look up at the right moment without spoiling anything.</li>
<li><b>Word pool size.</b> 60 family words means a repeat-free game twice; recommended target 150 family / 40 spicy before release, same difficulty split.</li>
<li><b>Ink budget.</b> 3 000 chars (~1 125 points after simplification) fits a detailed 60-second doodle; if playtests hit the limit often, raise <code>INK_CHARS</code> to 4 000 and <code>maxInputBytes</code> to 8 192, and lower <code>maxPlayers</code> to 8 to keep state under 256 KB.</li>
<li><b>Stroke replay on the show.</b> Recommended: <b>on</b> (≤ 600 ms) — the cheapest spectacle in the game. Off under reduced motion.</li>
</ol>`,
  },
  {
    title: 'Self-review scorecard',
    html: `
<div class="score">
<span>Fun</span><b class="v">5</b><span>The show is the best ten minutes of any telephone-drawing game; with no points to argue about, the room just laughs.</span>
<span>Clarity</span><b class="v">5</b><span>Six rules of play, three of show; the routing rule (§3.3) is the one thing a referee must trust and it is simulated for every player count.</span>
<span>Implementability</span><b class="v">4</b><span>Reducer is fully specified and simulated; the canvas is real client work with no primitive to lean on (R-4).</span>
<span>Novelty</span><b class="v">3</b><span>A known genre by request; the TV-driven page-by-page show, ink budget and chain verdict are the additions.</span>
<span>TV spectacle</span><b class="v">5</b><span>Filmstrip + big page + verdict banner; stroke replay.</span>
<span>Phone ergonomics</span><b class="v">4</b><span>328 px canvas with a sticky Done; toolbar targets ≥ 44 px; the risk is accidental scrolls, handled by <code>touch-action: none</code>.</span>
<span>Content longevity</span><b class="v">3</b><span>Custom words make it infinite in practice; the shipped pool needs to grow (§14.5).</span>
<span>Pacing</span><b class="v">4</b><span>≈12 min at 8; the show scales linearly with players, which is why max is 10, and the VIP can speed it up.</span>
<span>Edge-case coverage</span><b class="v">5</b><span>Placeholders make every missing page harmless; every phase has a floor timer; 1 200 simulated runs terminate.</span>
</div>`,
  },
  {
    title: 'Prior art & references',
    html: `
<table>
<thead><tr><th>Reference</th><th>What it does</th><th>Taken / rejected</th></tr></thead>
<tbody>
<tr><td><b>Telestrations</b> (board game)</td><td>4–8 players; everyone draws their own word first, then books pass: guess, sketch, guess… until the book returns. "Friendly" scoring: each owner awards a point to their favourite sketch and guess, +1 to themselves if the last guess matches. "Competitive": guessers score for matching the previous text, sketchers when their sketch is guessed.</td><td><b>Taken</b>: owner draws first; books end with a guess; the "friendly" spirit — taken further: no points at all (owner's decision). <b>Rejected</b>: both scoring variants.</td></tr>
<tr><td><b>Gartic Phone</b> (browser)</td><td>Write → draw → guess chains; presets and custom settings: turn counts, time presets (fast / normal / slow / regressive / progressive / dynamic / infinite / host's decision), a dozen task flows; the clock advances when the majority is done; the album is presented at the end by the host; Secret mode; Score mode.</td><td><b>Taken</b>: all-submitted early exit; a small settings surface (drawings, two timers); the album as the show, driven by one host (ours: the VIP). <b>Rejected</b>: majority-done clock (the contract exits on all-connected, equivalent once stragglers are disconnected), the task flows, Score mode.</td></tr>
<tr><td><b>Drawful</b> (Jackbox)</td><td>Phone drawing with one colour and two sizes; other players write fake titles; voting.</td><td><b>Taken</b>: nothing mechanical, but its 2-colour palette proves that constraints make phone drawings funny — hence 8 colours, 3 sizes, no fill, an ink budget.</td></tr>
<tr><td><b>Netflix Pictionary: Game Night</b> (TV + phones, 2025)</td><td>Team pictionary drawn on phones, shown on the TV.</td><td>Confirms 10-foot readability of phone doodles at ~500 px on a 1080p stage; ours is 560 px.</td></tr>
</tbody></table>
<h3>Links</h3>
<ul>
<li>Telestrations rules and scoring — <a href="https://www.geekyhobbies.com/telestrations-rules/">Geeky Hobbies</a>, <a href="https://www.ultraboardgames.com/telestrations/game-rules.php">UltraBoardGames</a></li>
<li>Gartic Phone custom settings — <a href="https://gartic-phone.fandom.com/wiki/Lobby_and_custom_settings">Gartic Phone Wiki</a>, <a href="https://medium.com/gartic/unlocking-gartic-phone-how-to-fully-customize-your-gartic-phone-match-3c3d67f418de">"Unlocking Gartic Phone" (Medium)</a>, <a href="https://medium.com/gartic/the-ultimate-gartic-phone-guide-all-modes-explained-805404f94948">all modes explained</a></li>
<li>Gartic Phone overview — <a href="https://www.fortressofsolitude.co.za/gartic-phone-what-is-it-how-do-you-play/">Fortress of Solitude</a></li>
<li>Netflix TV party games review — <a href="https://www.thenationalnews.com/arts-culture/pop-culture/2025/11/14/review-can-netflixs-new-tv-party-games-compete-with-jackbox/">The National</a></li>
<li>Ramer–Douglas–Peucker simplification — <a href="https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm">Wikipedia</a></li>
</ul>`,
  },
];

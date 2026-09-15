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
    'Telephone with a pencil: your word becomes a drawing, a guess, a drawing again — then every book is read aloud on the TV, one page at a time.',
  players: { min: 3, max: 10, sweet: '6–8' },
  duration: '≈13 min at 8 players (5 min play + 8 min reveal)',
  rounds: '1 book per player; 3 drawings per book by default',
  interaction: ['draw', 'text', 'vote'],
  tone: ['silly', 'cozy'],
  contentRating:
    'Family by default; optional spicy word pack (PG-13); custom words can be switched off',
  difficulty: 'L',
  status: 'idea',
  version: '0.1.0',
  date: '2026-09-15',
  axes: {
    interaction: ['draw', 'text', 'vote'],
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

const tvVote = tv(
  text(TV.padX, 96, 'Best page in Ana’s book?', { size: TV.h1, weight: 800 }) +
    text(TV.padX, 128, 'Vote on your phone · one point per vote to the page’s author', {
      size: TV.body,
      fill: T.muted,
    }) +
    BOOK.slice(1)
      .map((st, k) => {
        const x = TV.padX + (k % 3) * 290;
        const y = 150 + Math.floor(k / 3) * 165;
        return (
          rect(x, y, 270, 150, { fill: T.surface, r: 14 }) +
          text(x + 12, y + 22, `${k + 2}`, { size: TV.caption, weight: 800, fill: T.accent2 }) +
          avatar(x + 250, y + 18, 12, PLAYERS[st.author].i, PLAYERS[st.author].name) +
          (st.kind === 'draw'
            ? canvas(x + 80, y + 32, 110, st.drawing, { r: 8 })
            : text(x + 135, y + 92, `“${st.text}”`, {
                size: 20,
                weight: 700,
                anchor: 'middle',
                italic: true,
              }))
        );
      })
      .join('') +
    text(TV.W / 2, 500, '6 of 8 voted', { size: TV.body, fill: T.accent3, anchor: 'middle' }) +
    callout(TV.padX + 200, 160, 1) +
    callout(TV.W / 2 + 80, 500, 2),
  {
    kicker: 'BROKEN PENCIL · BOOK 1 OF 8',
    timer: { seconds: 6 },
    phaseLabel: 'phase: vote (book 0)',
  },
);

const tvDone = tv(
  text(TV.padX, 96, 'Final standings', { size: TV.h1, weight: 800 }) +
    text(TV.padX, 130, '3 of 8 books survived intact · 41 votes cast', {
      size: TV.body,
      fill: T.muted,
    }) +
    [
      ['Cy', 2, 11, '+2'],
      ['Ana', 0, 9, '+1'],
      ['Eli', 4, 8, '+4'],
      ['Bo', 1, 7, '+0'],
      ['Dee', 3, 6, '+2'],
      ['Fay', 5, 5, '+1'],
      ['Gus', 6, 4, '+0'],
      ['Hal', 7, 3, '+0'],
    ]
      .map(([n, i, tot, d], k) => {
        const yy = 150 + k * 40;
        return (
          rect(TV.padX, yy, 600, 34, { fill: k === 0 ? T.surface2 : T.surface, r: 10 }) +
          text(TV.padX + 24, yy + 24, String(k + 1), {
            size: 18,
            weight: 800,
            fill: T.accent2,
            anchor: 'middle',
          }) +
          avatar(TV.padX + 56, yy + 17, 13, i, n) +
          text(TV.padX + 80, yy + 24, n, { size: 18, weight: 700 }) +
          text(TV.padX + 520, yy + 24, d, {
            size: 16,
            weight: 700,
            fill: T.accent3,
            anchor: 'end',
          }) +
          text(TV.padX + 580, yy + 24, String(tot), { size: 22, weight: 800, anchor: 'end' })
        );
      })
      .join('') +
    rect(690, 150, 222, 320, { fill: T.surface, r: 16 }) +
    text(706, 182, 'AWARDS', { size: TV.caption, weight: 800, fill: T.accent2 }) +
    lines(706, 212, ['🎨 Picasso', 'Cy · 7 drawing votes'], { size: 17, weight: 700 }) +
    lines(706, 268, ['✍️ Wordsmith', 'Eli · 5 guess votes'], { size: 17, weight: 700 }) +
    lines(706, 324, ['🔗 Unbroken', 'Ana · 3 intact books'], { size: 17, weight: 700 }) +
    lines(706, 380, ['🌀 Chaos Agent', 'Dee · 4 twisted guesses'], { size: 17, weight: 700 }) +
    callout(680, 160, 1),
  { phaseLabel: 'phase: done' },
);

// ─── Phone mockups ──────────────────────────────────────────────────────────────────────────────
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

const phRevealOwner = phone(
  text(PH.pad, 130, 'It’s your book!', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 158, 'You turn the pages. Everyone else watches the TV.', {
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
    kicker: 'THE READING · YOUR BOOK',
    timer: { seconds: 9 },
    footer: button(PH.pad, PH.H - 80, PH.W - 2 * PH.pad, 'Next page ▸') + callout(40, 700, 2),
  },
);

const phRevealWatch = phone(
  text(PH.W / 2, 200, '👀', { size: 56, anchor: 'middle' }) +
    text(PH.W / 2, 250, 'Watch the TV', { size: PH.h1, weight: 800, anchor: 'middle' }) +
    text(PH.W / 2, 280, 'Ana is turning the pages of her book.', {
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
  { kicker: 'THE READING', timer: { seconds: 9 } },
);

const phVote = phone(
  text(PH.pad, 128, 'Best page in Ana’s book?', { size: PH.h2, weight: 800 }) +
    BOOK.slice(1)
      .map((st, k) => {
        const y = 150 + k * 78;
        const mine = st.author === 1;
        const sel = k === 3;
        return (
          rect(PH.pad, y, PH.W - 2 * PH.pad, 66, {
            fill: sel ? T.surface2 : T.surface,
            r: 14,
            stroke: sel ? T.accent2 : null,
            opacity: mine ? 0.5 : 1,
          }) +
          text(PH.pad + 12, y + 20, `${k + 2}`, { size: 12, weight: 800, fill: T.accent2 }) +
          avatar(PH.pad + 40, y + 40, 12, PLAYERS[st.author].i, PLAYERS[st.author].name) +
          (st.kind === 'draw' ? canvas(PH.pad + 62, y + 6, 54, st.drawing, { r: 6 }) : '') +
          text(
            PH.pad + 126,
            y + 40,
            st.kind === 'draw' ? `${PLAYERS[st.author].name} drew` : `“${st.text}”`,
            { size: 15, weight: 700 },
          ) +
          (mine
            ? text(PH.W - PH.pad - 12, y + 40, 'yours', { size: 12, fill: T.muted, anchor: 'end' })
            : '') +
          (sel
            ? text(PH.W - PH.pad - 12, y + 44, '✓', {
                size: 20,
                weight: 800,
                fill: T.accent3,
                anchor: 'end',
              })
            : '')
        );
      })
      .join('') +
    callout(PH.W - 44, 240, 1) +
    callout(PH.W - 44, 395, 2),
  { kicker: 'VOTE · BOOK 1 OF 8', timer: { seconds: 6 } },
);

const phSpectator = phone(
  text(PH.W / 2, 200, '◎', { size: 56, anchor: 'middle', fill: T.muted }) +
    text(PH.W / 2, 250, 'You’re spectating', { size: PH.h1, weight: 800, anchor: 'middle' }) +
    text(PH.W / 2, 280, 'Books were handed out before you arrived.', {
      size: PH.body,
      fill: T.muted,
      anchor: 'middle',
    }) +
    text(PH.W / 2, 306, 'You can still vote during the reading.', {
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
    text(
      PH.pad,
      560,
      'Your strokes are kept on this phone; Done will send them when you’re back.',
      { size: 13, fill: T.muted },
    ) +
    callout(PH.W - 40, 52, 1),
  {
    kicker: 'ANA’S BOOK · PAGE 2 OF 7',
    banner: 'reconnecting',
    footer: button(PH.pad, PH.H - 80, PH.W - 2 * PH.pad, 'Done drawing', { disabled: true }),
  },
);

const phDone = phone(
  text(PH.pad, 130, 'You finished 2nd', { size: PH.h1, weight: 800 }) +
    text(PH.pad, 158, '9 points · 7 votes + 1 intact book', { size: PH.caption, fill: T.muted }) +
    [
      ['Cy', 2, 11],
      ['Ana', 0, 9],
      ['Eli', 4, 8],
      ['Bo', 1, 7],
      ['Dee', 3, 6],
    ]
      .map(([n, i, tot], k) => {
        const yy = 180 + k * 46;
        const me = n === 'Ana';
        return (
          rect(PH.pad, yy, PH.W - 2 * PH.pad, 40, {
            fill: me ? T.surface2 : T.surface,
            r: 12,
            stroke: me ? T.accent2 : null,
          }) +
          text(PH.pad + 20, yy + 27, String(k + 1), {
            size: 15,
            weight: 800,
            fill: T.accent2,
            anchor: 'middle',
          }) +
          avatar(PH.pad + 50, yy + 20, 13, i, n) +
          text(PH.pad + 72, yy + 27, n + (me ? ' (you)' : ''), { size: 15, weight: 700 }) +
          text(PH.W - PH.pad - 14, yy + 27, String(tot), { size: 17, weight: 800, anchor: 'end' })
        );
      })
      .join('') +
    text(PH.pad, 440, 'YOUR AWARDS', { size: 12, weight: 800, fill: T.accent2 }) +
    text(PH.pad, 466, '🔗 Unbroken — 3 intact books', { size: 16, weight: 600 }),
  { kicker: 'FINAL' },
);

// ─── State diagram ──────────────────────────────────────────────────────────────────────────────
const stateDiagram = svg(
  960,
  360,
  node(20, 130, 120, 60, 'pick', { sub: 'pickSeconds' }) +
    node(200, 130, 130, 60, 'draw', { sub: 'drawSeconds' }) +
    node(390, 130, 130, 60, 'guess', { sub: 'guessSeconds' }) +
    node(580, 130, 140, 60, 'reveal', { sub: 'per page' }) +
    node(780, 130, 130, 60, 'vote', { sub: 'voteSeconds' }) +
    node(780, 260, 130, 50, 'done', { sub: 'terminal', terminal: true, stroke: T.accent3 }) +
    arrow(140, 160, 198, 160, 'all | timer', { dy: -34 }) +
    arrow(330, 160, 388, 160, 'all | timer', { dy: -34 }) +
    `<path d="M455,130 C455,60 265,60 265,128" fill="none" stroke="${T.muted}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    rect(300, 62, 120, 22, { fill: T.bg, r: 11 }) +
    text(360, 77, 'step < L', { size: 12, fill: T.muted, anchor: 'middle' }) +
    arrow(520, 160, 578, 160, 'last page', { dy: -34 }) +
    `<path d="M650,130 C630,70 690,70 652,128" fill="none" stroke="${T.muted}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    rect(590, 44, 140, 22, { fill: T.bg, r: 11 }) +
    text(660, 59, 'next | timer → page+1', { size: 12, fill: T.muted, anchor: 'middle' }) +
    arrow(720, 160, 778, 160, 'book done', { dy: -34 }) +
    `<path d="M845,190 C845,250 650,250 650,192" fill="none" stroke="${T.muted}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    rect(690, 232, 130, 22, { fill: T.bg, r: 11 }) +
    text(755, 247, 'next book', { size: 12, fill: T.muted, anchor: 'middle' }) +
    arrow(845, 190, 845, 258, 'last book', { dy: 0 }) +
    text(
      20,
      330,
      'voting=false: reveal → next book directly. VIP skip: pick/draw/guess → close the page; reveal → next book; vote → tally now. VIP end → done.',
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
  placeholderGuess: '???',
};

// ─── Sections ───────────────────────────────────────────────────────────────────────────────────
export const sections = [
  { title: 'Header card', html: '' },
  {
    title: 'The hook',
    html: `
<p>Everyone knows the telephone game; this one has a pencil in it. You draw your secret word on your phone, the person next to you guesses what it is, the next person draws <em>that</em>, and by the time your book comes home a cat wearing a crown has become "a fat king". The laugh is not the drawing, it is the reveal: the TV turns the pages of each book one at a time, with the book's owner holding the "next page" button and the room screaming at every turn. A small vote after each book gives the artist of the worst hamster a point for their trouble.</p>`,
  },
  {
    title: "A round from a player's seat",
    html: `
<p><b>Ana</b> is one of eight. Her phone offers three words — <i>toaster</i>, <i>a cat wearing a crown</i>, <i>a pirate at the gym</i> — plus a box to write her own. She taps the cat and locks it in; the TV shows "5 of 8 picked". Then her phone becomes a square sheet of paper with the word above it, eight ink colours, three pen sizes, undo, clear and a green ink bar. She draws a lumpy cat, a red nose, a yellow zigzag crown. The ink bar is at 40 %. She hits <b>Done drawing</b>; the phone shows her cat and says "Bo gets this next. Good luck, Bo." The TV shows eight cards with pencils, five ticked.</p>
<p>Next page: her phone shows a drawing she has never seen — Hal's, of what might be a lawn mower — and a text box. She types "angry vacuum" and sends. Then a drawing turn again: she is handed the words "haunted spoon" and has 60 seconds. The room is quiet except for giggling.</p>
<p>After the sixth page the TV says <b>The reading</b>, and Ana's book is first. Her phone says <i>It's your book! You turn the pages.</i> The TV shows "a cat wearing a crown", then her drawing (polite applause), then Bo's guess: "royal cat" — fine. Cy's drawing of a royal cat looks a lot like a potato. Dee's guess: <b>"hamster king"</b>. The room loses it. Ana holds the next-page button for effect. Eli's hamster king is a masterpiece. Fay's final guess: <b>"a fat king"</b> — CHAIN BROKEN in red. Everyone's phone then asks for the best page in Ana's book; Eli's hamster takes five votes. Seven more books to go, and Ana is already crying laughing.</p>`,
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
<li><b>Draw (<code>drawSeconds</code>, default 60)</b>: draw the text on the previous page. Tools: 8 colours, 3 pen sizes, undo, clear. <b>Ink</b> is limited (≈1 100 simplified points per drawing); when it runs out the pen stops until you undo. "Done" sends the drawing; you may not edit after sending. No submission by the deadline → whatever is on the canvas is <em>not</em> sent (the server never saw it); the page is filled with an <b>empty canvas</b>.</li>
<li><b>Guess (<code>guessSeconds</code>, default 30)</b>: look at the previous page's drawing and write what it is (1–40 characters). No submission → the page reads <b>"???"</b>.</li>
<li>Steps 5–6 repeat until every book has L pages. A step ends when every connected player has submitted or the deadline passes.</li>
<li><b>Never spoil</b>: while playing you only ever see the single previous page of the book in your hands. The TV shows only progress (who is done).</li>
</ol>
<h3>The reading</h3>
<ol start="9">
<li>Books are read in seat order. Each page is shown on the TV in turn: the word, then each drawing (with its artist) and each guess (with its author). The book's <b>owner turns the pages</b> with a "Next page" button; a page auto-turns after 6 s (word), 12 s (drawing) or 8 s (guess). Pages cannot be turned back.</li>
<li>After the last page the TV declares <b>UNBROKEN</b> if the final guess matches the word (case-insensitive, punctuation and leading "a/an/the" ignored) or <b>CHAIN BROKEN</b> otherwise.</li>
<li><b>Vote (10 s, if <code>voting</code> is on)</b>: everyone — spectators too — votes for the best page of that book (pages 2…L). You cannot vote for your own page. Then the next book.</li>
</ol>
<h3>Scoring &amp; winning</h3>
<ol start="12">
<li>+1 to a page's author per vote it receives. +2 to every contributor of an unbroken book (owner included; a player who contributed twice — impossible by rule 3 — would get it once).</li>
<li>Highest total wins; ties broken by votes received on drawings, then shared.</li>
<li>Awards: <b>Picasso</b> (most votes on drawings), <b>Wordsmith</b> (most votes on guesses), <b>Unbroken</b> (most intact books contributed to, ≥ 2), <b>Chaos Agent</b> (most guesses that changed the phrase — a guess that does not match the previous text page — ≥ 2).</li>
</ol>
<h3>Referee's notes</h3>
<ul>
<li>Disconnected players' pages are filled by the deadline rule (empty canvas / "???"); the book carries on. The owner's "Next page" button falls to the auto-turn timer if the owner is away; the VIP can also skip.</li>
<li>Late joiners spectate the play phases but <em>do</em> vote.</li>
<li>Pause freezes the current page timer; drawing continues locally on phones but cannot be sent until resume.</li>
</ul>`,
  },
  {
    title: 'Phase flow table',
    html: `
<div class="scroll"><table>
<thead><tr><th>Phase id</th><th>TV shows</th><th>Player phone</th><th>Spectator phone</th><th>Inputs accepted</th><th>Exit</th><th>Default timer</th><th>Allowed range</th></tr></thead>
<tbody>
<tr><td><code>pick</code></td><td>"Pick your secret word", the four-line how-to, n of m picked, chips</td><td>Three word options + custom text box + "Lock it in"; locked state</td><td>"You're spectating" + progress</td><td><code>pick</code></td><td>all connected picked · deadline · VIP skip</td><td>20 s</td><td>fixed</td></tr>
<tr><td><code>draw</code></td><td>"Everyone is drawing…", page p of L, per-player pencil cards (done/drawing), n of m done</td><td>Text to draw, canvas, toolbar, ink bar, "Done drawing"; sent state shows own drawing + who gets it next</td><td>Progress only</td><td><code>draw</code></td><td>all connected submitted · deadline · VIP skip</td><td>60 s</td><td>30–120 s, step 10</td></tr>
<tr><td><code>guess</code></td><td>"Everyone is guessing…", same progress layout</td><td>Previous drawing + text box + "Send guess"; sent state shows the guess</td><td>Progress only</td><td><code>guess</code></td><td>all connected submitted · deadline · VIP skip</td><td>30 s</td><td>15–60 s, step 5</td></tr>
<tr><td><code>reveal</code></td><td>Book title + filmstrip of pages so far + the current page big; UNBROKEN / CHAIN BROKEN banner on the last page</td><td>Owner: page counter + "Next page". Others: "Watch the TV" + when their page is coming</td><td>"Watch the TV"</td><td><code>next</code> (owner only)</td><td><code>next</code> · deadline → page+1; last page → <code>vote</code> (or next book / done) · VIP skip → next book</td><td>6 / 12 / 8 s per page kind</td><td>fixed</td></tr>
<tr><td><code>vote</code></td><td>The book's pages 2…L as tiles, n of m voted</td><td>Vote list (own page disabled); voted state</td><td>Same vote list</td><td><code>vote</code></td><td>all connected (players + spectators) voted · deadline · VIP skip → next book or <code>done</code></td><td>10 s</td><td>fixed</td></tr>
<tr><td><code>done</code></td><td>Final standings + awards + "k of N books survived"</td><td>Own rank, points breakdown, awards</td><td>Standings</td><td>none</td><td>terminal</td><td>—</td><td>—</td></tr>
</tbody></table></div>
<div class="note"><b><code>draw</code> and <code>guess</code> re-enter themselves</b> for each step with a new <code>startedAt</code> (step index lives in state); <code>reveal</code> re-enters per page. One fixture per phase id is enough; the phase id does not encode the step.</div>`,
  },
  {
    title: 'Screens',
    html: `
<p>TV at 960×540 (half of 1080p); phones at 360×780. The canvas is square everywhere: 328 px on the phone, 560 px real on the TV (280 here).</p>
<h3>pick</h3>
${fig(tvPick, '<b>TV · pick.</b> The rules in four lines while people choose; nothing to spoil yet.', ['Four-line how-to at body size — this is the only tutorial the game has.', 'Progress count; the shell chips show ✓ as players lock in.'])}
${phones([[phPick, '<b>Player · pick.</b> ① three offered words with difficulty labels, one tap selects; ② custom word box (hidden when <code>customWords</code> is off); ③ "Lock it in" in the sticky footer.']])}
<h3>draw</h3>
${fig(tvDraw, '<b>TV · draw.</b> Pure progress — the drawings stay secret until the reading.', ['Per-player pencil cards: name, ✓ done / ✎ drawing; card outline turns accent-3 when done.', 'The step ends early when everyone is done (all-submitted rule).'])}
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
  [phSpectator, '<b>Spectator · draw/guess.</b> Progress text only; spectators get a vote later.'],
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
<h3>reveal</h3>
${fig(
  tvRevealDraw,
  '<b>TV · reveal, a drawing page.</b> The filmstrip on the left is the book so far; the current page is big on the right.',
  [
    'Filmstrip: every page revealed so far with author avatar; the current one is outlined accent-2. Rows shrink as the book grows (50 px here for 7 pages).',
    "Current page: the drawing at 560 px real with the artist's name and what they were asked to draw.",
    'The last-revealed page always stays visible in the strip so latecomers to the joke can catch up.',
  ],
)}
${fig(tvRevealGuess, '<b>TV · reveal, the last page.</b> Guess pages show at display size; the last page carries the verdict banner.', ['Final guess at 90 px real in accent-2.', 'Verdict: UNBROKEN (accent-3) or CHAIN BROKEN (danger) — word and colour.'])}
${phones([
  [
    phRevealOwner,
    '<b>Owner · reveal.</b> ① page counter and what the TV is showing, progress bar; ② "Next page ▸" — the only input in this phase.',
  ],
  [
    phRevealWatch,
    '<b>Everyone else · reveal.</b> ① tells you when your own page is about to come up.',
  ],
])}
<h3>vote</h3>
${fig(tvVote, '<b>TV · vote.</b> Pages 2…L as tiles with page numbers and author avatars; no tallies until the next reveal begins.', ['Tiles: drawings as thumbnails, guesses as text; numbered so the room can shout "four!".', 'Vote count.'])}
${phones([[phVote, '<b>Player · vote.</b> ① own page is dimmed and marked "yours" (VoteList\'s <code>mine</code>); ② one tap locks the vote.']])}
<h3>done</h3>
${fig(tvDone, '<b>TV · done.</b> Standings with last-book deltas; awards panel.', ['Awards panel; only earned awards appear.'])}
${phones([[phDone, '<b>Player · done.</b> Rank, points breakdown, own awards.']])}`,
  },
  {
    title: 'Data model',
    html: `
<pre><code>// games/broken-pencil/server/types.ts
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = ['pick', 'draw', 'guess', 'reveal', 'vote', 'done'] as const;

export interface Settings {
  drawings: number;      // drawings per book, 1..4, default 3 (capped at floor(N/2) in init)
  drawSeconds: number;   // 30..120 step 10, default 60
  guessSeconds: number;  // 15..60 step 5, default 30
  voting: boolean;       // default true
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
  seats: string[];                       // seat index → playerId, shuffled at init (fixed for the game)
  pageCount: number;                     // L = 2·D + 1
  step: number;                          // play: index of the page being written (1..L−1); 0 during pick
  books: Book[];                         // books[b].ownerId === seats[b]; pages.length grows to L
  offers: Record&lt;string, string[]&gt;;      // playerId → the 3 offered words
  reading: { book: number; page: number } | null;  // reveal/vote position
  votes: Record&lt;string, number&gt;;         // current book: voterId → page index
  voteTotals: Record&lt;string, { draw: number; guess: number }&gt;;   // per author
  intact: Record&lt;string, number&gt;;        // playerId → unbroken books contributed to
  twists: Record&lt;string, number&gt;;        // playerId → guesses that changed the phrase
  scores: Record&lt;string, number&gt;;
  intactBooks: number;
}

const stroke = z.object({
  c: z.number().int().min(0).max(7),
  w: z.number().int().min(0).max(2),
  p: z.string().regex(/^[A-Za-z0-9+/]{4,}={0,2}$/).refine((s) =&gt; s.length % 4 === 0),
});
export const INK_CHARS = 3000;                     // ≈ 1 125 points per drawing → ≤ 4 KB JSON
export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('pick'), option: z.number().int().min(0).max(2) }),
  z.object({ type: z.literal('pick'), custom: z.string().trim().min(1).max(30) }),   // see note below
  z.object({ type: z.literal('draw'), strokes: z.array(stroke).max(80).refine((a) =&gt; a.reduce((n, s) =&gt; n + s.p.length, 0) &lt;= INK_CHARS) }),
  z.object({ type: z.literal('guess'), text: z.string().trim().min(1).max(40) }),
  z.object({ type: z.literal('next') }),
  z.object({ type: z.literal('vote'), page: z.number().int().min(1).max(8) }),
]);
export type Input = z.infer&lt;typeof inputSchema&gt;;
// zod discriminated unions need one literal per member: use 'pick' and 'pickCustom' as the type
// literals in the real implementation (two members with the same discriminator are rejected by zod).

export const PICK_MS = 20_000, VOTE_MS = 10_000;
export const REVEAL_MS = { word: 6_000, draw: 12_000, guess: 8_000 } as const;
export const POINTS = { vote: 1, intact: 2 } as const;</code></pre>
<p><b>Manifest</b>: <code>maxInputBytes: 6144</code> (ADR-002). A full drawing is ≤ 3 000 chars of points + ≤ 80 × ~20 bytes of stroke envelope ≈ 4.7 KB. <b>State budget</b>: 10 books × 4 drawings × 4.7 KB ≈ 190 KB worst case; 8 players × 3 drawings ≈ 115 KB. Under the 256 KB cap with margin; hence <code>maxPlayers = 10</code> and <code>drawings ≤ 4</code>.</p>

<h4>Views</h4>
<pre><code>export interface PencilTvView extends TvView {
  step: number; pageCount: number; bookCount: number;
  progress: { playerId: string; done: boolean }[];        // pick/draw/guess
  reading: null | {                                       // reveal/vote
    book: number; ownerId: string; page: number;          // page = index of the last revealed page
    pages: Page[];                                        // pages[0..page] ONLY (never the unrevealed ones)
    verdict: 'intact' | 'broken' | null;                  // set on the last page
    verdictLine: string;
    lastVotes: { page: number; count: number }[] | null;  // previous book's tally, shown on the first page of the next
  };
  voteCount: number; voterCount: number;                  // vote
  standings: { playerId: string; total: number; delta: number; rank: number }[] | null;
  intactBooks: number; awards: GameAward[];
}

export interface PencilControllerView extends ControllerView {
  step: number; pageCount: number; bookIndex: number | null;   // the book in my hands this step
  ownerName: string | null;
  offers: string[] | null; customWords: boolean;              // pick
  prompt: { kind: 'text'; text: string } | { kind: 'drawing'; drawing: Drawing | null } | null;   // the previous page, and nothing else
  submitted: boolean; mine: { drawing?: Drawing; text?: string } | null; nextName: string | null;
  reading: { book: number; ownerId: string; page: number; pageKind: 'word' | 'draw' | 'guess'; isOwner: boolean; myPageAt: number | null } | null;
  voteOptions: { page: number; kind: 'draw' | 'guess'; authorId: string; text: string | null; drawing: Drawing | null; mine: boolean }[] | null;
  votedPage: number | null;
  standings: PencilTvView['standings']; awards: GameAward[];
}</code></pre>
<p>Contract-test hints: <code>hiddenFromTv(state)</code> = every word/guess text of pages not yet revealed (in play: all of them); <code>hiddenFromController(state, me)</code> = every text page except the one in <code>prompt</code> and my own submissions; during reveal the controller carries no page content at all (the TV does).</p>

<h4>Sample mid-game state (8 players, step 3 = a guess page, 5 of 8 submitted; two books shown)</h4>
<pre><code>{
  "phase": { "id": "guess", "startedAt": 1758001200000, "deadline": 1758001230000 },
  "rng": { "seed": 4471, "step": 41 },
  "players": { "p1": { "id": "p1", "name": "Ana", "avatarId": "a03", "connected": true }, "p2": { "id": "p2", "name": "Bo", "avatarId": "a07", "connected": true }, "…": "…" },
  "settings": { "drawings": 3, "drawSeconds": 60, "guessSeconds": 30, "voting": true, "customWords": true, "spicy": false },
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
      { "kind": "guess", "authorId": "p3", "text": "???" },
      { "kind": "draw", "authorId": "p4", "drawing": { "strokes": [ { "c": 4, "w": 0, "p": "IiIzM0RE" } ] } }
    ] }
  ],
  "offers": { "p1": ["toaster", "a cat wearing a crown", "a pirate at the gym"], "p2": ["snail", "flat tire", "zombie wedding"], "…": "…" },
  "reading": null, "votes": {}, "voteTotals": {}, "intact": {}, "twists": {}, "scores": {}, "intactBooks": 0
}</code></pre>
<p>In this sample page 4 (a guess) of each book is being written and pages are appended on submit; books with 3 pages have not received their step-3 page yet (Bo's book already has one because Cy submitted). Bo's own first drawing is <code>null</code> — he missed the deadline — so Cy saw an empty canvas and gave up with "???".</p>`,
  },
  {
    title: 'Reducer logic',
    html: `
${fig(stateDiagram, '<b>State diagram.</b> Three self-loops (draw/guess alternate per step, reveal per page); everything else is deadline / all-submitted / VIP skip.', [], 'tv')}
<h3>Per-phase transition rules</h3>
<table>
<thead><tr><th>Phase</th><th>Event</th><th>Rule</th></tr></thead>
<tbody>
<tr><td>any</td><td><code>player</code></td><td><code>setConnected</code>; nothing else.</td></tr>
<tr><td>any</td><td><code>vip pause/resume</code></td><td><code>applyVip</code>.</td></tr>
<tr><td>any</td><td><code>vip end</code></td><td><code>enterDone</code> with scores as tallied so far (books not yet read score nothing).</td></tr>
<tr><td><code>pick</code></td><td><code>input pick</code></td><td>Player only, once. <code>option</code> → <code>offers[p][option]</code>; <code>custom</code> only if <code>settings.customWords</code>. Sets <code>books[seat(p)].pages[0]</code>. All connected picked → <code>closePick</code>.</td></tr>
<tr><td><code>pick</code></td><td>timer · skip</td><td><code>closePick</code>: unpicked players get <code>offers[p][1]</code>; <code>step = 1</code>; <code>enterStep</code>.</td></tr>
<tr><td><code>draw</code></td><td><code>input draw</code></td><td>Player only, once per step, only if the book in their hands has exactly <code>step</code> pages. Append <code>{kind:'draw', authorId, drawing}</code>. All connected submitted → <code>closeStep</code>.</td></tr>
<tr><td><code>guess</code></td><td><code>input guess</code></td><td>Same, appends <code>{kind:'guess', text}</code>.</td></tr>
<tr><td><code>draw</code>/<code>guess</code></td><td>timer · skip</td><td><code>closeStep</code>: for every book with <code>step</code> pages, append the placeholder page (<code>drawing: null</code> / <code>text: null</code>) authored by the seat that owed it; <code>step++</code>; <code>step &lt; pageCount ? enterStep : enterReveal(0, 0)</code>.</td></tr>
<tr><td><code>reveal</code></td><td><code>input next</code></td><td>Only from <code>books[reading.book].ownerId</code>. → <code>turnPage</code>.</td></tr>
<tr><td><code>reveal</code></td><td>timer</td><td><code>turnPage</code>.</td></tr>
<tr><td><code>reveal</code></td><td>skip</td><td><code>finishBook</code> (as if the last page had been shown; verdict computed) → vote / next book / done.</td></tr>
<tr><td><code>vote</code></td><td><code>input vote</code></td><td>Any known id (players and spectators are both allowed — spectators are ids not in <code>state.players</code>, so the reducer accepts any non-empty id here, once), <code>1 ≤ page ≤ pageCount−1</code>, not the voter's own page. All connected players voted (spectators are never waited for) → <code>tally</code>.</td></tr>
<tr><td><code>vote</code></td><td>timer · skip</td><td><code>tally</code>: +1 per vote to the page's author, update <code>voteTotals</code>; then <code>nextBook</code>.</td></tr>
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
  const [pool, r2] = dealOffers(rng, seats, settings.spicy); rng = r2;                  // 3 per player, no repeats
  const books = seats.map((id) =&gt; ({ ownerId: id, pages: [] }));
  const s = { ...base(ctx, rng), settings: { ...settings, drawings: D }, seats, pageCount: 2 * D + 1, step: 0, books, offers: pool,
              reading: null, votes: {}, voteTotals: {}, intact: {}, twists: {}, scores: zeros(ctx.players), intactBooks: 0 };
  return enterPhase(s, 'pick', ctx.now, PICK_MS);
}

/** Which book seat k holds at step p (p ≥ 1): book b such that (b + p − 2) mod N == k for p ≥ 3; the owner's own book for p ∈ {1, 2}. */
function bookInHands(s, playerId) {
  const N = s.seats.length; const k = s.seats.indexOf(playerId);
  if (k &lt; 0) return -1;
  return s.step &lt;= 2 ? k : (((k - (s.step - 2)) % N) + N) % N;
}
function enterStep(s, now) {
  const kind = s.step % 2 === 1 ? 'draw' : 'guess';
  const ms = (kind === 'draw' ? s.settings.drawSeconds : s.settings.guessSeconds) * 1000;
  return enterPhase(s, kind, now, ms);
}
function reduceStep(s, e) {                       // shared by draw and guess
  if (e.type === 'input' &amp;&amp; (e.input.type === 'draw' || e.input.type === 'guess')) {
    if (e.input.type !== s.phase.id) return s;
    const b = bookInHands(s, e.playerId); if (b &lt; 0) return s;
    const book = s.books[b]; if (book.pages.length !== s.step) return s;                     // already submitted or out of sync
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
    const author = s.seats[s.step &lt;= 2 ? b : (b + s.step - 2) % N];
    const page = s.step % 2 === 1 ? { kind: 'draw', authorId: author, drawing: null } : { kind: 'guess', authorId: author, text: null };
    return { ...bk, pages: [...bk.pages, page] };
  });
  const next = { ...s, books, step: s.step + 1 };
  return next.step &lt; next.pageCount ? enterStep(next, now) : enterReveal(next, 0, now);
}

// server/phases/reveal.ts
function enterReveal(s, book, now) {
  const page = 0; const kind = s.books[book].pages[page].kind;
  return enterPhase({ ...s, reading: { book, page }, votes: {} }, 'reveal', now, REVEAL_MS[kind]);
}
function turnPage(s, now) {
  const r = s.reading; const book = s.books[r.book];
  if (r.page + 1 &gt;= book.pages.length) return finishBook(s, now);
  const page = r.page + 1;
  return enterPhase({ ...s, reading: { book: r.book, page } }, 'reveal', now, REVEAL_MS[book.pages[page].kind]);
}
function finishBook(s, now) {
  const b = s.reading.book; const book = s.books[b];
  const word = book.pages[0].text; const last = book.pages[book.pages.length - 1];
  const intact = last.kind === 'guess' &amp;&amp; last.text !== null &amp;&amp; norm(last.text) === norm(word);
  let scores = { ...s.scores }, intactMap = { ...s.intact }, twists = { ...s.twists };
  if (intact) for (const id of new Set(book.pages.map((p) =&gt; p.authorId))) { scores[id] = (scores[id] ?? 0) + POINTS.intact; intactMap[id] = (intactMap[id] ?? 0) + 1; }
  let prevText = word;
  for (const p of book.pages.slice(1)) if (p.kind === 'guess') { if (p.text === null || norm(p.text) !== norm(prevText)) twists[p.authorId] = (twists[p.authorId] ?? 0) + 1; prevText = p.text ?? '???'; }
  const [line, rng] = pick(s.rng, intact ? LINES.intact : LINES.broken);
  const next = { ...s, rng, scores, intact: intactMap, twists, intactBooks: s.intactBooks + (intact ? 1 : 0),
                 reading: { ...s.reading, page: book.pages.length - 1, verdict: intact ? 'intact' : 'broken', verdictLine: line } };
  if (s.settings.voting) return enterPhase(next, 'vote', now, VOTE_MS);
  return nextBook(next, now);
}
function nextBook(s, now) { const b = s.reading.book + 1; return b &lt; s.books.length ? enterReveal(s, b, now) : enterDone(s, now); }

// server/phases/vote.ts
function reduceVote(s, e) {
  if (e.type === 'input' &amp;&amp; e.input.type === 'vote') {
    const book = s.books[s.reading.book]; const page = book.pages[e.input.page];
    if (!page || page.kind === 'word' || page.authorId === e.playerId || e.playerId in s.votes) return s;
    const next = { ...s, votes: { ...s.votes, [e.playerId]: e.input.page } };
    return allConnectedDone(next, Object.keys(next.votes)) ? tally(next, e.now) : next;
  }
  if (isTimerFor(s, e)) return tally(s, e.now);
  return s;
}
function tally(s, now) {
  const book = s.books[s.reading.book]; const scores = { ...s.scores }; const totals = { ...s.voteTotals };
  for (const page of Object.values(s.votes)) {
    const p = book.pages[page]; scores[p.authorId] = (scores[p.authorId] ?? 0) + POINTS.vote;
    const t = totals[p.authorId] ?? { draw: 0, guess: 0 }; totals[p.authorId] = { ...t, [p.kind]: t[p.kind] + 1 };
  }
  return nextBook({ ...s, scores, voteTotals: totals, lastVotes: countBy(Object.values(s.votes)) }, now);
}

export const norm = (t) =&gt; t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\\s+/g, ' ').trim().replace(/^(a|an|the) /, '');</code></pre>

<h3>Where randomness is drawn</h3>
<ul>
<li><code>init</code>: one <code>shuffle</code> for seats; one <code>shuffle</code> per difficulty pool for offers (3 pools), then sequential dealing — no further draws.</li>
<li><code>finishBook</code>: one <code>pick</code> for the verdict line.</li>
<li>Nothing during draw/guess/vote. Bots use their own <code>rng</code> argument.</li>
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
    case 'reveal':return state.books[state.reading.book].ownerId === playerId &amp;&amp; rng.chance(0.3) ? { type: 'next' } : null;
    case 'vote':  { if (playerId in state.votes) return null;
                    const opts = state.books[state.reading.book].pages.map((p, i) =&gt; i).filter((i) =&gt; i &gt; 0 &amp;&amp; state.books[state.reading.book].pages[i].authorId !== playerId);
                    return opts.length ? { type: 'vote', page: rng.pick(opts) } : null; }
    default:      return null;
  }
}</code></pre>
<p><code>encodeWalk</code> is a table-based base64 encoder over a random walk of quantised points — pure, no <code>Buffer</code>, no <code>btoa</code> (the server package must not assume a browser or Node global). The client uses the same module to decode.</p>`,
  },
  {
    title: 'Scoring',
    html: `
<table>
<thead><tr><th>Event</th><th>Points</th><th>To whom</th></tr></thead>
<tbody>
<tr><td>A vote for a page</td><td><b>+1</b></td><td>The page's author (drawings and guesses alike).</td></tr>
<tr><td>A book ends unbroken</td><td><b>+2</b></td><td>Every distinct contributor of that book, owner included.</td></tr>
</tbody></table>
<p><code>total = votes received + 2 × intact books contributed to</code>. With <code>voting = false</code> only the intact bonus scores (the game is then mostly a show). Max per book: <code>(N − 1)</code> vote points spread over up to 6 authors, +2 each if intact.</p>
<h3>Worked example — Ana, Bo, Cy, Dee (4 players → D = 2, 5 pages per book)</h3>
<p>Seats: Ana 0, Bo 1, Cy 2, Dee 3. Page authors of book b: owner, owner, seat b+1, b+2, b+3.</p>
<table>
<thead><tr><th>Book</th><th>Pages (author)</th><th>Verdict</th><th>Votes (3 voters, own page excluded)</th><th>Points</th></tr></thead>
<tbody>
<tr><td>Ana's</td><td>"toaster" (Ana) · draw (Ana) · "toaster" (Bo) · draw (Cy) · "toaster" (Dee)</td><td>intact</td><td>Ana's draw 2, Cy's draw 1</td><td>Ana +2 +2 = 4 · Bo +2 · Cy +2 +1 = 3 · Dee +2</td></tr>
<tr><td>Bo's</td><td>"flat tire" (Bo) · draw (Bo) · "sad donut" (Cy) · draw (Dee) · "donut" (Ana)</td><td>broken</td><td>Cy's guess 2, Dee's draw 1</td><td>Cy +2 · Dee +1</td></tr>
<tr><td>Cy's</td><td>"hiccups" (Cy) · draw (Cy) · "screaming" (Dee) · draw (Ana) · "hiccups" (Bo)</td><td>intact (final guess matches the word even though the middle went astray)</td><td>Ana's draw 3</td><td>Cy +2 · Dee +2 · Ana +2 +3 = 5 · Bo +2</td></tr>
<tr><td>Dee's</td><td>"a snail race" (Dee) · draw (Dee) · "snail race" (Ana) · draw (Bo) · "The Snail Race!" (Cy)</td><td>intact ("the" and punctuation ignored)</td><td>Bo's draw 2, Ana's guess 1</td><td>Dee +2 · Ana +2 +1 = 3 · Bo +2 +2 = 4 · Cy +2</td></tr>
</tbody></table>
<p><b>Totals</b>: Ana 4 + 0 + 5 + 3 = <b>12</b> · Bo 2 + 0 + 2 + 4 = <b>8</b> · Cy 3 + 2 + 2 + 2 = <b>9</b> · Dee 2 + 1 + 2 + 2 = <b>7</b>. Ranking: Ana 1, Cy 2, Bo 3, Dee 4. <code>intactBooks = 3</code>.</p>
<p><b>Tie-break</b>: if Bo and Cy had both been on 9, votes received on drawings decide (Bo 4, Cy 1 → Bo ahead); still tied → shared rank.</p>
<h3>Awards</h3>
<table>
<thead><tr><th>id</th><th>Title</th><th>Condition</th><th>In the example</th></tr></thead>
<tbody>
<tr><td><code>picasso</code></td><td>Picasso</td><td>Most votes on drawings (≥ 1)</td><td>Ana (5)</td></tr>
<tr><td><code>wordsmith</code></td><td>Wordsmith</td><td>Most votes on guesses (≥ 1)</td><td>Cy (2)</td></tr>
<tr><td><code>unbroken</code></td><td>Unbroken</td><td>Most intact books contributed to (≥ 2)</td><td>everyone has 3 → lowest id (Ana)</td></tr>
<tr><td><code>chaos-agent</code></td><td>Chaos Agent</td><td>Most guesses that changed the phrase (≥ 2)</td><td>Cy ("sad donut", "The Snail Race!"→ no, that matches; so Cy 1) — Dee ("screaming") 1 — nobody reaches 2 → not awarded</td></tr>
</tbody></table>
<p>Ties on awards → lowest player id. Settings: <code>voting</code> off removes vote points and the Picasso/Wordsmith awards.</p>`,
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
<li>Difficulty 1: a single concrete noun anyone can sketch in 20 s. Difficulty 2: an action or a situation (a verb or a feeling). Difficulty 3: a scene with two ideas that fight each other ("a pirate at the gym") — these are where the chains break.</li>
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
<p>Total: 80 words + 30 lines. A game burns 3 × N words; 60 family words last a 10-player game twice without repeats — the pack should grow to 150+ before release (open question 5).</p>`,
  },
  {
    title: 'Edge cases',
    html: `
<table>
<thead><tr><th>Case</th><th>Behaviour</th></tr></thead>
<tbody>
<tr><td>1–2 players</td><td><code>minPlayers = 3</code>; the engine will not start. Defensive: <code>D = max(1, ⌊N/2⌋)</code> → 1 player gets word → draw → guess all by themselves (works, pointless); 2 players: D = 1, book of 3 pages, the other player guesses.</td></tr>
<tr><td>3 players</td><td>D = 1 (3 pages). Duration ≈ 20 + 60 + 30 + 3 × (26 + 10) ≈ 4 min. The <code>drawings</code> setting is silently capped; the pick screen states "3 pages" so nobody is surprised.</td></tr>
<tr><td>10 players (max)</td><td>Reading ≈ 10 × (6 + 3 × 12 + 3 × 8 + 10) = 12.7 min if nobody presses Next; owners usually go faster. State ≈ 190 KB worst case.</td></tr>
<tr><td>Disconnect in <code>pick</code></td><td>Deadline assigns the medium word. Their book still exists and gets drawn by them on reconnect if they are back before the draw deadline; else an empty first drawing.</td></tr>
<tr><td>Disconnect in <code>draw</code>/<code>guess</code></td><td>Not waited for (<code>allConnectedDone</code>); their page becomes the placeholder at the deadline. Reconnecting before the deadline: the phone still has the local strokes/draft and can send.</td></tr>
<tr><td>Disconnect of the book owner in <code>reveal</code></td><td>Auto-turn timers carry the book; VIP skip ends it early.</td></tr>
<tr><td>Disconnect in <code>vote</code></td><td>Not waited for.</td></tr>
<tr><td>VIP leaves</td><td>Nothing in the game references the VIP.</td></tr>
<tr><td>Everyone idle</td><td>Pick → medium words; every drawing page <code>null</code>, every guess "???"; reading shows empty canvases and ???s; no votes; all books broken; everyone 0, shared rank 1. Duration at defaults, 8 players ≈ 20 + 3×60 + 3×30 + 8×(6+36+24+10) ≈ 15 min &lt; 45.</td></tr>
<tr><td>Empty / whitespace guess or custom word</td><td>Rejected by the schema (<code>trim().min(1)</code>) before <code>reduce</code>.</td></tr>
<tr><td>Duplicate submission</td><td>Second <code>draw</code>/<code>guess</code> in the same step ignored (<code>pages.length !== step</code>).</td></tr>
<tr><td>Drawing too big</td><td>Schema rejects &gt; 3 000 point-chars or &gt; 80 strokes; the client's ink meter makes this unreachable except by a hostile client. Socket payload cap 6 144 B.</td></tr>
<tr><td>Ties everywhere</td><td>Vote ties: every voted page's author gets their +1 (no "winner" of the vote is declared). Final ties: drawing votes, then shared rank.</td></tr>
<tr><td>Late joiners</td><td>Spectate play; may vote (reducer accepts votes from any id not already in <code>votes</code>; the shell only shows the vote list to connected sockets). They are never waited for.</td></tr>
<tr><td>VIP skip mid-phase</td><td><code>pick</code>/<code>draw</code>/<code>guess</code>: close the step with placeholders. <code>reveal</code>: jump to the verdict of the current book. <code>vote</code>: tally now.</td></tr>
<tr><td>Spicy off</td><td>Family pool only. Custom words are unaffected (a setting of their own).</td></tr>
<tr><td>Unspent timers</td><td>All-submitted exits abandon the step timer (stale by <code>startedAt</code>); owner's <code>next</code> abandons the page timer.</td></tr>
<tr><td>Pause</td><td>Timers shift; inputs ignored. Phones keep drawing locally; "Done" waits.</td></tr>
<tr><td>Word equals a later guess by accident</td><td>Only the <em>last</em> page decides intact; intermediate matches are irrelevant (Cy's book in §8).</td></tr>
<tr><td><code>voting = false</code></td><td>No vote phase; reveal → next book. Fixture for <code>vote</code> still exists (contract needs one per id).</td></tr>
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
<tr><td>Page turn (reveal)</td><td>Current page fades + rises 12 px; the previous page shrinks into the filmstrip (transform + opacity only)</td><td>300 ms</td></tr>
<tr><td>Drawing page appears</td><td>Strokes replay in order at ~4× recording speed, capped at 600 ms total; reduced-motion shows the whole drawing at once</td><td>≤ 600 ms</td></tr>
<tr><td>Verdict banner</td><td>Scale 0.95 → 1 + fade</td><td>300 ms</td></tr>
<tr><td>Phone stroke</td><td>Immediate (pointer events → canvas), no animation; the ink bar eases</td><td>150 ms</td></tr>
</tbody></table>
<h3>Sound</h3>
<table>
<thead><tr><th>Moment</th><th>Cue</th><th>Trigger</th></tr></thead>
<tbody>
<tr><td>Phase change</td><td><code>phase</code></td><td>TV shell</td></tr>
<tr><td>Page turn</td><td><code>reveal</code></td><td>Game (needs R-2 game-triggered cues; <code>reveal</code> re-enters the same phase id, so the shell's <code>phase</code> cue does not fire)</td></tr>
<tr><td>Verdict intact / broken</td><td><code>win</code> / <code>error</code></td><td>Game (R-2)</td></tr>
<tr><td>Own submission accepted</td><td><code>submit</code></td><td>Controller shell</td></tr>
<tr><td>Last 5 s of draw/guess</td><td><code>countdown</code></td><td>Shell — desirable here (unlike bingo); reveal pages should use the <b>quiet</b> timer (R-1)</td></tr>
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
<li><b>Colour</b>: verdict is a word plus colour; done/not-done pencil cards use ✓/✎ glyphs; vote selection uses ✓; ink bar has a text warning at 85 %. Drawing colours are the artist's choice — the paper is always light so any ink reads.</li>
<li><b>Screen readers</b>: canvas is <code>role="img"</code> with <code>aria-label="drawing canvas, {n} strokes"</code>; toolbar buttons are labelled ("Colour pink", "Pen size large", "Undo last stroke", "Clear drawing"); the prompt card is <code>aria-live="polite"</code>; vote options describe the page ("Page 4, guess by Dee: hamster king"; "Page 5, drawing by Eli"). A drawing-only game cannot be fully non-visual — the guess and vote phases are; drawing pages fall back to "drawing by X".</li>
<li><b>Touch</b>: colour dots 30 px on 41 px centres (≥ 44 px hit areas via padding); size buttons 40 px + spacing; canvas ignores touches that start on the toolbar; <code>touch-action: none</code> on the canvas so the page never scrolls mid-stroke; palm rejection by ignoring a second simultaneous pointer.</li>
<li><b>Reduced motion</b>: no stroke replay, no page-turn slide, verdict without scale.</li>
<li><b>Time</b>: <code>drawSeconds</code> up to 120 and <code>guessSeconds</code> up to 60; page auto-turn is the floor, the owner can only go faster.</li>
</ul>`,
  },
  {
    title: 'Implementation plan',
    html: `
<h3>Files under <code>games/broken-pencil/</code></h3>
<table>
<thead><tr><th>File</th><th>Contents</th></tr></thead>
<tbody>
<tr><td><code>manifest.json</code></td><td>id <code>broken-pencil</code>, name "Broken Pencil", tagline "Draw it. Guess it. Watch it fall apart.", minPlayers 3, maxPlayers 10, estimatedMinutes 15, tags ["drawing","telephone","co-op","reveal"], <code>maxInputBytes: 6144</code>, settings: <code>drawings</code> (1–4, default 3), <code>drawSeconds</code> (30–120 step 10, default 60), <code>guessSeconds</code> (15–60 step 5, default 30), <code>voting</code> (true), <code>customWords</code> (true), <code>spicy</code> (false).</td></tr>
<tr><td><code>README.md</code>, <code>CLAUDE.md</code></td><td>Spec (§3/§4/§8/§10) and local rules ("pages append only; step index lives in state; never put unrevealed pages in a view").</td></tr>
<tr><td><code>server/types.ts</code></td><td>§6.</td></tr>
<tr><td><code>server/encoding.ts</code></td><td>Pure base64 encode/decode of point arrays (table-based), <code>pointCount(p)</code>, <code>encodeWalk(rng, n)</code> for bots. Shared with the client via a plain relative import (both sides are in the game folder).</td></tr>
<tr><td><code>server/routing.ts</code></td><td><code>bookInHands</code>, <code>authorOfPage</code>, <code>norm</code>.</td></tr>
<tr><td><code>server/phases/pick.ts</code>, <code>step.ts</code> (draw+guess), <code>reveal.ts</code>, <code>vote.ts</code></td><td>§7.</td></tr>
<tr><td><code>server/scoring.ts</code></td><td>tie-break ranking, awards, <code>results</code>.</td></tr>
<tr><td><code>server/content.ts</code>, <code>content/schema.ts</code>, <code>content/words.json</code>, <code>words-spicy.json</code>, <code>lines.json</code></td><td>§9.</td></tr>
<tr><td><code>server/views.ts</code></td><td><code>tvView</code>, <code>controllerView</code> — the only place that decides what is revealed.</td></tr>
<tr><td><code>client/Canvas.tsx</code></td><td>Pointer-event capture, quantisation to 256², Ramer–Douglas–Peucker simplification (ε = 1.5 units) on stroke end, undo stack, ink accounting (<code>INK_CHARS</code>), renders via <code>&lt;canvas&gt;</code> for input and SVG for display.</td></tr>
<tr><td><code>client/DrawingView.tsx</code></td><td>Read-only SVG renderer of a <code>Drawing</code> at any size (TV, phone, thumbnails); optional stroke replay.</td></tr>
<tr><td><code>client/Toolbar.tsx</code>, <code>client/InkBar.tsx</code></td><td>Tools.</td></tr>
<tr><td><code>client/Tv.tsx</code>, <code>client/Controller.tsx</code>, <code>client/index.ts</code></td><td>Phase switches; <code>sounds: { page: 'reveal', intact: 'win', broken: 'error' }</code>.</td></tr>
<tr><td><code>fixtures/pick.json … done.json</code></td><td>Sim dump at 6 players; hand-edit <code>reveal.json</code> to page 5 of a 7-page book with one <code>null</code> drawing, <code>vote.json</code> with 3 votes in.</td></tr>
<tr><td><code>__tests__/routing.test.ts</code></td><td>Every (N, D) in 3…10 × 1…4: every player writes exactly one page per step; nobody touches a book twice; last page is a guess.</td></tr>
<tr><td><code>__tests__/encoding.test.ts</code></td><td>Round-trip; size bound; invalid strings rejected by the schema.</td></tr>
<tr><td><code>__tests__/scoring.test.ts</code></td><td>The §8 example end-to-end (Ana 12 / Cy 9 / Bo 8 / Dee 7; awards).</td></tr>
<tr><td><code>__tests__/phases.test.ts</code></td><td>"pick deadline assigns medium word", "draw all-submitted closes early", "deadline fills placeholders", "owner-only next", "auto-turn", "skip in reveal jumps to verdict", "vote rejects own page and duplicates", "spectator vote accepted", "voting=false skips vote", "VIP end mid-reading keeps tallied scores".</td></tr>
<tr><td><code>__tests__/views.test.ts</code></td><td>No unrevealed page text/drawing in any view; controller prompt is exactly the previous page; reveal TV pages ≤ reading.page.</td></tr>
<tr><td><code>__tests__/contract.config.ts</code></td><td><code>settingsVariants: [{ drawings: 1, voting: false }, { drawings: 4, drawSeconds: 30, guessSeconds: 15, spicy: true, customWords: false }]</code>; <code>hiddenFromTv</code>/<code>hiddenFromController</code> as in §6.</td></tr>
</tbody></table>
<h3>Effort</h3>
<p><b>L</b> — ≈ 900 lines TS + 700 lines TSX. The canvas (input capture, simplification, ink, undo) is the bulk and is the first drawing surface in the repo; budget 3–4 days. Server logic is routine once the routing helper is tested.</p>
<h3>SDK gaps (appended to <code>sdk-requests.md</code>)</h3>
<ol>
<li><b>R-4 — a shared drawing primitive.</b> BL-002 anticipates a drawing game; the canvas + toolbar + ink meter and the SVG renderer belong in <code>@partybox/game-sdk/ui</code> (<code>DrawPad</code>, <code>DrawingView</code>) with the encoding in <code>@partybox/game-sdk</code> so the next drawing game does not copy 500 lines. Build it inside this game first, then lift.</li>
<li><b>R-2 (existing)</b> — game-triggered sound cues for page turns and verdicts.</li>
<li><b>R-1 (existing)</b> — quiet timer for reveal pages (6–12 s deadlines would tick constantly).</li>
<li><b>R-5 — spectator inputs.</b> The contract routes inputs from any socket; the design lets spectators vote. Confirm the server does not drop inputs from non-players before <code>reduce</code> (PROTOCOL.md is silent). If it does, spectator voting becomes an open question, not a rule.</li>
</ol>`,
  },
  {
    title: 'Open questions',
    html: `
<ol>
<li><b>Owner-controlled page turns vs fixed auto-turn only.</b> Recommended: <b>owner + auto-turn floor</b> (as specified). Gartic Phone lets the host drive; Telestrations is whoever holds the book. The owner is the person most invested in the joke.</li>
<li><b>Should the owner draw their own word first?</b> Recommended: <b>yes</b> (Telestrations rule) — it guarantees the last page is a guess for every N and gives the owner skin in the game. Alternative: the first drawing goes to the next seat (Gartic style), which needs L = N and breaks the "ends with a guess" guarantee for odd N.</li>
<li><b>Vote per book (as specified) or one vote at the end?</b> Recommended: <b>per book</b>: 10 s each, keeps phones alive during a long reading and the memory is fresh. A single end vote over 56 pages is unworkable on a phone.</li>
<li><b>Spectators vote?</b> Recommended: <b>yes</b> if R-5 confirms inputs from spectators reach <code>reduce</code>; otherwise drop silently.</li>
<li><b>Word pool size.</b> 60 family words means a repeat-free game twice; recommended target 150 family / 40 spicy before release, same difficulty split.</li>
<li><b>Ink budget.</b> 3 000 chars (~1 125 points after simplification) fits a detailed 60-second doodle in testing on paper; if playtests hit the limit often, raise <code>INK_CHARS</code> to 4 000 and <code>maxInputBytes</code> to 8 192, and lower <code>maxPlayers</code> to 8 to keep state under 256 KB.</li>
<li><b>Stroke replay on reveal.</b> Recommended: <b>on</b> (≤ 600 ms) — it is the cheapest spectacle in the game. Off under reduced motion.</li>
</ol>`,
  },
  {
    title: 'Self-review scorecard',
    html: `
<div class="score">
<span>Fun</span><b class="v">5</b><span>The reading is the best ten minutes of any telephone-drawing game and this design gives it a driver, a verdict and a vote.</span>
<span>Clarity</span><b class="v">4</b><span>The routing rule (§3.3) is the one thing a referee must trust; the test in §13 pins it for every player count.</span>
<span>Implementability</span><b class="v">4</b><span>Reducer is fully specified; the canvas is real client work with no primitive to lean on (R-4).</span>
<span>Novelty</span><b class="v">3</b><span>A known genre by request; owner-driven reading, ink budget, chain verdict and per-book votes are the additions.</span>
<span>TV spectacle</span><b class="v">5</b><span>Filmstrip + big page + verdict banner; stroke replay.</span>
<span>Phone ergonomics</span><b class="v">4</b><span>328 px canvas with a sticky Done; toolbar targets ≥ 44 px; the risk is accidental scrolls, handled by <code>touch-action: none</code>.</span>
<span>Content longevity</span><b class="v">3</b><span>Custom words make it infinite in practice; the shipped pool needs to grow (§14.5).</span>
<span>Pacing</span><b class="v">4</b><span>≈13 min at 8; the reading scales linearly with players, which is why max is 10.</span>
<span>Edge-case coverage</span><b class="v">5</b><span>Placeholders make every missing page harmless; every phase has a floor timer.</span>
</div>`,
  },
  {
    title: 'Prior art & references',
    html: `
<table>
<thead><tr><th>Reference</th><th>What it does</th><th>Taken / rejected</th></tr></thead>
<tbody>
<tr><td><b>Telestrations</b> (board game)</td><td>4–8 players; everyone draws their own word first, then books pass: guess, sketch, guess… until the book returns. "Friendly" scoring: each owner awards a point to their favourite sketch and favourite guess, +1 to themselves if the last guess matches. "Competitive": guessers score for matching the previous text, sketchers when their sketch is guessed.</td><td><b>Taken</b>: owner draws first; books end with a guess; the "friendly" spirit (points for being funny, not right) — generalised to an all-player vote; the last-guess-matches bonus (ours pays the whole book, co-op). <b>Rejected</b>: competitive scoring — it punishes the twists that make the game.</td></tr>
<tr><td><b>Gartic Phone</b> (browser)</td><td>Write → draw → guess chains; presets and custom settings: turn counts (few / most / all / …), time presets (fast / normal / slow / regressive / progressive / dynamic / infinite / host's decision), task flows (writing-only ends, drawing-only, …); the clock advances when the majority is done; album presented at the end by the host; Secret mode hides the album until the end; Score mode for competitive play.</td><td><b>Taken</b>: all-submitted early exit; a small settings surface (drawings, two timers, voting); the album as the show. <b>Rejected</b>: host-driven album (ours: the book's owner), majority-done clock (contract exits on all-connected, which is equivalent when the stragglers are disconnected), the dozen task flows.</td></tr>
<tr><td><b>Drawful</b> (Jackbox)</td><td>Phone drawing with one colour and two sizes; other players write fake titles; voting on titles.</td><td><b>Taken</b>: nothing mechanical, but its 2-colour palette proves that constraints, not tools, make phone drawings funny — hence 8 colours, 3 sizes, no fill, an ink budget.</td></tr>
<tr><td><b>Netflix Pictionary: Game Night</b> (TV + phones, 2025)</td><td>Team pictionary drawn on phones, shown on the TV.</td><td>Confirms 10-foot readability of phone doodles at ~500 px on a 1080p stage; our drawing is 560 px.</td></tr>
</tbody></table>
<h3>Links</h3>
<ul>
<li>Telestrations rules and scoring — <a href="https://www.geekyhobbies.com/telestrations-rules/">Geeky Hobbies</a>, <a href="https://www.ultraboardgames.com/telestrations/game-rules.php">UltraBoardGames</a></li>
<li>Gartic Phone custom settings (turns, time presets, task flows) — <a href="https://gartic-phone.fandom.com/wiki/Lobby_and_custom_settings">Gartic Phone Wiki</a>, <a href="https://medium.com/gartic/unlocking-gartic-phone-how-to-fully-customize-your-gartic-phone-match-3c3d67f418de">"Unlocking Gartic Phone" (Medium)</a>, <a href="https://medium.com/gartic/the-ultimate-gartic-phone-guide-all-modes-explained-805404f94948">all modes explained</a></li>
<li>Gartic Phone overview (modes, duration) — <a href="https://www.fortressofsolitude.co.za/gartic-phone-what-is-it-how-do-you-play/">Fortress of Solitude</a></li>
<li>Netflix TV party games review (Pictionary: Game Night) — <a href="https://www.thenationalnews.com/arts-culture/pop-culture/2025/11/14/review-can-netflixs-new-tv-party-games-compete-with-jackbox/">The National</a></li>
<li>Ramer–Douglas–Peucker simplification (client canvas) — <a href="https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm">Wikipedia</a></li>
</ul>`,
  },
];

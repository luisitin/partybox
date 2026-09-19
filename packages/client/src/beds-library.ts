// The music-bed library (ADR-032): every bed is a tempo, a level and a bar function that schedules
// one bar of notes on a Web Audio context; `beds.ts` owns the engine that plays them. Owner's picks
// 2026-09-17 from the Blanks review page: warm (relaxed picking / result), latenight (under the
// read-out), marimba (judging), bossa (picking). Levels sit low on purpose: the owner asked for true
// background ("lower its decibels", 2026-09-17) — roughly half the review-page sketches.
import { MORE_BEDS } from './beds-library-more';
import { hat, hz, kick, snare, voice } from './beds-voices';
import type { Bed } from './beds-voices';

export type { Bed } from './beds-voices';

export const BED_IDS = [
  'warm',
  'bossa',
  'latenight',
  'marimba',
  'lofi',
  'lounge',
  'pulse',
] as const;
export type BedId = (typeof BED_IDS)[number];

export const BEDS: Record<BedId, Bed> = {
  ...MORE_BEDS,
  // Electric-piano chords (Cmaj7 · Am7 · Fmaj7 · G7), a round bass on 1 and 3, brushed hats.
  warm: {
    bpm: 92,
    level: 0.12,
    bar(ctx, out, t, i) {
      const beat = 60 / 92;
      const chords = [
        [60, 64, 67, 71],
        [57, 60, 64, 67],
        [53, 57, 60, 64],
        [55, 59, 62, 65],
      ];
      const roots = [48, 45, 41, 43];
      const c = chords[i % 4] as number[];
      const r = roots[i % 4] as number;
      c.forEach((m, k) =>
        voice(ctx, out, {
          f: hz(m),
          at: t + 0.02 * k,
          d: beat * 1.8,
          t: 'triangle',
          g: 0.05,
          a: 0.03,
        }),
      );
      c.forEach((m, k) =>
        voice(ctx, out, {
          f: hz(m),
          at: t + beat * 2.5 + 0.02 * k,
          d: beat * 1.2,
          t: 'triangle',
          g: 0.035,
          a: 0.03,
        }),
      );
      for (const b of [0, 2])
        voice(ctx, out, { f: hz(r), at: t + beat * b, d: beat * 0.9, g: 0.11, a: 0.02 });
      voice(ctx, out, { f: hz(r + 7), at: t + beat * 3.5, d: beat * 0.4, g: 0.07 });
      for (let e = 0; e < 8; e += 1) hat(ctx, out, t + (beat * e) / 2, e % 2 ? 0.02 : 0.035);
    },
  },
  // Nylon-string plucks in a bossa pattern (Dmaj7 · Bm7 · Em7 · A7), walking bass, off-beat shaker.
  bossa: {
    bpm: 100,
    level: 0.11,
    bar(ctx, out, t, i) {
      const beat = 60 / 100;
      const chords = [
        [62, 66, 69, 73],
        [59, 62, 66, 69],
        [64, 67, 71, 74],
        [57, 61, 64, 67],
      ];
      const roots = [50, 47, 52, 45];
      const c = chords[i % 4] as number[];
      const r = roots[i % 4] as number;
      [0, 0.75, 1.5, 2.5, 3.25].forEach((s, n) =>
        c.forEach((m, k) =>
          voice(ctx, out, {
            f: hz(m),
            at: t + beat * s + k * 0.015,
            d: 0.35,
            t: 'triangle',
            g: n % 2 ? 0.022 : 0.032,
            a: 0.004,
          }),
        ),
      );
      [0, 1.5, 2, 3.5].forEach((s, n) =>
        voice(ctx, out, {
          f: hz(n % 2 ? r + 7 : r),
          at: t + beat * s,
          d: beat * 0.7,
          g: 0.09,
          a: 0.015,
        }),
      );
      for (let e = 1; e < 8; e += 2) hat(ctx, out, t + (beat * e) / 2, 0.018);
    },
  },
  // Held Rhodes-like chords that swell in (Fmaj7 · Em7 · Dm7 · Cmaj7), one bass note a bar, no drums.
  latenight: {
    bpm: 70,
    level: 0.1,
    bar(ctx, out, t, i) {
      const beat = 60 / 70;
      const chords = [
        [65, 69, 72, 76],
        [64, 67, 71, 74],
        [62, 65, 69, 72],
        [60, 64, 67, 71],
      ];
      const roots = [41, 40, 38, 36];
      const c = chords[i % 4] as number[];
      for (const m of c) {
        voice(ctx, out, { f: hz(m), at: t, d: beat * 4, t: 'triangle', g: 0.035, a: 0.5 });
        voice(ctx, out, { f: hz(m), at: t, d: beat * 4, g: 0.03, a: 0.5, detune: 6 });
      }
      voice(ctx, out, { f: hz(roots[i % 4] as number), at: t, d: beat * 3.5, g: 0.09, a: 0.05 });
      if (i % 2)
        voice(ctx, out, {
          f: hz((c[2] as number) + 12),
          at: t + beat * 3,
          d: 0.8,
          g: 0.03,
          a: 0.02,
        });
    },
  },
  // Lo-fi hip hop (owner asked for more variety per stage, review-loop #161): a dusty swung beat
  // at 78 — soft kick, brushed snare, hats behind the beat, muted Rhodes over Am9 · Dm9 · Gmaj9 ·
  // Cmaj7. The "study beats" feel, for the judge's pick.
  lofi: {
    bpm: 78,
    level: 0.12,
    bar(ctx, out, t, i) {
      const beat = 60 / 78;
      const swing = (beat / 4) * 0.33;
      const chords = [
        [57, 60, 64, 67, 71],
        [50, 53, 57, 60, 64],
        [55, 59, 62, 66, 69],
        [48, 52, 55, 59],
      ];
      const roots = [45, 38, 43, 36];
      const c = chords[i % 4] as number[];
      const r = roots[i % 4] as number;
      c.forEach((m, k) =>
        voice(ctx, out, {
          f: hz(m),
          at: t + 0.03 * k,
          d: beat * 2.2,
          t: 'triangle',
          g: 0.035,
          a: 0.06,
        }),
      );
      c.forEach((m, k) =>
        voice(ctx, out, {
          f: hz(m),
          at: t + beat * 2 + swing + 0.03 * k,
          d: beat * 1.6,
          t: 'triangle',
          g: 0.026,
          a: 0.06,
        }),
      );
      voice(ctx, out, { f: hz(r), at: t, d: beat * 1.5, g: 0.095, a: 0.02 });
      voice(ctx, out, { f: hz(r), at: t + beat * 2.5, d: beat, g: 0.075, a: 0.02 });
      kick(ctx, out, t, 0.2);
      kick(ctx, out, t + beat * 2.5, 0.15);
      snare(ctx, out, t + beat, 0.045);
      snare(ctx, out, t + beat * 3, 0.045);
      for (let e = 0; e < 8; e += 1)
        hat(ctx, out, t + (beat * e) / 2 + (e % 2 ? swing : 0), e % 2 ? 0.013 : 0.022);
    },
  },
  // A lazy swing lounge at 84: vibraphone chords with a slow tremolo (Fmaj7 · B♭maj7 · Gm7 · C7),
  // a walking upright bass, a brushed ride — cocktail hour, for the result.
  lounge: {
    bpm: 84,
    level: 0.12,
    bar(ctx, out, t, i) {
      const beat = 60 / 84;
      const swing = beat / 3;
      const chords = [
        [65, 69, 72, 76],
        [58, 62, 65, 69],
        [55, 58, 62, 65],
        [60, 64, 67, 70],
      ];
      const walks = [
        [41, 43, 45, 47],
        [46, 45, 43, 41],
        [43, 46, 48, 50],
        [48, 47, 46, 43],
      ];
      const c = chords[i % 4] as number[];
      const walk = walks[i % 4] as number[];
      for (const [n, b] of [0, 2].entries())
        c.forEach((m, k) => {
          voice(ctx, out, {
            f: hz(m),
            at: t + beat * b + 0.02 * k,
            d: beat * 1.9,
            g: n ? 0.026 : 0.04,
            a: 0.01,
          });
          voice(ctx, out, {
            f: hz(m),
            at: t + beat * b + 0.02 * k + 0.09,
            d: beat * 1.7,
            g: n ? 0.011 : 0.018,
            a: 0.01,
            detune: 4,
          });
        });
      walk.forEach((m, n) =>
        voice(ctx, out, {
          f: hz(m),
          at: t + beat * n,
          d: beat * 0.8,
          t: 'triangle',
          g: 0.09,
          a: 0.015,
        }),
      );
      for (let e = 0; e < 4; e += 1) {
        hat(ctx, out, t + beat * e, 0.018);
        hat(ctx, out, t + beat * e + swing * 2, 0.011);
      }
    },
  },
  // A rolling 16th-note marimba figure over Dm · B♭ · F · C with a light shaker.
  marimba: {
    bpm: 112,
    level: 0.12,
    bar(ctx, out, t, i) {
      const beat = 60 / 112;
      const sets = [
        [62, 65, 69, 74],
        [58, 62, 65, 70],
        [65, 69, 72, 77],
        [60, 64, 67, 72],
      ];
      const s = sets[i % 4] as number[];
      const order = [0, 1, 2, 3, 2, 1];
      for (let n = 0; n < 16; n += 1)
        voice(ctx, out, {
          f: hz(s[order[n % 6] as number] as number),
          at: t + (beat * n) / 4,
          d: 0.18,
          t: 'triangle',
          g: n % 4 === 0 ? 0.05 : 0.03,
          a: 0.003,
        });
      for (let e = 0; e < 8; e += 1) hat(ctx, out, t + (beat * e) / 2, 0.015);
      voice(ctx, out, { f: hz((s[0] as number) - 24), at: t, d: beat * 2, g: 0.08 });
    },
  },
};

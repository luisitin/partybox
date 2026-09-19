// More music beds (ADR-032), split from beds-library.ts for the 300-line cap. `pulse` was written
// for Lightning Round (owner request 2026-09-18: music under the fast games too): a quiz-show
// tension bed at 120 — an eighth-note bass pulse over Am · F · C · G, a clock tick on every beat,
// a soft kick, hats on the eighths, a thin held fifth above. Steady, never busy: the phones' own
// countdown ticks and the TV's lock ticks must read over it.
import { hat, hz, kick, voice } from './beds-voices';
import type { Bed } from './beds-voices';

export const MORE_BEDS = {
  pulse: {
    bpm: 120,
    level: 0.1,
    bar(ctx, out, t, i) {
      const beat = 60 / 120;
      const roots = [33, 29, 36, 31];
      const r = roots[i % 4] as number;
      // The bass pulse: eight eighth notes, the root with its octave on the off-beats.
      for (let e = 0; e < 8; e += 1)
        voice(ctx, out, {
          f: hz(e % 2 ? r + 12 : r),
          at: t + (beat * e) / 2,
          d: beat * 0.42,
          t: 'triangle',
          g: e % 2 ? 0.05 : 0.09,
          a: 0.008,
        });
      // A thin held fifth above the root, swelling in over the bar.
      for (const m of [r + 24, r + 31])
        voice(ctx, out, { f: hz(m), at: t, d: beat * 4, g: 0.022, a: 0.6, detune: 5 });
      // The clock: a short high tick on every beat, brighter on the one.
      for (let b = 0; b < 4; b += 1)
        voice(ctx, out, {
          f: hz(b === 0 ? 93 : 88),
          at: t + beat * b,
          d: 0.06,
          t: 'square',
          g: b === 0 ? 0.02 : 0.012,
          a: 0.002,
        });
      for (let b = 0; b < 4; b += 1) kick(ctx, out, t + beat * b, b % 2 ? 0.1 : 0.16);
      for (let e = 0; e < 8; e += 1) hat(ctx, out, t + (beat * e) / 2, e % 2 ? 0.012 : 0.02);
    },
  },
} satisfies Record<string, Bed>;

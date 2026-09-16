// The bot every harness uses — and a seat-filler in the lobby (`supportsBots`). It cannot see, so
// it draws a wobbly doodle and guesses a noun from its vocabulary; its pages break chains, which
// is fine for a test run and honest about what a bot is. It only reads what its phone would show.
import { hasPlayer } from '@partybox/game-sdk';
import type { Rng } from '@partybox/game-sdk';
import { submittedThisStep } from './books';
import { LINES } from './content';
import { COLORS, WIDTHS, encodePoints } from './encoding';
import { hasPicked } from './phases/pick';
import type { Input, State, Stroke } from './types';

const CUSTOM_WORDS = ['a confused robot', 'my left shoe', 'a very tired cat', 'soup', 'the moon'];

/** A random walk of `n` points that starts somewhere on the canvas and wanders. */
function walk(rng: Rng, n: number): string {
  const points: number[] = [];
  let x = rng.int(30, 225);
  let y = rng.int(30, 225);
  let dx = rng.int(-8, 8);
  let dy = rng.int(-8, 8);
  for (let i = 0; i < n; i++) {
    points.push(x, y);
    dx = Math.max(-12, Math.min(12, dx + rng.int(-4, 4)));
    dy = Math.max(-12, Math.min(12, dy + rng.int(-4, 4)));
    x = Math.max(4, Math.min(251, x + dx));
    y = Math.max(4, Math.min(251, y + dy));
  }
  return encodePoints(points);
}

export function sampleInput(state: State, playerId: string, rng: Rng): Input | null {
  if (!hasPlayer(state, playerId)) return null;
  switch (state.phase.id) {
    case 'pick':
      if (hasPicked(state, playerId)) return null;
      if (state.settings.customWords && rng.chance(0.2))
        return { type: 'pickCustom', text: rng.pick(CUSTOM_WORDS) };
      return { type: 'pick', option: rng.int(0, 2) };
    case 'draw': {
      if (submittedThisStep(state, playerId)) return null;
      const strokes: Stroke[] = [];
      const n = rng.int(2, 7);
      for (let i = 0; i < n; i++)
        strokes.push({
          c: rng.int(0, COLORS - 1),
          w: rng.int(0, WIDTHS - 1),
          p: walk(rng, rng.int(6, 40)),
        });
      return { type: 'draw', strokes };
    }
    case 'guess':
      if (submittedThisStep(state, playerId)) return null;
      return { type: 'guess', text: rng.pick(LINES.botGuesses) };
    default:
      return null;
  }
}

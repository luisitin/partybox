// The bot every harness uses — and a seat-filler in the lobby (`supportsBots`). It cannot see a
// drawing, so it guesses a noun from its vocabulary; but it can read the phrase it was handed, so
// it draws that — a recognisable line drawing from shapes.ts (a cat, a house, a robot…), jittered
// like a hand would. It only reads what its phone would show.
import { hasPlayer } from '@partybox/game-sdk';
import type { Rng } from '@partybox/game-sdk';
import { bookInHands, owedNow } from './books';
import { LINES } from './content';
import { COLORS, WIDTHS, encodePoints } from './encoding';
import { jitter, shapeFor } from './shapes';
import { hasPicked } from './phases/pick';
import { presenterOf } from './phases/show';
import type { Input, State, Stroke } from './types';

const CUSTOM_WORDS = ['a confused robot', 'my left shoe', 'a very tired cat', 'soup', 'the moon'];

export function sampleInput(state: State, playerId: string, rng: Rng): Input | null {
  if (!hasPlayer(state, playerId)) return null;
  switch (state.phase.id) {
    case 'pick':
      if (hasPicked(state, playerId)) return null;
      if (state.settings.customWords && rng.chance(0.2))
        return { type: 'pickCustom', text: rng.pick(CUSTOM_WORDS) };
      return { type: 'pick', option: rng.int(0, 2) };
    case 'draw':
    case 'pass':
    case 'guess': {
      // Whatever the step asks for next: a guess, then (in a pass) a drawing of it.
      const owed = owedNow(state, playerId);
      if (owed === 'guess') return { type: 'guess', text: rng.pick(LINES.botGuesses) };
      if (owed !== 'draw') return null;
      // The page before the one being drawn holds the phrase: the word, or the last guess.
      const book = state.books[bookInHands(state, playerId)];
      const prev = book?.pages[book.pages.length - 1];
      const phrase = prev && prev.kind !== 'draw' ? (prev.text ?? '') : '';
      const colour = rng.int(0, COLORS - 1);
      const width = rng.int(0, WIDTHS - 1);
      const strokes: Stroke[] = jitter(shapeFor(phrase), rng).map((points) => ({
        c: colour,
        w: width,
        p: encodePoints(points),
      }));
      return { type: 'draw', strokes };
    }
    case 'show':
      // A real bot's book turns itself (BOT_SHOW_MS): nothing to send. A human driven through the
      // dev API's act (the harnesses) turns the page.
      if (state.players[playerId]?.bot === true) return null;
      return presenterOf(state) === playerId ? { type: 'turn' } : null;
    default:
      return null;
  }
}

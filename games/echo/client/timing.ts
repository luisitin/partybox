import { GUESS_BEATS } from '../shared/rules';

// Echo's client beats (ms from the phase's start). One place, so the TV's cards, the reader and the
// phones' holds line up. Every beat stays inside the server's phase length (types.ts RESULT_MS).

/** `guess`: the table deals face down, the echoes go blank ("Echo!"), then the survivors turn over
 *  one by one while the reader says them. */
export const GUESS = GUESS_BEATS;

/** `result`: the word lands with "The word was …", then the guess and its mark, then the echoes
 *  turn over with their authors, then the word's card flies to its pile (and a burn follows). */
export const RESULT = {
  word: 0,
  mark: 1500,
  authors: 2400,
  pile: 3300,
  burn: 4300,
} as const;

/** The phone's own line waits until the TV has shown the mark (never spoil the TV). */
export const PHONE_LINE_AFTER = RESULT.mark + 600;

/** A reading that turns up later than this after its moment is dropped, not read out of sync. */
export const LATE_READING_MS = 1500;

/** The gap between two lines read back to back. */
export const READING_GAP = 220;

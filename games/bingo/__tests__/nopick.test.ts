// I-400 A: nobody picking after a bingo moves the room on in 20 s (after the read), not 5 minutes.
import { describe, expect, it } from 'vitest';
import { NO_PICK_MS } from '../server/types';

describe('I-400: the winner screen is paced', () => {
  it('waits 20 s for a pick', () => {
    expect(NO_PICK_MS).toBe(20_000);
  });
});

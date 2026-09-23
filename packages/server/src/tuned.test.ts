import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createTunedBook } from './tuned';

describe('I-763 C: the tuned settings book', () => {
  it('writes what is tuned and reads it back on the next start', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'tuned-'));
    const book = createTunedBook(dir);
    expect(book.get()).toEqual({});
    book.save({ bingo: { cards: 4, callSeconds: 3 } });
    // the write is queued: wait for it (up to 2 s) rather than a fixed 50 ms
    for (let i = 0; i < 40 && !existsSync(join(dir, 'tuned-settings.json')); i++)
      await new Promise((r) => setTimeout(r, 50));
    await new Promise((r) => setTimeout(r, 50));
    expect(JSON.parse(readFileSync(join(dir, 'tuned-settings.json'), 'utf8'))).toEqual({
      bingo: { cards: 4, callSeconds: 3 },
    });
    expect(createTunedBook(dir).get()).toEqual({ bingo: { cards: 4, callSeconds: 3 } });
  });

  it('without a folder it keeps them in memory only', () => {
    const book = createTunedBook(null);
    book.save({ blanks: { rounds: 8 } });
    expect(book.get()).toEqual({ blanks: { rounds: 8 } });
  });
});

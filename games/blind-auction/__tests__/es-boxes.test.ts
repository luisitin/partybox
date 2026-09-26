// Decision [196a9e] rule 2: every box name (the game's own short labels) has Spanish in the pack.
import { describe, expect, it } from 'vitest';
import grand from '../content/grand.json';
import lots from '../content/lots.json';
import spicy from '../content/spicy.json';
import { ES_BOXES } from '../server/box-names-es';

describe('Spanish box names', () => {
  it('every box in every pack has a Spanish name', () => {
    const es = ES_BOXES;
    const missing = [...lots, ...grand, ...spicy]
      .map((b) => b.name)
      .filter((n) => !Object.hasOwn(es, n));
    expect(missing).toEqual([]);
  });
});

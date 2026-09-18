// The intro's pattern demo (loop 243) is a pure schedule: pins which cells are lit when.
import { describe, expect, it } from 'vitest';
import { demoShapes, litAt } from '../client/PatternDemo';
import { patternCells } from '../server/patterns';

describe('the pattern demo schedule', () => {
  it('"any line" plays a row, a column and a diagonal in turn, one cell every 140 ms, then holds', () => {
    const shapes = demoShapes('line', patternCells('line'));
    expect(shapes.map((s) => s.cells)).toEqual([
      [10, 11, 12, 13, 14],
      [2, 7, 12, 17, 22],
      [0, 6, 12, 18, 24],
    ]);
    expect([...litAt(shapes, 0)]).toEqual([10]);
    expect([...litAt(shapes, 300)]).toEqual([10, 11, 12]);
    expect([...litAt(shapes, 700)]).toEqual([10, 11, 12, 13, 14]); // full, holding
    expect(litAt(shapes, 1500).size).toBe(5); // still holding (700 + 900)
    expect(litAt(shapes, 1700).size).toBe(0); // the gap before the column
    const col = shapes[1]?.at ?? 0;
    expect([...litAt(shapes, col + 150)]).toEqual([2, 7]);
  });

  it('a fixed pattern (corners) lights its own cells once and holds', () => {
    const cells = patternCells('corners');
    const shapes = demoShapes('corners', cells);
    expect(shapes).toHaveLength(1);
    expect([...litAt(shapes, 5 * 140)]).toEqual(cells);
  });
});

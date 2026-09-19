// The kind reads the loop has verified by hand, pinned: every prompt that reads as a doing, a person
// or a name, a spread of tricky things, every card that reads as a person or an event and a spread
// of doings and things (kinds.golden.json). A rule change that moves one of these fails here on
// purpose — read the diff, and when the new read is the better one, regenerate the entry.
import { describe, expect, it } from 'vitest';
import { servesOf, slotOf } from '../server/fit';
import golden from './kinds.golden.json';

const prompts = golden.prompts as Record<string, string[]>;
const cards = golden.cards as Record<string, string[]>;

describe('kind reads pinned by the fit loop', () => {
  it('every pinned prompt still reads the same', () => {
    const moved = Object.entries(prompts)
      .map(([text, kinds]) => ({ text, was: kinds.join('+'), now: slotOf({ text }) }))
      .filter((p) => p.was !== p.now);
    expect(moved, moved.map((p) => `${p.text}: ${p.was} → ${p.now}`).join('\n')).toEqual([]);
  });

  it('every pinned white card still reads the same', () => {
    const moved = Object.entries(cards)
      .map(([text, kinds]) => ({ text, was: kinds.join('+'), now: servesOf({ text }).join('+') }))
      .filter((c) => c.was !== c.now);
    expect(moved, moved.map((c) => `${c.text}: ${c.was} → ${c.now}`).join('\n')).toEqual([]);
  });

  it('pins enough to matter', () => {
    expect(Object.keys(prompts).length).toBeGreaterThan(600);
    expect(Object.keys(cards).length).toBeGreaterThan(900);
  });
});

// SPEC §10.18 / §10.20 "Flavours": both are complete in English and Spanish; the bot lines fit the
// board (80 characters with the longest name) and either flavour; the state stays in budget.
import { describe, expect, it } from 'vitest';
import { BOTLINES, FLAVOUR_PACK, botLine } from '../server/content';
import { STRINGS } from '../client/strings';
import { FLAVOURS } from '../content/schema';
import { playRandom } from './helpers';

const LONG_NAME = 'Maximilianoooooo'; // 16 characters, the join limit

function englishOf(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(englishOf);
  return [];
}

describe('content', () => {
  it('bot banks hold the promised counts', () => {
    expect(BOTLINES.accusations.length).toBeGreaterThanOrEqual(40);
    expect(BOTLINES.defences.length).toBeGreaterThanOrEqual(20);
    expect(BOTLINES.seerClaims.length).toBeGreaterThanOrEqual(10);
    expect(BOTLINES.lastWords.length).toBeGreaterThanOrEqual(10);
  });

  it('every bot line fits 80 characters in both flavours with the longest name', () => {
    const all = Object.values(BOTLINES).flat();
    const ids = new Set(all.map((l) => l.id));
    expect(ids.size).toBe(all.length);
    for (const flavour of FLAVOURS)
      for (const line of all) {
        const text = botLine(line.text, flavour, LONG_NAME);
        expect(text.length, `${line.id} (${flavour}): ${text}`).toBeLessThanOrEqual(80);
        expect(text, line.id).not.toMatch(/\{\w+\}/);
      }
  });

  it('flavour tokens read naturally', () => {
    expect(botLine("I'm the {seer}. {name} is {aWolf}!", 'village', 'Ben')).toBe(
      "I'm the seer. Ben is a wolf!",
    );
    expect(botLine("I'm the {seer}. {name} is {aWolf}!", 'mafia', 'Ben')).toBe(
      "I'm the detective. Ben is in the mafia!",
    );
    expect(botLine('{seer} here. Vote {name}.', 'mafia', 'Ben')).toBe('Detective here. Vote Ben.');
  });

  it('both flavours are complete in English and Spanish', () => {
    const es = STRINGS.es ?? {};
    for (const flavour of FLAVOURS) {
      for (const text of englishOf(FLAVOUR_PACK[flavour])) {
        if (/^\p{Extended_Pictographic}/u.test(text)) continue; // icons stay as they are
        expect(es[text], `${flavour}: "${text}" has no Spanish`).toBeTruthy();
      }
    }
  });

  it('16 players with the board on: the state stays under 40 KB (fails above 80 KB)', () => {
    let max = 0;
    for (const seed of [1, 2, 3])
      for (const s of playRandom(16, seed, { townBoard: 'on', roles: 'seer,doctor,hunter,jester' }))
        max = Math.max(max, JSON.stringify(s).length);
    console.log(`nightfall: max state at 16 players = ${max} bytes`);
    expect(max).toBeLessThan(80 * 1024);
  });
});

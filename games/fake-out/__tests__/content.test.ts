// The pack test (SPEC §3.15, §3.17 "Pack"; Part 00 §4.9): every played fact is sourced and
// checked, has 6+ distinct accepted forms that all match exactly, and 8 house lies that pass the
// §3.7 checks, are distinct from each other, and never fit the truth.
import { describe, expect, it } from 'vitest';
import { BLANK, CATEGORIES, LIE_MAX_CHARS } from '../content/schema';
import type { FactItem } from '../content/schema';
import { FAMILY, FILLERS, SPICY } from '../server/content';
import { checkLie } from '../server/lies';
import { matchAnswer, normalize, sameAnswer } from '@partybox/game-sdk/match';
import unverifiedJson from '../content/unverified.json' with { type: 'json' };

const PLAYED: readonly FactItem[] = [...FAMILY.facts, ...SPICY.facts];

function problems(f: FactItem): string[] {
  const out: string[] = [];
  if (!f.verified) out.push('not verified');
  if (f.source.trim().length < 3) out.push('no source');
  if (f.fact.split(BLANK).length !== 2) out.push('needs exactly one blank');
  const forms = [f.truth.answer, ...f.truth.accept];
  const compacts = new Set(forms.map((a) => normalize(a, 'en').compact));
  if (compacts.size - 1 < 6) out.push(`only ${compacts.size - 1} distinct accepted forms`);
  for (const a of f.truth.accept)
    if (matchAnswer(a, f.truth, 'en') !== 'exact') out.push(`accept "${a}" is not exact`);
  if (f.truth.answer.length > LIE_MAX_CHARS) out.push('truth too long to be an option');
  f.houseLies.forEach((lie, i) => {
    const why = checkLie(lie, f);
    if (why) out.push(`house lie "${lie}" fails: ${why}`);
    f.houseLies.slice(i + 1).forEach((other) => {
      if (sameAnswer(lie, other, 'en')) out.push(`house lies "${lie}" and "${other}" merge`);
    });
  });
  return out;
}

describe('fact packs', () => {
  it('meet the pack sizes', () => {
    expect(FAMILY.facts.length).toBeGreaterThanOrEqual(150);
    expect(SPICY.facts.length).toBeGreaterThanOrEqual(60);
  });

  it('every played fact passes the §3.7 and §4.9 checks', () => {
    const bad = PLAYED.map((f) => ({ id: f.id, issues: problems(f) })).filter(
      (x) => x.issues.length > 0,
    );
    expect(bad).toEqual([]);
  });

  it('ids are unique across both packs, and spicy ids never sit in the family pack', () => {
    const ids = PLAYED.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(FAMILY.facts.every((f) => f.id.startsWith('fo-'))).toBe(true);
    expect(SPICY.facts.every((f) => f.id.startsWith('fs-'))).toBe(true);
  });

  it('no two facts share a truth and a topic word (duplicates across packs)', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const f of PLAYED) {
      const words = normalize(f.fact.replace(BLANK, ''), 'en')
        .norm.split(' ')
        .filter((w) => w.length >= 6)
        .sort()
        .slice(0, 3)
        .join(' ');
      const key = `${normalize(f.truth.answer, 'en').compact}|${words}`;
      const other = seen.get(key);
      if (other) dupes.push(`${other} ~ ${f.id}`);
      seen.set(key, f.id);
    }
    expect(dupes).toEqual([]);
  });

  it('every category has family facts, except the spicy-only ones', () => {
    for (const c of CATEGORIES) {
      const n = FAMILY.facts.filter((f) => f.category === c).length;
      if (c === 'drinking' || c === 'dating') expect(n).toBe(0);
      else expect(n, c).toBeGreaterThanOrEqual(10);
    }
  });

  it('the unverified pack is never played', () => {
    const ids = new Set(PLAYED.map((f) => f.id));
    for (const f of unverifiedJson.facts as { id: string }[]) expect(ids.has(f.id)).toBe(false);
  });
});

describe('fillers', () => {
  it('have 20+ distinct fakes per kind and per category', () => {
    for (const list of [...Object.values(FILLERS.byKind), ...Object.values(FILLERS.byCategory)]) {
      expect(list.length).toBeGreaterThanOrEqual(20);
      expect(new Set(list.map((x) => normalize(x, 'en').compact)).size).toBe(list.length);
    }
    expect(Object.keys(FILLERS.byCategory).sort()).toEqual([...CATEGORIES].sort());
  });
});

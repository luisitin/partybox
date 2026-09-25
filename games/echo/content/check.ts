// Pack checks shared by the pack test and the content writers' CLI (`pnpm exec tsx
// games/echo/content/check.ts <file.json>…`). Returns human-readable problems; empty = clean.
import { isLegalClue, matchAnswer, normalize, sameAnswer } from '../server/match/index';
import { wordItemSchema } from './schema';
import type { WordItem } from './schema';

export const CLUE_OPTS = { oneWord: true, maxChars: 20 } as const;

export function checkItem(raw: unknown): { problems: string[]; warnings: string[] } {
  const problems: string[] = [];
  const warnings: string[] = [];
  const parsed = wordItemSchema.safeParse(raw);
  const tag = (raw as { id?: string })?.id ?? '?';
  if (!parsed.success) {
    problems.push(
      `${tag}: schema — ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`,
    );
    return { problems, warnings };
  }
  const it: WordItem = parsed.data;
  const seen = new Map<string, string>();
  for (const e of [it.answer, ...it.accept, ...it.reject]) {
    const c = normalize(e, 'en').compact;
    const prev = seen.get(c);
    if (prev !== undefined)
      problems.push(`${it.id}: "${e}" duplicates "${prev}" after normalizing`);
    else seen.set(c, e);
  }
  for (const a of it.accept)
    if (matchAnswer(a, it, 'en') !== 'exact')
      problems.push(`${it.id}: accept "${a}" is not exact (a reject blocks it?)`);
  if (it.accept.length < 6) warnings.push(`${it.id}: only ${it.accept.length} accepts`);
  for (const r of it.reject)
    if (matchAnswer(r, it, 'en') !== 'none') problems.push(`${it.id}: reject "${r}" still matches`);
  it.clues.forEach((c, i) => {
    const res = isLegalClue(c, it, 'en', CLUE_OPTS);
    if (!res.ok) problems.push(`${it.id}: clue "${c}" illegal (${res.reason})`);
    for (let j = 0; j < i; j++)
      if (sameAnswer(c, it.clues[j] as string, 'en'))
        problems.push(`${it.id}: clues "${it.clues[j]}" and "${c}" would echo each other`);
  });
  return { problems, warnings };
}

export function checkPack(items: readonly unknown[]): { problems: string[]; warnings: string[] } {
  const problems: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  const answers = new Map<string, string>();
  for (const raw of items) {
    const r = checkItem(raw);
    problems.push(...r.problems);
    warnings.push(...r.warnings);
    const it = raw as WordItem;
    if (ids.has(it.id)) problems.push(`${it.id}: duplicate id`);
    ids.add(it.id);
    const c = normalize(it.answer ?? '', 'en').compact;
    const prev = answers.get(c);
    if (prev) problems.push(`${it.id}: answer "${it.answer}" duplicates ${prev}`);
    answers.set(c, it.id);
  }
  return { problems, warnings };
}

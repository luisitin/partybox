// Labels both surfaces print: the question kicker, category names and the score-reason chips.
// Lives apart from the TV and phone components so a phone never downloads TV modules (ADR-050).
import type { Translator } from '@partybox/game-sdk/ui';
import type { Why } from '../server/types';

export function kicker(
  L: Translator,
  view: { final: boolean; n: number; total: number; fact: { category: string } },
): string {
  if (view.final) return L('Final Fake-Out · double points');
  return `${L('Question {n} of {total}', { n: view.n, total: view.total })} · ${L(categoryLabel(view.fact.category))}`;
}

const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  animals: 'Animals',
  history: 'History',
  food: 'Food',
  science: 'Science',
  geography: 'Geography',
  'weird-laws': 'Weird laws',
  sports: 'Sports',
  inventions: 'Inventions',
  space: 'Space',
  body: 'The human body',
  words: 'Words',
  holidays: 'Holidays',
  drinking: 'Drinking',
  dating: 'Dating',
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function whyChip(L: Translator, why: Why): string {
  if (why.k === 'truth') return L('+{pts} truth', { pts: why.pts });
  if (why.k === 'fooled') return L('+{pts} fooled {n}', { pts: why.pts, n: why.n });
  return L('×2 final');
}

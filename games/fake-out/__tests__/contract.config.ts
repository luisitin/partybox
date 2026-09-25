// Hints for the shared contract suite (packages/game-sdk/src/contract-tests): strings each view
// must never contain. The truth is secret until the options exist (then it sits among them, styled
// like every lie) and players' lies are secret until `pick`. Flags (authors, house, truth, picks)
// are not strings — __tests__/leaks.test.ts pins those step by step.
import type { GameStateBase } from '@partybox/game-sdk';
import type { State } from '../server/types';

function beforeOptions(state: State): boolean {
  return ['intro', 'question', 'lie'].includes(state.phase.id);
}

/** Text the viewer legitimately holds: the fact, their own lie, their own Suggest fakes. A secret
 *  inside one of these ("beer" inside "root beer") is not a leak. */
function held(state: State, viewer: string): string[] {
  const { q } = state;
  return [q.item.fact, q.lies[viewer] ?? '', ...(q.suggestions[viewer] ?? [])].map((t) =>
    t.toLowerCase(),
  );
}

function secrets(state: State, viewer: string): string[] {
  if (!beforeOptions(state)) return [];
  const { q } = state;
  const out = [q.item.truth.answer];
  if (state.phase.id === 'lie')
    for (const [p, text] of Object.entries(q.lies)) if (p !== viewer) out.push(text);
  const mine = held(state, viewer);
  return out.filter((s) => !mine.some((t) => t.includes(s.toLowerCase())));
}

export const contractConfig = {
  hiddenFromTv: (base: GameStateBase): string[] => secrets(base as State, ''),
  hiddenFromController: (base: GameStateBase, viewer: string): string[] =>
    secrets(base as State, viewer),
  settingsVariants: [
    { questions: 3, spicy: true, reader: 'none' },
    { likes: false, suggestions: false, finalDouble: false },
    { categories: 'drinking', spicy: false },
  ],
};

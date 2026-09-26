// Hints for the shared contract suite (packages/game-sdk/src/contract-tests): strings a view must
// never contain. Answers are secret while people write; upcoming cards are secret until their own
// guess phase (SPEC §4.5). Author ids can't be listed (every id is on stage as a candidate), so the
// author sit-out and author-leak rules are pinned in views.test.ts instead. Very short answers
// are skipped: they collide with ordinary words in a view ("why", "nap").
import type { GameStateBase } from '@partybox/game-sdk';
import type { State } from '../server/types';

const MIN = 6;

function hidden(state: State, viewer: string | null): string[] {
  const { p } = state;
  const mine = viewer ? p.answers[viewer] : undefined;
  // What the viewer legitimately sees: the prompt, their own answer, their own idea chips.
  const visible = [
    state.prompts[p.n]?.prompt ?? '',
    mine ?? '',
    ...(viewer ? (p.ideas[viewer] ?? []) : []),
  ];
  let secret: string[] = [];
  if (state.phase.id === 'write')
    secret = Object.entries(p.answers)
      .filter(([id]) => id !== viewer)
      .map(([, text]) => text);
  else if (state.phase.id === 'guess' || state.phase.id === 'reveal') {
    const current = p.cards[p.idx]?.text ?? '';
    visible.push(current);
    secret = p.cards.slice(p.idx + 1).map((c) => c.text);
  }
  return secret.filter((s) => s.length >= MIN && !visible.some((v) => v.includes(s)));
}

export const contractConfig = {
  hiddenFromTv: (state: GameStateBase): string[] => hidden(state as State, null),
  hiddenFromController: (state: GameStateBase, playerId: string): string[] =>
    hidden(state as State, playerId),
  settingsVariants: [
    { prompts: '1', spicy: true, reader: 'none' },
    { prompts: '4', ideas: false, readAnswers: false },
  ],
};

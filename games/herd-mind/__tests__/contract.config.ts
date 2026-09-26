// Hints for the shared contract suite. Answers are private until `herd`: nobody's typed words may
// reach the TV or another phone while people answer. A tile pick has no string of its own (tile
// labels are public), so a leaked answer record would show up as the key "answers" instead.
import type { GameStateBase } from '@partybox/game-sdk';
import type { State } from '../server/types';

function typedTexts(state: State, except: string | null): string[] {
  if (state.phase.id !== 'answer') return [];
  const prompt = (state.questions[state.q.n]?.prompt ?? '').toLowerCase();
  // What the viewer legitimately sees: the prompt and their own words ("sprouts" is inside
  // "brussels sprouts").
  const mine = ((except ? state.q.answers[except]?.text : undefined) ?? '').toLowerCase();
  return Object.entries(state.q.answers)
    .filter(([id, a]) => id !== except && a.text !== undefined)
    .map(([, a]) => a.text ?? '')
    .filter((text) => !prompt.includes(text.toLowerCase()) && !mine.includes(text.toLowerCase()));
}

export const contractConfig = {
  hiddenFromTv: (state: GameStateBase): string[] => [
    'answers',
    ...typedTexts(state as State, null),
  ],
  hiddenFromController: (state: GameStateBase, playerId: string): string[] => [
    'answers',
    ...typedTexts(state as State, playerId),
  ],
  settingsVariants: [
    { mode: 'typed', reader: 'none' },
    { mode: 'tiles', pace: 'fast', target: 3, maxQuestions: 5, spicy: true, reader: 'george' },
  ],
};

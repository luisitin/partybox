// Hints for the shared contract suite (packages/game-sdk/src/contract-tests): strings each view
// must never contain. TV: answers before "vote", authors (ids + names) before "reveal". Phones:
// other players' answers during "answer"; during "vote" the authors' ids and names for everyone,
// plus the other author's answer for an author (an author sees only their own).
import type { GameStateBase } from '@partybox/game-sdk';
import type { State } from '../server/types';

function authorsOf(state: State): string[] {
  const prompt = state.prompts[state.promptIndex];
  if (!prompt) return [];
  return [...prompt.authors, ...prompt.authors.map((id) => state.players[id]?.name ?? '')];
}

/** Answers written by players other than `me`, minus any text `me` also wrote (legitimately seen). */
function othersAnswers(state: State, me: string): string[] {
  const mine = new Set<string>();
  const others: string[] = [];
  for (const byAuthor of Object.values(state.answers))
    for (const [author, text] of Object.entries(byAuthor))
      if (author === me) mine.add(text);
      else others.push(text);
  return others.filter((text) => !mine.has(text));
}

export const contractConfig = {
  hiddenFromTv: (base: GameStateBase): string[] => {
    const state = base as State;
    if (state.phase.id === 'answer') return othersAnswers(state, '');
    if (state.phase.id === 'vote') return authorsOf(state);
    return [];
  },
  hiddenFromController: (base: GameStateBase, playerId: string): string[] => {
    const state = base as State;
    if (state.phase.id === 'answer') return othersAnswers(state, playerId);
    if (state.phase.id === 'vote') {
      const prompt = state.prompts[state.promptIndex];
      // My own id sits in the envelope's `me`; my own name is fine too.
      const myName = state.players[playerId]?.name;
      const hidden = authorsOf(state).filter((s) => s !== playerId && s !== myName);
      if (prompt && prompt.authors.includes(playerId)) {
        const myText = state.answers[prompt.id]?.[playerId];
        for (const other of prompt.authors) {
          const text = state.answers[prompt.id]?.[other];
          if (other !== playerId && text !== undefined && text !== myText) hidden.push(text);
        }
      }
      return hidden;
    }
    return [];
  },
  settingsVariants: [{ rounds: 1, spicy: true }],
};

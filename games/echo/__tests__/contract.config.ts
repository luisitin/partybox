// Hints for the shared contract suite: Echo's secrets (§7.5). The word stays off the TV, the
// guesser's and spectators' phones until `result`; clues stay off the TV and the guesser until
// `guess` (survivors) or `result` (echoes). The suite matches substrings, so a secret that is also
// part of the views' fixed vocabulary (a clue "key" vs the `key` field) is skipped — a real leak of
// such a word would need the word itself, which the other checks and the unit tests pin.
import type { GameStateBase } from '@partybox/game-sdk';
import { echoedRefs, survivorTexts, textOf } from '../server/echoes';
import { LINES } from '../server/speech';
import type { State } from '../server/types';

const PUBLIC = [
  ...Object.values(LINES),
  'gameId phaseId deadline paused players timerMode vipSkipLabel normal quiet hidden me id role player spectator',
  'wordNo deckSize counts left won lost guesser givers ready twoClues swapped survivors echoCount clueCount',
  'result word guess outcome byVip clues text by echo burned unwon final rating say key ms null true false',
  'tv secret answer accept family myClues reject dontKnow open closesAt mine check rows ok canCount spicy',
  'giver guesser watcher right wrong pass flawless brilliant great solid warming again',
  "intro clue check guess result done Let's go Close the clues Looks good for everyone Count it as a pass Next word See results",
  'empty too-long not-one-word is-secret contains-secret twin count',
].join(' ');

function hidden(state: State, texts: string[]): string[] {
  const ids = Object.keys(state.players).join(' ');
  const survivors =
    state.phase.id === 'guess' || state.phase.id === 'result' ? survivorTexts(state).join(' ') : '';
  return texts.filter(
    (t) => t.length >= 3 && !PUBLIC.includes(t) && !ids.includes(t) && !survivors.includes(t),
  );
}

function echoedTexts(state: State): string[] {
  return echoedRefs(state).map((r) => textOf(state, r));
}

/** What a viewer who does NOT know the word may not see in this phase. */
function secretsFor(state: State): string[] {
  const phase = state.phase.id;
  if (phase === 'result' || phase === 'done') return [];
  const out = [state.w.word.answer];
  if (phase === 'guess') out.push(...echoedTexts(state));
  else out.push(...Object.values(state.w.clues).flat());
  return hidden(state, out);
}

export const contractConfig = {
  hiddenFromTv: (state: GameStateBase): string[] => secretsFor(state as State),
  hiddenFromController: (state: GameStateBase, playerId: string): string[] => {
    const s = state as State;
    const giver =
      s.seats.includes(playerId) && playerId !== s.w.guesser && !s.left.includes(playerId);
    if (!giver) return secretsFor(s);
    // A clue-giver knows the word; during `clue` they see only their own clue.
    if (s.phase.id !== 'clue') return [];
    // Skip another clue that sits inside what this giver may see (their own clue, the word's
    // accepted forms: "smoke" inside "smokestack").
    const known = [
      ...(s.w.clues[playerId] ?? []),
      s.w.word.answer,
      ...s.w.word.accept,
      ...s.w.word.family,
    ].join(' ');
    return hidden(
      s,
      Object.entries(s.w.clues)
        .filter(([id]) => id !== playerId)
        .flatMap(([, t]) => t)
        .filter((t) => !known.includes(t)),
    );
  },
  settingsVariants: [
    { check: false },
    { spicy: true, reader: 'none' },
    { words: 6, categories: 'animals,food' },
    { words: 13, clueSeconds: 20, guessSeconds: 15 },
  ],
};

// Declared secrets for the shared contract suite (SPEC §1.5): the word (TV and imposter phones,
// until wordReveal) and this clue round's clues before their cards are dealt (everyone but the
// author). Imposter identity and votes are ids that legitimately appear elsewhere (board authors,
// ballots), so they are pinned by __tests__/leaks.test.ts instead of substrings here.
import type { GameStateBase } from '@partybox/game-sdk';
import { boardClues } from '../server/round';
import type { State } from '../server/types';

const WORD_SHOWN = new Set(['wordReveal', 'scores', 'done']);

function word(s: State, viewer: string | null = null): string[] {
  if (WORD_SHOWN.has(s.phase.id)) return [];
  const w = s.words[s.round.w]?.answer;
  if (!w) return [];
  // lastChance: the six options are public (SPEC §1.5), and a guesser sees their own guess.
  if ((s.round.options ?? []).includes(w)) return [];
  if (viewer && (s.round.guesses[viewer]?.said ?? '').toLowerCase().includes(w)) return [];
  // An imposter may type the word itself as a clue (SPEC §1.15); once on the board it is public.
  const onBoard = boardClues(s).some((c) => c.text.toLowerCase().includes(w));
  return onBoard ? [] : [w];
}

// View keys and fixed text a clue may coincide with ("family", "before", "ready"…).
const VIEW_TEXT = JSON.stringify([
  'gameId phaseId deadline paused players stage round rounds clueRound clueRounds category',
  'imposterCount board before dealt tally votes counts runoff candidates slots accuse accused',
  'spot flipped roles imposter crew last guessers options typed guessed reveal word imposters',
  'guesses said step void countable delta why caught read escaped stole say key url text seated',
  'role answer accept reject family catId catLabel mine ready clue vote guess ballot picks',
  'guessing result timerMode hidden quiet vipSkipLabel submitted waiting active spectator',
  "connected avatarId player name score status Let's go Start the vote Scores Next round",
]).toLowerCase();

function unrevealedClues(s: State, viewer: string | null): string[] {
  const r = s.round;
  if (!['clue', 'clueReveal'].includes(s.phase.id)) return [];
  const w = s.words[r.w];
  const crew = viewer !== null && s.seats.includes(viewer) && !r.imposters.includes(viewer);
  const shown = [
    ...boardClues(s).map((c) => c.text.toLowerCase()),
    ...(viewer ? (s.said[viewer] ?? []) : []),
    ...(crew && w ? [w.answer, ...w.accept, ...w.reject, ...w.family] : []),
    ...(w && s.cfg.hint === 'category' ? [w.label.toLowerCase()] : []),
    VIEW_TEXT,
  ];
  const own = r.clues.filter((c) => c.by === viewer).map((c) => c.text.toLowerCase());
  return r.clues
    .filter((c) => c.r === r.clueRound && c.by !== viewer)
    .map((c) => c.text)
    .filter(
      (t) =>
        !shown.some((x) => x.includes(t.toLowerCase())) &&
        !own.some((x) => x.includes(t.toLowerCase())),
    );
}

export const contractConfig = {
  hiddenFromTv: (state: GameStateBase): string[] => {
    const s = state as State;
    return [...word(s), ...unrevealedClues(s, null)];
  },
  hiddenFromController: (state: GameStateBase, viewer: string): string[] => {
    const s = state as State;
    const imposterOrOut = !s.seats.includes(viewer) || s.round.imposters.includes(viewer);
    return [...(imposterOrOut ? word(s, viewer) : []), ...unrevealedClues(s, viewer)];
  },
  settingsVariants: [
    { rounds: 1, lastChance: 'typed', reader: 'none' },
    { imposters: '2', clueRounds: '2', talk: false, hint: 'none', spicy: true },
    { lastChance: 'off', clueRounds: '3', rounds: 2 },
  ],
};

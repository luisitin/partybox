// Echo's results (§7.7): co-op, so every player carries the team's words won and everyone shares
// rank 1. The spec crowns nobody below Great, but the contract suite requires a winner, so the
// Tune In co-op fallback applies: everyone is crowned and the finale board carries the verdict
// (NOTES.md, open question for the owner). Four individual awards; ties share them.
import { buildResults } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { piles } from './deck';
import type { State, Turn } from './types';

export interface Tally {
  keyClues: number;
  echoed: number;
  right: number;
  wrong: number;
}

export function tallies(state: Pick<State, 'players' | 'turns'>): Record<string, Tally> {
  const out: Record<string, Tally> = {};
  for (const id of Object.keys(state.players))
    out[id] = { keyClues: 0, echoed: 0, right: 0, wrong: 0 };
  const bump = (id: string, key: keyof Tally): void => {
    const t = out[id];
    if (t) t[key] += 1;
  };
  for (const turn of state.turns as Turn[]) {
    if (turn.result === 'right') for (const id of turn.kept) bump(id, 'keyClues');
    for (const id of turn.echoed) bump(id, 'echoed');
    if (turn.result === 'right') bump(turn.guesser, 'right');
    if (turn.result === 'wrong') bump(turn.guesser, 'wrong');
  }
  return out;
}

/** Everyone tied on the top count gets it; nobody when the top is below `min`. */
function leaders(t: Record<string, Tally>, key: keyof Tally, min: number): string[] {
  const top = Math.max(0, ...Object.values(t).map((x) => x[key]));
  if (top < min) return [];
  return Object.keys(t)
    .filter((id) => t[id]?.[key] === top)
    .sort();
}

const AWARDS: { id: string; key: keyof Tally; min: number; title: string; description: string }[] =
  [
    {
      id: 'key-clue',
      key: 'keyClues',
      min: 1,
      title: '🗝️ Key Clue',
      description: 'Most clues that survived on words the team got',
    },
    {
      id: 'echo-chamber',
      key: 'echoed',
      min: 2,
      title: '🔁 Echo Chamber',
      description: 'Most clues that vanished',
    },
    {
      id: 'sharp-guesser',
      key: 'right',
      min: 1,
      title: '🎯 Sharp Guesser',
      description: 'Most right guesses',
    },
    {
      id: 'bold-guess',
      key: 'wrong',
      min: 2,
      title: '🙈 Bold Guess',
      description: 'Most wrong guesses',
    },
  ];

export function awardsFor(state: Pick<State, 'players' | 'turns'>): GameAward[] {
  const t = tallies(state);
  return AWARDS.flatMap((a) =>
    leaders(t, a.key, a.min).map((playerId) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      playerId,
    })),
  );
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  const won = piles(state).won.length;
  const scores: Record<string, number> = {};
  for (const id of Object.keys(state.players)) scores[id] = won;
  return buildResults(state, scores, awardsFor(state));
}

// Results and awards (SPEC §9.10, §9.11). Teams: each player scores their team's round wins, so a
// team ranks together and a draw crowns both. Co-op: everyone scores the agents found; a lost mission has no winner (ADR-052).
import { TEAM_MARK, TEAM_NAME } from '../names';
import { buildResults } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { teamOf } from './teams';
import type { State } from './types';

/** Own agents found across the game (co-op score). */
export function agentsFound(state: State): number {
  return state.history.reduce((n, h) => n + h.flips.filter((f) => f.kind === h.team).length, 0);
}

function best(
  state: State,
  value: (id: string) => number,
  eligible: (id: string) => boolean,
): string[] {
  const ids = Object.keys(state.players).filter(eligible);
  const top = Math.max(0, ...ids.map(value));
  return top > 0 ? ids.filter((id) => value(id) === top) : [];
}

export function awards(state: State): GameAward[] {
  const out: GameAward[] = [];
  const add = (id: string, ids: string[], title: string, description: string): void => {
    for (const playerId of ids) out.push({ id, title, description, playerId });
  };
  const s = (id: string) => state.stats[id];
  add(
    'master-spy',
    best(
      state,
      (id) => Math.round(((s(id)?.agentsFromClues ?? 0) / Math.max(1, s(id)?.clues ?? 0)) * 100),
      (id) => (s(id)?.clues ?? 0) >= 2,
    ),
    '🕶️ Master Spy',
    'Best average of own agents found per clue',
  );
  add(
    'big-link',
    best(
      state,
      (id) => s(id)?.bestClue ?? 0,
      (id) => (s(id)?.bestClue ?? 0) >= 3,
    ),
    '🔗 Big Link',
    'One clue that found the most agents',
  );
  add(
    'sharp-eye',
    best(
      state,
      (id) => s(id)?.sharp ?? 0,
      () => true,
    ),
    '🎯 Sharp Eye',
    'First to point at the most of their own agents',
  );
  add(
    'trap-door',
    best(
      state,
      (id) => s(id)?.trap ?? 0,
      () => true,
    ),
    '💀 Trap Door',
    'First to point at the assassin',
  );
  return out;
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  const scores: Record<string, number> = {};
  if (state.mode === 'coop') {
    const found = agentsFound(state);
    for (const id of Object.keys(state.players)) scores[id] = found;
    // ADR-052: a failed mission crowns nobody (P03 §5.7); a complete one crowns everyone.
    const won = state.winner === 'sun';
    const base = buildResults(state, scores, awards(state));
    return {
      ...base,
      winnerIds: won ? Object.keys(state.players) : [],
      outcome: { kind: 'coop', won },
      headline: won ? 'Mission complete! 🕶️' : 'Mission failed',
    };
  }
  for (const id of Object.keys(state.players)) {
    const team = teamOf(state, id);
    scores[id] = team ? state.roundWins[team] : 0;
  }
  const base = buildResults(state, scores, awards(state));
  const sun = state.roundWins.sun;
  const moon = state.roundWins.moon;
  const winner = sun === moon ? null : sun > moon ? 'sun' : 'moon';
  return {
    ...base,
    outcome: {
      kind: 'teams',
      winner,
      teams: (['sun', 'moon'] as const).map((t) => ({
        id: t,
        name: TEAM_NAME[t],
        mark: TEAM_MARK[t],
        members: [...state.teams[t]],
      })),
    },
    // The headline names the team with its mark at the end, so no language puts the dot
    // mid-sentence (reviewer [2e0f9d] #2); client/strings.ts translates it.
    headline: winner === null ? "It's a draw" : `${TEAM_NAME[winner]} wins! ${TEAM_MARK[winner]}`,
  };
}

/** "Mission complete with 2 clues to spare 🕶️" or "Agents found: 6 of 9" (co-op finale). */
export function coopRating(state: State): { complete: boolean; spare: number; found: number } {
  const lastWin = state.winner === 'sun';
  return { complete: lastWin, spare: state.coop?.cluesLeft ?? 0, found: agentsFound(state) };
}

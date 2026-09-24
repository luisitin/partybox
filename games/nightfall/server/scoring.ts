// Results and awards (SPEC §10.8). Every member of the winning side scores 1, dead or alive; the
// jester alone scores 1 when the jester wins; everyone else 0. Awards are skipped when nobody
// earned them, and ties share them.
import { buildResults } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { roleOf, sideOf } from './rules';
import type { State } from './types';

export function scoresOf(state: State): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const id of Object.keys(state.players)) {
    const role = roleOf(state, id);
    const won = state.winner !== null && role !== undefined && sideOf(role) === state.winner;
    scores[id] = won ? 1 : 0;
  }
  return scores;
}

function award(id: string, title: string, description: string, playerId: string): GameAward {
  return { id, title, description, playerId };
}

function count(n: number, one: string, many: string): string {
  return (n === 1 ? one : many).replace('{n}', String(n));
}

export function awardsOf(state: State): GameAward[] {
  const out: GameAward[] = [];
  const ids = state.seats;
  const stat = (id: string): State['stats'][string] | undefined => state.stats[id];
  for (const id of ids) {
    const s = stat(id);
    const role = roleOf(state, id);
    if (!s) continue;
    if (role === 'seer' && s.wolvesFound >= 1) {
      const text = count(s.wolvesFound, 'Unmasked a hidden foe', 'Unmasked {n} hidden foes');
      out.push(award('sharp-eyes', '🔮 Sharp Eyes', text, id));
    }
    if (role === 'doctor' && s.saves >= 1) {
      const text = count(
        s.saves,
        'Saved someone from the night',
        'Saved {n} people from the night',
      );
      out.push(award('life-saver', '🩺 Life Saver', text, id));
    }
  }
  const village = ids.filter((id) => sideOf(roleOf(state, id)) === 'village');
  const best = Math.max(0, ...village.map((id) => stat(id)?.votesOnWolves ?? 0));
  if (best >= 2)
    for (const id of village.filter((h) => stat(h)?.votesOnWolves === best))
      out.push(award('wolf-hunter', '🗳️ Wolf Hunter', `${best} day votes on the right target`, id));
  const liars = ids.filter((id) => roleOf(state, id) === 'wolf' && (stat(id)?.daysAlive ?? 0) >= 2);
  const fewest = Math.min(...liars.map((id) => stat(id)?.votesReceived ?? 0));
  for (const id of liars.filter((l) => stat(l)?.votesReceived === fewest)) {
    const text = count(fewest, 'Drew just {n} vote in daylight', 'Drew just {n} votes in daylight');
    out.push(award('best-liar', '🎭 Best Liar', text, id));
  }
  const first = state.dead.find((d) => d.how !== 'left');
  if (first)
    out.push(award('first-to-fall', '👻 First to Fall', 'Gone first, never forgotten', first.id));
  return out;
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, scoresOf(state), awardsOf(state));
}

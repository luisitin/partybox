// The running board for `score`, shared by the TV and a phone-only room's phones (kept out of the
// TV files so a phone never pulls TV code). Ranks with ties sharing ("1, 2, 2, 4"), highest first;
// `before` is the previous order, for the Scoreboard's climb.
import type { ScoreboardRow, ViewPlayer } from '@partybox/game-sdk/ui';
import type { ScoreView } from '../server/views';

export function boardRows(view: { players: ViewPlayer[]; score: ScoreView | null }): {
  rows: ScoreboardRow[];
  before: string[];
} {
  const delta = new Map((view.score?.rows ?? []).map((r) => [r.id, r.pts]));
  const players = view.players.filter((p) => p.status !== 'spectator');
  const byId = (a: ViewPlayer, b: ViewPlayer): number => (a.id < b.id ? -1 : 1);
  const byScore = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || byId(a, b));
  let rank = 0;
  let last: number | null = null;
  const rows = byScore.map((p, i): ScoreboardRow => {
    if (p.score !== last) {
      rank = i + 1;
      last = p.score ?? 0;
    }
    return {
      playerId: p.id,
      name: p.name,
      avatarId: p.avatarId,
      score: p.score ?? 0,
      rank,
      delta: delta.get(p.id) ?? 0,
      connected: p.connected,
    };
  });
  const prior = (p: ViewPlayer): number => (p.score ?? 0) - (delta.get(p.id) ?? 0);
  const before = [...players].sort((a, b) => prior(b) - prior(a) || byId(a, b)).map((p) => p.id);
  return { rows, before };
}

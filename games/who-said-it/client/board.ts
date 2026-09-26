// The board rows both surfaces draw (TV scores, phone scores, the phone stage).
import type { ScoreboardRow } from '@partybox/game-sdk/ui';
import type { WsPhoneView, WsTvView } from '../server/views';

export function boardRows(view: WsTvView | WsPhoneView): ScoreboardRow[] {
  const byId = new Map(view.players.map((p) => [p.id, p]));
  return view.board.map((row) => {
    const p = byId.get(row.playerId);
    return {
      playerId: row.playerId,
      name: p?.name ?? '?',
      avatarId: p?.avatarId ?? 'ghost',
      connected: p?.connected ?? false,
      score: row.score,
      rank: row.rank,
      delta: row.delta,
    };
  });
}

/** The order the board stood in before this question (for the climb). */
export function previousOrder(view: WsTvView | WsPhoneView): string[] {
  return [...view.board]
    .sort((a, b) => b.score - b.delta - (a.score - a.delta))
    .map((r) => r.playerId);
}

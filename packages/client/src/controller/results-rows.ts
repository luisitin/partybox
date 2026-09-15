// Shared by the phone and TV results screens: results → scoreboard rows + winner sentence.
import type { RoomSnapshot } from '@partybox/shared';
import type { ScoreboardRow } from '@partybox/game-sdk';
import { t } from '../i18n';

export function scoreboardRows(room: RoomSnapshot): ScoreboardRow[] {
  const results = room.results;
  if (!results) return [];
  const byId = new Map(results.players.map((p) => [p.id, p]));
  return results.results.ranking.map((r) => {
    const info = byId.get(r.playerId);
    const live = room.players.find((p) => p.id === r.playerId);
    return {
      playerId: r.playerId,
      name: info?.name ?? '?',
      avatarId: info?.avatarId ?? 'ghost',
      score: r.score,
      rank: r.rank,
      connected: live ? live.connected : false,
    };
  });
}

export function winnerLine(room: RoomSnapshot): string {
  const results = room.results;
  if (!results) return '';
  const names = results.results.winnerIds.map(
    (id) => results.players.find((p) => p.id === id)?.name ?? '?',
  );
  if (names.length === 0) return '';
  if (names.length === 1) return t.results.winner(names[0] as string);
  return t.results.winners(`${names.slice(0, -1).join(', ')} & ${names.at(-1)}`);
}

// Shared by the phone and TV results screens: results → scoreboard rows + winner sentence.
import type { RoomSnapshot } from '@partybox/shared';
import type { ScoreboardRow } from '@partybox/game-sdk/ui';
import { t } from '../i18n';

export function scoreboardRows(room: RoomSnapshot): ScoreboardRow[] {
  const results = room.results;
  if (!results) return [];
  const byId = new Map(results.players.map((p) => [p.id, p]));
  // Ties keep their rank but read alphabetically (numeric-aware), like every other player list.
  const byName = (a: string, b: string): number =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  const ranking = [...results.results.ranking].sort(
    (a, b) =>
      a.rank - b.rank || byName(byId.get(a.playerId)?.name ?? '', byId.get(b.playerId)?.name ?? ''),
  );
  return ranking.map((r) => {
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

/** True when nobody scored anything (a game ended early): trophies and "wins" would be nonsense. */
export function nobodyScored(room: RoomSnapshot): boolean {
  const scores = Object.values(room.results?.results.scores ?? {});
  return scores.length > 0 && scores.every((s) => s <= 0);
}

export function winnerLine(room: RoomSnapshot): string {
  const results = room.results;
  if (!results) return '';
  // Everyone on zero is still a tie (review-loop #6): the headline says so; the screens add why.
  if (nobodyScored(room)) return results.players.length > 1 ? t.results.tie : t.results.over;
  const ids = results.results.winnerIds;
  if (ids.length === 0) return '';
  if (ids.length >= results.players.length && ids.length > 1) return t.results.tie;
  // Tied winners read alphabetically (numeric-aware), like every other player list (review-loop #36).
  const names = ids
    .map((id) => results.players.find((p) => p.id === id)?.name ?? '?')
    .sort((x, y) => x.localeCompare(y, undefined, { numeric: true, sensitivity: 'base' }));
  if (names.length === 1) return t.results.winner(names[0] as string);
  if (names.length === 2) return t.results.winners(`${names[0]} & ${names[1]}`);
  return t.results.tieAmong(`${names[0]}, ${names[1]}`, names.length - 2);
}

/** My ranking entry — undefined for a spectator or a late joiner who has no row. */
export function myRow(room: RoomSnapshot, meId: string): ScoreboardRow | undefined {
  return scoreboardRows(room).find((r) => r.playerId === meId);
}

/** The winner sentence in the first person: "You win!" on the winner's own phone. */
export function winnerLineFor(room: RoomSnapshot, meId: string): string {
  const results = room.results;
  if (!results) return '';
  if (nobodyScored(room)) return winnerLine(room);
  const ids = results.results.winnerIds;
  if (!ids.includes(meId)) return winnerLine(room);
  if (ids.length === 1) return t.results.youWin;
  if (ids.length >= results.players.length) return t.results.tie;
  return t.results.youTie;
}

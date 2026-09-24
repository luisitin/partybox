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

export function winnerLine(room: RoomSnapshot, scoreless = false): string {
  const results = room.results;
  if (!results) return '';
  // A game without points (Broken Pencil) is a show, not a tie (review-loop #63).
  if (scoreless) return t.results.show;
  // Everyone on zero is still a tie (review-loop #6): the headline says so; the screens add why.
  // I-128 A: an all-zero board is not a tie — say what happened.
  if (nobodyScored(room)) return results.gameId === 'bingo' ? t.results.noBingos : t.results.nobody;
  const ids = results.results.winnerIds;
  if (ids.length === 0) return '';
  if (ids.length >= results.players.length && ids.length > 1) return t.results.tie;
  // I-153 A: people first. Tied winners still read alphabetically (numeric-aware) within their
  // group, but a bot never takes a naming slot from someone who was actually in the room — "Bot 1,
  // Bot 3 & 2 others" named the robots and hid the only two guests.
  const tiedPlayers = ids
    .map((id) => results.players.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .sort(
      (x, y) =>
        Number(x.bot ?? false) - Number(y.bot ?? false) ||
        x.name.localeCompare(y.name, undefined, { numeric: true, sensitivity: 'base' }),
    );
  const people = tiedPlayers.filter((p) => p.bot !== true);
  const bots = tiedPlayers.filter((p) => p.bot === true);
  // I-153 C: a tie nobody was there for — a TIE, not a lone bot winner, which still gets its
  // name ("Bot 1 wins!"). Recording this caught it: the first draft crowned a single bot with
  // "The bots tie — nobody home?" over a board showing Bot 1 alone on 3.
  if (ids.length > 1 && people.length === 0 && bots.length > 0) return t.results.botTie;
  // I-153 B: bots tied with people are "the bots" — furniture does not get billing.
  if (bots.length > 0 && people.length > 0) {
    const named = people.map((p) => p.name);
    // The copy supplies the final "& the bots", so the names are comma-joined — "Priya & Sam &
    // the bots" read as two ampersands in a row.
    return t.results.tieWithBots(named.join(', '), bots.length);
  }
  const names = (people.length > 0 ? people : bots).map((p) => p.name);
  if (names.length === 1) return t.results.winner(names[0] as string);
  if (names.length === 2)
    return t.results.winners(t.results.pair(names[0] as string, names[1] as string));
  return t.results.tieAmong(`${names[0]}, ${names[1]}`, names.length - 2);
}

/** My ranking entry — undefined for a spectator or a late joiner who has no row. */
export function myRow(room: RoomSnapshot, meId: string): ScoreboardRow | undefined {
  return scoreboardRows(room).find((r) => r.playerId === meId);
}

/** The winner sentence in the first person: "You win!" on the winner's own phone. */
export function winnerLineFor(room: RoomSnapshot, meId: string, scoreless = false): string {
  const results = room.results;
  if (!results) return '';
  if (scoreless || nobodyScored(room)) return winnerLine(room, scoreless);
  const ids = results.results.winnerIds;
  if (!ids.includes(meId)) return winnerLine(room);
  if (ids.length === 1) return t.results.youWin;
  if (ids.length >= results.players.length) return t.results.tie;
  return t.results.youTie;
}

/** I-329 B: one of a pool, the same on every render — per player and per game (the final scores). */
function pickOf<T>(pool: readonly T[], room: RoomSnapshot, meId: string): T {
  const scores = Object.entries(room.results?.results.scores ?? {})
    .map(([id, s]) => `${id}:${s}`)
    .sort()
    .join(',');
  let h = 0;
  for (const ch of `${meId}|${room.results?.gameId ?? ''}|${scores}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[h % pool.length] as T;
}

/**
 * I-329: a line for a player who didn't win, by how the game went for them — lost to a bot, last,
 * runner-up (with the gap), or the middle of the table. Null for a winner, a spectator, a board
 * where nobody scored, or a room of two (second is last, and says so as the runner-up).
 */
export function placeLine(room: RoomSnapshot, meId: string): string | null {
  const results = room.results;
  if (!results || nobodyScored(room)) return null;
  const rows = scoreboardRows(room);
  const mine = rows.find((r) => r.playerId === meId);
  if (!mine || results.results.winnerIds.includes(meId)) return null;
  const botWon = results.results.winnerIds.some((id) => room.players.find((p) => p.id === id)?.bot);
  const meBot = room.players.find((p) => p.id === meId)?.bot;
  const lastRank = Math.max(...rows.map((r) => r.rank));
  const top = Math.max(...rows.map((r) => r.score));
  if (botWon && !meBot && mine.rank === 2) return pickOf(t.results.placeBot, room, meId);
  if (mine.rank === 2) return pickOf(t.results.placeRunnerUp, room, meId)(top - mine.score);
  if (mine.rank === lastRank) return pickOf(t.results.placeLast, room, meId);
  if (botWon && !meBot) return pickOf(t.results.placeBot, room, meId);
  return pickOf(t.results.placeMiddle, room, meId)(mine.rank);
}

// Shared by the phone and TV results screens: results → scoreboard rows + winner sentence.
import type { GameAward, RoomSnapshot } from '@partybox/shared';
import type { ScoreboardRow } from '@partybox/game-sdk/ui';
import { getLang } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { serverText } from '../server-text';

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

/** ADR-052: the line for a co-op or team game — the game's own headline first. */
export function outcomeLine(room: RoomSnapshot): string | null {
  const r = room.results;
  if (!r) return null;
  const say = (text: string): string => serverText(text, getLang(), r.gameId);
  if (r.results.headline) return say(r.results.headline);
  const o = r.results.outcome;
  if (!o) return null;
  if (o.kind === 'coop') return o.won ? t.results.coopWon : t.results.coopLost;
  const team = o.teams.find((x) => x.id === o.winner);
  if (!team) return t.results.teamDraw;
  return t.results.teamWins(`${team.mark ? `${team.mark} ` : ''}${say(team.name)}`);
}

export function winnerLine(room: RoomSnapshot, scoreless = false): string {
  const results = room.results;
  if (!results) return '';
  const outcome = outcomeLine(room);
  if (outcome) return outcome;
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
  // up to three are all named (the reviewer's "Abuela, Kenji & 1 other tie!" had room for Lucía)
  if (names.length === 3) return t.results.tieNamed(joinNames(names));
  return t.results.tieAmong(`${names[0]}, ${names[1]}`, names.length - 2);
}

/** "Sam", "Sam & Maya", "Sam, Maya & Leo" — the language's own "&" (t.results.pair). */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return t.results.pair(names.slice(0, -1).join(', '), names.at(-1) as string);
}

/** One award, everyone who won it: a tie gives the award to each tied player, and a card per
 *  player repeated the award (and collided on its key, echo/imposter play-tests). */
export interface AwardGroup {
  id: string;
  title: string;
  description: string;
  playerIds: string[];
}

export function groupAwards(awards: readonly GameAward[]): AwardGroup[] {
  const groups = new Map<string, AwardGroup>();
  for (const a of awards) {
    const key = `${a.id}|${a.title}`;
    const group = groups.get(key);
    if (!group)
      groups.set(key, { id: a.id, title: a.title, description: a.description, playerIds: [a.playerId] }); // prettier-ignore
    else if (!group.playerIds.includes(a.playerId)) group.playerIds.push(a.playerId);
  }
  return [...groups.values()];
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
  if (outcomeLine(room)) return winnerLine(room);
  const ids = results.results.winnerIds;
  if (!ids.includes(meId)) return winnerLine(room);
  if (ids.length === 1) return t.results.youWin;
  if (ids.length >= results.players.length) return t.results.tie;
  return t.results.youTie;
}

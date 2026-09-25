// The picker's rules, apart from its looks (game pack Part 00 §1.3, rulings 3 and 4): does a game
// fit the room and why not, which filter chips are worth showing, and the order of the list.
import type { CatalogEntry, RoomSnapshot } from '@partybox/shared';

export type Fit =
  | { ok: true }
  | { ok: false; why: 'needs'; min: number; n: number }
  | { ok: false; why: 'tooMany'; max: number; n: number }
  | { ok: false; why: 'noBots'; n: number };

/** Whether the game can start with the room as it is (bots count as players). */
export function fitOf(
  g: Pick<CatalogEntry, 'minPlayers' | 'maxPlayers' | 'supportsBots'>,
  room: Pick<RoomSnapshot, 'players'>,
): Fit {
  const n = room.players.length;
  if (!g.supportsBots && room.players.some((p) => p.bot)) return { ok: false, why: 'noBots', n };
  if (n < g.minPlayers) return { ok: false, why: 'needs', min: g.minPlayers, n };
  if (n > g.maxPlayers) return { ok: false, why: 'tooMany', max: g.maxPlayers, n };
  return { ok: true };
}

/** The filter chips, in the order the row shows them (the spec's list, Comedy and the rest). */
export const CHIPS = [
  'all',
  'quick',
  'words',
  'bluff',
  'teams',
  'co-op',
  'drawing',
  'trivia',
  'comedy',
  'classic',
  'hidden-roles',
  'strategy',
  'anywhere',
] as const;
export type Chip = (typeof CHIPS)[number];

export function matchesChip(g: CatalogEntry, chip: Chip): boolean {
  if (chip === 'all') return true;
  if (chip === 'anywhere') return g.presence === 'anywhere';
  return g.tags.includes(chip);
}

/** "All" plus every chip that narrows the list: it matches some games, not every one. */
export function chipsFor(games: readonly CatalogEntry[]): Chip[] {
  return CHIPS.filter((c) => {
    if (c === 'all') return true;
    const n = games.filter((g) => matchesChip(g, c)).length;
    return n > 0 && n < games.length;
  });
}

/**
 * The list's order (ruling 3): games that fit the room first, then the room's votes, then NEW,
 * then A–Z by name (a code-unit compare: every phone agrees).
 */
export function sortGames(
  games: readonly CatalogEntry[],
  room: Pick<RoomSnapshot, 'players' | 'votes'>,
): CatalogEntry[] {
  const votes = new Map<string, number>();
  for (const id of Object.values(room.votes ?? {})) votes.set(id, (votes.get(id) ?? 0) + 1);
  const key = (g: CatalogEntry): [number, number, number] => [
    fitOf(g, room).ok ? 0 : 1,
    -(votes.get(g.id) ?? 0),
    g.isNew ? 0 : 1,
  ];
  return [...games].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    for (let i = 0; i < ka.length; i += 1) if (ka[i] !== kb[i]) return (ka[i] ?? 0) - (kb[i] ?? 0);
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
}

/** The games this room already played tonight (the "↻ played" marker; room state, I-652). */
export function playedTonight(room: Pick<RoomSnapshot, 'tonight'>): Set<string> {
  return new Set((room.tonight ?? []).map((g) => g.gameId));
}

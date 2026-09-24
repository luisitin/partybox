// Small view lookups the TV and phone share: a player by id, a role's name and icon from the public
// role list. Pure; no content import (P00 §2.5: content reaches the client only through views).
import type { ViewPlayer } from '@partybox/game-sdk/ui';
import type { CastEntry } from '../server/views-common';
import type { Role } from '../server/types';

export function playerOf(players: readonly ViewPlayer[], id: string): ViewPlayer | undefined {
  return players.find((p) => p.id === id);
}

export function nameOf(players: readonly ViewPlayer[], id: string): string {
  return playerOf(players, id)?.name ?? '';
}

export function roleText(cast: readonly CastEntry[], role: Role | null): CastEntry | null {
  if (!role) return null;
  return cast.find((c) => c.role === role) ?? null;
}

/** "2 Wolves · Seer · Doctor · 4 Villagers" as entries: a count only when more than one. */
export function castLine(
  cast: readonly CastEntry[],
  tr: (text: string) => string,
): { key: string; icon: string; text: string }[] {
  return cast.map((c) => ({
    key: c.role,
    icon: c.icon,
    text: c.count > 1 ? `${c.count} ${tr(c.plural)}` : tr(c.name),
  }));
}

/** Seat-stable order for faces: the order the server lists the living in. */
export function facesOf(players: readonly ViewPlayer[], ids: readonly string[]): ViewPlayer[] {
  return ids.flatMap((id) => {
    const p = playerOf(players, id);
    return p ? [p] : [];
  });
}

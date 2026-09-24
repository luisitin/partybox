// Local stand-ins for the Foundation's team helpers (P00 §6: teamsFromSeed, majorityPick; owned by
// the Foundation session, F7). Same shape as the audit asks (#53): pure, `[value, RngState]`
// returns, never throw. Swap to `@partybox/game-sdk` when they land (NOTES.md).
import { nextInt, shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import type { Side, TeamId } from './types';

/** Two teams of even size (the extra player goes to Sun), bots spread across both. */
export function teamsFromSeed(
  players: readonly { id: string; bot?: boolean }[],
  rng: RngState,
): [Record<TeamId, string[]>, RngState] {
  const [people, afterPeople] = shuffle(
    rng,
    players.filter((p) => p.bot !== true).map((p) => p.id),
  );
  const [bots, afterBots] = shuffle(
    afterPeople,
    players.filter((p) => p.bot === true).map((p) => p.id),
  );
  const teams: Record<TeamId, string[]> = { sun: [], moon: [] };
  // People alternate first, then bots fill the smaller side, so neither team is all bots.
  people.forEach((id, i) => teams[i % 2 === 0 ? 'sun' : 'moon'].push(id));
  for (const id of bots) (teams.sun.length <= teams.moon.length ? teams.sun : teams.moon).push(id);
  return [teams, afterBots];
}

/** The side most callers tapped, or null for a tie or no taps (spec §5.7: neither scores). */
export function majoritySide(calls: Record<string, Side>, callers: readonly string[]): Side | null {
  let left = 0;
  let right = 0;
  for (const id of callers) {
    const side = calls[id];
    if (side === 'left') left += 1;
    else if (side === 'right') right += 1;
  }
  if (left === right) return null;
  return left > right ? 'left' : 'right';
}

/** A seeded coin, for the rare pick with no better rule (which team starts). */
export function coin(rng: RngState): [boolean, RngState] {
  const [n, next] = nextInt(rng, 0, 1);
  return [n === 1, next];
}

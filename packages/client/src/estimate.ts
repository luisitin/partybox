// I-189: how long this game will take, from its measured pace, its settings and the room. A game
// with no pace in its manifest keeps its fixed estimatedMinutes.
import type { CatalogEntry } from '@partybox/shared';

export function minutesFor(
  game: Pick<CatalogEntry, 'pace' | 'estimatedMinutes' | 'minPlayers' | 'maxPlayers'>,
  settings: Readonly<Record<string, unknown>> | null | undefined,
  players: number,
): number {
  if (!game.pace) return game.estimatedMinutes;
  const [fixed, perRound, perPlayer, roundsSetting, roundsDefault] = game.pace;
  const n = Math.max(game.minPlayers, Math.min(game.maxPlayers, players));
  const value =
    roundsSetting === 'players' ? n : Number(settings?.[roundsSetting] ?? roundsDefault);
  const rounds = Number.isFinite(value) && value > 0 ? value : 1;
  const seconds = fixed + rounds * (perRound + n * perPlayer);
  return Math.max(1, Math.round(seconds / 60));
}

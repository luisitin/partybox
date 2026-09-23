// I-189: how long this game will take, from its measured pace, its settings and the room. A game
// with no pace in its manifest keeps its fixed estimatedMinutes.
import type { GameSummary } from '@partybox/shared';

export function minutesFor(
  game: GameSummary,
  settings: Readonly<Record<string, unknown>> | null,
  players: number,
): number {
  const pace = game.estimate;
  if (!pace) return game.estimatedMinutes;
  const n = Math.max(game.minPlayers, Math.min(game.maxPlayers, players));
  const spec = game.settings.find((s) => s.key === pace.roundsSetting);
  const value =
    pace.roundsSetting === 'players' ? n : Number(settings?.[pace.roundsSetting] ?? spec?.default);
  const rounds = Number.isFinite(value) && value > 0 ? value : 1;
  const seconds =
    pace.fixedSeconds + rounds * (pace.perRoundSeconds + n * pace.perPlayerPerRoundSeconds);
  return Math.max(1, Math.round(seconds / 60));
}

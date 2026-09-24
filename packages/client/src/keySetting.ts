// I-187: each game's one load-bearing setting — the one the room should see before Start.
import type { GameSummary, Settings } from '@partybox/shared';

const KEY_SETTINGS: Record<string, string> = { blanks: 'decks' };
const MARKS: Record<string, string> = { wild: '🔞', 'wild-only': '🔞', adults: '🌶️', mild: '👪' };

/** The game's key setting as short words ("WILD", "Family night") and a mark, or null. */
export function keySetting(
  game: GameSummary,
  settings: Settings,
): { key: string; value: string; short: string; mark: string } | null {
  const key = KEY_SETTINGS[game.id];
  const spec = key ? game.settings.find((s) => s.key === key) : undefined;
  if (!spec || spec.type !== 'select') return null;
  const value = String(settings[spec.key] ?? spec.default);
  const option = spec.options.find((o) => o.value === value);
  if (!option) return null;
  return {
    key: spec.key,
    value,
    short: option.label.replace(/\s*\(.*\)\s*$/, ''),
    mark: MARKS[value] ?? '',
  };
}

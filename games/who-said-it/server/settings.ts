// Settings → the resolved config one game plays with (SPEC §4.7, §4.13). `prompts: auto` picks by
// room size; any count is clamped so prompts × players ≤ 40 answer cards.
import type { GameManifest, Settings as RawSettings } from '@partybox/game-sdk';
import { MAX_CARDS, READERS } from './types';
import type { Cfg, Reader } from './types';

/** §4.7: 3–6 players → 4 prompts, 7–10 → 3, 11–16 → 2. */
export function autoPrompts(players: number): number {
  if (players <= 6) return 4;
  if (players <= 10) return 3;
  return 2;
}

/** The most prompts a room of `players` may play: prompts × players ≤ 40, at least one. */
export function maxPrompts(players: number): number {
  return Math.max(1, Math.floor(MAX_CARDS / Math.max(1, players)));
}

export function resolvePrompts(value: unknown, players: number): number {
  const asked = value === 'auto' || value === undefined ? autoPrompts(players) : Number(value);
  const wanted = Number.isFinite(asked) && asked >= 1 ? Math.floor(asked) : autoPrompts(players);
  return Math.min(wanted, maxPrompts(players));
}

function numberSetting(manifest: GameManifest, raw: RawSettings, key: string): number {
  const spec = manifest.settings.find((s) => s.key === key);
  if (!spec || spec.type !== 'number') return 0;
  const value = Number(raw[key] ?? spec.default);
  if (!Number.isFinite(value)) return spec.default;
  return Math.min(spec.max, Math.max(spec.min, Math.round(value)));
}

function boolSetting(manifest: GameManifest, raw: RawSettings, key: string): boolean {
  const spec = manifest.settings.find((s) => s.key === key);
  const value = raw[key];
  if (typeof value === 'boolean') return value;
  return spec?.type === 'boolean' ? spec.default : false;
}

export function readSettings(manifest: GameManifest, raw: RawSettings, players: number): Cfg {
  const reader = String(raw['reader'] ?? 'sky');
  return {
    prompts: resolvePrompts(raw['prompts'], players),
    writeSeconds: numberSetting(manifest, raw, 'writeSeconds'),
    guessSeconds: numberSetting(manifest, raw, 'guessSeconds'),
    ideas: boolSetting(manifest, raw, 'ideas'),
    readAnswers: boolSetting(manifest, raw, 'readAnswers'),
    spicy: boolSetting(manifest, raw, 'spicy'),
    reader: (READERS as readonly string[]).includes(reader) ? (reader as Reader) : 'sky',
  };
}

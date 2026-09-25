// Settings (spec §5.14) resolved against the room at init: the mode `auto` picks, the rounds
// `auto` gives, and the presence switch that turns the huddle off. Pure; init must never throw, so
// every read clamps to the manifest's spec.
import type {
  GamePresence,
  InitContext,
  SettingSpec,
  Settings as RawSettings,
} from '@partybox/game-sdk';
import { ES_READY } from './content';
import type { ContentLang, Mode, PresenceMode, Reader, Settings, TargetSize } from './types';

const READERS: readonly Reader[] = ['george', 'fable', 'jessica', 'sky', 'original'];
const SIZES: readonly TargetSize[] = ['narrow', 'normal', 'wide'];

function numberSetting(specs: readonly SettingSpec[], raw: RawSettings, key: string): number {
  const spec = specs.find((s) => s.key === key);
  if (!spec || spec.type !== 'number') return 0;
  const value = Number(raw[key] ?? spec.default);
  if (!Number.isFinite(value)) return spec.default;
  return Math.min(spec.max, Math.max(spec.min, Math.round(value)));
}

/** Spec §5.3: auto = co-op at 2, solo at 3+. Teams needs 4+ and solo 3+ (else auto decides);
 *  co-op allows up to 8 (else solo). */
export function resolveMode(chosen: unknown, players: number): Mode {
  const auto: Mode = players >= 3 ? 'solo' : 'coop';
  if (chosen === 'teams') return players >= 4 ? 'teams' : auto;
  if (chosen === 'solo') return players >= 3 ? 'solo' : auto;
  if (chosen === 'coop') return players <= 8 ? 'coop' : 'solo';
  return auto;
}

/** Spec §5.14: auto = 8 at 2 players, one per player at 3–8, 8 at 9–16; else 3–12. */
export function resolveRounds(chosen: unknown, players: number): number {
  const n = Number(chosen);
  if (chosen !== 'auto' && Number.isInteger(n) && n >= 3 && n <= 12) return n;
  return players >= 3 && players <= 8 ? players : 8;
}

/** ADR-047: where everyone is, fixed at start (a host from before presence sends none: all in one
 *  room with a TV). */
export function readPresence(ctx: InitContext): GamePresence {
  return ctx.presence ?? { mode: 'together', phoneOnly: false };
}

/** ADR-054: the room's content language, fixed at start. Spanish only once every dial has its
 *  Spanish bank (else the room plays in English and the phones mark the bots' clues). The cast goes
 *  when InitContext.contentLang is on main. */
export function readContentLang(ctx: InitContext, ready = ES_READY): ContentLang {
  const lang = (ctx as InitContext & { contentLang?: string }).contentLang;
  return lang === 'es' && ready ? 'es' : 'en';
}

export function readSettings(
  specs: readonly SettingSpec[],
  raw: RawSettings,
  players: number,
  presence: PresenceMode,
): Settings {
  const mode = resolveMode(raw['mode'], players);
  const reader = raw['reader'];
  return {
    mode,
    rounds: resolveRounds(raw['rounds'], players),
    targetScore: numberSetting(specs, raw, 'targetScore'),
    maxTurns: numberSetting(specs, raw, 'maxTurns'),
    clueSeconds: numberSetting(specs, raw, 'clueSeconds'),
    dialSeconds: numberSetting(specs, raw, 'dialSeconds'),
    callSeconds: numberSetting(specs, raw, 'callSeconds'),
    targetSize: SIZES.find((s) => s === raw['targetSize']) ?? 'normal',
    huddle: mode !== 'solo' && raw['huddle'] !== false && presence !== 'remote-text',
    spicy: raw['spicy'] === true,
    reader: reader === 'none' ? 'none' : (READERS.find((r) => r === reader) ?? 'sky'),
  };
}

// Settings, presence and the deal (SPEC §10.3, §10.16, §10.17). Pure: the deal draws from the
// state's PRNG only, so the same seed deals the same roles.
import { multiselectPicks, shuffle } from '@partybox/game-sdk';
import type { InitContext, RngState, Settings } from '@partybox/game-sdk';
import { FLAVOURS } from '../content/schema';
import type { Cfg, FlavourId, Presence, PresenceMode, Role } from './types';

const MODES: readonly PresenceMode[] = ['together', 'remote-voice', 'remote-text'];

/** ADR-047 (F4): presence arrives on the init context once F4 lands; until then: together. */
export function presenceOf(ctx: InitContext): Presence {
  const raw = (ctx as InitContext & { presence?: { mode?: unknown; phoneOnly?: unknown } })
    .presence;
  const mode = MODES.find((m) => m === raw?.mode) ?? 'together';
  return { mode, phoneOnly: raw?.phoneOnly === true };
}

function num(settings: Settings, key: string, fallback: number, min: number, max: number): number {
  const v = Number(settings[key] ?? fallback);
  return Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback;
}

function bool(settings: Settings, key: string, fallback: boolean): boolean {
  const v = settings[key];
  return typeof v === 'boolean' ? v : fallback;
}

/** The four role switches share one multiselect (NOTES: the manifest allows 12 settings). */
export const DEFAULT_ROLES = 'seer,doctor';

export function resolveCfg(settings: Settings, presence: Presence): Cfg {
  const flavour = FLAVOURS.find((f) => f === settings['flavour']) ?? 'village';
  const wolvesRaw = String(settings['wolves'] ?? 'auto');
  const board = String(settings['townBoard'] ?? 'auto');
  const roles = multiselectPicks(settings['roles'] ?? DEFAULT_ROLES);
  return {
    flavour: flavour as FlavourId,
    wolves: wolvesRaw === 'auto' ? 0 : num(settings, 'wolves', 0, 0, 4),
    seer: roles.includes('seer'),
    doctor: roles.includes('doctor'),
    hunter: roles.includes('hunter'),
    jester: roles.includes('jester'),
    revealRoles: bool(settings, 'revealRoles', true),
    ghostsSeeAll: bool(settings, 'ghostsSeeAll', false),
    hunches: bool(settings, 'hunches', true),
    townBoard: board === 'on' || (board === 'auto' && presence.mode === 'remote-text'),
    nightSeconds: num(settings, 'nightSeconds', 45, 30, 60),
    daySeconds: num(settings, 'daySeconds', 150, 60, 240),
    voteSeconds: num(settings, 'voteSeconds', 30, 20, 45),
    maxDays: num(settings, 'maxDays', 6, 4, 8),
    reader: typeof settings['reader'] === 'string' ? settings['reader'] : 'fable',
  };
}

/** SPEC §10.3: 6–8 → 2, 9–11 → 3, 12–16 → 4; a set count never exceeds a third of the players. */
export function wolfCount(players: number, setting: number): number {
  const cap = Math.max(1, Math.floor(players / 3));
  if (setting > 0) return Math.min(setting, cap);
  const auto = players >= 12 ? 4 : players >= 9 ? 3 : 2;
  return Math.min(auto, cap);
}

/** The roles dealt for `players` seats, before shuffling: wolves, then the specials that fit. */
export function roleList(players: number, cfg: Cfg): Role[] {
  const wolves = wolfCount(players, cfg.wolves);
  const out: Role[] = Array.from({ length: wolves }, () => 'wolf' as const);
  const want: Role[] = [];
  if (cfg.seer) want.push('seer');
  if (cfg.doctor) want.push('doctor');
  if (cfg.hunter) want.push('hunter');
  if (cfg.jester && players >= 7) want.push('jester');
  for (const role of want) if (out.length < players) out.push(role);
  while (out.length < players) out.push('villager');
  return out;
}

/** Deals `roleList` to the seats at random. */
export function deal(
  seats: readonly string[],
  cfg: Cfg,
  rng: RngState,
): [Record<string, Role>, RngState] {
  const [shuffled, next] = shuffle(rng, roleList(seats.length, cfg));
  const roles: Record<string, Role> = {};
  seats.forEach((id, i) => {
    roles[id] = shuffled[i] ?? 'villager';
  });
  return [roles, next];
}

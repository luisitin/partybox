// The game contract (docs/GAME_CONTRACT.md). Games implement `GameDefinition`; the engine drives it.
// Changing anything here changes every game — write an ADR first (docs/DECISIONS.md).
import { z } from 'zod';
import type { Rng, RngState } from './rng';

// ─── Manifest + settings ────────────────────────────────────────────────────────────────────────

export const GAME_ID_PATTERN = /^[a-z][a-z0-9-]{1,31}$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const settingBase = {
  key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/),
  label: z.string().min(1).max(40),
  description: z.string().max(200).optional(),
};

export const settingSpecSchema = z.discriminatedUnion('type', [
  z.object({
    ...settingBase,
    type: z.literal('number'),
    default: z.number(),
    min: z.number(),
    max: z.number(),
    step: z.number().positive().optional(),
    /**
     * The ceiling follows the roster: effective max = min(max, players + maxFromPlayers), and a
     * stored value above it displays and starts as that ceiling ("players per book" = −1: everyone
     * else). The game's own start logic keeps the same cap (games/broken-pencil/server/index.ts).
     */
    maxFromPlayers: z.number().int().optional(),
  }),
  z.object({ ...settingBase, type: z.literal('boolean'), default: z.boolean() }),
  z.object({
    ...settingBase,
    type: z.literal('select'),
    default: z.string(),
    options: z.array(z.object({ value: z.string(), label: z.string() })).min(2),
  }),
  /**
   * Several picks from a list (ADR-034): the value is the picked option values joined by commas
   * (`''` = nothing picked, which a game reads as "no filter"). With `groupBy`, the options carry a
   * `group` and only those whose group equals the sibling `select` setting's current value are
   * offered — and kept: the engine drops picks from another group.
   */
  z.object({
    ...settingBase,
    type: z.literal('multiselect'),
    default: z.string(),
    options: z
      .array(z.object({ value: z.string(), label: z.string(), group: z.string().optional() }))
      .min(1),
    groupBy: z.string().optional(),
  }),
]);

/** A multiselect value → its picks (deduped, in option order when `spec` is given). */
export function multiselectPicks(
  value: unknown,
  spec?: { options: { value: string }[] },
): string[] {
  const raw = typeof value === 'string' ? value.split(',') : [];
  const picks = [...new Set(raw.map((v) => v.trim()).filter((v) => v.length > 0))];
  if (!spec) return picks;
  const known = spec.options.map((o) => o.value);
  return known.filter((v) => picks.includes(v));
}
export type SettingSpec = z.infer<typeof settingSpecSchema>;

export const DEFAULT_MAX_INPUT_BYTES = 16 * 1024;
export const HARD_MAX_INPUT_BYTES = 256 * 1024;

export const gameManifestSchema = z
  .object({
    id: z.string().regex(GAME_ID_PATTERN),
    name: z.string().min(1).max(40),
    tagline: z.string().min(1).max(80),
    description: z.string().min(1).max(500),
    version: z.string().regex(SEMVER),
    minPlayers: z.number().int().min(1).max(16),
    maxPlayers: z.number().int().min(1).max(16),
    estimatedMinutes: z.number().int().min(1).max(60),
    tags: z.array(z.string().min(1).max(20)).max(10),
    settings: z.array(settingSpecSchema).max(12),
    /** ADR-002: raise for stroke-list inputs (drawing games). */
    maxInputBytes: z.number().int().min(1024).max(HARD_MAX_INPUT_BYTES).optional(),
    /**
     * "Available for bots": the author certifies `bot.sampleInput` is a reasonable opponent in every
     * input phase. Players may add bots in the lobby; a game without this flag cannot be started
     * while bots are in the room (ADR-028).
     */
    supportsBots: z.boolean().optional(),
  })
  .refine((m) => m.minPlayers <= m.maxPlayers, { message: 'minPlayers must be <= maxPlayers' });
export type GameManifest = z.infer<typeof gameManifestSchema>;

export type SettingValue = number | boolean | string;
export type Settings = Record<string, SettingValue>;
export const settingsSchema = z.record(z.string(), z.union([z.number(), z.boolean(), z.string()]));

// ─── State ──────────────────────────────────────────────────────────────────────────────────────

export interface PlayerInfo {
  id: string;
  name: string;
  /** The face id — or `photo:<id>` for a player with a photo avatar (I-031); pass it to `Avatar`. */
  avatarId: string;
  connected: boolean;
  /** A bot (ADR-028): a game may act for it where a person would tap (Bingo's ready-up). */
  bot?: boolean;
}

export interface PhaseInfo {
  id: string;
  startedAt: number;
  /** ms timestamp; the engine fires exactly one `timer` event per (id, startedAt) once reached. */
  deadline: number | null;
  paused?: { at: number };
}

export interface GameStateBase {
  phase: PhaseInfo;
  rng: RngState;
  players: Record<string, PlayerInfo>;
}

export interface InitContext {
  players: PlayerInfo[];
  settings: Settings;
  seed: number;
  now: number;
}

// ─── Events ─────────────────────────────────────────────────────────────────────────────────────

export type VipGameAction = 'skip' | 'pause' | 'resume' | 'end';

export type GameEvent<I> =
  | { type: 'input'; now: number; playerId: string; input: I }
  | { type: 'timer'; now: number; phaseId: string; startedAt: number }
  | { type: 'player'; now: number; playerId: string; connected: boolean }
  | { type: 'vip'; now: number; action: VipGameAction };

// ─── Views ──────────────────────────────────────────────────────────────────────────────────────

export type PlayerStatus = 'active' | 'submitted' | 'waiting' | 'spectator';

export interface ViewPlayer {
  id: string;
  name: string;
  avatarId: string;
  connected: boolean;
  status: PlayerStatus;
  score?: number;
}

/** Common part of every view; the shells render it. Games add their own fields next to it. */
export interface ViewEnvelope {
  gameId: string;
  phaseId: string;
  deadline: number | null;
  paused: boolean;
  players: ViewPlayer[];
  /**
   * How the shells present `deadline` (ADR-030). `normal` (default): digits, red + ticks in the last
   * 5 s. `quiet`: the progress bar only — for phases whose timer is a rhythm, not a countdown
   * (a bingo call, a page of a slideshow). `hidden`: nothing at all.
   */
  timerMode?: 'normal' | 'quiet' | 'hidden';
}

export type TvView = ViewEnvelope;

export interface ControllerView extends ViewEnvelope {
  me: { id: string; role: 'player' | 'spectator' };
}

/** What actually goes over the wire: the engine adds the VIP (ADR-020). */
export type PushedView<V extends ViewEnvelope> = V & { vip: string | null };

// ─── Results ────────────────────────────────────────────────────────────────────────────────────

export interface GameAward {
  id: string;
  title: string;
  description: string;
  playerId: string;
}

export interface GameResults {
  scores: Record<string, number>;
  ranking: { playerId: string; score: number; rank: number }[];
  winnerIds: string[];
  awards: GameAward[];
}

/** One extra file a recap writes next to `recap.md` (a drawing as SVG, a CSV). */
export interface RecapFile {
  /** A plain file name, no folders. */
  name: string;
  body: string;
}

/** A human-readable account of one finished game, written by the host when the room records (ADR-035). */
export interface GameRecap {
  markdown: string;
  files?: RecapFile[];
}

export interface RecapContext<S> {
  players: PlayerInfo[];
  /** The state as each phase instance began, oldest first — the reveal states hold what a game clears per round. */
  history: { phase: string; at: number; state: S }[];
  /** Null when the game was ended early. */
  results: GameResults | null;
}

// ─── The definition ─────────────────────────────────────────────────────────────────────────────

export interface GameBot<S, I> {
  /** A valid input for this player right now, or null when there is nothing to do. */
  sampleInput(state: S, playerId: string, rng: Rng): I | null;
}

/**
 * S = your state, I = your input union. TV / CV default to the bare envelopes; declare your own view
 * interfaces (extending TvView / ControllerView) so `game.tvView(state).yourField` type-checks in tests.
 */
export interface GameDefinition<
  S extends GameStateBase,
  I,
  TV extends TvView = TvView,
  CV extends ControllerView = ControllerView,
> {
  manifest: GameManifest;
  phases: readonly string[];
  inputSchema: z.ZodType<I>;
  init(ctx: InitContext): S;
  reduce(state: S, event: GameEvent<I>): S;
  tvView(state: S): TV;
  controllerView(state: S, playerId: string): CV;
  results(state: S): GameResults | null;
  bot: GameBot<S, I>;
  /**
   * Optional: what the host writes to disk for the owner's feedback (ADR-035) — a markdown recap and
   * any files it references. Pure like every other method; `null` means "just the state".
   */
  recap?(state: S, ctx: RecapContext<S>): GameRecap | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- the registry holds heterogeneous games */
export type AnyGameDefinition = GameDefinition<any, any, any, any>;
/* eslint-enable @typescript-eslint/no-explicit-any */

export const STATE_SIZE_LIMIT_BYTES = 256 * 1024;

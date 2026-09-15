// Socket.IO protocol (docs/PROTOCOL.md): every client → server payload has a zod schema here; the
// server → client shapes are plain types (the server builds them, clients trust them).
import { z } from 'zod';
import type { GameResults, PlayerInfo, SettingSpec, Settings } from './contract';
import { settingsSchema } from './contract';

export const LIMITS = {
  roomCapacity: 16,
  maxPayloadBytes: 16 * 1024,
  inputsPerSecond: 20,
  disconnectGraceMs: 120_000,
  vipHandoverMs: 30_000,
  pingIntervalMs: 10_000,
  pingTimeoutMs: 20_000,
} as const;

// ─── client → server ────────────────────────────────────────────────────────────────────────────

export const joinPayloadSchema = z.object({
  roomCode: z.string().max(8).optional(),
  name: z.string().max(64),
  avatarId: z.string().max(32),
  token: z.string().max(128).optional(),
});
export type JoinPayload = z.infer<typeof joinPayloadSchema>;

export const inputPayloadSchema = z.object({
  seq: z.number().int().nonnegative(),
  input: z.unknown(),
});
export type InputPayload = z.infer<typeof inputPayloadSchema>;

export const vipPayloadSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('selectGame'), gameId: z.string().max(32) }),
  z.object({ action: z.literal('updateSettings'), settings: settingsSchema }),
  z.object({ action: z.literal('start') }),
  z.object({ action: z.literal('skip') }),
  z.object({ action: z.literal('pause') }),
  z.object({ action: z.literal('resume') }),
  z.object({ action: z.literal('end') }),
  z.object({ action: z.literal('kick'), playerId: z.string().max(64) }),
  z.object({ action: z.literal('transferVip'), playerId: z.string().max(64) }),
  z.object({ action: z.literal('lock') }),
  z.object({ action: z.literal('unlock') }),
  z.object({ action: z.literal('playAgain') }),
  z.object({ action: z.literal('toLobby') }),
]);
export type VipAction = z.infer<typeof vipPayloadSchema>;

export const tvJoinPayloadSchema = z.object({ roomCode: z.string().max(8).optional() });
export type TvJoinPayload = z.infer<typeof tvJoinPayloadSchema>;

/** Any player may add bots they own (ADR-028); owners and the VIP may remove them. */
export const botPayloadSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('add') }),
  z.object({ action: z.literal('remove'), botId: z.string().max(64) }),
]);
export type BotAction = z.infer<typeof botPayloadSchema>;

/** How a bot decides when to act; `random` is what the lobby button creates. */
export const BOT_STRATEGIES = ['random', 'fast', 'slow', 'idle', 'chaos'] as const;
export type BotStrategy = (typeof BOT_STRATEGIES)[number];
export const MAX_BOTS_PER_OWNER = 4;

// ─── server → client ────────────────────────────────────────────────────────────────────────────

export type RoomStatus = 'lobby' | 'selecting' | 'playing' | 'results';

export interface PlayerPublic {
  id: string;
  name: string;
  avatarId: string;
  isVip: boolean;
  connected: boolean;
  spectator: boolean;
  joinedAt: number;
  /** Present for bots: who added it (null = added by the dev API). */
  bot?: { ownerId: string | null; strategy: BotStrategy };
}

export interface GameSummary {
  id: string;
  name: string;
  tagline: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedMinutes: number;
  tags: string[];
  settings: SettingSpec[];
  supportsBots: boolean;
}

export interface RoomResults {
  gameId: string;
  results: GameResults;
  /** Names/avatars of everyone who played, including players who left. */
  players: PlayerInfo[];
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  locked: boolean;
  capacity: number;
  players: PlayerPublic[];
  vip: string | null;
  selectedGameId: string | null;
  settings: Settings;
  games: GameSummary[];
  results: RoomResults | null;
  /** Why the VIP's Start button is disabled, if it is. */
  canStart: { ok: true } | { ok: false; reason: string };
}

export interface WelcomePayload {
  playerId: string;
  token: string;
  room: RoomSnapshot;
  at: number;
}

export interface RoomPush {
  rev: number;
  room: RoomSnapshot;
  /** Server time when pushed; clients derive their clock offset from it. */
  at: number;
}

export interface ViewPush<V> {
  rev: number;
  view: V;
  at: number;
}

export type ToastKind = 'info' | 'success' | 'warning';
export interface ToastPayload {
  kind: ToastKind;
  text: string;
}

export type ErrorCode =
  | 'invalid_payload'
  | 'name_invalid'
  | 'name_taken'
  | 'avatar_invalid'
  | 'room_full'
  | 'room_locked'
  | 'room_not_found'
  | 'bad_token'
  | 'not_vip'
  | 'not_in_room'
  | 'unknown_game'
  | 'cannot_start'
  | 'invalid_input'
  | 'not_playing'
  | 'rate_limited'
  | 'payload_too_large'
  | 'bots_not_supported'
  | 'bot_limit';

export interface ErrorPayload {
  code: ErrorCode;
  message: string;
}

export interface KickedPayload {
  reason: string;
}

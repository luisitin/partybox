// Engine vocabulary: the room state, the events the host feeds in, and the effects it gets back
// (ADR-010). Everything is plain JSON-able data; no classes, no functions inside state.
import type {
  AnyGameDefinition,
  BotStrategy,
  ErrorCode,
  GameStateBase,
  RoomResults,
  RoomStatus,
  Settings,
  ToastKind,
  VipAction,
} from '@partybox/shared';

export interface RoomPlayer {
  id: string;
  name: string;
  avatarId: string;
  token: string;
  isVip: boolean;
  connected: boolean;
  joinedAt: number;
  disconnectedAt: number | null;
  /** Joined while a game was running; waits for the next one. */
  spectator: boolean;
  /** Bots are room players driven by the host from `game.bot.sampleInput` (ADR-028). Never VIP. */
  bot?: { ownerId: string | null; strategy: BotStrategy };
}

export interface RunningGame {
  gameId: string;
  seed: number;
  settings: Settings;
  state: GameStateBase;
  startedAt: number;
  /** The one phase instance we already fired a timer for (ADR-004: exactly once). */
  firedTimer: { phaseId: string; startedAt: number } | null;
}

export interface RoomState {
  code: string;
  createdAt: number;
  capacity: number;
  locked: boolean;
  status: RoomStatus;
  /** Bumped on every push; clients drop pushes with a lower rev (docs/PROTOCOL.md). */
  rev: number;
  players: Record<string, RoomPlayer>;
  vipId: string | null;
  selectedGameId: string | null;
  settings: Settings;
  game: RunningGame | null;
  results: RoomResults | null;
  /** For "play again". */
  lastGame: { gameId: string; settings: Settings } | null;
}

export type RoomEvent =
  | {
      type: 'join';
      now: number;
      /** Fresh id/token minted by the host; unused when `existingToken` resumes a player. */
      playerId: string;
      token: string;
      name: string;
      avatarId: string;
      existingToken?: string;
    }
  | {
      /** A player (or the dev API, ownerId null) adds a bot; the host mints id + token. */
      type: 'bot-add';
      now: number;
      ownerId: string | null;
      playerId: string;
      token: string;
      strategy: BotStrategy;
    }
  | { type: 'bot-remove'; now: number; ownerId: string | null; botId: string }
  | { type: 'disconnect'; now: number; playerId: string }
  | { type: 'leave'; now: number; playerId: string }
  | { type: 'vip'; now: number; playerId: string; action: VipAction; seed?: number }
  | { type: 'input'; now: number; playerId: string; input: unknown }
  | { type: 'tick'; now: number }
  | { type: 'dev:loadState'; now: number; gameId: string; state: unknown; settings?: Settings }
  | { type: 'dev:gameEvent'; now: number; event: unknown };

export type Effect =
  | { type: 'welcome'; playerId: string }
  | { type: 'push' }
  | { type: 'toast'; to: 'all' | string; kind: ToastKind; text: string }
  | { type: 'kicked'; playerId: string; reason: string }
  | { type: 'error'; to: string; code: ErrorCode; message: string }
  | { type: 'log'; level: 'warn' | 'error'; text: string };

export interface ApplyResult {
  room: RoomState;
  effects: Effect[];
}

export interface EngineDeps {
  games: Readonly<Record<string, AnyGameDefinition>>;
}

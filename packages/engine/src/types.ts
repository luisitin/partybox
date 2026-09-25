// Engine vocabulary: the room state, the events the host feeds in, and the effects it gets back
// (ADR-010). Everything is plain JSON-able data; no classes, no functions inside state.
import type {
  AnyGameDefinition,
  BotStrategy,
  ErrorCode,
  GameStateBase,
  PresenceMode,
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
  photo?: string;
  token: string;
  isVip: boolean;
  connected: boolean;
  joinedAt: number;
  disconnectedAt: number | null;
  /** Joined while a game was running; waits for the next one. */
  spectator: boolean;
  /** Bots are room players driven by the host from `game.bot.sampleInput` (ADR-028). Never VIP. */
  bot?: { ownerId: string | null; strategy: BotStrategy };
  /** ADR-047: this person can't see the TV (stored only when false; bots always can). */
  canSeeTv?: false;
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
  /**
   * I-763 A: what the VIP tuned, per game, for the night — picking a game reads it, a settings
   * change writes it. Optional so saved room states from before it still load. Never on the wire.
   */
  settingsByGame?: Record<string, Settings>;
  /** The host records each game to disk while true (ADR-035); the VIP toggles it in the picker. */
  recording: boolean;
  /** S-004: the VIP's room-wide phone-music switch. */
  musicOnPhones: boolean;
  /** The owner (2026-09-22): shown in the join page's room list. */
  listed: boolean;
  /** S-005: "phone only" — the TV's moments go to the phones. */
  phoneOnly: boolean;
  /** ADR-047: where everyone is (absent = together; optional so saved rooms still load). */
  presenceMode?: PresenceMode;
  /** I-746 B: when the last person's phone dropped mid-game (the game is paused until one is back). */
  asleepSince?: number;
  /** I-746: the game was already paused (by the VIP) when everyone dropped — waking leaves it paused. */
  asleepKeptPause?: boolean;
  /** I-652 B: tonight's finished games, newest last (a gap over 3 h starts a new night). */
  tonight?: TonightGame[];
  /** I-347 A: the VIP whose role passed on while their phone was away (cleared when a game starts
   *  or the role moves again). */
  formerVip?: string;
  /** I-650: votes for the next game (player id → game id); cleared when a game starts. */
  votes?: Record<string, string>;
  /** Part 00 §1.4: the game whose About sheet the VIP (`by`) has open — the TV shows it big. */
  highlight?: { gameId: string; by: string };
  /** Ruling 2: when each player's last "👍 … suggests …" toast went out (the 10 s throttle). */
  suggestedAt?: Record<string, number>;
}

/** I-652 B: one finished game, as the lobby remembers it. */
export interface TonightGame {
  gameId: string;
  endedAt: number;
  /** The people who won (bots left out). */
  winners: { name: string; avatarId: string }[];
  /** Only bots won it (as opposed to nobody scoring). */
  botsWon: boolean;
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
      /** A photo avatar (I-031): a JPEG data URL the socket already validated. */
      photo?: string;
      existingToken?: string;
      /** I-741 C: "That's me — take my seat": claim the seat of this name even if it reads connected. */
      takeOver?: boolean;
      /** ADR-047: the phone's own "I can see the TV", else the host's guess from its address. */
      canSeeTv?: boolean;
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
  /** I-070 A: a waiting player nudges the VIP — a toast to everyone that names the sender. */
  | { type: 'nudge'; now: number; playerId: string }
  /** I-650: a person votes for the next game (null takes the vote back). */
  | { type: 'vote'; now: number; playerId: string; gameId: string | null }
  /** ADR-047: a phone flips its "I can see the TV". */
  | { type: 'presence'; now: number; playerId: string; canSeeTv: boolean }
  | {
      type: 'vip';
      now: number;
      /** The sender; must be the VIP — unless `host` is set (the TV, ADR-031), then any id works. */
      playerId: string;
      action: VipAction;
      seed?: number;
      host?: boolean;
    }
  | { type: 'input'; now: number; playerId: string; input: unknown; vip?: boolean }
  | { type: 'tick'; now: number }
  | { type: 'dev:loadState'; now: number; gameId: string; state: unknown; settings?: Settings }
  | { type: 'dev:gameEvent'; now: number; event: unknown }
  /** ADR-045: a reading the running game asked for is ready (or failed: ms -1). */
  | { type: 'speech'; now: number; key: string; ms: number };

export type Effect =
  | { type: 'welcome'; playerId: string }
  | { type: 'push' }
  | {
      type: 'toast';
      /** I-040: 'tvs' reaches every TV in the room and no phone. */
      to: 'all' | 'tvs' | string;
      kind: ToastKind;
      text: string;
      /** I-040 B: a player the toast is about (the lobby rings their chip while it shows). */
      playerId?: string;
    }
  | { type: 'kicked'; playerId: string; reason: string }
  | {
      type: 'error';
      to: string;
      code: ErrorCode;
      message: string;
      /** I-040 C: for `name_taken`, who already has the name (the phone shows their face). */
      player?: { name: string; avatarId: string };
    }
  | { type: 'log'; level: 'warn' | 'error'; text: string };

export interface ApplyResult {
  room: RoomState;
  effects: Effect[];
}

export interface EngineDeps {
  games: Readonly<Record<string, AnyGameDefinition>>;
}

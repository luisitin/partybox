// Public surface of @partybox/game-sdk: everything a game is allowed to import (ADR-009).
// Sections: contract (from shared) · reducer helpers · UI primitives (docs/DESIGN_SYSTEM.md).

// ── contract types + zod, re-exported from shared ─────────────────────────────────────────────
export { PARTYBOX_VERSION, gameManifestSchema, multiselectPicks, z } from '@partybox/shared';
export type {
  ControllerView,
  GameAward,
  GameBot,
  GameDefinition,
  GameEvent,
  GameManifest,
  GameRecap,
  GameResults,
  GameStateBase,
  InitContext,
  PhaseInfo,
  PlayerInfo,
  PlayerStatus,
  PushedView,
  RecapContext,
  RecapFile,
  Rng,
  RngState,
  SettingSpec,
  Settings,
  SettingValue,
  SpeechPart,
  SpeechRequest,
  TvView,
  ViewEnvelope,
  ViewPlayer,
  VipGameAction,
  GamePresence,
  PresenceMode,
} from '@partybox/shared';
// ADR-047: where everyone is, for games that switch features on it
export { PRESENCE_MODES } from '@partybox/shared';
export type {
  GameControllerProps,
  GameLoaders,
  GamePhoneModule,
  GameSettingsModule,
  GameShared,
  GameTvModule,
  GameTvProps,
} from './client-module';

// ── randomness (pure `[value, next]` helpers; `createRng` only for bots) ──────────────────────
export {
  createRng,
  hashString,
  nextFloat,
  nextInt,
  pick,
  seedRng,
  shuffle,
} from '@partybox/shared';

// ── reducer helpers ──────────────────────────────────────────────────────────────────────────
export {
  allConnectedDone,
  applyVip,
  connectedIds,
  enterPhase,
  hasPlayer,
  isPaused,
  isTimerFor,
  setConnected,
} from './timer';
export type { VipHandlers } from './timer';
export { addScores, buildResults, rank, speedPoints } from './scoring';
export type { RankedRow } from './scoring';
export { controllerEnvelope, envelope, viewPlayers } from './views';
export type { EnvelopeOptions } from './views';
export { compareCodeUnits } from './compare';
export { majorityPick, rotation, teamsFromSeed } from './turns';
export type { Teams } from './turns';

// ── answer packs (ADR-048); the matcher itself is `@partybox/game-sdk/match` ─────────────────
export {
  answerItemSchema,
  answerLangSchema,
  answerPackSchema,
  checkAnswerPack,
} from './answer-pack';
export type { AnswerItem, AnswerPack, AnswerPackOptions, AnswerPackReport } from './answer-pack';

// UI primitives live in `@partybox/game-sdk/ui` (ADR-023): this entry point stays free of React
// and CSS so game server code can be loaded by Node (server, sim, contract tests).

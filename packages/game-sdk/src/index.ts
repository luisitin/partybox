// Public surface of @partybox/game-sdk: everything a game is allowed to import (ADR-009).
// Contract + helpers from shared, then UI primitives (docs/DESIGN_SYSTEM.md).
export { PARTYBOX_VERSION } from '@partybox/shared';
export type { GameClientModule, GameControllerProps, GameTvProps } from './client-module';

// UI: shared
export { Avatar, avatarColorVar } from './ui/Avatar';
export type { AvatarProps } from './ui/Avatar';
export { PlayerChip } from './ui/PlayerChip';
export type { PlayerChipProps } from './ui/PlayerChip';
export { ServerClockProvider, useSecondsLeft, useServerNow } from './ui/clock';

// UI: TV
export { Stage } from './tv/Stage';
export type { StageProps } from './tv/Stage';
export { BigText } from './tv/BigText';
export type { BigTextProps } from './tv/BigText';
export { Timer } from './tv/Timer';
export type { TimerProps } from './tv/Timer';
export { PlayerChips } from './tv/PlayerChips';
export type { PlayerChipsProps } from './tv/PlayerChips';
export { Scoreboard } from './tv/Scoreboard';
export type { ScoreboardProps, ScoreboardRow } from './tv/Scoreboard';

// UI: controller
export { Screen } from './controller/Screen';
export type { ScreenProps } from './controller/Screen';
export { PrimaryButton } from './controller/PrimaryButton';
export type { PrimaryButtonProps } from './controller/PrimaryButton';
export { WaitingScreen } from './controller/WaitingScreen';
export type { WaitingScreenProps } from './controller/WaitingScreen';

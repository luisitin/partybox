// `@partybox/game-sdk/ui` — React primitives for games and the client shells (docs/DESIGN_SYSTEM.md).
// Kept separate from the pure entry point (ADR-023) because these import CSS modules.

// Component prop types (also available from the pure entry point).
export type { GameClientModule, GameControllerProps, GameTvProps } from './client-module';

// ── shared ───────────────────────────────────────────────────────────────────────────────────
export { Avatar, avatarColorVar } from './ui/Avatar';
export type { AvatarProps } from './ui/Avatar';
export { PlayerChip } from './ui/PlayerChip';
export type { PlayerChipProps } from './ui/PlayerChip';
export { ServerClockProvider, useSecondsLeft, useServerNow } from './ui/clock';
export { DeadlineBar } from './ui/DeadlineBar';
export { usePrefersReducedMotion } from './ui/motion';
export type { DeadlineBarProps } from './ui/DeadlineBar';

// ── TV ───────────────────────────────────────────────────────────────────────────────────────
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
export { Reveal } from './tv/Reveal';
export type { RevealItem, RevealProps } from './tv/Reveal';

// ── controller ───────────────────────────────────────────────────────────────────────────────
export { Screen } from './controller/Screen';
export type { ScreenProps } from './controller/Screen';
export { PrimaryButton } from './controller/PrimaryButton';
export type { PrimaryButtonProps } from './controller/PrimaryButton';
export { WaitingScreen } from './controller/WaitingScreen';
export type { WaitingScreenProps } from './controller/WaitingScreen';
export { TextAnswer } from './controller/TextAnswer';
export type { TextAnswerProps } from './controller/TextAnswer';
export { ChoiceGrid } from './controller/ChoiceGrid';
export type { Choice, ChoiceGridProps } from './controller/ChoiceGrid';
export { VoteList } from './controller/VoteList';
export type { VoteListProps, VoteOption } from './controller/VoteList';

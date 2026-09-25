// S-003: Bingo's panel in the lobby's 🎨 sheet — the card style and Motion, set up while waiting.
// Its own download (ADR-050): fetched when a player opens the panel, not with the game.
import type { GameSettingsModule } from '@partybox/game-sdk/ui';
import { PhonePanel } from './PhonePanel';

export const settings: GameSettingsModule = { PhoneSettings: PhonePanel };

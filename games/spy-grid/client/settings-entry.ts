// Spy Grid's panel in the lobby's 🎨 sheet. Its own download (ADR-050): fetched when a player
// opens the panel, not with the game.
import type { GameSettingsModule } from '@partybox/game-sdk/ui';
import { PhonePanel } from './PhonePanel';

export const settings: GameSettingsModule = { PhoneSettings: PhonePanel };

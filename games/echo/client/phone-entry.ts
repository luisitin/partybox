// Echo's phone entry (ADR-050): downloaded once the game is chosen, never by the TV. No
// PhoneStage: its component gets no send/skip, so the Controller renders the result stage itself
// in phone-only rooms and keeps the VIP's buttons (NOTES.md).
import type { GamePhoneModule } from '@partybox/game-sdk/ui';
import { Controller } from './Controller';
import { shared } from './shared';

export const phone: GamePhoneModule = { ...shared, Controller };

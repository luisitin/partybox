// Herd Mind's phone entry (ADR-050): downloaded once the game is chosen, never by the TV. The
// stage phases on a phone without a TV are drawn by the Controller itself (it keeps the VIP's
// buttons, which PhoneStage has no way to offer) — docs/game-pack/herd-mind/NOTES.md.
import type { GamePhoneModule } from '@partybox/game-sdk/ui';
import { Controller } from './Controller';
import { shared } from './shared';

export const phone: GamePhoneModule = { ...shared, Controller };

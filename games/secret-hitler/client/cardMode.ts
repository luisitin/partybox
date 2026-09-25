// How this game's secret things open on a phone (the dossier, the card rows). The owner's play-test
// (2026-09-24): tap to show and tap to hide is the default here, because holding felt hard to
// read. It reads the SDK SecretCard's device preference (`partybox:secret-card`) directly, since
// the SDK's getter answers 'hold' when nothing is stored: only a phone whose player chose "hold"
// keeps holding.
import type { SecretCardMode } from '@partybox/game-sdk/ui/secret-card';

const KEY = 'partybox:secret-card';

export function getSecretCardMode(): SecretCardMode {
  try {
    return localStorage.getItem(KEY) === 'hold' ? 'hold' : 'tap';
  } catch {
    return 'tap';
  }
}

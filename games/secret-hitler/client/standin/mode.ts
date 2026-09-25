// STAND-IN for the SDK's getSecretCardMode (@partybox/game-sdk/ui/secret-card, Imposter's; not on
// main yet): the phone's hold / tap preference for secret cards, read from the same storage key so
// the swap changes nothing for players.
const KEY = 'partybox:secret-card';

export type SecretCardMode = 'hold' | 'tap';

export function getSecretCardMode(): SecretCardMode {
  try {
    return localStorage.getItem(KEY) === 'tap' ? 'tap' : 'hold';
  } catch {
    return 'hold';
  }
}

/** Tap mode: a revealed card turns back by itself after this long. */
export const AUTO_HIDE_MS = 5000;

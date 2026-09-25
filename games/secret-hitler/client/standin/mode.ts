// How this game's secret things open on a phone (the dossier, the card rows). The owner's play-test
// (2026-09-24): tap to show and tap to hide is the default, because holding felt hard to read. A
// phone whose player chose "hold" in the SecretCard preference (the SDK's `partybox:secret-card`
// key, Imposter's; not on main yet) keeps holding.
const KEY = 'partybox:secret-card';

export type SecretCardMode = 'hold' | 'tap';

export function getSecretCardMode(): SecretCardMode {
  try {
    return localStorage.getItem(KEY) === 'hold' ? 'hold' : 'tap';
  } catch {
    return 'tap';
  }
}

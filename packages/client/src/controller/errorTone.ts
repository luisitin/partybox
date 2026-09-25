// I-674 B: which refusals mean "nothing happened" — a quiet grey line, no error sound. Red (and ⚠)
// is kept for real trouble: a bad link, a payload the server could not read.
import type { ErrorCode } from '@partybox/shared';

const QUIET: ReadonlySet<ErrorCode> = new Set<ErrorCode>([
  'not_vip',
  'not_in_room',
  'cannot_start',
  'invalid_input',
  'not_playing',
  'bots_not_supported',
  'bot_limit',
  'unknown_game',
]);

export function isQuietError(code: ErrorCode | string | undefined): boolean {
  return code !== undefined && QUIET.has(code as ErrorCode);
}

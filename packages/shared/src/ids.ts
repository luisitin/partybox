// Room codes, player names and avatar ids: the small vocabulary every layer must agree on.
import type { Rng } from './rng';

/** Upper-case letters without the look-alikes 0/O, 1/I/L. Four of these = 234,256 codes. */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ';
export const ROOM_CODE_LENGTH = 4;

export function normalizeRoomCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isRoomCode(code: string): boolean {
  if (code.length !== ROOM_CODE_LENGTH) return false;
  for (const ch of code) if (!ROOM_CODE_ALPHABET.includes(ch)) return false;
  return true;
}

export function roomCodeFrom(rng: Rng): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) code += rng.pick([...ROOM_CODE_ALPHABET]);
  return code;
}

export const PLAYER_NAME_MIN = 1;
export const PLAYER_NAME_MAX = 16;

/** Character class of code points to strip from names: C0/C1 controls, zero-width, bidi, BOM. */
const INVISIBLE = new RegExp(
  `[${cp(0x0, 0x1f)}${cp(0x7f, 0x9f)}${cp(0x200b, 0x200f)}${cp(0x2028, 0x202e)}${cp(0x2060, 0x206f)}${cp(0xfeff)}]`,
  'g',
);

function cp(from: number, to = from): string {
  return to === from
    ? String.fromCodePoint(from)
    : `${String.fromCodePoint(from)}-${String.fromCodePoint(to)}`;
}

/**
 * Trims, collapses whitespace and strips control / zero-width / bidi characters. Returns null when
 * nothing usable remains or the result is longer than 16 code points. Case is preserved (uniqueness
 * is checked case-insensitively by the engine).
 */
export function normalizeName(raw: string): string | null {
  const cleaned = raw.replace(INVISIBLE, '').replace(/\s+/g, ' ').trim();
  const length = Array.from(cleaned).length;
  if (length < PLAYER_NAME_MIN || length > PLAYER_NAME_MAX) return null;
  return cleaned;
}

export function nameKey(name: string): string {
  return name.toLocaleLowerCase();
}

/** Built-in avatar set; the client ships one SVG per id. Chip colour = index % 8. */
export const AVATAR_IDS = [
  'fox',
  'owl',
  'frog',
  'cat',
  'panda',
  'koala',
  'penguin',
  'octopus',
  'lion',
  'bee',
  'whale',
  'sloth',
  'robot',
  'ghost',
  'dino',
  'unicorn',
  // I-079 A: seasonal faces — valid every day (a chip never breaks), offered in their month.
  'pumpkin',
  'snowflake',
  'heart',
] as const;

/** I-079 A: the everyday sixteen (what the join grid shows out of season). */
export const EVERYDAY_AVATAR_IDS = AVATAR_IDS.slice(0, 16);
export const SEASONAL_AVATARS: Record<number, AvatarId> = {
  10: 'pumpkin',
  12: 'snowflake',
  2: 'heart',
};
/** The seasonal face for a date's month, if any. */
export function seasonalAvatarId(date: Date = new Date()): AvatarId | null {
  return SEASONAL_AVATARS[date.getMonth() + 1] ?? null;
}

export type AvatarId = (typeof AVATAR_IDS)[number];

export function isAvatarId(id: string): id is AvatarId {
  return (AVATAR_IDS as readonly string[]).includes(id);
}

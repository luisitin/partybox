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

/** I-080 A: whole codes the room must never be called (the alphabet has no I, L or O). */
const BANNED_CODES: ReadonlySet<string> = new Set(['FUCK','CUNT','ARSE','TWAT','CRAP','COCK','KNOB','WANK','JERK','DAMN','DUMB','RAPE','ANUS','BUTT','FART','POOP','SUCK','SEXY','PUSS','SLUT','HOMO','FAGS','SPAZ','CUMS','DYKE','KYKE','NAZY','PAKY','GAYS','HELL','DEAD','KYSS','SHAG','MUFF','TURD','WHAT','NUTS','JUGS','BUMS','PEDO','DRUG','METH','HEAD','SCUM','DUNG','SNOT','PUKE']);
/** I-080 B: stems a code must never contain. */
const BANNED_STEMS: readonly string[] = ['ASS','SEX','CUM','FAG','NEG','JEW','KKK','TIT','DIK','FUK','FUC','CNT','JIZ','HOR','NIG','WTF','FML','STD','HIV','DIE','PEE','POO','GAY','WOG','SPK'];
export function isCleanRoomCode(code: string): boolean {
  if (BANNED_CODES.has(code)) return false;
  for (const stem of BANNED_STEMS) if (code.includes(stem)) return false;
  return true;
}

/** A code that is clean: rerolls like the host does against collisions (bounded: ≤ 0.05 % hit). */
export function cleanRoomCodeFrom(rng: Rng): string {
  let code = roomCodeFrom(rng);
  for (let i = 0; i < 50 && !isCleanRoomCode(code); i++) code = roomCodeFrom(rng);
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
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export function isAvatarId(id: string): id is AvatarId {
  return (AVATAR_IDS as readonly string[]).includes(id);
}

// The 16 built-in avatars as inline SVG (no image files, ADR-012). Each is a coloured disc with a
// simple face so it reads at 40 px on a phone and 72 px on a TV. Colour = index % 8 (design system).
import { createContext, useContext, useMemo } from 'react';
import type { JSX, ReactNode } from 'react';
import { AVATAR_IDS } from '@partybox/shared';

export interface AvatarProps {
  /** A face id — or `photo:<playerId>` (I-031): the picture comes from `AvatarPhotos`. */
  avatarId: string;
  /** A photo avatar to show instead of the face (a JPEG data URL — the join form's preview). */
  photo?: string;
  size?: number | string;
  className?: string;
  /** Rendered dimmer (disconnected / spectator). */
  dim?: boolean;
}

/** The room's photo avatars by player id (I-031, the owner: "upload your own photo"). The shell
 *  provides it from the room snapshot; a `photo:<id>` avatar id anywhere resolves through it. */
const PhotoContext = createContext<ReadonlyMap<string, string>>(new Map());
const PHOTO_PREFIX = 'photo:';

export function AvatarPhotos({
  players,
  children,
}: {
  players?: readonly { id: string; photo?: string }[];
  children: ReactNode;
}): JSX.Element {
  const map = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of players ?? []) if (p.photo) m.set(p.id, p.photo);
    return m;
  }, [players]);
  return <PhotoContext.Provider value={map}>{children}</PhotoContext.Provider>;
}

const INK = '#1a0b12';
const LIGHT = '#fff7fb';

const eyes = (dx = 9, y = 30, r = 3.2): JSX.Element => (
  <>
    <circle cx={32 - dx} cy={y} r={r} fill={INK} />
    <circle cx={32 + dx} cy={y} r={r} fill={INK} />
  </>
);
const smile = (w = 8, y = 41): JSX.Element => (
  <path
    d={`M${32 - w} ${y} q${w} ${w * 0.9} ${w * 2} 0`}
    stroke={INK}
    strokeWidth={3}
    fill="none"
    strokeLinecap="round"
  />
);

const ART: Record<string, JSX.Element> = {
  fox: (
    <>
      <path d="M14 30 L18 12 L30 24 Z M50 30 L46 12 L34 24 Z" fill={INK} opacity={0.35} />
      {eyes(9, 32)}
      <ellipse cx={32} cy={42} rx={4} ry={3} fill={INK} />
    </>
  ),
  owl: (
    <>
      <circle cx={23} cy={30} r={9} fill={LIGHT} />
      <circle cx={41} cy={30} r={9} fill={LIGHT} />
      {eyes(9, 30, 4)}
      <path d="M32 36 l-4 6 h8 z" fill={INK} />
    </>
  ),
  frog: (
    <>
      <circle cx={22} cy={20} r={7} fill={LIGHT} />
      <circle cx={42} cy={20} r={7} fill={LIGHT} />
      {eyes(10, 20)}
      {smile(11, 38)}
    </>
  ),
  cat: (
    <>
      <path d="M16 26 L18 10 L30 22 Z M48 26 L46 10 L34 22 Z" fill={INK} opacity={0.35} />
      {eyes(9, 31, 3)}
      <path d="M26 42 q6 5 12 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M12 38 h12 M40 38 h12" stroke={INK} strokeWidth={2} opacity={0.6} />
    </>
  ),
  panda: (
    <>
      <circle cx={22} cy={30} r={8} fill={INK} />
      <circle cx={42} cy={30} r={8} fill={INK} />
      {eyes(10, 30, 2.5)}
      <circle cx={22} cy={30} r={2.5} fill={LIGHT} />
      <circle cx={42} cy={30} r={2.5} fill={LIGHT} />
      {smile(6, 42)}
    </>
  ),
  koala: (
    <>
      <circle cx={13} cy={26} r={9} fill={INK} opacity={0.35} />
      <circle cx={51} cy={26} r={9} fill={INK} opacity={0.35} />
      {eyes(9, 29)}
      <ellipse cx={32} cy={41} rx={6} ry={4.5} fill={INK} />
    </>
  ),
  penguin: (
    <>
      <ellipse cx={32} cy={38} rx={14} ry={17} fill={LIGHT} />
      {eyes(7, 27)}
      <path d="M32 33 l-5 5 h10 z" fill={INK} />
    </>
  ),
  octopus: (
    <>
      {eyes(9, 30, 4)}
      <path
        d="M14 46 q4 8 9 0 q4 8 9 0 q4 8 9 0 q4 8 9 0"
        stroke={INK}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  lion: (
    <>
      <circle cx={32} cy={32} r={26} fill={INK} opacity={0.25} />
      <circle cx={32} cy={32} r={18} fill="currentColor" />
      {eyes(7, 29)}
      <ellipse cx={32} cy={38} rx={3.5} ry={2.5} fill={INK} />
    </>
  ),
  bee: (
    <>
      <rect x={14} y={36} width={36} height={6} fill={INK} opacity={0.6} />
      <rect x={14} y={46} width={36} height={5} fill={INK} opacity={0.6} />
      {eyes(9, 27)}
      <path d="M22 14 l4 8 M42 14 l-4 8" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  whale: (
    <>
      <path d="M8 40 q24 -30 48 0 q-24 12 -48 0 z" fill={LIGHT} opacity={0.9} />
      {eyes(11, 34)}
      <path
        d="M30 12 q2 -8 6 0 q2 -8 4 2"
        stroke={INK}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  sloth: (
    <>
      <path d="M12 30 q20 -6 40 0 v6 q-20 -6 -40 0 z" fill={INK} opacity={0.35} />
      {eyes(9, 33, 2.5)}
      {smile(5, 42)}
    </>
  ),
  robot: (
    <>
      <rect x={16} y={20} width={32} height={28} rx={5} fill={LIGHT} />
      <rect x={22} y={28} width={7} height={7} fill={INK} />
      <rect x={35} y={28} width={7} height={7} fill={INK} />
      <rect x={24} y={40} width={16} height={3} fill={INK} />
      <path d="M32 20 v-8" stroke={INK} strokeWidth={3} />
      <circle cx={32} cy={10} r={3} fill={INK} />
    </>
  ),
  ghost: (
    <>
      <path d="M16 54 v-22 a16 16 0 0 1 32 0 v22 l-5 -4 -6 4 -5 -4 -6 4 -5 -4 z" fill={LIGHT} />
      {eyes(7, 32, 3.5)}
      <ellipse cx={32} cy={42} rx={3} ry={4} fill={INK} />
    </>
  ),
  dino: (
    <>
      <path d="M18 14 l6 -8 l6 8 l6 -8 l6 8 z" fill={INK} opacity={0.35} />
      {eyes(9, 30)}
      <path d="M22 42 h20 l-3 5 h-14 z" fill={INK} />
    </>
  ),
  // I-079 A: the seasonal three.
  pumpkin: (
    <>
      <path d="M30 14 q2 -6 8 -6" stroke={INK} strokeWidth={3} fill="none" />
      <path d="M20 26 l6 6 l-12 0 z M44 26 l-6 6 l12 0 z" fill={INK} />
      <path d="M18 42 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l2 6 h-32 z" fill={INK} />
    </>
  ),
  snowflake: (
    <>
      <path d="M32 10 v44 M13 21 l38 22 M13 43 l38 -22" stroke={LIGHT} strokeWidth={3} />
      {eyes(8, 30)}
      <path d="M26 42 q6 5 12 0" stroke={INK} strokeWidth={3} fill="none" />
    </>
  ),
  heart: (
    <>
      <path d="M32 52 l-14 -14 a8 8 0 0 1 14 -10 a8 8 0 0 1 14 10 z" fill={LIGHT} />
      {eyes(6, 32, 3)}
      <path d="M28 41 q4 3 8 0" stroke={INK} strokeWidth={2.5} fill="none" />
    </>
  ),
  unicorn: (
    <>
      <path d="M32 6 l6 16 h-12 z" fill={LIGHT} />
      {eyes(9, 32)}
      {smile(7, 42)}
      <circle cx={20} cy={40} r={3} fill={LIGHT} opacity={0.7} />
      <circle cx={44} cy={40} r={3} fill={LIGHT} opacity={0.7} />
    </>
  ),
};

/** I-043: a bot's skin — `robot:<n>` — its colour slot and a small variation on the face. */
const ROBOT_SKINS = 6;
export function robotSkin(avatarId: string): number | null {
  if (!avatarId.startsWith('robot:')) return null;
  const n = Number(avatarId.slice(6));
  return Number.isFinite(n) ? ((n % ROBOT_SKINS) + ROBOT_SKINS) % ROBOT_SKINS : 0;
}
function robotArt(skin: number): JSX.Element {
  const eyes =
    skin % 3 === 0 ? (
      <>
        <rect x={22} y={28} width={7} height={7} fill={INK} />
        <rect x={35} y={28} width={7} height={7} fill={INK} />
      </>
    ) : skin % 3 === 1 ? (
      <>
        <circle cx={25.5} cy={31.5} r={3.5} fill={INK} />
        <circle cx={38.5} cy={31.5} r={3.5} fill={INK} />
      </>
    ) : (
      <rect x={21} y={28} width={22} height={6} rx={3} fill={INK} />
    );
  return (
    <>
      <rect x={16} y={20} width={32} height={28} rx={skin >= 3 ? 10 : 5} fill={LIGHT} />
      {eyes}
      <rect x={24} y={40} width={16} height={3} fill={INK} />
      <path d="M32 20 v-8" stroke={INK} strokeWidth={3} />
      <circle cx={32} cy={10} r={3} fill={INK} />
      {skin % 2 === 1 ? (
        <>
          <path d="M22 20 v-6" stroke={INK} strokeWidth={2} />
          <circle cx={22} cy={12} r={2} fill={INK} />
        </>
      ) : null}
    </>
  );
}

export function avatarColorVar(avatarId: string): string {
  // I-043 A: a bot's skin picks its colour slot.
  const skin = robotSkin(avatarId);
  if (skin !== null) return `var(--pb-player-${(skin % 8) + 1})`;
  // A photo player has no face colour: a stable one from the id (I-031).
  const index = avatarId.startsWith(PHOTO_PREFIX)
    ? [...avatarId].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 8, 0)
    : Math.max(0, (AVATAR_IDS as readonly string[]).indexOf(avatarId));
  return `var(--pb-player-${(index % 8) + 1})`;
}

export function Avatar({
  avatarId,
  photo,
  size = 'var(--pb-chip-size)',
  className,
  dim,
}: AvatarProps): JSX.Element {
  const photos = useContext(PhotoContext);
  const src =
    photo ??
    (avatarId.startsWith(PHOTO_PREFIX)
      ? photos.get(avatarId.slice(PHOTO_PREFIX.length))
      : undefined);
  if (src)
    return (
      <img
        src={src}
        alt=""
        role="img"
        aria-label="photo avatar"
        width={typeof size === 'number' ? size : undefined}
        height={typeof size === 'number' ? size : undefined}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          opacity: dim ? 0.45 : 1,
          flexShrink: 0,
          display: 'block',
        }}
      />
    );
  const skin = robotSkin(avatarId);
  const art = skin !== null ? robotArt(skin) : (ART[avatarId] ?? ART['ghost']);
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`avatar ${avatarId}`}
      style={{ color: avatarColorVar(avatarId), opacity: dim ? 0.45 : 1, flexShrink: 0 }}
    >
      <circle cx={32} cy={32} r={31} fill="currentColor" />
      {art}
    </svg>
  );
}

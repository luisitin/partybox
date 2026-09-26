// Parliament Noir icons (SPEC §7.5): the four powers, the veto, and the brass plates. Original
// line art drawn for this game; `currentColor` so the surrounding text colour carries them.
import type { JSX } from 'react';
import type { PowerKind } from '../server/types';

export function PowerIcon({
  kind,
  size = 40,
}: {
  kind: PowerKind;
  size?: number | string;
}): JSX.Element {
  const s = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 5,
    strokeLinecap: 'round' as const,
  };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      {kind === 'investigate' ? (
        <>
          <path d="M18 26 h30 l8 8 v44 h-38z" style={s} />
          <path d="M26 44 h20 M26 54 h14" style={{ ...s, strokeWidth: 3 }} />
          <circle cx="62" cy="58" r="14" style={s} />
          <path d="M72 68 l14 14" style={{ ...s, strokeWidth: 8 }} />
        </>
      ) : kind === 'special' ? (
        <>
          <rect x="44" y="18" width="40" height="22" rx="4" style={s} />
          <path d="M58 29 h12" style={{ ...s, strokeWidth: 3 }} />
          <path
            d="M14 78 c10 -2 18 -10 26 -20 l10 -12 c3 -4 9 -1 7 4 l-6 12 h18 c5 0 5 7 0 7 h-14"
            style={s}
          />
        </>
      ) : kind === 'peek' ? (
        <>
          <rect
            x="16"
            y="46"
            width="20"
            height="32"
            rx="3"
            style={s}
            transform="rotate(-10 26 62)"
          />
          <rect x="40" y="44" width="20" height="32" rx="3" style={s} />
          <rect
            x="64"
            y="46"
            width="20"
            height="32"
            rx="3"
            style={s}
            transform="rotate(10 74 62)"
          />
          <path d="M26 24 q24 -18 48 0 q-24 18 -48 0z" style={s} />
          <circle cx="50" cy="24" r="5" style={{ fill: 'currentColor' }} />
        </>
      ) : (
        <>
          <path d="M30 14 l-12 72 M70 14 l12 72" style={{ ...s, opacity: 0.35, strokeWidth: 3 }} />
          <path d="M36 44 v-16 h28 v16 M32 44 h36 v8 h-36z M36 52 v28 M64 52 v28" style={s} />
          <path d="M20 86 h60" style={{ ...s, strokeWidth: 3, opacity: 0.6 }} />
        </>
      )}
    </svg>
  );
}

/** The veto: two crossed-out decrees. */
export function VetoIcon({ size = 40 }: { size?: number | string }): JSX.Element {
  const s = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 5,
    strokeLinecap: 'round' as const,
  };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <rect x="18" y="20" width="30" height="42" rx="3" style={s} transform="rotate(-8 33 41)" />
      <rect x="52" y="20" width="30" height="42" rx="3" style={s} transform="rotate(8 67 41)" />
      <path d="M14 16 l72 60 M86 16 l-72 60" style={{ ...s, strokeWidth: 7 }} />
    </svg>
  );
}

/** Brass plates: a star for the President, a key for the Chancellor. */
export function PlateIcon({
  kind,
  size = 22,
}: {
  kind: 'president' | 'chancellor';
  size?: number | string;
}): JSX.Element {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      {kind === 'president' ? (
        <path
          d="M50 8 l12 28 30 3 -23 20 7 30 -26 -16 -26 16 7 -30 -23 -20 30 -3z"
          style={{ fill: 'currentColor' }}
        />
      ) : (
        <>
          <circle
            cx="32"
            cy="50"
            r="20"
            style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 10 }}
          />
          <path
            d="M52 50 h40 M78 50 v16 M90 50 v12"
            style={{ stroke: 'currentColor', strokeWidth: 10 }}
          />
        </>
      )}
    </svg>
  );
}

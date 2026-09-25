// Parliament Noir art (SPEC §7.5): every emblem is original inline SVG drawn for this game — a
// lantern for the Liberals, a serpent around a cracked column for the Fascists, a cracked theatre
// mask for Hitler. No real symbols, flags, insignia or likenesses (§7.2). Colours come from the
// game's tokens through `style`, so every platform theme works.
import { useId } from 'react';
import type { CSSProperties, JSX } from 'react';
import type { Party } from '../server/types';

const tok = (name: string): string => `var(--sh-${name})`;

/** A steady flame in a lantern, inside a ring. */
export function LanternEmblem({
  size = 48,
  color,
}: {
  size?: number | string;
  color?: string;
}): JSX.Element {
  const c = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" style={{ color: c }}>
      <circle cx="50" cy="50" r="45" style={{ fill: 'none', stroke: c, strokeWidth: 5 }} />
      <path d="M40 22 h20 l-3 8 h-14z" style={{ fill: c }} />
      <path d="M46 16 a4 4 0 0 1 8 0 v6 h-8z" style={{ fill: 'none', stroke: c, strokeWidth: 3 }} />
      <rect
        x="36"
        y="30"
        width="28"
        height="36"
        rx="4"
        style={{ fill: 'none', stroke: c, strokeWidth: 4 }}
      />
      <path d="M50 38 C57 47 56 56 50 60 C44 56 43 47 50 38z" style={{ fill: c }} />
      <path d="M33 66 h34 l-4 10 h-26z" style={{ fill: c }} />
      <path d="M36 30 v36 M64 30 v36" style={{ stroke: c, strokeWidth: 2 }} />
    </svg>
  );
}

/** A serpent coiled around a cracked column. */
export function SerpentEmblem({
  size = 48,
  color,
}: {
  size?: number | string;
  color?: string;
}): JSX.Element {
  const c = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" style={{ color: c }}>
      <path
        d="M38 14 h24 v6 h-3 v58 h3 v8 h-24 v-8 h3 v-58 h-3z"
        style={{ fill: 'none', stroke: c, strokeWidth: 4 }}
      />
      <path d="M48 26 l4 10 -5 8 6 9 -4 7" style={{ fill: 'none', stroke: c, strokeWidth: 2.5 }} />
      <path
        d="M70 20 c-8 -6 -18 2 -12 8 c8 6 10 10 -8 14 c-18 4 -22 10 0 14 c18 4 18 10 0 14 c-14 3 -18 8 -8 12"
        style={{ fill: 'none', stroke: c, strokeWidth: 6, strokeLinecap: 'round' }}
      />
      <circle cx="68" cy="19" r="4.5" style={{ fill: c }} />
      <path d="M72 17 l6 -3 M72 20 l6 1" style={{ stroke: c, strokeWidth: 1.8 }} />
    </svg>
  );
}

/** Hitler: a black silhouette behind a white theatre mask split by a crack (§7.5). */
export function MaskEmblem({ size = 48 }: { size?: number | string }): JSX.Element {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <path
        d="M50 8 C28 8 20 28 22 46 C24 66 36 80 50 84 C64 80 76 66 78 46 C80 28 72 8 50 8z"
        style={{ fill: tok('ink') }}
      />
      <path
        d="M50 22 C34 22 30 36 32 48 C34 62 42 72 50 74 C58 72 66 62 68 48 C70 36 66 22 50 22z"
        style={{ fill: tok('paper') }}
      />
      <path
        d="M38 44 q5 -5 10 0 q-5 3 -10 0z M52 44 q5 -5 10 0 q-5 3 -10 0z"
        style={{ fill: tok('ink') }}
      />
      <path d="M44 62 q6 -4 12 0" style={{ fill: 'none', stroke: tok('ink'), strokeWidth: 2.5 }} />
      <path
        d="M50 22 l-3 12 5 8 -4 10 5 9 -3 13"
        style={{ fill: 'none', stroke: tok('ink'), strokeWidth: 2.5 }}
      />
      <path
        d="M22 88 C30 78 40 76 50 76 C60 76 70 78 78 88 v6 h-56z"
        style={{ fill: tok('ink') }}
      />
    </svg>
  );
}

export function PartyEmblem({
  party,
  size,
  color,
}: {
  party: Party;
  size?: number | string;
  color?: string;
}): JSX.Element {
  return party === 'L' ? (
    <LanternEmblem size={size} color={color} />
  ) : (
    <SerpentEmblem size={size} color={color} />
  );
}

/** A scalloped wax seal carrying the party emblem. */
export function Seal({ party, size = 44 }: { party: Party; size?: number | string }): JSX.Element {
  const scallops = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `${50 + Math.cos(a) * 44},${50 + Math.sin(a) * 44}`;
  });
  const wax = party === 'L' ? tok('liberal') : tok('fascist');
  const ink = party === 'L' ? tok('liberal-ink') : tok('fascist-ink');
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      {scallops.map((p, i) => {
        const [x, y] = p.split(',');
        return <circle key={i} cx={x} cy={y} r="9" style={{ fill: wax }} />;
      })}
      <circle cx="50" cy="50" r="42" style={{ fill: wax }} />
      <circle
        cx="50"
        cy="50"
        r="34"
        style={{ fill: 'none', stroke: ink, strokeWidth: 2, opacity: 0.6 }}
      />
      <g transform="translate(22 22) scale(0.56)">
        <PartyEmblem party={party} size={100} color={ink} />
      </g>
    </svg>
  );
}

/** Engraved guilloché rosette for card backs: overlapping sine rings (generated once). */
const GUILLOCHE = Array.from({ length: 7 }, (_, ring) => {
  const pts: string[] = [];
  for (let i = 0; i <= 180; i++) {
    const t = (i / 180) * Math.PI * 2;
    const r = 18 + ring * 4 + 3.2 * Math.sin(12 * t + ring * 0.7);
    pts.push(`${(50 + r * Math.cos(t)).toFixed(2)},${(70 + r * Math.sin(t) * 1.35).toFixed(2)}`);
  }
  return `M${pts.join(' L')}Z`;
});

export function CardBackArt(): JSX.Element {
  return (
    <svg
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="100" height="140" style={{ fill: tok('wood') }} />
      <rect
        x="6"
        y="6"
        width="88"
        height="128"
        rx="6"
        style={{ fill: 'none', stroke: tok('brass'), strokeWidth: 1.2, opacity: 0.8 }}
      />
      {GUILLOCHE.map((d, i) => (
        <path
          key={i}
          d={d}
          style={{ fill: 'none', stroke: tok('brass'), strokeWidth: 0.45, opacity: 0.55 }}
        />
      ))}
      <circle cx="50" cy="70" r="9" style={{ fill: tok('brass') }} />
      <path
        d="M50 63 l2 5 5 .4 -4 3.2 1.4 5 -4.4 -2.8 -4.4 2.8 1.4 -5 -4 -3.2 5 -.4z"
        style={{ fill: tok('wood') }}
      />
    </svg>
  );
}

/** A rubber stamp: a double frame and the word, with uneven ink (a static turbulence filter). */
export function Stamp({
  text,
  tone = 'alarm',
  className,
  style,
}: {
  text: string;
  tone?: 'alarm' | 'brass' | 'liberal' | 'fascist' | 'ink';
  className?: string;
  style?: CSSProperties;
}): JSX.Element {
  const id = useId().replace(/:/g, '');
  const color = tok(tone);
  const w = Math.max(240, text.length * 34 + 60);
  return (
    <svg viewBox={`0 0 ${w} 110`} className={className} style={style} role="img" aria-label={text}>
      <defs>
        <filter id={`ink${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.25" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#ink${id})`}>
        <rect
          x="6"
          y="6"
          width={w - 12}
          height="98"
          rx="10"
          style={{ fill: 'none', stroke: color, strokeWidth: 7 }}
        />
        <rect
          x="18"
          y="18"
          width={w - 36}
          height="74"
          rx="6"
          style={{ fill: 'none', stroke: color, strokeWidth: 2.5 }}
        />
        <text
          x={w / 2}
          y="74"
          textAnchor="middle"
          style={{
            fill: color,
            fontFamily: 'var(--sh-font-display)',
            fontSize: 64,
            letterSpacing: 4,
          }}
        >
          {text}
        </text>
      </g>
    </svg>
  );
}

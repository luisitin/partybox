// A player's card on the TV: the face side (avatar + name), turned in 3D to the role side when the
// role is revealed (`pb-flip`-style rotateY; transform only, so Chromium keeps the 3D context).
// Hidden roles (`revealRoles` off) flip to "?". `delayMs` staggers a ripple (the end board).
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { CastEntry } from '../server/views-common';
import type { Role } from '../server/types';
import { roleText } from './lookup';
import { STRINGS } from './strings';
import styles from './RoleCard.module.css';

export interface RoleCardProps {
  name: string;
  avatarId: string;
  cast: readonly CastEntry[];
  role: Role | null;
  flipped: boolean;
  size?: 'hero' | 'medium' | 'small' | 'dense' | 'compact';
  delayMs?: number;
  /** Winner side glow on the end board. */
  won?: boolean;
  dead?: boolean;
  /** A card that mounts already revealed turns this long after it lands (deal, then flip). */
  flipAfterMs?: number;
  /** The verdict pairs its spoken role with the turning card. */
  fastFlip?: boolean;
}

export function RoleCard(p: RoleCardProps): JSX.Element {
  const L = useT(STRINGS);
  const text = roleText(p.cast, p.role);
  const wolf = p.role === 'wolf';
  // The turn is a transition, so it needs a face-up frame first: a card mounted revealed (the
  // verdict's card, the end board) lands face up and turns a beat later instead of appearing
  // already turned.
  const [turned, setTurned] = useState(false);
  const after = p.flipAfterMs ?? 80;
  useEffect(() => {
    if (!p.flipped) return undefined;
    const h = setTimeout(() => setTurned(true), after);
    return () => clearTimeout(h);
  }, [p.flipped, after]);
  const shown = p.flipped && turned;
  return (
    <div
      className={`${styles.card} ${styles[p.size ?? 'hero']} ${shown ? styles.flipped : ''} ${p.won ? styles.won : ''} ${p.fastFlip ? styles.fastFlip : ''}`}
      style={{ '--delay': `${p.delayMs ?? 0}ms` } as CSSProperties}
    >
      <div className={styles.flipper}>
        <div className={`${styles.side} ${styles.front}`}>
          <div className={styles.avatar}>
            <Avatar avatarId={p.avatarId} size="100%" dim={p.dead} />
          </div>
          <span className={styles.name}>{p.name}</span>
        </div>
        <div className={`${styles.side} ${styles.back} ${wolf ? styles.wolf : ''}`}>
          <span className={styles.icon} aria-hidden="true">
            {text?.icon ?? '❔'}
          </span>
          <span className={styles.role}>{text ? L.sent(text.name) : '?'}</span>
          <span className={styles.owner}>{p.name}</span>
        </div>
      </div>
    </div>
  );
}

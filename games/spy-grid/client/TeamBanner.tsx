// TeamBanner (Part 00 §6) — STAND-IN until Tune In ships the SDK's; same idea: shape, name and
// colour always together, never a tint on a face. One side per team; the active side is lit
// (half-lit while its spymaster thinks, fully while its team guesses).
import type { JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import { SHAPE } from './model';
import type { Team } from './model';
import styles from './TeamBanner.module.css';
import { STRINGS } from './strings';

export interface TeamSide {
  team: Team;
  faces: readonly { id: string; avatarId: string; spy?: boolean; dim?: boolean }[];
  /** Agents still face down (null hides the count, e.g. in `teams`). */
  left: number | null;
  lit: 'off' | 'half' | 'on';
  wins?: number | null;
}

export function TeamBanner({
  side,
  surface,
  align = 'start',
}: {
  side: TeamSide;
  surface: 'tv' | 'phone';
  align?: 'start' | 'end';
}): JSX.Element {
  const L = useT(STRINGS);
  const name = side.team === 'sun' ? L('Sun') : L('Moon');
  return (
    <div
      className={`${styles.side} ${styles[side.team]} ${styles[surface]} ${styles[side.lit]} ${align === 'end' ? styles.end : ''}`}
    >
      <div className={styles.title}>
        <span className={styles.shape}>{SHAPE[side.team]}</span>
        <span className={styles.name}>{name}</span>
        {side.wins !== null && side.wins !== undefined && side.wins > 0 ? (
          <span className={styles.wins}>{'★'.repeat(side.wins)}</span>
        ) : null}
      </div>
      {side.left !== null ? (
        <div className={styles.left}>{L('{n} left', { n: side.left })}</div>
      ) : null}
      <div className={styles.faces}>
        {side.faces.map((f) => (
          <span key={f.id} className={`${styles.face} ${f.dim ? styles.dimFace : ''}`}>
            <Avatar avatarId={f.avatarId} size="100%" />
            {f.spy ? <span className={styles.spy}>🕶️</span> : null}
          </span>
        ))}
      </div>
    </div>
  );
}

// Local stand-in for Part 00 §6's `FacePicker` (Imposter owns the SDK one; NOTES: stand-ins). A grid
// of faces with names: the pick gets a ring and a ✓ (never colour alone), your own tile says "You",
// an optional last tile ("No one"). Three columns, so 15 faces fit an iPhone SE in five rows. The
// grid itself never marks a role: at night every phone draws the same grid (SPEC §10.10).
import type { JSX, ReactNode } from 'react';
import { Avatar } from '@partybox/game-sdk/ui';
import styles from './FaceGrid.module.css';

export interface Face {
  id: string;
  name: string;
  avatarId: string;
  connected?: boolean;
}

export interface FaceGridProps {
  faces: readonly Face[];
  selected: string | null;
  onPick: (id: string) => void;
  me?: string;
  meLabel?: string;
  /** A last tile that is not a face ("No one"): its id and label. */
  extra?: { id: string; label: string; glyph: string };
  disabled?: boolean;
  /** Something small under a face (a hunch bar). */
  under?: (id: string) => ReactNode;
  label: string;
}

export function FaceGrid({
  faces,
  selected,
  onPick,
  me,
  meLabel,
  extra,
  disabled,
  under,
  label,
}: FaceGridProps): JSX.Element {
  const count = faces.length + (extra ? 1 : 0);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`${styles.grid} ${count > 12 ? styles.dense : ''}`}
    >
      {faces.map((f, i) => {
        const on = selected === f.id;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-disabled={disabled}
            className={`${styles.tile} ${on ? styles.on : ''}`}
            style={{ animationDelay: `${Math.min(i, 15) * 24}ms` }}
            onClick={() => {
              if (!disabled && !on) onPick(f.id);
            }}
          >
            <span className={styles.face}>
              <Avatar avatarId={f.avatarId} size="100%" dim={f.connected === false} />
              <span className={styles.check} aria-hidden="true">
                ✓
              </span>
            </span>
            <span className={styles.name}>{f.name}</span>
            {f.id === me && meLabel ? <span className={styles.me}>{meLabel}</span> : null}
            {under ? under(f.id) : null}
          </button>
        );
      })}
      {extra ? (
        <button
          type="button"
          role="radio"
          aria-checked={selected === extra.id}
          aria-disabled={disabled}
          className={`${styles.tile} ${styles.extra} ${selected === extra.id ? styles.on : ''}`}
          onClick={() => {
            if (!disabled && selected !== extra.id) onPick(extra.id);
          }}
        >
          <span className={styles.face}>
            <span className={styles.glyph} aria-hidden="true">
              {extra.glyph}
            </span>
            <span className={styles.check} aria-hidden="true">
              ✓
            </span>
          </span>
          <span className={styles.name}>{extra.label}</span>
        </button>
      ) : null}
    </div>
  );
}

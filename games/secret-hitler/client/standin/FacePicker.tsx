// STAND-IN for the SDK's FacePicker (Part 00 §6 P6; Imposter owns it, not on main yet). Same props
// subset as the real one: a grid of faces, tap to pick one; a disabled tile shows its reason.
// The selected face gets a ring AND a ✓ — never colour alone.
import { Avatar } from '@partybox/game-sdk/ui';
import type { JSX } from 'react';
import styles from './standin.module.css';

export interface FaceOption {
  id: string;
  name: string;
  avatarId: string;
  /** Shown instead of a detail; the tile can't be picked. */
  disabledReason?: string;
}

export interface FacePickerProps {
  options: readonly FaceOption[];
  selected: readonly string[];
  onChange: (ids: string[]) => void;
  columns?: 1 | 2 | 3;
  locked?: boolean;
  /** Accessible name of the grid (translated by the caller). */
  label: string;
}

export function FacePicker({
  options,
  selected,
  onChange,
  columns,
  locked = false,
  label,
}: FacePickerProps): JSX.Element {
  const cols = columns ?? (options.length > 6 ? 3 : 2);
  return (
    <div role="radiogroup" aria-label={label} className={styles.grid} data-cols={cols}>
      {options.map((o) => {
        const on = selected.includes(o.id);
        const off = locked || o.disabledReason !== undefined;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={o.disabledReason ? `${o.name} · ${o.disabledReason}` : o.name}
            disabled={off}
            className={styles.tile}
            data-on={on || undefined}
            onClick={() => onChange([o.id])}
          >
            <Avatar avatarId={o.avatarId} size="3rem" dim={o.disabledReason !== undefined} />
            <span className={styles.name}>{o.name}</span>
            {o.disabledReason ? <span className={styles.reason}>{o.disabledReason}</span> : null}
            {on ? (
              <span className={styles.check} aria-hidden="true">
                ✓
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

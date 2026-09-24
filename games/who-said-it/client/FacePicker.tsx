// STAND-IN for the SDK's `FacePicker` (foundation §6 — the Imposter session owns it; swap when it
// lands on main, NOTES.md). A grid of faces with names: two columns up to eight faces, three above.
// A tap picks; a tap on another face changes the pick. The picked face gets a ring and a ✓ (never
// colour alone). Buttons are ≥ 44 px, never selectable, and a repeat tap on the pick sends nothing.
import type { JSX } from 'react';
import { Avatar } from '@partybox/game-sdk/ui';
import styles from './phone.module.css';

export interface Face {
  id: string;
  name: string;
  avatarId: string;
  connected: boolean;
}

export interface FacePickerProps {
  faces: readonly Face[];
  picked: string | null;
  onPick: (id: string) => void;
  /** Accessible name of the whole grid ("Who said it?"). */
  label: string;
  /** "Pick {name}" / "{name}, picked" for screen readers. */
  itemLabel: (face: Face, picked: boolean) => string;
}

export function FacePicker({
  faces,
  picked,
  onPick,
  label,
  itemLabel,
}: FacePickerProps): JSX.Element {
  const three = faces.length > 8;
  return (
    <ul className={`${styles.faces} ${three ? styles.facesThree : ''}`} aria-label={label}>
      {faces.map((f) => {
        const on = f.id === picked;
        return (
          <li key={f.id}>
            <button
              type="button"
              className={`${styles.faceBtn} ${on ? styles.facePicked : ''}`}
              aria-pressed={on}
              aria-label={itemLabel(f, on)}
              onClick={() => {
                if (!on) onPick(f.id);
              }}
            >
              <span className={styles.faceArt}>
                <Avatar avatarId={f.avatarId} size="100%" dim={!f.connected} />
                {on ? (
                  <span className={styles.faceTick} aria-hidden>
                    ✓
                  </span>
                ) : null}
              </span>
              <span className={styles.faceName}>{f.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

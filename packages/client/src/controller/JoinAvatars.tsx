// The join screen's avatar grid: the faces on offer today (I-079), which of them the room already
// wears (I-083) and the pick animation (I-031 A).
import type { JSX } from 'react';
import { Avatar } from '@partybox/game-sdk/ui';
import styles from './Join.module.css';

export interface JoinAvatarsProps {
  legend: string;
  ids: readonly string[];
  avatarId: string;
  onPick: (id: string) => void;
  /** I-083 A: faces someone in the room already has — badged, still pickable. */
  taken: ReadonlySet<string>;
  /** I-079 C: the face that is only here this month. */
  season: string | null;
  /** With a photo up the whole grid steps back. */
  photo: boolean;
}

export function JoinAvatars({
  legend,
  ids,
  avatarId,
  onPick,
  taken,
  season,
  photo,
}: JoinAvatarsProps): JSX.Element {
  return (
    <fieldset className={styles.avatars}>
      <legend className={styles.label}>{legend}</legend>
      {/* I-031 A: the pick pops (keyed on the pick, so it pops once per change) and the rest
          step back while one is chosen; with a photo up the whole grid steps back. */}
      <div
        className={`${styles.grid} ${styles.picking} ${photo ? styles.photoUp : ''}`}
        role="radiogroup"
      >
        {ids.map((id) => (
          <button
            key={id === avatarId ? `${id}:on` : id}
            type="button"
            role="radio"
            aria-checked={id === avatarId}
            aria-label={taken.has(id) ? `${id} (someone in the room has it)` : id}
            className={`${styles.avatarButton} ${id === avatarId ? styles.selected : ''}`}
            onClick={() => onPick(id)}
          >
            <Avatar avatarId={id} size={56} />
            {/* I-083 A: a face already in the room — still yours to pick. */}
            {taken.has(id) ? (
              <span className={styles.takenBadge} aria-hidden>
                in
              </span>
            ) : null}
            {/* I-079 C: the seasonal cell says why it is here. */}
            {id === season ? (
              <span className={styles.seasonTag} aria-hidden>
                this month
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

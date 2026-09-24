// The join screen's faces: the ones on offer today (I-079), which of them the room already wears
// (I-083) and the pick animation (I-031 A). I-793 F (design review): one sideways-swiping strip in
// the chosen colour instead of a four-column grid, so the whole form fits an iPhone SE; the picked
// face is scrolled into view when it starts off-strip (a remembered or random default).
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Avatar } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import styles from './Join.module.css';

/** A face's name in the device's language (the id when it has none: a new face reads as its id). */
function avatarName(id: string): string {
  return (t.avatars as Readonly<Record<string, string>>)[id] ?? id;
}

export interface JoinAvatarsProps {
  legend: string;
  ids: readonly string[];
  avatarId: string;
  /** I-793 F: the faces wear the colour picked below them. */
  tint: number;
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
  tint,
  onPick,
  taken,
  season,
  photo,
}: JoinAvatarsProps): JSX.Element {
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = strip.current;
    const cell = el?.querySelector<HTMLElement>('[aria-checked="true"]');
    if (!el || !cell) return;
    const left =
      cell.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft;
    // only when it is (partly) out of sight: a tap on a visible face never slides the strip
    if (left < el.scrollLeft || left + cell.offsetWidth > el.scrollLeft + el.clientWidth)
      el.scrollLeft = left - (el.clientWidth - cell.offsetWidth) / 2;
  }, [avatarId]);
  return (
    <fieldset className={styles.avatars}>
      <legend className={styles.label}>{legend}</legend>
      {/* I-031 A: the pick pops (keyed on the pick, so it pops once per change) and the rest
          step back while one is chosen; with a photo up the whole grid steps back. */}
      <div
        ref={strip}
        className={`${styles.grid} ${styles.picking} ${photo ? styles.photoUp : ''}`}
        role="radiogroup"
        aria-label={legend}
      >
        {ids.map((id) => (
          <button
            key={id === avatarId ? `${id}:on` : id}
            type="button"
            role="radio"
            aria-checked={id === avatarId}
            aria-label={taken.has(id) ? t.join.avatarTaken(avatarName(id)) : avatarName(id)}
            className={`${styles.avatarButton} ${id === avatarId ? styles.selected : ''}`}
            onClick={() => onPick(id)}
          >
            <Avatar avatarId={`${id}#${tint}`} size={52} />
            {/* I-083 A: a face already in the room — still yours to pick. */}
            {taken.has(id) ? (
              <span className={styles.takenBadge} aria-hidden>
                {t.join.takenBadge}
              </span>
            ) : null}
            {/* I-079 C: the seasonal cell says why it is here. */}
            {id === season ? (
              <span className={styles.seasonTag} aria-hidden>
                {t.join.thisMonth}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

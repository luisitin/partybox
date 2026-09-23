// I-086: the colour is its own choice beside the face — eight swatches (the player colours) that
// paint the portrait live; the join sends `face#tint`. C: colours someone in the room already wears
// are marked, and a fresh phone starts on a free one. Sits above the face grid so an iPhone SE sees
// it without scrolling (Session B's note, 2026-09-22).
import { useState } from 'react';
import type { JSX } from 'react';
import { avatarTint } from '@partybox/shared';
import { t } from '../i18n';
import styles from './Join.module.css';

const TINTS = [0, 1, 2, 3, 4, 5, 6, 7];

/** The colour this phone joins with: a tap, else the remembered one, else the first free one. */
export function useTint(
  remembered: string | undefined,
  roomAvatars: readonly string[],
): { tint: number; taken: ReadonlySet<number>; setTint: (n: number) => void } {
  const taken = new Set(roomAvatars.map(avatarTint).filter((n): n is number => n !== null));
  const [picked, setTint] = useState<number | null>(() =>
    remembered ? avatarTint(remembered) : null,
  );
  const tint = picked ?? TINTS.find((n) => !taken.has(n)) ?? 0;
  return { tint, taken, setTint };
}

export function JoinTints({
  tint,
  taken,
  onPick,
}: {
  tint: number;
  taken: ReadonlySet<number>;
  onPick: (n: number) => void;
}): JSX.Element {
  return (
    <div className={styles.tints} role="radiogroup" aria-label={t.join.pickColour}>
      {TINTS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={tint === n}
          aria-label={t.join.colour(n + 1, taken.has(n))}
          className={`${styles.tint} ${tint === n ? styles.tintOn : ''} ${taken.has(n) ? styles.tintTaken : ''}`}
          style={{ background: `var(--pb-player-${n + 1})` }}
          onClick={() => onPick(n)}
        />
      ))}
    </div>
  );
}

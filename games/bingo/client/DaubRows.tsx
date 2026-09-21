// S-002: the style sheet's Daub and Ink rows — the daub's look (Blot / Stamp / Ring) and its ink
// (Mine / Pink / Gold / Green), per phone, applied the moment you tap; each row shows the pick as a
// tiny daubed cell. Split from Overlays.tsx at the 300-line cap.
import type { CSSProperties, JSX } from 'react';
import { DAUBS, INKS, setDaubStyle, setInk, useDaubStyle, useInk } from './styles';
import styles from './Controller.module.css';

export function DaubRows(): JSX.Element {
  const daub = useDaubStyle();
  const ink = useInk();
  return (
    <>
      {/* S-002 A: the daub's look — Blot, Stamp or Ring — per phone, applied at once. */}
      <p className={styles.sheetGroup}>Daub</p>
      <div className={styles.choiceRow} role="radiogroup" aria-label="Daub">
        {DAUBS.map((d) => (
          <button
            type="button"
            key={d.id}
            role="radio"
            aria-checked={daub === d.id}
            className={`${styles.choice} ${daub === d.id ? styles.choiceOn : ''}`}
            onClick={() => setDaubStyle(d.id)}
          >
            <span className={styles.choiceCell} data-daub={d.id} aria-hidden>
              <i>27</i>
            </span>
            {d.label}
          </button>
        ))}
      </div>
      {/* S-002 B: the ink. */}
      <p className={styles.sheetGroup}>Ink</p>
      <div className={styles.choiceRow} role="radiogroup" aria-label="Ink">
        {INKS.map((i) => (
          <button
            type="button"
            key={i.id}
            role="radio"
            aria-checked={ink === i.id}
            className={`${styles.choice} ${ink === i.id ? styles.choiceOn : ''}`}
            onClick={() => setInk(i.id)}
            style={i.css ? ({ '--pb-swatch': i.css } as CSSProperties) : undefined}
          >
            <span className={`${styles.swatch} ${i.css ? '' : styles.swatchMine}`} aria-hidden />
            {i.label}
          </button>
        ))}
      </div>
    </>
  );
}

// S-002: the style sheet's Daub and Ink rows — the daub's look (Blot / Stamp / Ring) and its ink
// (Mine / Pink / Gold / Green), per phone, applied the moment you tap; each row shows the pick as a
// tiny daubed cell. Split from Overlays.tsx at the 300-line cap.
import type { CSSProperties, JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import { DAUBS, INKS, setDaubStyle, setInk, useDaubStyle, useInk } from './styles';
import { daubWords, inkWords } from './words';
import styles from './Controller.module.css';

export function DaubRows(): JSX.Element {
  const daub = useDaubStyle();
  const ink = useInk();
  const L = useT(STRINGS);
  const daubName = daubWords(L);
  const inkName = inkWords(L);
  return (
    <>
      {/* S-002 A: the daub's look — Blot, Stamp or Ring — per phone, applied at once. */}
      <p className={styles.sheetGroup}>{L('Daub')}</p>
      <div className={styles.choiceRow} role="radiogroup" aria-label={L('Daub')}>
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
            {daubName[d.id]}
          </button>
        ))}
      </div>
      {/* S-002 B: the ink. */}
      <p className={styles.sheetGroup}>{L('Ink')}</p>
      <div className={styles.choiceRow} role="radiogroup" aria-label={L('Ink')}>
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
            {inkName[i.id]}
          </button>
        ))}
      </div>
    </>
  );
}

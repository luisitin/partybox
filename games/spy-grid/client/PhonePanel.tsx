// Spy Grid's own 🎨 row (S-003): the board as a 5×5 grid or a list, per phone (SPEC §9.5).
import type { JSX } from 'react';
import { useSyncExternalStore } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import { getLayoutPref, setLayoutPref } from './model';
import type { LayoutPref } from './model';
import styles from './Controller.module.css';
import { STRINGS } from './strings';

const noop = (): (() => void) => () => undefined;

export function PhonePanel(): JSX.Element {
  const L = useT(STRINGS);
  const pref = useSyncExternalStore(noop, getLayoutPref, () => 'auto' as LayoutPref);
  const options: { value: LayoutPref; label: string }[] = [
    { value: 'auto', label: L('Auto') },
    { value: 'grid', label: L('Grid') },
    { value: 'list', label: L('List') },
  ];
  return (
    <div className={styles.stack}>
      <div className={styles.hint}>{L('Board layout')}</div>
      <div className={styles.row} role="radiogroup" aria-label={L('Board layout')}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={pref === o.value}
            className={`${styles.button} ${pref === o.value ? styles.chosen : ''}`}
            onClick={() => setLayoutPref(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// One of the room's on/off switches in the ★ menu's Room group (recap, phone music, phone only):
// a label with its current meaning under it and a checkbox, dimmed when it can't change now.
import type { JSX } from 'react';
import styles from './VipMenu.module.css';

export /** I-642 A: one room switch — the picker's old row, in the ★ menu's Room section. */
function RoomSwitch({
  id,
  label,
  hint,
  on,
  disabled = false,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  on: boolean;
  disabled?: boolean;
  onChange: (on: boolean) => void;
}): JSX.Element {
  return (
    <label className={`${styles.switchRow} ${disabled ? styles.switchOff : ''}`} htmlFor={id}>
      <span className={styles.switchLabel}>
        {label}
        <small>{hint}</small>
      </span>
      <input
        id={id}
        type="checkbox"
        className={styles.switchBox}
        checked={on}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

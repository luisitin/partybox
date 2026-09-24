// Put N things in order by tapping (foundation §6, Hive Rank SPEC §6.4): each tap gives a row the
// next number, shown as a round badge on its left; tapping a numbered row takes it back and the
// numbers after it move up by one; Reset clears them all. The rows never move — a finger always
// finds the thing where it was. Controlled: the caller owns `value` (the ids in order, first = 1)
// and decides what locking means (a sticky button in its Screen footer).
//
// Hands on the phone: a second tap on the same row within MASH_MS is ignored (a double tap never
// undoes a pick), rows never select text or raise a callout, and a number that changes (a row
// taken out before it) ticks to its new value instead of blinking.
import { useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { buzz } from '../ui/haptics';
import { useT } from '../ui/lang';
import styles from './OrderPicker.module.css';
import { STRINGS } from './strings';

export interface OrderItem {
  id: string;
  label: ReactNode;
  /** Plain text for screen readers when `label` is not a string. */
  text?: string;
}

export interface OrderPickerProps {
  items: readonly OrderItem[];
  /** The ids placed so far, in order: value[0] is number 1. */
  value: readonly string[];
  onChange: (next: string[]) => void;
  /** Locked in: rows and Reset do nothing (the caller shows how to change). */
  disabled?: boolean;
  /** Replaces the Reset button's row on the left (the game's "Tap from Best to Worst"). */
  hint?: ReactNode;
  /** The list's accessible name ("Best to worst"). */
  label?: string;
  /** `false` leaves Reset to the caller (a button in its footer, where the space is): the hint
   *  then has the whole row. Default true. */
  reset?: boolean;
  className?: string;
}

/** A second tap on the same row within this long is a mash, not a change of mind. */
export const MASH_MS = 350;
/** Labels longer than this step down a size, so a 22-character one stays on one line at 320 px. */
const LONG = 15;

/** The next list after tapping `id`: placed → out (later numbers move up), else → the next number. */
export function toggleOrder(value: readonly string[], id: string): string[] {
  return value.includes(id) ? value.filter((v) => v !== id) : [...value, id];
}

export function OrderPicker(props: OrderPickerProps): JSX.Element {
  const { items, value, onChange, disabled = false, hint, label, className, reset = true } = props;
  const L = useT(STRINGS);
  const last = useRef<{ id: string; at: number } | null>(null);
  // The order before the latest change, so a row can tell "just placed" (flip in) from
  // "renumbered" (tick). Compared by content: a caller may pass a fresh array every render.
  const [seen, setSeen] = useState<{ now: string; before: readonly string[] }>({
    now: value.join('\n'),
    before: value,
  });
  const joined = value.join('\n');
  if (seen.now !== joined) setSeen({ now: joined, before: seen.now ? seen.now.split('\n') : [] });
  const before = seen.now === joined ? seen.before : [];
  const full = value.length === items.length;
  const tap = (id: string, at: number): void => {
    if (disabled) return;
    const prev = last.current;
    if (prev && prev.id === id && at - prev.at < MASH_MS) return;
    last.current = { id, at };
    buzz(value.includes(id) ? 10 : 15);
    onChange(toggleOrder(value, id));
  };
  return (
    <div className={`${styles.picker} ${className ?? ''}`}>
      <div className={`${styles.bar} ${reset ? '' : styles.barPlain}`}>
        <div className={styles.hint}>{hint}</div>
        {reset ? (
          <button
            type="button"
            className={styles.reset}
            disabled={disabled || value.length === 0}
            onClick={() => {
              last.current = null;
              buzz(10);
              onChange([]);
            }}
          >
            <span aria-hidden>↺</span> {L('Reset')}
          </button>
        ) : null}
      </div>
      <ol className={styles.rows} aria-label={label}>
        {items.map((item) => {
          const at = value.indexOf(item.id);
          const placed = at >= 0;
          const was = before.indexOf(item.id);
          const motion = !placed ? '' : was < 0 ? styles.flip : was !== at ? styles.tick : '';
          const text = item.text ?? (typeof item.label === 'string' ? item.label : '');
          return (
            <li key={item.id} className={styles.slot}>
              <button
                type="button"
                className={`${styles.row} ${placed ? styles.placed : ''}`}
                aria-pressed={placed}
                disabled={disabled}
                aria-label={
                  placed
                    ? L('{label}: number {n}. Tap to take it out.', { label: text, n: at + 1 })
                    : L('{label}: not placed. Tap to make it number {n}.', {
                        label: text,
                        n: value.length + 1,
                      })
                }
                onClick={(e) => tap(item.id, e.timeStamp)}
              >
                <span className={styles.badge} aria-hidden>
                  {placed ? (
                    // Keyed by the number: a new number flips in, a renumber ticks.
                    <span key={at + 1} className={`${styles.num} ${motion}`}>
                      {at + 1}
                    </span>
                  ) : (
                    <span className={styles.next}>{full ? '' : value.length + 1}</span>
                  )}
                </span>
                <span className={`${styles.label} ${text.length > LONG ? styles.long : ''}`}>
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

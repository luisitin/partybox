// Multiple choice: 2–6 big buttons (letters + text), one tap locks the pick. Never colour-only:
// the chosen option shows ✓, correct/incorrect (after reveal) show ✓/✗ plus a hidden label.
// The tap locks the grid optimistically (✓ + "Locking in…") before the server echoes `selectedId`;
// a `promptKey` change clears that, and a 4 s silence re-enables the grid with a retry line.
import { useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { buzz } from '../ui/haptics';
import { Screen } from './Screen';
import styles from './ChoiceGrid.module.css';

export interface Choice {
  id: string;
  label: ReactNode;
}

export interface ChoiceGridProps {
  prompt?: ReactNode;
  kicker?: string;
  choices: Choice[];
  /** The player's locked pick, if any. */
  selectedId?: string | null;
  /** After reveal: which id was correct (marks the grid). */
  correctId?: string | null;
  disabled?: boolean;
  onPick: (id: string) => void;
  footer?: ReactNode;
  /**
   * Identifies the prompt (e.g. `${phaseId}:${round}`) so the optimistic lock resets when a new
   * prompt arrives — never keyed on `choices`, which callers rebuild every render.
   */
  promptKey?: string;
  /** Stretch the choices to fill the screen body — for speed games where reach and target size matter. */
  fill?: boolean;
  /** `false` drops the A/B/C discs (a wager menu is not a quiz). Default true. */
  letters?: boolean;
  /** `final` paints the kicker in the accent colour, like the TV's "final question" kicker. */
  tone?: 'default' | 'final';
}

const LETTERS = 'ABCDEFGH';
/** How long an unacknowledged tap stays locked before the grid offers a retry. */
const ECHO_TIMEOUT_MS = 4000;

interface Pending {
  key: string | undefined;
  id: string;
  /** The server never echoed the pick: the grid is enabled again and says so. */
  failed: boolean;
}

export function ChoiceGrid(props: ChoiceGridProps): JSX.Element {
  const {
    prompt,
    kicker,
    choices,
    selectedId = null,
    correctId = null,
    disabled,
    onPick,
    footer,
    promptKey,
    fill,
    letters = true,
    tone = 'default',
  } = props;
  const [pending, setPending] = useState<Pending | null>(null);
  // "Adjust state when a prop changes": a new prompt clears the optimistic lock.
  if (pending !== null && pending.key !== promptKey) setPending(null);
  const pendingId = pending !== null && !pending.failed ? pending.id : null;
  const echoed = selectedId !== null;
  useEffect(() => {
    if (pendingId === null || echoed) return;
    const handle = setTimeout(
      () => setPending((p) => (p !== null && p.id === pendingId ? { ...p, failed: true } : p)),
      ECHO_TIMEOUT_MS,
    );
    return () => clearTimeout(handle);
  }, [pendingId, echoed]);
  const shownId = selectedId ?? pendingId;
  const locked = shownId !== null || disabled;
  const pick = (id: string): void => {
    buzz(15);
    setPending({ key: promptKey, id, failed: false });
    onPick(id);
  };
  return (
    <Screen footer={footer}>
      {kicker ? (
        <p className={`${styles.kicker} ${tone === 'final' ? styles.kickerFinal : ''}`}>{kicker}</p>
      ) : null}
      {prompt ? <p className={styles.prompt}>{prompt}</p> : null}
      <div
        className={`${styles.grid} ${fill ? styles.fill : ''}`}
        role="radiogroup"
        aria-label="choices"
      >
        {choices.map((choice, index) => {
          const isSelected = choice.id === shownId;
          const revealed = correctId !== null;
          const isCorrect = revealed && choice.id === correctId;
          const isWrongPick = revealed && isSelected && !isCorrect;
          const classes = [
            styles.choice,
            letters ? '' : styles.noLetters,
            isSelected ? styles.selected : '',
            isCorrect ? styles.correct : '',
            isWrongPick ? styles.wrong : '',
            locked && !isSelected && !isCorrect ? styles.dim : '',
          ].join(' ');
          return (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={classes}
              disabled={locked}
              onClick={() => pick(choice.id)}
            >
              {letters ? (
                <span className={styles.letter} aria-hidden>
                  {LETTERS[index] ?? index + 1}
                </span>
              ) : null}
              <span className={styles.label}>{choice.label}</span>
              <span className={styles.mark} aria-hidden>
                {isCorrect ? '✓' : isWrongPick ? '✗' : isSelected ? '✓' : ''}
              </span>
              {isCorrect ? <span className="pb-visually-hidden">correct</span> : null}
              {isWrongPick ? <span className="pb-visually-hidden">incorrect</span> : null}
            </button>
          );
        })}
      </div>
      {correctId === null ? (
        selectedId !== null ? (
          <p className={styles.locked} role="status">
            ✓ Locked in — look at the TV
          </p>
        ) : pendingId !== null ? (
          <p className={styles.locked} role="status">
            ✓ Locking in…
          </p>
        ) : pending?.failed ? (
          <p className={`${styles.locked} ${styles.failed}`} role="status">
            ✗ Didn't reach the TV — tap again
          </p>
        ) : null
      ) : null}
    </Screen>
  );
}

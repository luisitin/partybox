// Multiple choice: 2–6 big buttons (letters + text), one tap locks the pick. Never colour-only:
// the chosen option shows ✓, correct/incorrect (after reveal) show ✓/✗ plus a hidden label.
import type { JSX, ReactNode } from 'react';
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
}

const LETTERS = 'ABCDEFGH';

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
  } = props;
  const locked = selectedId !== null || disabled;
  return (
    <Screen footer={footer}>
      {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
      {prompt ? <p className={styles.prompt}>{prompt}</p> : null}
      <div className={styles.grid} role="radiogroup" aria-label="choices">
        {choices.map((choice, index) => {
          const isSelected = choice.id === selectedId;
          const revealed = correctId !== null;
          const isCorrect = revealed && choice.id === correctId;
          const isWrongPick = revealed && isSelected && !isCorrect;
          const classes = [
            styles.choice,
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
              onClick={() => onPick(choice.id)}
            >
              <span className={styles.letter} aria-hidden>
                {LETTERS[index] ?? index + 1}
              </span>
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
    </Screen>
  );
}

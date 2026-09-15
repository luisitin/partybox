// Free-text input phase: prompt, textarea, character counter, submit in the sticky footer (the
// iOS keyboard never covers it). Keeps the draft in state so a reconnect mid-phase re-sends it.
import { useEffect, useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { PrimaryButton } from './PrimaryButton';
import { Screen } from './Screen';
import styles from './TextAnswer.module.css';

export interface TextAnswerProps {
  prompt: ReactNode;
  /** Small text above the prompt (e.g. "Round 2 · Prompt 1 of 2"). */
  kicker?: string;
  placeholder?: string;
  maxLength?: number;
  /** Already accepted by the server → button shows ✓ and input locks. */
  submitted: boolean;
  /** After the deadline the input is disabled. */
  disabled?: boolean;
  submitLabel?: string;
  onSubmit: (text: string) => void;
  /** Distinguishes prompts so the draft resets when the prompt changes. */
  promptKey?: string;
}

export function TextAnswer(props: TextAnswerProps): JSX.Element {
  const {
    prompt,
    kicker,
    placeholder,
    maxLength = 80,
    submitted,
    disabled,
    submitLabel = 'Submit',
    onSubmit,
    promptKey,
  } = props;
  const [text, setText] = useState('');
  const lastKey = useRef(promptKey);
  useEffect(() => {
    if (lastKey.current !== promptKey) {
      lastKey.current = promptKey;
      setText('');
    }
  }, [promptKey]);
  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && !submitted && !disabled;
  if (submitted) {
    // The dead textarea + counter added nothing once the answer was in; show what was sent instead.
    return (
      <Screen
        footer={
          <PrimaryButton done onClick={() => undefined}>
            Submitted
          </PrimaryButton>
        }
      >
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <p className={styles.prompt}>{prompt}</p>
        <div className={styles.sent} role="status">
          {trimmed ? (
            <>
              <span className={styles.sentLabel}>You said</span>
              <span className={styles.sentText}>{trimmed}</span>
            </>
          ) : (
            <span className={styles.sentLabel}>Your answer is in</span>
          )}
          <span className={styles.sentHint}>Waiting for the others — look at the TV</span>
        </div>
      </Screen>
    );
  }
  return (
    <Screen
      footer={
        <PrimaryButton
          onClick={() => canSubmit && onSubmit(trimmed)}
          disabled={!canSubmit}
          done={submitted}
        >
          {submitted ? 'Submitted' : submitLabel}
        </PrimaryButton>
      }
    >
      {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
      <p className={styles.prompt}>{prompt}</p>
      <textarea
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        disabled={submitted || disabled}
        autoCapitalize="sentences"
        enterKeyHint="done"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (canSubmit) onSubmit(trimmed);
          }
        }}
        aria-label="your answer"
      />
      {disabled && trimmed ? (
        <p className={styles.late} role="status">
          Time's up — your answer wasn't sent.
        </p>
      ) : (
        <p className={styles.counter} aria-live="off">
          {text.length} / {maxLength}
        </p>
      )}
    </Screen>
  );
}

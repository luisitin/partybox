// Free-text input phase: prompt, textarea, character counter, submit in the sticky footer (the
// iOS keyboard never covers it). Keeps the draft in state so a reconnect mid-phase re-sends it.
import { useEffect, useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { useT } from '../ui/lang';
import { PrimaryButton } from './PrimaryButton';
import { Screen } from './Screen';
import styles from './TextAnswer.module.css';
import { SDK_LINES, usePhoneOnly } from './phoneOnly';
import { STRINGS } from './strings';

/** How long an empty field sits before it breathes (I-001 C). */
const STALL_MS = 3000;

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
  /** Forwarded to the Screen frame (e.g. `pb-enter` so a new prompt rises in as a new card). */
  className?: string;
  /** Under "You said …" once submitted (default: "Waiting for the others — look at the TV", or
   *  without the TV in a phone-only room — see `SDK_LINES`). */
  submittedHint?: ReactNode;
}

export function TextAnswer(props: TextAnswerProps): JSX.Element {
  const phoneOnly = usePhoneOnly();
  const L = useT(STRINGS);
  const {
    prompt,
    kicker,
    placeholder,
    maxLength = 80,
    submitted,
    disabled,
    submitLabel = L('Submit'),
    onSubmit,
    promptKey,
    className,
    submittedHint,
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
  // I-001 C: a field left empty for 3 s breathes until a character lands — sequencing, not a
  // timer the phone shows, so it is not gated on reduced motion (the keyframe itself is). The
  // flag is armed by the timer and read only while the field is still empty and live; a keystroke
  // clears it in render, so a field emptied again waits its 3 s afresh.
  const idle = text.length === 0 && !submitted && !disabled;
  const [stalledFlag, setStalledFlag] = useState(false);
  if (stalledFlag && !idle) setStalledFlag(false);
  useEffect(() => {
    if (!idle) return;
    const handle = setTimeout(() => setStalledFlag(true), STALL_MS);
    return () => clearTimeout(handle);
  }, [idle]);
  const stalled = stalledFlag && idle;
  if (submitted) {
    // The dead textarea + counter added nothing once the answer was in; show what was sent instead.
    return (
      <Screen
        className={className}
        footer={
          <PrimaryButton done onClick={() => undefined}>
            {L('Submitted')}
          </PrimaryButton>
        }
      >
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <p className={styles.prompt}>{prompt}</p>
        <div className={styles.sent} role="status">
          {trimmed ? (
            <>
              <span className={styles.sentLabel}>{L('You said')}</span>
              <span className={styles.sentText}>{trimmed}</span>
            </>
          ) : (
            <span className={styles.sentLabel}>{L('Your answer is in')}</span>
          )}
          <span className={styles.sentHint}>
            {submittedHint ?? SDK_LINES.waiting(phoneOnly, L)}
          </span>
        </div>
      </Screen>
    );
  }
  return (
    <Screen
      className={className}
      footer={
        <PrimaryButton
          onClick={() => canSubmit && onSubmit(trimmed)}
          disabled={!canSubmit}
          done={submitted}
        >
          {submitted ? L('Submitted') : submitLabel}
        </PrimaryButton>
      }
    >
      {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
      <p className={styles.prompt}>{prompt}</p>
      <textarea
        className={`${styles.input} ${stalled ? styles.stalled : ''}`}
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
        aria-label={L('your answer')}
      />
      {disabled && trimmed ? (
        <p className={styles.late} role="status">
          {L("Time's up — your answer wasn't sent.")}
        </p>
      ) : (
        // I-001 B: keyed on the length so every keystroke remounts the counter and it bumps once.
        <p
          key={text.length}
          className={`${styles.counter} ${text.length > 0 ? styles.typed : ''}`}
          aria-live="off"
        >
          {text.length} / {maxLength}
        </p>
      )}
    </Screen>
  );
}

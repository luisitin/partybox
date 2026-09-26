// Phone answer, typed: the question, a 30-character box and Lock it in (sticky, above the
// keyboard). Text that is only spaces or symbols never goes out ("Type an answer."). Once locked
// the phone says what you sent; Change reopens the box until the phase ends.
import { useRef, useState } from 'react';
import type { FormEvent, JSX } from 'react';
import { buzz, PrimaryButton, Screen, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import { normalize } from '../server/match';
import { TYPED_MAX_CHARS } from '../server/limits';
import type { Input } from '../server/types';
import type { HerdControllerView } from '../server/views';
import { kicker } from './labels';
import { SettingsPill } from './Settings';
import { WaitingFor } from './WaitingFor';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

export function PhoneTyped({
  view,
  send,
}: {
  view: PushedView<HerdControllerView>;
  send: (input: Input) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const sent = view.mine?.text ?? null;
  const [draft, setDraft] = useState(sent ?? '');
  const [editing, setEditing] = useState(sent === null);
  const [error, setError] = useState(false);
  // Mounted fresh for each question (the phase switch unmounts it), so a reload mid-answer
  // starts from what the server already has.
  const box = useRef<HTMLInputElement>(null);
  const submit = (e: FormEvent): void => {
    e.preventDefault();
    const text = draft.trim().slice(0, TYPED_MAX_CHARS);
    if (normalize(text, 'en').compact === '') {
      setError(true);
      buzz([40, 60, 40]);
      return;
    }
    setError(false);
    setEditing(false);
    box.current?.blur();
    buzz(20);
    play('submit');
    send({ type: 'type', text });
  };
  const locked = !editing && sent !== null;
  return (
    <Screen
      className={styles.answerScreen}
      footer={
        locked ? (
          <PrimaryButton tone="neutral" onClick={() => setEditing(true)}>
            {L('Change my answer')}
          </PrimaryButton>
        ) : (
          <PrimaryButton type="submit" form="herd-typed">
            {L('Lock it in')}
          </PrimaryButton>
        )
      }
    >
      <header className={styles.ask}>
        <div className={styles.kickerRow}>
          <p className={styles.kicker}>{kicker(view.n, view.total, view.target, L)}</p>
          <SettingsPill />
        </div>
        <h2 className={styles.prompt} lang="en">
          {view.prompt}
        </h2>
      </header>
      {locked ? (
        <div className={styles.lockedWrap}>
          <p className={styles.lockedText} role="status">
            {L('Locked: “{answer}”', { answer: sent })}
          </p>
          <WaitingFor view={view} me={view.me.id} />
        </div>
      ) : (
        <form id="herd-typed" className={styles.typedForm} onSubmit={submit}>
          <input
            ref={box}
            className={styles.input}
            value={draft}
            maxLength={TYPED_MAX_CHARS}
            enterKeyHint="done"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={L('What will most people say?')}
            aria-label={L('Your answer')}
            aria-invalid={error}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(false);
            }}
          />
          <span className={styles.counter} aria-hidden>
            {draft.length} / {TYPED_MAX_CHARS}
          </span>
          {error ? (
            <p className={styles.error} role="alert">
              {L('Type an answer.')}
            </p>
          ) : null}
        </form>
      )}
    </Screen>
  );
}

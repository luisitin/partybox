// Join form: name, avatar grid, room code (only when more than one room exists), and the
// resume/kicked states. The submit button lives in the sticky footer so the keyboard never hides it.
import { useEffect, useState } from 'react';
import type { FormEvent, JSX } from 'react';
import { AVATAR_IDS, PLAYER_NAME_MAX } from '@partybox/shared';
import { Avatar, PrimaryButton, Screen } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { Controller, ControllerState } from '../net/controller';
import { useServerInfo } from '../net/info';
import styles from './Join.module.css';

export interface JoinProps {
  controller: Controller;
  state: ControllerState;
}

export function Join({ controller, state }: JoinProps): JSX.Element {
  const info = useServerInfo();
  const session = controller.session() ?? controller.identity();
  const [name, setName] = useState(session?.name ?? '');
  // A random default (instead of always the fox) so two phones joining together rarely match.
  const [avatarId, setAvatarId] = useState<string>(
    () => session?.avatarId ?? AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)] ?? 'fox',
  );
  const [code, setCode] = useState('');
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const needsCode = info !== null && info.rooms.length !== 1;
  // "Joining…" until the server answers: a welcome unmounts this screen, an error (or a 6 s safety
  // timeout, for a server that never answers) re-enables the button.
  const submitting = submittedAt !== null;
  // "Adjust state when a prop changes": an error answers the pending join, right in this render.
  if (submittedAt !== null && state.error !== null) setSubmittedAt(null);
  useEffect(() => {
    if (submittedAt === null) return;
    const handle = setTimeout(() => setSubmittedAt(null), 6000);
    return () => clearTimeout(handle);
  }, [submittedAt]);

  if (state.resuming) {
    return (
      <Screen>
        <p className={styles.resuming} role="status">
          {t.join.resuming}
        </p>
      </Screen>
    );
  }

  const canSubmit =
    name.trim().length > 0 &&
    (!needsCode || code.trim().length === 4) &&
    state.connection === 'connected';

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmittedAt(Date.now());
    controller.join({
      name: name.trim(),
      avatarId,
      roomCode: needsCode ? code.trim().toUpperCase() : undefined,
    });
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <Screen
        title={t.join.title}
        footer={
          <PrimaryButton type="submit" disabled={!canSubmit || submitting}>
            {submitting
              ? t.join.joining
              : state.connection !== 'connected'
                ? t.join.offline
                : t.join.submit}
          </PrimaryButton>
        }
      >
        {state.kicked ? (
          <p className={styles.kicked} role="alert">
            {t.join.kicked}
          </p>
        ) : null}
        {state.restarted && !state.kicked ? (
          <p className={styles.kicked} role="status">
            {t.join.restarted}
          </p>
        ) : null}
        {info && info.rooms.length === 0 ? <p className={styles.hint}>{t.join.noRooms}</p> : null}
        <label className={styles.field}>
          <span className={styles.label}>{t.join.name}</span>
          <input
            className={`${styles.input} ${state.error ? styles.inputError : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={state.error !== null}
            aria-describedby={state.error ? 'join-error' : undefined}
            placeholder={t.join.namePlaceholder}
            maxLength={PLAYER_NAME_MAX}
            autoComplete="nickname"
            autoCapitalize="words"
            enterKeyHint="done"
            required
          />
          {state.error ? (
            <span id="join-error" className={styles.error} role="alert">
              {state.error.message} {t.join.tryAgain}
            </span>
          ) : null}
        </label>
        {needsCode ? (
          <label className={styles.field}>
            <span className={styles.label}>{t.join.code}</span>
            <input
              className={`${styles.input} ${styles.code}`}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t.join.codePlaceholder}
              maxLength={4}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
          </label>
        ) : null}
        <fieldset className={styles.avatars}>
          <legend className={styles.label}>{t.join.avatar}</legend>
          <div className={styles.grid} role="radiogroup">
            {AVATAR_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={id === avatarId}
                aria-label={id}
                className={`${styles.avatarButton} ${id === avatarId ? styles.selected : ''}`}
                onClick={() => setAvatarId(id)}
              >
                <Avatar avatarId={id} size={56} />
              </button>
            ))}
          </div>
        </fieldset>
      </Screen>
    </form>
  );
}

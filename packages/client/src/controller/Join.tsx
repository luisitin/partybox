// Join form: name, avatar grid, room code (only when more than one room exists), and the
// resume/kicked states. The submit button lives in the sticky footer so the keyboard never hides it.
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, JSX } from 'react';
import { AVATAR_IDS, PLAYER_NAME_MAX } from '@partybox/shared';
import { Avatar, PrimaryButton, Screen } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { Controller, ControllerState } from '../net/controller';
import { useServerInfo } from '../net/info';
import type { SoundEngine } from '../sound';
import styles from './Join.module.css';

export interface JoinProps {
  controller: Controller;
  state: ControllerState;
  /** Enabled from the submit gesture (a keyboard "done" has no pointerdown for the shell to catch). */
  audio?: SoundEngine;
}

export function Join({ controller, state, audio }: JoinProps): JSX.Element {
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
  // A rejected join shakes the name field and hands the taken/invalid name back selected (or the
  // code, for a room that does not exist) so the retry is one keystroke away. "Adjust state when
  // a prop changes": every new error object shakes once; the one already on screen at mount (a
  // stale error left by leave()) does not. The shell plays `error` and buzzes for it.
  const nameRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const [shaking, setShaking] = useState(false);
  const [seenError, setSeenError] = useState(state.error);
  if (state.error !== seenError) {
    setSeenError(state.error);
    if (state.error && !state.joined) setShaking(true);
  }
  useEffect(() => {
    if (!shaking) return;
    const code = state.error?.code;
    const target =
      code === 'name_taken' || code === 'name_invalid'
        ? nameRef.current
        : code === 'room_not_found' && needsCode
          ? codeRef.current
          : null;
    if (target) {
      target.focus();
      // setSelectionRange, not select(): iOS ignores select().
      target.setSelectionRange(0, target.value.length);
    }
    // Reduced motion runs the animation at 0 ms and may never fire animationend.
    const fallback = setTimeout(() => setShaking(false), 400);
    return () => clearTimeout(fallback);
  }, [shaking, state.error, needsCode]);
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
    void audio?.enable();
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
                : name.trim().length === 0
                  ? t.join.needName
                  : needsCode && code.trim().length !== 4
                    ? t.join.needCode
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
        {/* I-031 B: the portrait — the chosen face, large, beside the name; swaps with a pop. */}
        <div className={styles.portraitRow}>
          <span key={avatarId} className={styles.portrait} aria-hidden>
            <Avatar avatarId={avatarId} size={96} />
          </span>
          <span className={styles.portraitName}>{name.trim() || '…'}</span>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>{t.join.name}</span>
          <input
            ref={nameRef}
            className={`${styles.input} ${state.error ? styles.inputError : ''} ${shaking ? styles.shake : ''}`}
            onAnimationEnd={() => setShaking(false)}
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
              <span aria-hidden>⚠ </span>
              {state.error.message} {t.join.tryAgain}
            </span>
          ) : null}
        </label>
        {needsCode ? (
          <label className={styles.field}>
            <span className={styles.label}>{t.join.code}</span>
            <input
              ref={codeRef}
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
          {/* I-031 A: the pick pops (keyed on the pick, so it pops once per change) and the rest
              step back while one is chosen. */}
          <div className={`${styles.grid} ${styles.picking}`} role="radiogroup">
            {AVATAR_IDS.map((id) => (
              <button
                key={id === avatarId ? `${id}:on` : id}
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

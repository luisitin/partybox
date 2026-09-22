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
import { JoinPortrait } from './JoinPortrait';

export interface JoinProps {
  controller: Controller;
  state: ControllerState;
  /** Enabled from the submit gesture (a keyboard "done" has no pointerdown for the shell to catch). */
  audio?: SoundEngine;
}

/** The `room` query parameter of the page the phone opened (the QR's), as a 4-letter code. */
function roomFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('room');
  const code = raw?.trim().toUpperCase() ?? '';
  return /^[A-Z]{4}$/.test(code) ? code : null;
}

export function Join({ controller, state, audio }: JoinProps): JSX.Element {
  const info = useServerInfo();
  const session = controller.session() ?? controller.identity();
  const [name, setName] = useState(session?.name ?? '');
  // A random default (instead of always the fox) so two phones joining together rarely match.
  const [avatarId, setAvatarId] = useState<string>(
    () => session?.avatarId ?? AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)] ?? 'fox',
  );
  // I-031 (the owner): a photo avatar from the phone, kept with the name and face across sessions.
  const [photo, setPhoto] = useState<string | null>(session?.photo ?? null);
  // I-041 (the owner): a phone that scanned the QR carries the room in the URL and skips the
  // code; one that typed the bare URL from the TV always asks for it (the server keeps its
  // single-open-room fallback for a code-less join, but the form asks).
  const urlRoom = roomFromUrl();
  const [code, setCode] = useState(urlRoom ?? '');
  // I-046 A: the placeholder rotates through example names while the field is empty and unfocused.
  const EXAMPLES = ['Sam', 'Priya', 'Grandma Jo', 'Big Dave', 'Mo', 'Auntie Kay'];
  // I-046 B: the room's own people lead the examples.
  const roomExamples = info?.rooms[0]?.names;
  const exampleNames = [
    ...(roomExamples ?? []),
    ...EXAMPLES.filter((n) => !(roomExamples ?? []).includes(n)),
  ];
  const [exampleAt, setExampleAt] = useState(() => Math.floor(Math.random() * 6));
  const [nameFocused, setNameFocused] = useState(false);
  useEffect(() => {
    if (name !== '' || nameFocused) return undefined;
    const h = setInterval(() => setExampleAt((i) => i + 1), 2500);
    return () => clearInterval(h);
  }, [name, nameFocused]);
  const placeholder = `e.g. ${exampleNames[exampleAt % exampleNames.length] ?? 'Sam'}`;
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const needsCode = urlRoom === null;
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
  // I-056 A: a rejection about the ROOM (full / locked) is not about what was typed.
  const roomError =
    state.error?.code === 'room_full' || state.error?.code === 'room_locked'
      ? state.error.code
      : null;
  // I-041: a room that does not exist is the CODE field's fault when the phone typed one.
  const codeError = state.error?.code === 'room_not_found' && needsCode;
  const nameError = state.error !== null && roomError === null && !codeError;
  // I-056 C: after a room rejection the button says why and holds for 5 s, then allows a retry.
  // `retryFor` is the error object the hold has ended for: a fresh rejection (a new object) is
  // held again without a synchronous setState in the effect.
  const [retryFor, setRetryFor] = useState<ControllerState['error']>(null);
  const roomErr = roomError ? state.error : null;
  useEffect(() => {
    if (!roomErr) return;
    const h = setTimeout(() => setRetryFor(roomErr), 5000);
    return () => clearTimeout(h);
  }, [roomErr]);
  const retryOpen = roomErr !== null && retryFor === roomErr;
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
      roomCode: code.trim().length === 4 ? code.trim().toUpperCase() : undefined,
      ...(photo ? { photo } : {}),
    });
  };

  return (
    <form className={`${styles.form} ${roomError ? styles.formDim : ''}`} onSubmit={submit}>
      <Screen
        title={t.join.title}
        footer={
          <>
            {/* I-056 B: a room rejection lands where the action is — above the button. */}
            {roomError && state.error ? (
              <p className={`${styles.kicked} ${styles.roomError}`} role="alert">
                <span aria-hidden>{roomError === 'room_full' ? '👥 ' : '🔒 '}</span>
                {state.error.message}{' '}
                {roomError === 'room_full'
                  ? 'Ask the VIP to make room.'
                  : 'Ask the VIP to unlock it.'}
              </p>
            ) : null}
            <PrimaryButton
              type="submit"
              disabled={!canSubmit || submitting || (roomError !== null && !retryOpen)}
            >
              {submitting
                ? t.join.joining
                : state.connection !== 'connected'
                  ? t.join.offline
                  : name.trim().length === 0
                    ? t.join.needName
                    : needsCode && code.trim().length !== 4
                      ? t.join.needCode
                      : roomError === 'room_full' && !retryOpen
                        ? 'Room is full'
                        : roomError === 'room_locked' && !retryOpen
                          ? 'Room is locked'
                          : t.join.submit}
            </PrimaryButton>
          </>
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
        {urlRoom ? (
          <p className={styles.joiningRoom} role="status">
            {t.join.joiningRoom} <strong>{urlRoom}</strong>
          </p>
        ) : null}
        {/* I-031 B: the portrait — the chosen face (or the photo), large, beside the name. */}
        <JoinPortrait avatarId={avatarId} name={name} photo={photo} onPhoto={setPhoto} />
        <label className={styles.field}>
          <span className={styles.label}>{t.join.name}</span>
          <input
            ref={nameRef}
            className={`${styles.input} ${nameError ? styles.inputError : ''} ${shaking && nameError ? styles.shake : ''} ${name === '' && !nameFocused ? styles.placeholderFade : ''}`}
            onAnimationEnd={() => setShaking(false)}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={nameError}
            aria-describedby={nameError ? 'join-error' : undefined}
            placeholder={placeholder}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            maxLength={PLAYER_NAME_MAX}
            autoComplete="nickname"
            autoCapitalize="words"
            enterKeyHint="done"
            required
          />
          {nameError && state.error ? (
            <span id="join-error" className={styles.error} role="alert">
              {/* I-040 C: a taken name shows who has it. */}
              {state.error.player ? (
                <>
                  <Avatar avatarId={state.error.player.avatarId} size={22} />
                  That name is taken — {state.error.player.name} is already in.
                </>
              ) : (
                <>
                  <span aria-hidden>⚠ </span>
                  {state.error.message} {t.join.tryAgain}
                </>
              )}
            </span>
          ) : null}
        </label>
        {needsCode ? (
          <label className={styles.field}>
            <span className={styles.label}>{t.join.code}</span>
            <input
              ref={codeRef}
              className={`${styles.input} ${styles.code} ${codeError ? styles.inputError : ''} ${shaking && codeError ? styles.shake : ''}`}
              onAnimationEnd={() => setShaking(false)}
              aria-invalid={codeError}
              aria-describedby={codeError ? 'join-code-error' : undefined}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t.join.codePlaceholder}
              maxLength={4}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
            {codeError && state.error ? (
              <span id="join-code-error" className={styles.error} role="alert">
                <span aria-hidden>⚠ </span>
                {state.error.message} {t.join.tryAgain}
              </span>
            ) : null}
          </label>
        ) : null}
        <fieldset className={styles.avatars}>
          <legend className={styles.label}>{t.join.avatar}</legend>
          {/* I-031 A: the pick pops (keyed on the pick, so it pops once per change) and the rest
              step back while one is chosen; with a photo up the whole grid steps back. */}
          <div
            className={`${styles.grid} ${styles.picking} ${photo ? styles.photoUp : ''}`}
            role="radiogroup"
          >
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

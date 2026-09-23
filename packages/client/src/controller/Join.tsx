// Join form: name, avatar grid, room code (only when more than one room exists), and the
// resume/kicked states. The submit button lives in the sticky footer so the keyboard never hides it.
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, JSX } from 'react';
import { EVERYDAY_AVATAR_IDS, PLAYER_NAME_MAX, avatarFace, normalizeName } from '@partybox/shared';
import {
  Avatar,
  AvatarPhotos,
  PlayerChip,
  PrimaryButton,
  Screen,
  useLang,
} from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { joinStrings, roomStrings, setJoinLang } from '../i18n-join';
import { serverText } from '../server-text';
import type { JoinLang } from '../i18n-join';
import type { Controller, ControllerState } from '../net/controller';
import { useServerInfo } from '../net/info';
import { JoinTints, useTint } from './JoinTints';
import { useExampleName } from './useExampleName';
import type { SoundEngine } from '../sound';
import styles from './Join.module.css';
import { JoinAvatars } from './JoinAvatars';
import { JoinLangs } from './JoinLangs';
import { JoinPortrait } from './JoinPortrait';
import { RoomPicker } from './RoomPicker';
import { joinGrid, roomFromUrl } from './joinUrl';

export interface JoinProps {
  controller: Controller;
  state: ControllerState;
  /** Enabled from the submit gesture (a keyboard "done" has no pointerdown for the shell to catch). */
  audio?: SoundEngine;
}

export function Join({ controller, state, audio }: JoinProps): JSX.Element {
  const info = useServerInfo(60_000, true); // the join page: the funnel's "opened" (I-077)
  // I-079 A/B: the faces on offer today (`?date=` previews a month).
  const { season, ids: gridIds } = joinGrid();
  // I-076 A: the join strings in the phone's language (B: the remembered choice).
  // The device's language store (shared with every screen after this one and the 🎨 sheet).
  const lang: JoinLang = useLang();
  const setLang = setJoinLang;
  const j = joinStrings(lang);
  const session = controller.session() ?? controller.identity();
  const [name, setName] = useState(session?.name ?? '');
  // A random default (instead of always the fox) so two phones joining together rarely match.
  // I-041 (the owner): a phone that scanned the QR carries the room in the URL and skips the
  // code; one that typed the bare URL from the TV always asks for it (the server keeps its
  // single-open-room fallback for a code-less join, but the form asks).
  const urlRoom = roomFromUrl();
  // I-083 A: the faces already in the room the phone is joining (ADR-043 made "the room" a
  // question — the typed code decides, else the first room /api/info lists).
  const taken = new Set(
    ((info?.rooms.find((r) => r.code === (urlRoom ?? '')) ?? info?.rooms[0])?.avatars ?? []).map(
      avatarFace,
    ),
  );
  // I-083 B: a fresh phone's random default is drawn from the free faces.
  const freeIds = EVERYDAY_AVATAR_IDS.filter((id) => !taken.has(id));
  const pool = freeIds.length > 0 ? freeIds : EVERYDAY_AVATAR_IDS;
  // The default face is DERIVED, not rolled once at mount: /api/info (and with it `taken`) lands a
  // beat after the first render, and a default chosen before it knew the room would happily be the
  // face someone already wears. A remembered identity, or a tap, wins over it.
  // I-086: the colour beside the face (JoinTints.tsx).
  const {
    tint,
    taken: takenTints,
    setTint,
  } = useTint(
    session?.avatarId,
    (info?.rooms.find((r) => r.code === (urlRoom ?? '')) ?? info?.rooms[0])?.avatars ?? [],
  );
  const [chosen, setChosen] = useState<string | null>(
    session?.avatarId ? avatarFace(session.avatarId) : null,
  );
  const [seed] = useState(() => Math.random());
  const avatarId = chosen ?? pool[Math.floor(seed * pool.length)] ?? 'fox';
  const setAvatarId = setChosen;
  // I-031 (the owner): a photo avatar from the phone, kept with the name and face across sessions.
  const [photo, setPhoto] = useState<string | null>(session?.photo ?? null);
  const [code, setCode] = useState(urlRoom ?? '');
  // The badges follow the room actually being joined — a code typed or a room tapped in the list
  // (ADR-043) — while the default face above stays keyed on the first room, so it does not change
  // under the person's thumb as they type.
  const picked = info?.rooms.find((r) => r.code === code.trim().toUpperCase());
  const badged = picked ? new Set((picked.avatars ?? []).map(avatarFace)) : taken;
  const [nameFocused, setNameFocused] = useState(false);
  const placeholder = j.example(useExampleName(info?.rooms[0]?.names, name === '' && !nameFocused));
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
  // I-741 C: the name the room said was taken — while it is still the typed name, the button
  // offers "That's me — take my seat" (your phone died and the room has not noticed yet)
  const [takenName, setTakenName] = useState<string | null>(null);
  if (state.error !== seenError) {
    setSeenError(state.error);
    setTakenName(state.error?.code === 'name_taken' && state.error.player ? name : null);
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
  const takeSeat = takenName !== null && name === takenName && state.error?.code === 'name_taken';
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

  // The server's own rule (normalizeName: invisible characters out, 1-16 left), so a name that
  // renders as nothing never gets an enabled Join button (2026-09-22).
  const cleanName = normalizeName(name);
  const canSubmit =
    cleanName !== null &&
    (!needsCode || code.trim().length === 4) &&
    state.connection === 'connected';

  const submit = (e: FormEvent, takeOver = false): void => {
    e.preventDefault();
    if (!canSubmit) return;
    void audio?.enable();
    setSubmittedAt(Date.now());
    controller.join({
      ...(takeOver ? { takeOver: true } : {}),
      name: cleanName ?? name.trim(),
      // I-086 B: the face and the colour travel as one id.
      avatarId: `${avatarId}#${tint}`,
      roomCode: code.trim().length === 4 ? code.trim().toUpperCase() : undefined,
      ...(photo ? { photo } : {}),
    });
  };

  return (
    <form
      className={`${styles.form} ${roomError ? styles.formDim : ''}`}
      onSubmit={(e) => submit(e, takeSeat)}
    >
      <Screen
        title={
          <span className={styles.head}>
            <span className={styles.headTitle}>{j.title}</span>
            <JoinLangs lang={lang} onPick={setLang} />
          </span>
        }
        footer={
          <>
            {/* I-056 B: a room rejection lands where the action is — above the button. */}
            {roomError && state.error ? (
              <p className={`${styles.kicked} ${styles.roomError}`} role="alert">
                <span aria-hidden>{roomError === 'room_full' ? '👥 ' : '🔒 '}</span>
                {serverText(state.error.message, lang)}{' '}
                {roomError === 'room_full' ? j.askRoom : j.askUnlock}
              </p>
            ) : null}
            <PrimaryButton
              type="submit"
              disabled={!canSubmit || submitting || (roomError !== null && !retryOpen)}
            >
              {submitting
                ? j.joining
                : takeSeat
                  ? 'That’s me — take my seat'
                : state.connection !== 'connected'
                  ? t.join.offline
                  : cleanName === null
                    ? j.needName
                    : needsCode && code.trim().length !== 4
                      ? t.join.needCode
                      : roomError === 'room_full' && !retryOpen
                        ? j.roomFull
                        : roomError === 'room_locked' && !retryOpen
                          ? j.roomLocked
                          : j.submit}
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
            {j.joiningRoom} <strong>{urlRoom}</strong>
          </p>
        ) : null}
        {/* I-031 B: the portrait — the chosen face (or the photo), large, beside the name. */}
        {/* I-067 B: sideways, the portrait + field sit in a left column beside the grid. */}
        <div className={styles.sideways}>
          <JoinPortrait
            avatarId={`${avatarId}#${tint}`}
            name={name}
            photo={photo}
            onPhoto={setPhoto}
          />
          <label className={styles.field}>
            <span className={styles.label}>{j.name}</span>
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
                    {j.nameTakenBy(state.error.player.name)}
                  </>
                ) : (
                  <>
                    <span aria-hidden>⚠ </span>
                    {serverText(state.error.message, lang)} {t.join.tryAgain}
                  </>
                )}
              </span>
            ) : null}
          </label>
          {needsCode ? (
            <label className={styles.field}>
              <span className={styles.label}>{roomStrings(lang).code}</span>
              <input
                ref={codeRef}
                className={`${styles.input} ${styles.code} ${codeError ? styles.inputError : ''} ${shaking && codeError ? styles.shake : ''}`}
                onAnimationEnd={() => setShaking(false)}
                aria-invalid={codeError}
                aria-describedby={codeError ? 'join-code-error' : undefined}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={roomStrings(lang).codePlaceholder}
                maxLength={4}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
              {codeError && state.error ? (
                <span id="join-code-error" className={styles.error} role="alert">
                  <span aria-hidden>⚠ </span>
                  {serverText(state.error.message, lang)} {t.join.tryAgain}
                </span>
              ) : null}
            </label>
          ) : null}
          {/* The owner (2026-09-22): which rooms are open, and a way to open your own. */}
          {needsCode ? <RoomPicker info={info} code={code} onPick={setCode} lang={lang} /> : null}
        </div>
        <JoinTints tint={tint} taken={takenTints} onPick={setTint} />
        <JoinAvatars
          legend={j.avatar}
          ids={gridIds}
          avatarId={avatarId}
          onPick={setAvatarId}
          taken={badged}
          season={season}
          photo={photo !== null}
        />
      </Screen>
      {/* I-059 A: a tablet's spare width is a preview stage — your chip as the room will see it. */}
      <aside className={styles.stage} aria-label={j.preview}>
        <p className={styles.label}>{j.howSeen}</p>
        <div key={`${name.trim()}|${photo ?? avatarId}`} className={styles.stagePop}>
          <AvatarPhotos players={photo ? [{ id: 'preview', photo }] : []}>
            <PlayerChip
              name={name.trim() || j.namePlaceholder}
              avatarId={photo ? 'photo:preview' : avatarId}
              isMe
              size="lg"
            />
          </AvatarPhotos>
        </div>
      </aside>
    </form>
  );
}

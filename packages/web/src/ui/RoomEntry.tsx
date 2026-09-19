// The one screen the LAN app has no use for: which room. On a LAN the TV shows the code and there
// is only ever one room, so the phone just joins it. On the web anyone can start a party, so this
// asks first — start one (you host it, and the engine runs in your tab) or open a friend's code.
// Who you are comes next, on the client's own join screen.
import { useState } from 'react';
import type { FormEvent, JSX } from 'react';
import { PrimaryButton, Screen } from '@partybox/game-sdk/ui';
import { ROOM_CODE_LENGTH, isRoomCode, normalizeRoomCode } from '@partybox/shared';
import styles from './RoomEntry.module.css';

export interface RoomEntryProps {
  /** Prefilled from `?room=CODE` or the last room this device was in. */
  initialCode?: string;
  busy: 'hosting' | 'joining' | null;
  error: string | null;
  onHost(): void;
  onJoin(code: string): void;
}

export function RoomEntry({
  initialCode,
  busy,
  error,
  onHost,
  onJoin,
}: RoomEntryProps): JSX.Element {
  const [code, setCode] = useState(initialCode ?? '');
  const valid = isRoomCode(normalizeRoomCode(code));
  const submit = (event: FormEvent): void => {
    event.preventDefault();
    if (valid && busy === null) onJoin(normalizeRoomCode(code));
  };
  return (
    <Screen>
      <div className={styles.entry}>
        <h1 className={styles.brand}>PartyBox</h1>
        <p className={styles.tagline}>
          Party games for a group that is not in the same room. Everyone plays on their own phone —
          the stage rides along at the top of the screen.
        </p>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.label} htmlFor="room-code">
            Got a room code?
          </label>
          <div className={styles.row}>
            <input
              id="room-code"
              className={styles.code}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, ROOM_CODE_LENGTH))}
              placeholder="ABCD"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              inputMode="text"
              aria-describedby={error ? 'room-error' : undefined}
            />
            <button type="submit" className={styles.joinButton} disabled={!valid || busy !== null}>
              {busy === 'joining' ? 'Joining…' : 'Join'}
            </button>
          </div>
        </form>

        <p className={styles.or}>or</p>

        <PrimaryButton onClick={onHost} disabled={busy !== null}>
          {busy === 'hosting' ? 'Starting…' : 'Start a new room'}
        </PrimaryButton>
        <p className={styles.note}>
          Whoever starts the room runs it: keep this tab open and everyone stays connected. You join
          first, so you are the VIP — you can hand that over to anyone once they are in.
        </p>
        {error ? (
          <p className={styles.error} id="room-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Screen>
  );
}

// The owner (2026-09-22): a phone that does not know a code is not stuck. It can see which rooms
// are open (the public ones — a private room still joins by code) and open its own, either with a
// code it typed or one the server picks.
import { useState } from 'react';
import type { JSX } from 'react';
import { isRoomCode } from '@partybox/shared';
import { t } from '../i18n';
import { roomStrings } from '../i18n-join';
import { serverText } from '../server-text';
import type { JoinLang } from '../i18n-join';
import type { ServerInfo } from '../net/info';
import styles from './Join.module.css';

export interface RoomPickerProps {
  info: ServerInfo | null;
  /** What the code field holds — a tapped room or a new one fills it. */
  code: string;
  onPick: (code: string) => void;
  /** I-076: the join screen's language. */
  lang?: JoinLang;
}

async function createRoom(code: string): Promise<{ code: string } | { error: string }> {
  try {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(code ? { code } : {}),
    });
    const body = (await res.json()) as { code?: string; message?: string };
    // The server's own sentence is English (serverText translates it at display); these two are ours.
    if (!res.ok || !body.code) return { error: body.message ?? t.join.openFailed };
    return { code: body.code };
  } catch {
    return { error: t.join.noAnswer };
  }
}

export function RoomPicker({
  info,
  code,
  onPick,
  lang = 'en',
}: RoomPickerProps): JSX.Element | null {
  const rs = roomStrings(lang);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!info) return null;
  const open = info.rooms.filter((r) => r.listed !== false);
  const typed = code.trim().toUpperCase();
  const wants = typed.length === 4 && isRoomCode(typed) ? typed : '';
  const taken = info.rooms.some((r) => r.code === wants);
  const make = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    const made = await createRoom(taken ? '' : wants);
    setBusy(false);
    if ('error' in made) setError(made.error);
    else onPick(made.code);
  };
  return (
    <div className={styles.rooms}>
      <span className={styles.label}>{rs.roomsOpen}</span>
      {open.length > 0 ? (
        <div className={styles.roomList}>
          {open.map((r) => (
            <button
              key={r.code}
              type="button"
              className={`${styles.roomChip} ${r.code === typed ? styles.roomChipOn : ''}`}
              aria-pressed={r.code === typed}
              disabled={r.locked}
              onClick={() => onPick(r.code)}
            >
              <span className={styles.roomCode}>{r.code}</span>
              <span className={styles.roomWho}>
                {r.locked
                  ? rs.locked
                  : r.status === 'playing'
                    ? rs.playing(r.players)
                    : rs.here(r.players)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.hint}>{rs.noRooms}</p>
      )}
      <button type="button" className={styles.newRoom} onClick={() => void make()} disabled={busy}>
        {busy ? rs.opening : wants && !taken ? rs.openCode(wants) : rs.openNew}
      </button>
      {error ? (
        <span className={styles.error} role="alert">
          <span aria-hidden>⚠ </span>
          {serverText(error, lang)}
        </span>
      ) : null}
    </div>
  );
}

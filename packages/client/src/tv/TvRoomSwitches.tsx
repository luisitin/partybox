// I-668 C: the room's switches as one line of toggle chips on the TV's picker (the TV is the host's
// screen, ADR-031): the recap, phone music and — ADR-047 — where everyone is (a chip that turns to
// the next answer), with the question when someone can't see the TV while the room says together.
import type { JSX } from 'react';
import { PRESENCE_MODES } from '@partybox/shared';
import type { PresenceMode, RoomSnapshot } from '@partybox/shared';
import { useT } from '@partybox/game-sdk/ui';
import type { TvClient } from '../net/tv';
import { awayToAsk } from '../presence';
import { STRINGS } from './strings';
import styles from './TvSelecting.module.css';

export function TvRoomSwitches({
  room,
  client,
}: {
  room: RoomSnapshot;
  client: TvClient;
}): JSX.Element {
  const L = useT(STRINGS);
  const mode: PresenceMode = room.presenceMode ?? 'together';
  const next =
    PRESENCE_MODES[(PRESENCE_MODES.indexOf(mode) + 1) % PRESENCE_MODES.length] ?? 'together';
  const away = awayToAsk(room);
  const set = (m: PresenceMode): void => client.act({ action: 'setPresenceMode', mode: m });
  // While the room is asked where Maya is, the question and its answers ARE the row: two rows
  // pushed the grid's last games under it (the switches stay on the VIP's phone meanwhile).
  if (away.length > 0)
    return (
      <div className={`${styles.switches} ${styles.switchAsk}`} role="status">
        {L("{name} can't see the TV. On a call with you?", { name: away[0]?.name ?? '' })}
        <button type="button" className={styles.switchChip} onClick={() => set('remote-voice')}>
          🎧 {L('On a call')}
        </button>
        <button type="button" className={styles.switchChip} onClick={() => set('remote-text')}>
          💬 {L('No call')}
        </button>
      </div>
    );
  return (
    <div className={styles.switches}>
      <button
        type="button"
        aria-pressed={room.recording}
        className={`${styles.switchChip} ${room.recording ? styles.switchOn : ''}`}
        onClick={() => client.act({ action: 'setRecording', on: !room.recording })}
      >
        📼 {L('Recap')} {room.recording ? '✓' : ''}
      </button>
      <button
        type="button"
        aria-pressed={room.musicOnPhones}
        className={`${styles.switchChip} ${room.musicOnPhones ? styles.switchOn : ''}`}
        onClick={() => client.act({ action: 'setMusicOnPhones', on: !room.musicOnPhones })}
      >
        🎵 {L('Phone music')} {room.musicOnPhones ? '✓' : ''}
      </button>
      <button
        type="button"
        className={`${styles.switchChip} ${mode === 'together' ? '' : styles.switchOn}`}
        onClick={() => set(next)}
      >
        {MODE_ICON[mode]}{' '}
        {mode === 'together'
          ? L('All in one room')
          : mode === 'remote-voice'
            ? L('Some remote, on a call')
            : L('Some remote, no call')}
      </button>
    </div>
  );
}

const MODE_ICON: Record<PresenceMode, string> = {
  together: '📍',
  'remote-voice': '🎧',
  'remote-text': '💬',
};

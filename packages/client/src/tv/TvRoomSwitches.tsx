// I-668 C: the room's switches as one line of toggle chips on the TV's picker (the TV is the host's
// screen, ADR-031): the recap and phone music.
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { useT } from '@partybox/game-sdk/ui';
import type { TvClient } from '../net/tv';
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
    </div>
  );
}

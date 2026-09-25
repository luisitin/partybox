// Owner 2026-09-24: when the phones carry the sound (a phone-only room, or music on every phone)
// the TV steps back — one copy of each bed, cue and reading, never N+1 unsynced ones. The viewer's
// own saved mute is left alone; the TV's pill still reads it.
import { useEffect } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import type { BedEngine } from '../beds';
import type { MusicEngine } from '../music';
import type { SoundEngine } from '../sound';

export function useSoundHandOff(
  room: RoomSnapshot | null | undefined,
  audio: SoundEngine,
  music: MusicEngine,
  beds: BedEngine,
): void {
  const handOff = Boolean(room && (room.phoneOnly || room.musicOnPhones));
  useEffect(() => {
    audio.setHandedOff(handOff);
    music.setMuted(audio.muted() || handOff);
    beds.setMuted(audio.muted() || handOff);
  }, [handOff, audio, music, beds]);
}

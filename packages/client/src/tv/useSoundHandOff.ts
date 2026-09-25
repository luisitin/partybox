// Owner 2026-09-24: when the phones carry the sound the TV steps back — one copy of each bed, cue
// and reading, never N+1 unsynced ones. The viewer's
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
  // Foundation's ruling [151143]: phone-only → the TV hands off everything; music on the phones with
  // a TV in use → the TV hands off music and beds but keeps the phase cues and voices (the Bingo
  // caller at-TV players hear comes only from the TV).
  const all = Boolean(room?.phoneOnly);
  const music_ = all || Boolean(room?.musicOnPhones);
  useEffect(() => {
    audio.setHandedOff(all);
    music.setMuted(audio.muted() || music_);
    beds.setMuted(audio.muted() || music_);
  }, [all, music_, audio, music, beds]);
}

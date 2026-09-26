// The phone's music and sound switches, handed to the game through @partybox/game-sdk/ui's
// PhonePrefsProvider (a game's in-game settings menu flips the same switches as the 🎨 sheet).
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { PhonePrefs } from '@partybox/game-sdk/ui';
import type { RoomSnapshot } from '@partybox/shared';
import {
  phoneMusicChoice,
  phoneMusicWantedForPlayer,
  setPhoneMusicOn,
  subscribePhoneMusic,
} from '../phone-music';
import type { SoundEngine } from '../sound';

export function usePhonePrefsValue(
  audio: SoundEngine | null | undefined,
  room: RoomSnapshot,
  playerId: string,
): Omit<PhonePrefs, 'available'> {
  const choice = useSyncExternalStore(subscribePhoneMusic, phoneMusicChoice, () => null);
  // The engine owns the mute (the 🎨 sheet flips it too): read it live, never a copy.
  const subscribeMute = useCallback(
    (cb: () => void) => audio?.onMuteChange(() => cb()) ?? (() => undefined),
    [audio],
  );
  const muted = useSyncExternalStore(
    subscribeMute,
    () => audio?.muted() ?? true,
    () => true,
  );
  return useMemo(
    () => ({
      music: {
        on: phoneMusicWantedForPlayer(choice, room, playerId),
        set: (on: boolean) => setPhoneMusicOn(on),
      },
      sound: {
        on: !muted,
        set: (on: boolean) => {
          if (!audio) return;
          audio.setMuted(!on);
          if (on) void audio.enable().then((ok) => ok && audio.play('submit'));
        },
      },
    }),
    [choice, room, playerId, muted, audio],
  );
}

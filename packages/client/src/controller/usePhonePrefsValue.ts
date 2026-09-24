// The phone's music and sound switches, handed to the game through @partybox/game-sdk/ui's
// PhonePrefsProvider (a game's in-game settings menu flips the same switches as the 🎨 sheet).
import { useMemo, useState, useSyncExternalStore } from 'react';
import type { PhonePrefs } from '@partybox/game-sdk/ui';
import type { RoomSnapshot } from '@partybox/shared';
import {
  phoneMusicChoice,
  phoneMusicWanted,
  setPhoneMusicOn,
  subscribePhoneMusic,
} from '../phone-music';
import type { SoundEngine } from '../sound';

export function usePhonePrefsValue(
  audio: SoundEngine | null | undefined,
  room: RoomSnapshot,
): Omit<PhonePrefs, 'available'> {
  const choice = useSyncExternalStore(subscribePhoneMusic, phoneMusicChoice, () => null);
  const [muted, setMuted] = useState(() => audio?.muted() ?? true);
  const { phoneOnly, musicOnPhones } = room;
  return useMemo(
    () => ({
      music: {
        on: phoneMusicWanted(choice, { phoneOnly, musicOnPhones }),
        set: (on: boolean) => setPhoneMusicOn(on),
      },
      sound: {
        on: !muted,
        set: (on: boolean) => {
          if (!audio) return;
          audio.setMuted(!on);
          setMuted(!on);
          if (on) void audio.enable().then((ok) => ok && audio.play('submit'));
        },
      },
    }),
    [choice, phoneOnly, musicOnPhones, muted, audio],
  );
}

// This phone's own sound and music switches, for a game's in-game settings menu (the owner,
// 2026-09-24: "a button where I can turn my music on or off"). The switches live in the controller
// shell (packages/client: the phone's mute and phone-music choice); the shell provides them here so
// a game can offer the same two rows without importing the shell. Vibration and motion are already
// in the SDK (`hapticsEnabled` / `setHapticsEnabled`, `useMotionOff` / `setMotionOff`).
// Without a shell (tests, /preview) both switches read "off" and do nothing.
import { createContext, useContext } from 'react';
import type { JSX, ReactNode } from 'react';

export interface PhoneSwitch {
  on: boolean;
  set: (on: boolean) => void;
}

export interface PhonePrefs {
  /** Music playing on this phone (its own choice wins over the room's). */
  music: PhoneSwitch;
  /** This phone's sound cues and readings. */
  sound: PhoneSwitch;
  /** False when the shell did not provide the switches (hide the rows). */
  available: boolean;
}

const OFF: PhoneSwitch = { on: false, set: () => undefined };
const NONE: PhonePrefs = { music: OFF, sound: OFF, available: false };
const PrefsContext = createContext<PhonePrefs>(NONE);

export function PhonePrefsProvider({
  value,
  children,
}: {
  value: Omit<PhonePrefs, 'available'>;
  children: ReactNode;
}): JSX.Element {
  return (
    <PrefsContext.Provider value={{ ...value, available: true }}>{children}</PrefsContext.Provider>
  );
}

export function usePhonePrefs(): PhonePrefs {
  return useContext(PrefsContext);
}

// S-004: music on this phone — a per-phone choice (localStorage), read by the controller app:
// the switch (the phone's own choice wins over the room's) and the volume.
const PHONE_MUSIC_KEY = 'partybox:phone-music';
const PHONE_MUSIC_LEVEL_KEY = 'partybox:phone-music-level';
const phoneMusicListeners = new Set<() => void>();
/** The old three-step level, read once into the volume (soft 35 %, normal 70 %, loud 100 %). */
const OLD_LEVELS: Readonly<Record<string, number>> = { soft: 35, normal: 70, loud: 100 };
const PHONE_MUSIC_VOLUME_KEY = 'partybox:phone-music-volume';
export const PHONE_MUSIC_DEFAULT_VOLUME = 70;

/** This phone's own music choice: 'on', 'off', or null (never touched — the room decides). An
 *  explicit 'off' wins over the room: until 2026-09-23 a phone-only room (or the VIP's "music on
 *  every phone") played on regardless, so the switch looked broken (the owner). */
export function phoneMusicChoice(): 'on' | 'off' | null {
  try {
    const v = localStorage.getItem(PHONE_MUSIC_KEY);
    return v === 'on' || v === 'off' ? v : null;
  } catch {
    return null;
  }
}
export function phoneMusicOn(): boolean {
  return phoneMusicChoice() === 'on';
}
/** Whether this phone plays music: its own choice, else the room's ask (phone only / VIP switch). */
export function phoneMusicWanted(
  choice: 'on' | 'off' | null,
  room: { phoneOnly?: boolean; musicOnPhones?: boolean } | null | undefined,
): boolean {
  if (choice !== null) return choice === 'on';
  return (room?.phoneOnly ?? false) || (room?.musicOnPhones ?? false);
}
export function setPhoneMusicOn(on: boolean): void {
  try {
    localStorage.setItem(PHONE_MUSIC_KEY, on ? 'on' : 'off');
  } catch {
    // private mode: the session
  }
  for (const l of phoneMusicListeners) l();
}
/** This phone's music volume, 0–100 (the owner, 2026-09-23: turn it down to hear the reader). */
export function phoneMusicVolume(): number {
  try {
    const v = localStorage.getItem(PHONE_MUSIC_VOLUME_KEY);
    if (v !== null && Number.isFinite(Number(v))) return Math.max(0, Math.min(100, Number(v)));
    return (
      OLD_LEVELS[localStorage.getItem(PHONE_MUSIC_LEVEL_KEY) ?? ''] ?? PHONE_MUSIC_DEFAULT_VOLUME
    );
  } catch {
    return PHONE_MUSIC_DEFAULT_VOLUME;
  }
}
export function setPhoneMusicVolume(volume: number): void {
  try {
    localStorage.setItem(PHONE_MUSIC_VOLUME_KEY, String(Math.round(volume)));
  } catch {
    // private mode
  }
  for (const l of phoneMusicListeners) l();
}
export function subscribePhoneMusic(cb: () => void): () => void {
  phoneMusicListeners.add(cb);
  return () => phoneMusicListeners.delete(cb);
}

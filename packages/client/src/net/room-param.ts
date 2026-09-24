// I-658 B: the phone's address follows the room it is really in, so a reload or a share after the
// TV's "start over" uses the new code, not the retired one. Split from controller.ts (line cap).

/** Swaps `?room=` in the address (only when one is there and differs); true if it changed. */
export function replaceRoomParam(code: string): boolean {
  try {
    const url = new URL(window.location.href);
    const now = url.searchParams.get('room');
    if (!now || now.toUpperCase() === code) return false;
    url.searchParams.set('room', code);
    window.history.replaceState(window.history.state, '', url);
    return true;
  } catch {
    return false;
  }
}

/** After a "room not found" (a start over): point the address at the new house room, then call
 *  `changed` so the join form shows it. */
export function followHouseRoom(changed: () => void): void {
  void fetch('/api/info')
    .then((r) => r.json() as Promise<{ houseRoom?: string }>)
    .then((i) => {
      if (i.houseRoom && replaceRoomParam(i.houseRoom)) changed();
    })
    .catch(() => undefined);
}

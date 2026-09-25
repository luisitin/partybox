// This phone's "I can see the TV" (game pack Part 00 §3.3, ADR-047): remembered on the phone once
// its player says, sent with every join; until then the host guesses from the phone's address.
// `?canSeeTv=0` / `=1` on the page's URL overrides it (the harness films a remote phone that way).
// And who the room should be asked about (the VIP's phone and the TV both ask).
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';

const KEY = 'partybox:can-see-tv';

function fromUrl(): boolean | undefined {
  try {
    const v = new URLSearchParams(location.search).get('canSeeTv');
    return v === '0' ? false : v === '1' ? true : undefined;
  } catch {
    return undefined;
  }
}

/** The phone's own answer, or undefined when it never gave one (the host's guess stands). */
export function storedCanSeeTv(): boolean | undefined {
  const forced = fromUrl();
  if (forced !== undefined) return forced;
  try {
    const v = localStorage.getItem(KEY);
    return v === 'off' ? false : v === 'on' ? true : undefined;
  } catch {
    return undefined;
  }
}

export function storeCanSeeTv(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* private mode: the choice lasts until the next join */
  }
}

/** The people who can't see the TV, when the room should be asked about them. */
export function awayToAsk(room: RoomSnapshot | null | undefined): PlayerPublic[] {
  if (!room || room.status === 'playing' || room.phoneOnly) return [];
  if ((room.presenceMode ?? 'together') !== 'together') return [];
  return room.players.filter((p) => !p.bot && p.canSeeTv === false);
}

// This phone's "I can see the TV" (game pack Part 00 §3.3, ADR-047): remembered on the phone once
// its player says, for that room and that evening only (a friend who said "can't see" from home last
// week is on the couch tonight, reviewer C3), sent with every join; until then the host guesses from
// the phone's address.
// `?canSeeTv=0` / `=1` on the page's URL overrides it (the harness films a remote phone that way).
// And who the room should be asked about (the VIP's phone and the TV both ask).
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';

const KEY = 'partybox:can-see-tv';
/** An answer outlives a reload or a dropped phone, not the night. */
const KEEP_MS = 12 * 60 * 60 * 1000;

function fromUrl(): boolean | undefined {
  try {
    const v = new URLSearchParams(location.search).get('canSeeTv');
    return v === '0' ? false : v === '1' ? true : undefined;
  } catch {
    return undefined;
  }
}

/** The phone's own answer in this room, or undefined when it never gave one there tonight (the
 *  host's guess stands). */
export function storedCanSeeTv(roomCode: string | undefined): boolean | undefined {
  const forced = fromUrl();
  if (forced !== undefined) return forced;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Saved | null;
    if (!saved || !roomCode || saved.room !== roomCode) return undefined;
    if (!(Date.now() - saved.at < KEEP_MS)) return undefined;
    return saved.on;
  } catch {
    return undefined;
  }
}

interface Saved {
  on: boolean;
  room: string;
  at: number;
}

export function storeCanSeeTv(on: boolean, roomCode: string | undefined): void {
  if (!roomCode) return;
  try {
    const saved: Saved = { on, room: roomCode, at: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(saved));
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

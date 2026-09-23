// I-744 C: the host's rooms survive a restart. Every change rewrites <recordings>/rooms.json (queued,
// debounced); on boot the host restores them: the same codes, the same players and tokens (so
// every phone rejoins as itself), the VIP and the settings. A running game is not kept: its room
// comes back to the lobby. Bots come back too (the bot manager drives them from the room).
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RoomState } from '@partybox/engine';

export interface SavedRooms {
  house: string;
  rooms: RoomState[];
}

export interface RoomStore {
  load(): SavedRooms | null;
  save(saved: SavedRooms): void;
}

/** What a restored room looks like: nobody connected yet, no game running. */
export function restoredRoom(room: RoomState, now: number): RoomState {
  const players = Object.fromEntries(
    Object.entries(room.players).map(([id, p]) => [
      id,
      { ...p, connected: Boolean(p.bot), disconnectedAt: p.bot ? null : now, spectator: false },
    ]),
  );
  const wasPlaying = room.status === 'playing';
  return {
    ...room,
    players,
    game: null,
    status: wasPlaying ? 'lobby' : room.status,
    results: wasPlaying ? null : room.results,
  };
}

export function createRoomStore(dir: string | null): RoomStore {
  let writes = Promise.resolve();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: string | null = null;
  const flush = (): void => {
    timer = null;
    if (!dir || pending === null) return;
    const text = pending;
    pending = null;
    writes = writes
      .then(async () => {
        await mkdir(dir, { recursive: true });
        await writeFile(join(dir, 'rooms.json'), text, 'utf8');
      })
      .catch(() => undefined);
  };
  return {
    load: () => {
      if (!dir) return null;
      try {
        const raw = JSON.parse(readFileSync(join(dir, 'rooms.json'), 'utf8')) as SavedRooms;
        return raw && typeof raw.house === 'string' && Array.isArray(raw.rooms) ? raw : null;
      } catch {
        return null;
      }
    },
    save: (saved) => {
      // the running game is never written (it would not survive the restart anyway)
      pending = JSON.stringify({ house: saved.house, rooms: saved.rooms.map((r) => ({ ...r, game: null })) });
      if (!timer) timer = setTimeout(flush, 300);
    },
  };
}

// Opening or joining a room on the web (ADR-034). Two shapes, one result: a Link the stores talk
// to. Hosting also spins up the engine in this tab; joining only dials the tab that already has it.
import type { EngineDeps } from '@partybox/engine';
import { LAST_ROOM_KEY, ROOM_CODE_ATTEMPTS } from '../config';
import { RoomCodeTakenError, connectToRoom, openPeerHost } from './peer';
import type { PeerHost as PeerHostLike } from './peer';
import { createRoomHost } from './room-host';
import { createLoopbackLink } from './wire';
import type { Link } from './wire';

export interface Room {
  code: string;
  /** True when the engine runs in this tab: closing it ends the party for everyone. */
  hosting: boolean;
  /** False when the signalling broker could not be reached: you can play, nobody can join yet. */
  reachable: boolean;
  link: Link;
  /** Hosting only: try to make the room reachable again. Resolves to the new `reachable`. */
  retryShare(): Promise<boolean>;
  close(): void;
}

export function rememberRoom(code: string | null): void {
  try {
    if (code) localStorage.setItem(LAST_ROOM_KEY, code);
    else localStorage.removeItem(LAST_ROOM_KEY);
  } catch {
    /* private mode: the code just will not be prefilled next time */
  }
}

export function lastRoom(): string | null {
  try {
    return localStorage.getItem(LAST_ROOM_KEY);
  } catch {
    return null;
  }
}

/**
 * Starts a room in this tab. Room codes double as the address other players dial, and the broker
 * hands out each id once, so a code another party is already using is simply swapped for the next
 * one the engine mints.
 */
export async function hostRoom(deps: EngineDeps): Promise<Room> {
  let room: ReturnType<typeof createRoomHost> | null = null;
  let peer: Awaited<ReturnType<typeof openPeerHost>> | null = null;
  let offline: unknown = null;

  // A code the broker already knows belongs to someone else's party: take the next one the engine
  // mints. Any other failure (no network, a broker having a bad day) is not fatal — the room opens
  // anyway and `retryShare` can make it reachable later, rather than losing the party over it.
  for (let attempt = 0; attempt < ROOM_CODE_ATTEMPTS && peer === null; attempt++) {
    room = createRoomHost(deps);
    try {
      peer = await openPeerHost(room.code);
    } catch (err) {
      if (err instanceof RoomCodeTakenError) {
        room.close();
        room = null;
        continue;
      }
      offline = err;
      break;
    }
  }
  const hosted = room ?? createRoomHost(deps);
  if (peer === null && offline === null)
    offline = new Error('Every room code was taken — try again in a moment.');

  const welcome = (client: Parameters<Parameters<PeerHostLike['onClient']>[0]>[0]): void => {
    const session = hosted.attach(client);
    client.onMessage((event, payload) => session.receive(event, payload));
    client.onClose(() => session.detach());
  };
  peer?.onClient(welcome);

  // The host's own phone: the same two-way shape, no network in between.
  const loop = createLoopbackLink();
  const own = hosted.attach({
    id: 'self',
    send: (event, payload) => loop.server.send(event, payload),
    close: () => undefined,
  });
  loop.server.onMessage((event, payload) => own.receive(event, payload));
  rememberRoom(hosted.code);

  return {
    code: hosted.code,
    hosting: true,
    reachable: peer !== null,
    link: loop.client,
    async retryShare() {
      if (peer !== null) return true;
      try {
        peer = await openPeerHost(hosted.code);
        peer.onClient(welcome);
        return true;
      } catch {
        return false;
      }
    },
    close() {
      own.detach();
      peer?.close();
      hosted.close();
    },
  };
}

export function joinRoom(code: string): Room {
  const link = connectToRoom(code);
  rememberRoom(code);
  return {
    code,
    hosting: false,
    reachable: true,
    link,
    retryShare: () => Promise.resolve(true),
    close: () => link.close(),
  };
}

// Helpers for the Socket.IO layer (sockets.ts), kept apart so that file stays one screen of wiring.
import type { Socket } from 'socket.io';

/**
 * I-750 B: latest wins — a room/view push is a full state, so while the connection is busy
 * (still writing, or more than 16 KB handed to the network and not yet sent), the newest replaces
 * the one waiting instead of queueing behind it: a slow phone renders the present, not the
 * backlog. Everything else is sent in order.
 * (SECOND BUILD: waited on the connection's 'drain' event, which did not always come, so a
 *  waiting push could be lost, and a newer one sent directly overtook it. Now: while one is
 *  waiting, newer ones wait too, and a 15 ms timer sends when the connection is free.)
 */
export function createLatestWinsEmitter(): (
  socket: Socket,
  event: string,
  payload: unknown,
) => void {
  /** The newest room/view push waiting for a busy connection, per socket. */
  const latest = new Map<Socket, Map<string, unknown>>();
  const ticking = new Set<Socket>();
  const busy = (socket: Socket): boolean => {
    const transport = socket.conn.transport as unknown as {
      writable: boolean;
      socket?: { bufferedAmount?: number };
    };
    return !transport.writable || (transport.socket?.bufferedAmount ?? 0) > 16 * 1024;
  };
  return (socket, event, payload) => {
    if ((event === 'room' || event === 'view') && (busy(socket) || latest.has(socket))) {
      const waiting = latest.get(socket) ?? new Map<string, unknown>();
      waiting.set(event, payload);
      latest.set(socket, waiting);
      if (!ticking.has(socket)) {
        ticking.add(socket);
        const tick = (): void => {
          if (!socket.connected) {
            latest.delete(socket);
            ticking.delete(socket);
            return;
          }
          if (busy(socket)) {
            setTimeout(tick, 15);
            return;
          }
          const due = latest.get(socket);
          latest.delete(socket);
          ticking.delete(socket);
          for (const [ev, p] of due ?? []) socket.emit(ev, p);
        };
        setTimeout(tick, 15);
      }
      return;
    }
    socket.emit(event, payload);
  };
}

/**
 * I-755 C: a login that joins more than 3 times in 5 s is two tabs fighting — the newest attempt
 * is told so instead of taking the seat. Returns true when this join is one too many.
 */
export function createJoinFloodGuard(): (token: string) => boolean {
  /** Recent join times per login token. */
  const joinsByToken = new Map<string, number[]>();
  return (token) => {
    const now = Date.now();
    const recent = (joinsByToken.get(token) ?? []).filter((t) => now - t < 5000);
    recent.push(now);
    joinsByToken.set(token, recent);
    if (joinsByToken.size > 500)
      for (const [k, v] of joinsByToken) if (now - (v.at(-1) ?? 0) > 5000) joinsByToken.delete(k);
    return recent.length > 3;
  };
}

/**
 * I-753 C: a browser page from another website may not open a PartyBox socket (browsers do not
 * apply CORS to WebSockets, so the Origin is checked here); tools without an Origin are fine.
 */
export function sameOriginOnly(
  req: { headers: { origin?: string; host?: string } },
  callback: (err: string | null | undefined, success: boolean) => void,
): void {
  const from = req.headers.origin;
  if (!from) return callback(null, true);
  try {
    callback(null, new URL(from).host === req.headers.host);
  } catch {
    callback(null, false);
  }
}

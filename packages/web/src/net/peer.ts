// WebRTC over PeerJS (ADR-034). GitHub Pages serves files, not sockets, so there is no server to
// host a room: the first player's tab does, and everyone else opens a data channel straight to it.
// PeerJS's broker is used for signalling only — the offers/answers that let two browsers find each
// other. Once a channel is open the game traffic is peer-to-peer and touches no third party.
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { PEER_CONFIG, PEER_NAMESPACE } from '../config';
import { isWireMessage, peerIdFor } from './wire';
import type { Link, LinkStatus, WireHandler } from './wire';

/** Room codes are global on the broker, so a fresh code is tried when one is already claimed. */
export class RoomCodeTakenError extends Error {}

export interface PeerHost {
  /** Called for every guest that opens a channel; return a receiver for their messages. */
  onClient(handler: (client: PeerClient) => void): void;
  close(): void;
}

export interface PeerClient {
  id: string;
  send(event: string, payload: unknown): void;
  onMessage(handler: WireHandler): void;
  onClose(handler: () => void): void;
  close(): void;
}

/** Claims `<namespace>-<CODE>` on the broker. Rejects with RoomCodeTakenError if someone has it. */
export async function openPeerHost(roomCode: string): Promise<PeerHost> {
  const peer = new Peer(peerIdFor(roomCode, PEER_NAMESPACE), PEER_CONFIG);
  await new Promise<void>((resolve, reject) => {
    const onError = (err: Error & { type?: string }): void => {
      reject(err.type === 'unavailable-id' ? new RoomCodeTakenError(roomCode) : err);
    };
    peer.once('open', () => {
      peer.off('error', onError);
      resolve();
    });
    peer.once('error', onError);
  });
  let handler: ((client: PeerClient) => void) | null = null;
  peer.on('connection', (conn) => {
    conn.on('open', () => handler?.(wrap(conn)));
  });
  return {
    onClient(next) {
      handler = next;
    },
    close: () => peer.destroy(),
  };
}

function wrap(conn: DataConnection): PeerClient {
  const messages = new Set<WireHandler>();
  const closers = new Set<() => void>();
  conn.on('data', (raw) => {
    if (!isWireMessage(raw)) return;
    for (const h of [...messages]) h(raw.e, raw.p);
  });
  const goodbye = (): void => {
    for (const h of [...closers]) h();
    closers.clear();
  };
  conn.on('close', goodbye);
  conn.on('error', goodbye);
  return {
    id: conn.connectionId,
    send: (e, p) => {
      if (conn.open) void conn.send({ e, p });
    },
    onMessage: (h) => void messages.add(h),
    onClose: (h) => void closers.add(h),
    close: () => conn.close(),
  };
}

/**
 * A guest's side. Reconnects on its own: a dropped channel is retried with a growing delay, and
 * the engine's 120 s disconnect grace means a player who comes back inside it keeps their seat.
 */
export function connectToRoom(roomCode: string): Link {
  const messages = new Set<WireHandler>();
  const watchers = new Set<(status: LinkStatus) => void>();
  let status: LinkStatus = 'connecting';
  let conn: DataConnection | null = null;
  let peer: Peer | null = null;
  let attempt = 0;
  let closed = false;
  let retry: ReturnType<typeof setTimeout> | null = null;

  const setStatus = (next: LinkStatus): void => {
    if (status === next) return;
    status = next;
    for (const w of [...watchers]) w(next);
  };

  const dial = (): void => {
    if (closed) return;
    peer?.destroy();
    peer = new Peer(PEER_CONFIG);
    peer.on('open', () => {
      const next = peer?.connect(peerIdFor(roomCode, PEER_NAMESPACE), { reliable: true });
      if (!next) return;
      next.on('open', () => {
        attempt = 0;
        conn = next;
        setStatus('open');
      });
      next.on('data', (raw) => {
        if (!isWireMessage(raw)) return;
        for (const h of [...messages]) h(raw.e, raw.p);
      });
      next.on('close', again);
      next.on('error', again);
    });
    peer.on('error', again);
  };

  // Backoff capped at 8 s: a host that closed their tab is gone, but a phone that walked through a
  // tunnel should get back in without the person touching anything.
  function again(): void {
    if (closed) return;
    conn = null;
    setStatus('connecting');
    if (retry) return;
    attempt += 1;
    retry = setTimeout(
      () => {
        retry = null;
        dial();
      },
      Math.min(8000, 500 * 2 ** Math.min(attempt, 4)),
    );
  }

  dial();

  return {
    send: (e, p) => {
      if (conn?.open) void conn.send({ e, p });
    },
    onMessage(handler) {
      messages.add(handler);
      return () => messages.delete(handler);
    },
    onStatus(handler) {
      watchers.add(handler);
      return () => watchers.delete(handler);
    },
    status: () => status,
    close() {
      closed = true;
      if (retry) clearTimeout(retry);
      conn?.close();
      peer?.destroy();
      setStatus('closed');
    },
  };
}

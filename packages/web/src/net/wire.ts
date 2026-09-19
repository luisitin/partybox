// One WebRTC data channel carries what a LAN player needs two sockets for: their phone AND the
// stage they would otherwise read off the TV. Controller events keep the names in docs/PROTOCOL.md;
// the stage's copies are the same names under a `tv:` prefix, in both directions.
export const TV_PREFIX = 'tv:';

export interface WireMessage {
  /** Event name — a docs/PROTOCOL.md name, or one prefixed `tv:`. */
  e: string;
  p: unknown;
}

export function isWireMessage(value: unknown): value is WireMessage {
  return (
    typeof value === 'object' && value !== null && typeof (value as WireMessage).e === 'string'
  );
}

/** The peer id a room is reachable at. Versioned: an old tab must not dial a new host. */
export function peerIdFor(roomCode: string, namespace: string): string {
  return `${namespace}-${roomCode.toUpperCase()}`;
}

export type WireHandler = (event: string, payload: unknown) => void;

/** A two-way channel to one counterpart: a remote peer, or this very tab. */
export interface Link {
  send(event: string, payload: unknown): void;
  onMessage(handler: WireHandler): () => void;
  onStatus(handler: (status: LinkStatus) => void): () => void;
  status(): LinkStatus;
  close(): void;
}

export type LinkStatus = 'connecting' | 'open' | 'closed';

/**
 * The VIP's own phone talks to the host that runs in the same tab. No serialisation, no network —
 * but the same two-way shape, so every screen above it is identical for the host and the guests.
 */
export function createLoopbackLink(): { client: Link; server: Link } {
  const toClient = new Set<WireHandler>();
  const toServer = new Set<WireHandler>();
  const endpoint = (mine: Set<WireHandler>, theirs: Set<WireHandler>): Link => ({
    send(event, payload) {
      // Asynchronous on purpose: a synchronous echo would re-enter the host mid-dispatch.
      queueMicrotask(() => {
        for (const handler of [...theirs]) handler(event, payload);
      });
    },
    onMessage(handler) {
      mine.add(handler);
      return () => mine.delete(handler);
    },
    onStatus(handler) {
      queueMicrotask(() => handler('open'));
      return () => undefined;
    },
    status: () => 'open',
    close: () => undefined,
  });
  return { client: endpoint(toClient, toServer), server: endpoint(toServer, toClient) };
}

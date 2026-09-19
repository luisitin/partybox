// One data channel, two stores. The controller store (docs/PROTOCOL.md events) and the stage store
// (the same events under a `tv:` prefix) each get a NetTransport view of the same Link, so both
// reuse the client's real stores instead of a web-only copy of them.
import type { NetTransport } from '@partybox/client';
import { TV_PREFIX } from './wire';
import type { Link } from './wire';

type Handlers = Map<string, ((payload: unknown) => void)[]>;

function fanOut(handlers: Handlers, event: string, payload: unknown): void {
  for (const handler of handlers.get(event) ?? []) handler(payload);
}

/**
 * Both stores react to `connect` / `disconnect`, which a socket gives them for free. A Link's
 * status is the same signal under another name: `open` means the room is reachable.
 */
function bridge(
  link: Link,
  handlers: Handlers,
  accepts: (event: string) => string | null,
): NetTransport {
  link.onMessage((event, payload) => {
    const local = accepts(event);
    if (local !== null) fanOut(handlers, local, payload);
  });
  link.onStatus((status) => fanOut(handlers, status === 'open' ? 'connect' : 'disconnect', 'link'));
  return {
    emit: (event, payload) => link.send(event, payload),
    on: (event, handler) => {
      handlers.set(event, [...(handlers.get(event) ?? []), handler as (p: unknown) => void]);
      // A store that subscribes after the link is already open would otherwise wait for a drop.
      if (event === 'connect' && link.status() === 'open')
        queueMicrotask(() => (handler as (p: unknown) => void)('link'));
    },
    connected: () => link.status() === 'open',
    connect: () => undefined,
    drop: () => undefined,
  };
}

/** The phone half: every event that is not the stage's. */
export function controllerTransport(link: Link): NetTransport {
  return bridge(link, new Map(), (event) => (event.startsWith(TV_PREFIX) ? null : event));
}

/**
 * The stage half. It sends `tv:vip` / `tv:bot` like a TV does, but on the web the stage is the
 * player's own screen, so the host applies those with that player's VIP rights — nobody gets the
 * TV's no-VIP-check powers (ADR-031) when the TV is everybody's phone.
 */
export function stageTransport(link: Link): NetTransport {
  return bridge(link, new Map(), (event) =>
    event.startsWith(TV_PREFIX) ? event.slice(TV_PREFIX.length) : null,
  );
}

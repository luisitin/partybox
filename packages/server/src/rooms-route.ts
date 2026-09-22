// POST /api/rooms (ADR-043, the owner 2026-09-22): a phone that does not know a code can open its
// own room — with a code it picked, when that code is free — instead of being stuck on the join
// form.
import type { FastifyInstance } from 'fastify';
import type { Server as IoServer } from 'socket.io';
import { ROOM_CODE_ALPHABET, isRoomCode } from '@partybox/shared';
import type { Clock } from './clock';
import type { Host } from './host';
import { createRateLimiter } from './rate-limit';
import type { RateLimiter } from './rate-limit';

/** An empty phone-made room nobody joined is reaped after this; a host keeps at most MAX_ROOMS. */
export const ROOM_IDLE_MS = 10 * 60_000;
export const MAX_ROOMS = 12;

export function registerRoomsRoute(
  fastify: FastifyInstance,
  deps: { host: Host; clock: Clock; io: IoServer },
): void {
  const { host, clock, io } = deps;
  // A phone opens a handful of rooms in a party, not dozens — and through the tunnel this route is
  // on the internet. One bucket per client address (the tunnel's own header when present: every
  // tunnelled request arrives from the local cloudflared): a burst of 3, then one per 20 s. Only a
  // room actually opened is charged — a mistyped or taken code costs nothing.
  const buckets = new Map<string, RateLimiter>();
  const bucket = (key: string): RateLimiter => {
    if (buckets.size > 500) buckets.clear(); // a party never has 500 addresses; a flood is reset
    let b = buckets.get(key);
    if (!b) {
      b = createRateLimiter(1 / 20, 3);
      buckets.set(key, b);
    }
    return b;
  };

  fastify.post('/api/rooms', async (req, reply) => {
    // Reap only a room nobody is using: no players, not the house room, idle long enough on the
    // ROOM clock (createdAt is stamped by it — Date.now() drifts from a dev clock), and no TV
    // watching it: a TV opened on /tv?room=CODE before anyone joins must not be pulled away to
    // the house room because someone else opened a room.
    for (const room of host.rooms())
      if (
        room.code !== host.house().code &&
        Object.keys(room.players).length === 0 &&
        clock.now() - room.createdAt > ROOM_IDLE_MS &&
        (io.sockets.adapter.rooms.get(`tv:${room.code}`)?.size ?? 0) === 0
      )
        host.drop(room.code);

    const body = (req.body ?? {}) as { code?: unknown; listed?: unknown };
    const wanted = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    if (wanted && !isRoomCode(wanted))
      return reply.code(400).send({
        error: 'invalid',
        message: `A code is 4 letters from ${ROOM_CODE_ALPHABET}.`,
      });
    if (wanted && host.get(wanted))
      return reply.code(409).send({ error: 'taken', message: 'That code is already in use.' });
    if (host.rooms().length >= MAX_ROOMS)
      return reply.code(429).send({ error: 'too_many_rooms', message: 'Too many rooms open.' });
    const who = String(req.headers['cf-connecting-ip'] ?? req.ip);
    if (!bucket(who).take())
      return reply
        .code(429)
        .send({ error: 'slow_down', message: 'That was a lot of rooms — try again in a moment.' });
    const room = host.createRoom({
      code: wanted || undefined,
      listed: body.listed === false ? false : true,
    });
    return { code: room.code, listed: room.listed };
  });
}

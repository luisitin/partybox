// A person's small room messages — nudge, vote, presence: each checks the seat, validates its
// payload, pays its rate-limit tokens and hands the host one event. Split from sockets.ts.
import type { Socket } from 'socket.io';
import type { ErrorPayload } from '@partybox/shared';
import { presencePayloadSchema, votePayloadSchema } from '@partybox/shared';
import type { Host } from './host';
import type { RateLimiter } from './rate-limit';

/** The socket's seat, read live (a join fills it in after these handlers are registered). */
interface Seat {
  playerId: string | null;
  code: string | null;
}

export function registerPersonMessages(
  socket: Socket,
  seat: Seat,
  limiter: RateLimiter,
  host: Host,
  sendError: (code: ErrorPayload['code'], message: string) => void,
): void {
  const seated = (): { playerId: string; code: string } | null => {
    if (seat.playerId && seat.code) return { playerId: seat.playerId, code: seat.code };
    sendError('not_in_room', 'Join a room first.');
    return null;
  };

  // I-070 A: a nudge costs 10 tokens (two per 20 s at most) and the engine ignores the VIP's.
  socket.on('nudge', () => {
    const me = seated();
    if (!me) return;
    if (!limiter.take(10)) return sendError('rate_limited', 'Slow down.');
    host.dispatch(me.code, { type: 'nudge', playerId: me.playerId });
  });

  // I-650: a vote for the next game — 2 tokens, so a thumb can change its mind a few times.
  socket.on('vote', (raw: unknown) => {
    const me = seated();
    if (!me) return;
    const parsed = votePayloadSchema.safeParse(raw);
    if (!parsed.success) return sendError('invalid_payload', 'Bad vote payload.');
    if (!limiter.take(2)) return sendError('rate_limited', 'Slow down.');
    host.dispatch(me.code, { type: 'vote', playerId: me.playerId, gameId: parsed.data.gameId });
  });

  // ADR-047: the phone's "I can see the TV" (🎨) — 2 tokens, a toggle, not a stream.
  socket.on('presence', (raw: unknown) => {
    const me = seated();
    if (!me) return;
    const parsed = presencePayloadSchema.safeParse(raw);
    if (!parsed.success) return sendError('invalid_payload', 'Bad presence payload.');
    if (!limiter.take(2)) return sendError('rate_limited', 'Slow down.');
    host.dispatch(me.code, {
      type: 'presence',
      playerId: me.playerId,
      canSeeTv: parsed.data.canSeeTv,
    });
  });
}

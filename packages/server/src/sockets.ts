// Socket.IO wiring (docs/PROTOCOL.md): validates every payload with the shared zod schemas,
// rate-limits, maps sockets to players/TVs, and forwards to the host. Never throws into a handler.
import type { Server as HttpServer } from 'node:http';
import { Server as IoServer } from 'socket.io';
import type { Socket } from 'socket.io';
import type { EngineDeps } from '@partybox/engine';
import {
  DEFAULT_MAX_INPUT_BYTES,
  HARD_MAX_INPUT_BYTES,
  LIMITS,
  inputPayloadSchema,
  isRoomCode,
  joinPayloadSchema,
  normalizeRoomCode,
  tvJoinPayloadSchema,
  vipPayloadSchema,
} from '@partybox/shared';
import type { ErrorPayload } from '@partybox/shared';
import type { Host, Transport } from './host';
import { createRateLimiter, jsonBytes } from './rate-limit';

interface SocketData {
  role: 'controller' | 'tv' | null;
  playerId: string | null;
  code: string | null;
}

export interface SocketLayer {
  io: IoServer;
  transport: Transport;
  /** Wires the host once it exists (host and sockets need each other). */
  attach(host: Host, deps: EngineDeps): void;
}

export function createSocketLayer(server: HttpServer): SocketLayer {
  const io = new IoServer(server, {
    maxHttpBufferSize: HARD_MAX_INPUT_BYTES + 4096,
    pingInterval: LIMITS.pingIntervalMs,
    pingTimeout: LIMITS.pingTimeoutMs,
    serveClient: false,
    cors: { origin: true },
  });
  const byPlayer = new Map<string, Socket>();

  const transport: Transport = {
    toPlayer: (playerId, event, payload) => byPlayer.get(playerId)?.emit(event, payload),
    toTvs: (code, event, payload) => io.to(`tv:${code}`).emit(event, payload),
    toAll: (code, event, payload) => io.to(`tv:${code}`).to(`room:${code}`).emit(event, payload),
    disconnectPlayer: (playerId) => {
      const socket = byPlayer.get(playerId);
      byPlayer.delete(playerId);
      if (socket) {
        (socket.data as SocketData).playerId = null;
        socket.disconnect(true);
      }
    },
  };

  function attach(host: Host, deps: EngineDeps): void {
    io.on('connection', (socket) => {
      const data: SocketData = { role: null, playerId: null, code: null };
      socket.data = data;
      const limiter = createRateLimiter();
      const sendError = (code: ErrorPayload['code'], message: string): void => {
        socket.emit('error', { code, message } satisfies ErrorPayload);
      };

      function resolveRoom(raw: string | undefined): string | null {
        if (raw !== undefined && raw !== '') {
          const code = normalizeRoomCode(raw);
          return isRoomCode(code) && host.get(code) ? code : null;
        }
        const open = host.rooms().filter((r) => !r.locked);
        return open.length === 1
          ? (open[0]?.code ?? null)
          : host.rooms().length === 1
            ? (host.rooms()[0]?.code ?? null)
            : null;
      }

      socket.on('join', (raw: unknown) => {
        const parsed = joinPayloadSchema.safeParse(raw);
        if (!parsed.success) return sendError('invalid_payload', 'Bad join payload.');
        // One role and one identity per socket (docs/PROTOCOL.md): a TV never plays (F-005) and a
        // phone that already holds a player must `leave` first, otherwise the earlier player would
        // stay "connected" with no socket behind it, forever (F-003).
        if (data.role === 'tv') return sendError('invalid_payload', 'TVs cannot join as players.');
        const code = resolveRoom(parsed.data.roomCode);
        if (!code) return sendError('room_not_found', 'No room with that code.');
        const { playerId, token } = host.mintPlayer();
        // Map this socket to both the provisional id and (for a resume) the existing player BEFORE
        // dispatching, so the engine's welcome/error effects land on this socket.
        const resumed = parsed.data.token
          ? Object.values(host.get(code)?.players ?? {}).find((p) => p.token === parsed.data.token)
          : undefined;
        if (
          data.playerId &&
          byPlayer.get(data.playerId) === socket &&
          resumed?.id !== data.playerId
        )
          return sendError('invalid_payload', 'Leave the room before joining again.');
        for (const id of [playerId, resumed?.id]) {
          if (!id) continue;
          const previous = byPlayer.get(id);
          if (previous && previous !== socket) {
            (previous.data as SocketData).playerId = null;
            previous.disconnect(true);
          }
          byPlayer.set(id, socket);
        }
        const result = host.dispatch(code, {
          type: 'join',
          playerId,
          token,
          name: parsed.data.name,
          avatarId: parsed.data.avatarId,
          existingToken: parsed.data.token,
        });
        const welcome = result?.effects.find((e) => e.type === 'welcome');
        for (const id of [playerId, resumed?.id])
          if (id && (!welcome || welcome.type !== 'welcome' || welcome.playerId !== id))
            byPlayer.delete(id);
        if (!welcome || welcome.type !== 'welcome') return;
        if (
          data.playerId &&
          data.playerId !== welcome.playerId &&
          byPlayer.get(data.playerId) === socket
        )
          byPlayer.delete(data.playerId);
        data.role = 'controller';
        data.playerId = welcome.playerId;
        data.code = code;
        void socket.join(`room:${code}`);
      });

      socket.on('input', (raw: unknown) => {
        if (!data.playerId || !data.code) return sendError('not_in_room', 'Join a room first.');
        if (!limiter.take()) return sendError('rate_limited', 'Slow down.');
        const parsed = inputPayloadSchema.safeParse(raw);
        if (!parsed.success) return sendError('invalid_payload', 'Bad input payload.');
        const room = host.get(data.code);
        const gameId = room?.game?.gameId;
        const max =
          (gameId && deps.games[gameId]?.manifest.maxInputBytes) || DEFAULT_MAX_INPUT_BYTES;
        if (jsonBytes(parsed.data.input) > max)
          return sendError('payload_too_large', 'That input is too large.');
        host.dispatch(data.code, {
          type: 'input',
          playerId: data.playerId,
          input: parsed.data.input,
        });
        socket.emit('ack', { seq: parsed.data.seq });
      });

      socket.on('vip', (raw: unknown) => {
        if (!data.playerId || !data.code) return sendError('not_in_room', 'Join a room first.');
        const parsed = vipPayloadSchema.safeParse(raw);
        if (!parsed.success) return sendError('invalid_payload', 'Bad VIP payload.');
        const room = host.get(data.code);
        const isVip = room?.players[data.playerId]?.isVip === true;
        if (!limiter.take(isVip ? 1 : 5)) return sendError('rate_limited', 'Slow down.');
        host.dispatch(data.code, { type: 'vip', playerId: data.playerId, action: parsed.data });
      });

      socket.on('leave', () => {
        if (!data.playerId || !data.code) return;
        const { playerId, code } = data;
        byPlayer.delete(playerId);
        data.playerId = null;
        host.dispatch(code, { type: 'leave', playerId });
        void socket.leave(`room:${code}`);
      });

      socket.on('tv:join', (raw: unknown) => {
        const parsed = tvJoinPayloadSchema.safeParse(raw);
        if (!parsed.success) return sendError('invalid_payload', 'Bad TV payload.');
        if (data.role === 'controller')
          return sendError('invalid_payload', 'Phones cannot become TVs.');
        const code = resolveRoom(parsed.data.roomCode) ?? host.house().code;
        if (data.code && data.role === 'tv') void socket.leave(`tv:${data.code}`);
        data.role = 'tv';
        data.code = code;
        void socket.join(`tv:${code}`);
        host.resend(code);
      });

      socket.on('disconnect', () => {
        if (data.role === 'controller' && data.playerId && data.code) {
          if (byPlayer.get(data.playerId) === socket) {
            byPlayer.delete(data.playerId);
            host.dispatch(data.code, { type: 'disconnect', playerId: data.playerId });
          }
        }
      });
    });
  }

  return { io, transport, attach };
}

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
  botPayloadSchema,
} from '@partybox/shared';
import type { ErrorPayload } from '@partybox/shared';
import type { Host, Transport } from './host';
import type { FunnelBook } from './funnel';
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
  attach(host: Host, deps: EngineDeps, funnel?: FunnelBook): void;
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

  function attach(host: Host, deps: EngineDeps, funnel?: FunnelBook): void {
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
        const code = resolveRoom(parsed.data.roomCode);
        if (!code) return sendError('room_not_found', 'No room with that code.');
        const { playerId, token } = host.mintPlayer();
        // Map this socket to both the provisional id and (for a resume) the existing player BEFORE
        // dispatching, so the engine's welcome/error effects land on this socket.
        const resumed = parsed.data.token
          ? Object.values(host.get(code)?.players ?? {}).find((p) => p.token === parsed.data.token)
          : undefined;
        for (const id of [playerId, resumed?.id]) {
          if (!id) continue;
          const previous = byPlayer.get(id);
          if (previous && previous !== socket) {
            (previous.data as SocketData).playerId = null;
            previous.disconnect(true);
          }
          byPlayer.set(id, socket);
        }
        funnel?.attempted(code); // I-077 A
        const result = host.dispatch(code, {
          type: 'join',
          playerId,
          token,
          name: parsed.data.name,
          avatarId: parsed.data.avatarId,
          ...(parsed.data.photo ? { photo: parsed.data.photo } : {}),
          existingToken: parsed.data.token,
        });
        const welcome = result?.effects.find((e) => e.type === 'welcome');
        if (welcome) funnel?.joined(code);
        else {
          const err = result?.effects.find((e) => e.type === 'error');
          funnel?.failed(code, err && err.type === 'error' ? err.code : 'unknown');
        }
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

      socket.on('bot', (raw: unknown) => {
        if (!data.playerId || !data.code) return sendError('not_in_room', 'Join a room first.');
        const parsed = botPayloadSchema.safeParse(raw);
        if (!parsed.success) return sendError('invalid_payload', 'Bad bot payload.');
        if (!limiter.take(5)) return sendError('rate_limited', 'Slow down.');
        if (parsed.data.action === 'add') {
          const { playerId, token } = host.mintPlayer();
          host.dispatch(data.code, {
            type: 'bot-add',
            ownerId: data.playerId,
            playerId,
            token,
            strategy: 'random',
          });
          return;
        }
        host.dispatch(data.code, {
          type: 'bot-remove',
          ownerId: data.playerId,
          botId: parsed.data.botId,
        });
      });

      // I-070 A: a nudge costs 10 tokens (two per 20 s at most) and the engine ignores the VIP's.
      socket.on('nudge', () => {
        if (!data.playerId || !data.code) return sendError('not_in_room', 'Join a room first.');
        if (!limiter.take(10)) return sendError('rate_limited', 'Slow down.');
        host.dispatch(data.code, { type: 'nudge', playerId: data.playerId });
      });

      // I-388: "I'm here" in the lobby (1 token: a toggle).
      socket.on('here', (raw: unknown) => {
        if (!data.playerId || !data.code) return sendError('not_in_room', 'Join a room first.');
        const on = typeof raw === 'object' && raw !== null && (raw as { on?: unknown }).on === true;
        if (!limiter.take(1)) return sendError('rate_limited', 'Slow down.');
        host.dispatch(data.code, { type: 'here', playerId: data.playerId, on });
      });

      socket.on('leave', () => {
        if (!data.playerId || !data.code) return;
        const { playerId, code } = data;
        byPlayer.delete(playerId);
        data.playerId = null;
        host.dispatch(code, { type: 'leave', playerId });
        void socket.leave(`room:${code}`);
      });

      // The TV is the host's screen (ADR-031): it may run any VIP action and add/remove bots,
      // with the engine's `host` flag (no VIP check — a room of bots has no VIP). The sender id is
      // the VIP when there is one so per-player errors land on their phone too.
      function tvActor(): string {
        const room = data.code ? host.get(data.code) : undefined;
        return room?.vipId ?? '@tv';
      }

      function reportErrors(result: ReturnType<Host['dispatch']>): void {
        for (const effect of result?.effects ?? [])
          if (effect.type === 'error') sendError(effect.code, effect.message);
      }

      socket.on('tv:vip', (raw: unknown) => {
        if (data.role !== 'tv' || !data.code)
          return sendError('not_in_room', 'This TV is not watching a room.');
        const parsed = vipPayloadSchema.safeParse(raw);
        if (!parsed.success) return sendError('invalid_payload', 'Bad TV payload.');
        if (!limiter.take(1)) return sendError('rate_limited', 'Slow down.');
        reportErrors(
          host.dispatch(data.code, {
            type: 'vip',
            playerId: tvActor(),
            action: parsed.data,
            host: true,
          }),
        );
      });

      socket.on('tv:bot', (raw: unknown) => {
        if (data.role !== 'tv' || !data.code)
          return sendError('not_in_room', 'This TV is not watching a room.');
        const parsed = botPayloadSchema.safeParse(raw);
        if (!parsed.success) return sendError('invalid_payload', 'Bad TV payload.');
        if (!limiter.take(5)) return sendError('rate_limited', 'Slow down.');
        if (parsed.data.action === 'add') {
          const { playerId, token } = host.mintPlayer();
          reportErrors(
            host.dispatch(data.code, {
              type: 'bot-add',
              ownerId: null,
              playerId,
              token,
              strategy: 'random',
            }),
          );
          return;
        }
        reportErrors(
          host.dispatch(data.code, { type: 'bot-remove', ownerId: null, botId: parsed.data.botId }),
        );
      });

      socket.on('tv:join', (raw: unknown) => {
        const parsed = tvJoinPayloadSchema.safeParse(raw);
        if (!parsed.success) return sendError('invalid_payload', 'Bad TV payload.');
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

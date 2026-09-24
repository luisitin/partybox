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
  nameKey,
  normalizeName,
  votePayloadSchema,
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
    // I-753 C: a browser page from another website may not open a PartyBox socket (browsers do not
    // apply CORS to WebSockets, so the Origin is checked here); tools without an Origin are fine
    allowRequest: (req, callback) => {
      const from = req.headers.origin;
      if (!from) return callback(null, true);
      try {
        callback(null, new URL(from).host === req.headers.host);
      } catch {
        callback(null, false);
      }
    },
  });
  const byPlayer = new Map<string, Socket>();
  /** I-755 C: recent join times per login token. */
  const joinsByToken = new Map<string, number[]>();
  /** I-750 B: the newest room/view push waiting for a busy connection, per socket. */
  const latest = new Map<Socket, Map<string, unknown>>();
  const ticking = new Set<Socket>();
  const busy = (socket: Socket): boolean => {
    const transport = socket.conn.transport as unknown as {
      writable: boolean;
      socket?: { bufferedAmount?: number };
    };
    return !transport.writable || (transport.socket?.bufferedAmount ?? 0) > 16 * 1024;
  };

  const transport: Transport = {
    toPlayer: (playerId, event, payload) => {
      const socket = byPlayer.get(playerId);
      if (!socket) return;
      // I-750 B: latest wins — a room/view push is a full state, so while the connection is busy
      // (still writing, or more than 16 KB handed to the network and not yet sent), the newest
      // replaces the one waiting instead of queueing behind it: a slow phone renders the present,
      // not the backlog. Everything else is sent in order.
      // (SECOND BUILD: waited on the connection's 'drain' event, which did not always come, so a
      //  waiting push could be lost, and a newer one sent directly overtook it. Now: while one is
      //  waiting, newer ones wait too, and a 15 ms timer sends when the connection is free.)
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
    },
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
          if (isRoomCode(code) && host.get(code)) return code;
          // I-658 A: a code the TV's "start over" retired leads to the new room for a while
          return isRoomCode(code) ? (host.aliasOf(code) ?? null) : null;
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
        // I-755 C: a login that joins more than 3 times in 5 s is two tabs fighting — the newest
        // attempt is told so instead of taking the seat
        if (parsed.data.token) {
          const now = Date.now();
          const recent = (joinsByToken.get(parsed.data.token) ?? []).filter((t) => now - t < 5000);
          recent.push(now);
          joinsByToken.set(parsed.data.token, recent);
          if (joinsByToken.size > 500)
            for (const [k, v] of joinsByToken)
              if (now - (v.at(-1) ?? 0) > 5000) joinsByToken.delete(k);
          if (recent.length > 3) {
            socket.emit('kicked', { reason: 'another_tab' });
            return;
          }
        }
        const { playerId, token } = host.mintPlayer();
        // Map this socket to both the provisional id and (for a resume) the existing player BEFORE
        // dispatching, so the engine's welcome/error effects land on this socket.
        const seats = Object.values(host.get(code)?.players ?? {});
        // I-741 A: a token-less join under the name of a disconnected player resumes that seat
        // (ADR-029) — so this socket must be mapped to it too, or the welcome goes to the dead one.
        // I-741 C: "That's me — take my seat" (takeOver) also claims a seat that still reads connected.
        const key = nameKey(normalizeName(parsed.data.name) ?? '');
        const resumed = parsed.data.token
          ? seats.find((p) => p.token === parsed.data.token)
          : key
            ? seats.find(
                (p) =>
                  !p.bot &&
                  nameKey(p.name) === key &&
                  (parsed.data.takeOver === true || !p.connected),
              )
            : undefined;
        for (const id of [playerId, resumed?.id]) {
          if (!id) continue;
          const previous = byPlayer.get(id);
          if (previous && previous !== socket) {
            (previous.data as SocketData).playerId = null;
            // I-755 A: say why, so the other tab stops reconnecting (else two tabs trade the seat
            // ~35 times a second, forever)
            previous.emit('kicked', { reason: 'another_tab' });
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
          ...(parsed.data.takeOver ? { takeOver: true } : {}),
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

      // I-650: a vote for the next game — 2 tokens, so a thumb can change its mind a few times.
      socket.on('vote', (raw: unknown) => {
        if (!data.playerId || !data.code) return sendError('not_in_room', 'Join a room first.');
        const parsed = votePayloadSchema.safeParse(raw);
        if (!parsed.success) return sendError('invalid_payload', 'Bad vote payload.');
        if (!limiter.take(2)) return sendError('rate_limited', 'Slow down.');
        host.dispatch(data.code, {
          type: 'vote',
          playerId: data.playerId,
          gameId: parsed.data.gameId,
        });
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

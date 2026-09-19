// The room, hosted in a browser tab (ADR-034). This is packages/server/src/sockets.ts for the web:
// the same zod schemas, the same rate limits, the same engine — a peer is simply not to be trusted
// any more than a phone on the LAN is. One client here is one person: their controller AND the
// stage they read instead of a TV, so it is both a "player" and a "TV" to the host.
import type { EngineDeps } from '@partybox/engine';
import { createClock, createHost, createRateLimiter, jsonBytes } from '@partybox/host';
import type { Host, Transport } from '@partybox/host';
import {
  DEFAULT_MAX_INPUT_BYTES,
  botPayloadSchema,
  inputPayloadSchema,
  joinPayloadSchema,
  vipPayloadSchema,
} from '@partybox/shared';
import type { ErrorPayload } from '@partybox/shared';
import { TV_PREFIX } from './wire';

interface Client {
  id: string;
  send(event: string, payload: unknown): void;
  close(): void;
  playerId: string | null;
}

export interface RoomHost {
  code: string;
  host: Host;
  /** Wires one client in. The returned `receive` takes everything they send. */
  attach(client: { id: string; send(event: string, payload: unknown): void; close(): void }): {
    receive(event: string, payload: unknown): void;
    detach(): void;
  };
  close(): void;
}

export function createRoomHost(deps: EngineDeps): RoomHost {
  const clients = new Map<string, Client>();
  const byPlayer = new Map<string, string>();

  const transport: Transport = {
    toPlayer: (playerId, event, payload) => {
      const client = clients.get(byPlayer.get(playerId) ?? '');
      client?.send(event, payload);
    },
    // Everyone's stage, because on the web every device is its own TV.
    toTvs: (_code, event, payload) => {
      for (const client of clients.values()) client.send(TV_PREFIX + event, payload);
    },
    // On the LAN this reaches the TV and the phones, which are different screens. Here they are
    // the same device, so it reaches both surfaces of it: the stage shows it, the phone shows it.
    toAll: (_code, event, payload) => {
      for (const client of clients.values()) {
        client.send(TV_PREFIX + event, payload);
        if (client.playerId) client.send(event, payload);
      }
    },
    disconnectPlayer: (playerId) => {
      const client = clients.get(byPlayer.get(playerId) ?? '');
      byPlayer.delete(playerId);
      if (!client) return;
      client.playerId = null;
      client.close();
    },
  };

  const host = createHost({
    deps,
    clock: createClock(),
    transport,
    log: (level, text) => console[level === 'error' ? 'error' : 'warn'](`[room] ${text}`),
  });
  const code = host.house().code;

  function attach(incoming: {
    id: string;
    send(event: string, payload: unknown): void;
    close(): void;
  }): { receive(event: string, payload: unknown): void; detach(): void } {
    const client: Client = { ...incoming, playerId: null };
    clients.set(client.id, client);
    const limiter = createRateLimiter();
    const fail = (errorCode: ErrorPayload['code'], message: string): void =>
      client.send('error', { code: errorCode, message } satisfies ErrorPayload);

    // Every client watches the stage from the moment it connects — there is no separate TV to join.
    host.resend(code);

    const handlers: Record<string, (payload: unknown) => void> = {
      join(payload) {
        const parsed = joinPayloadSchema.safeParse(payload);
        if (!parsed.success) return fail('invalid_payload', 'Bad join payload.');
        const { playerId, token } = host.mintPlayer();
        const resumed = parsed.data.token
          ? Object.values(host.get(code)?.players ?? {}).find((p) => p.token === parsed.data.token)
          : undefined;
        // Claim both ids before dispatching so the engine's welcome/error lands on this client.
        for (const id of [playerId, resumed?.id]) if (id) byPlayer.set(id, client.id);
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
          if (id && welcome?.playerId !== id && byPlayer.get(id) === client.id) byPlayer.delete(id);
        if (!welcome) return;
        if (client.playerId && client.playerId !== welcome.playerId)
          byPlayer.delete(client.playerId);
        client.playerId = welcome.playerId;
      },
      input(payload) {
        if (!client.playerId) return fail('not_in_room', 'Join a room first.');
        if (!limiter.take()) return fail('rate_limited', 'Slow down.');
        const parsed = inputPayloadSchema.safeParse(payload);
        if (!parsed.success) return fail('invalid_payload', 'Bad input payload.');
        const gameId = host.get(code)?.game?.gameId;
        const max =
          (gameId && deps.games[gameId]?.manifest.maxInputBytes) || DEFAULT_MAX_INPUT_BYTES;
        if (jsonBytes(parsed.data.input) > max)
          return fail('payload_too_large', 'That input is too large.');
        host.dispatch(code, { type: 'input', playerId: client.playerId, input: parsed.data.input });
        client.send('ack', { seq: parsed.data.seq });
      },
      vip(payload) {
        if (!client.playerId) return fail('not_in_room', 'Join a room first.');
        const parsed = vipPayloadSchema.safeParse(payload);
        if (!parsed.success) return fail('invalid_payload', 'Bad VIP payload.');
        const isVip = host.get(code)?.players[client.playerId]?.isVip === true;
        if (!limiter.take(isVip ? 1 : 5)) return fail('rate_limited', 'Slow down.');
        host.dispatch(code, { type: 'vip', playerId: client.playerId, action: parsed.data });
      },
      bot(payload) {
        if (!client.playerId) return fail('not_in_room', 'Join a room first.');
        const parsed = botPayloadSchema.safeParse(payload);
        if (!parsed.success) return fail('invalid_payload', 'Bad bot payload.');
        if (!limiter.take(5)) return fail('rate_limited', 'Slow down.');
        if (parsed.data.action === 'add') {
          const { playerId, token } = host.mintPlayer();
          host.dispatch(code, {
            type: 'bot-add',
            ownerId: client.playerId,
            playerId,
            token,
            strategy: 'random',
          });
          return;
        }
        host.dispatch(code, {
          type: 'bot-remove',
          ownerId: client.playerId,
          botId: parsed.data.botId,
        });
      },
      leave() {
        if (!client.playerId) return;
        const playerId = client.playerId;
        client.playerId = null;
        byPlayer.delete(playerId);
        host.dispatch(code, { type: 'leave', playerId });
      },
      // There is no host's screen on the web: nobody gets the TV's no-VIP-check powers (ADR-031),
      // because the stage is each player's own screen. Its controls run as that player, so the
      // engine's VIP rules decide, exactly as they do for the phone half of the same device.
      'tv:join': () => host.resend(code),
      'tv:vip': (payload) => handlers['vip']?.(payload),
      'tv:bot': (payload) => handlers['bot']?.(payload),
    };

    return {
      receive(event, payload) {
        handlers[event]?.(payload);
      },
      detach() {
        clients.delete(client.id);
        if (!client.playerId) return;
        const playerId = client.playerId;
        client.playerId = null;
        if (byPlayer.get(playerId) === client.id) byPlayer.delete(playerId);
        host.dispatch(code, { type: 'disconnect', playerId });
      },
    };
  }

  return { code, host, attach, close: () => host.close() };
}

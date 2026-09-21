// RoomHost: owns the rooms, runs the pure engine, and is the ONLY place effects turn into I/O
// (ADR-010). One pending timer per room, re-armed from `nextWakeAt` after every event (ADR-022).
// Sockets are behind the `Transport` interface so tests can run the host without Socket.IO.
import { randomBytes, randomUUID } from 'node:crypto';
import type { ApplyResult, EngineDeps, RoomEvent, RoomState } from '@partybox/engine';
import {
  applyRoomEvent,
  controllerView,
  createRoom,
  nextWakeAt,
  snapshot,
  tvView,
} from '@partybox/engine';
import type {
  ErrorPayload,
  KickedPayload,
  RoomPush,
  ToastPayload,
  ViewPush,
  WelcomePayload,
} from '@partybox/shared';
import { createRng, roomCodeFrom } from '@partybox/shared';
import type { Clock } from './clock';

export interface Transport {
  toPlayer(playerId: string, event: string, payload: unknown): void;
  toTvs(code: string, event: string, payload: unknown): void;
  /** Every controller AND every TV in the room. */
  toAll(code: string, event: string, payload: unknown): void;
  disconnectPlayer(playerId: string): void;
}

/** A RoomEvent minus `now` — the host stamps the clock. */
export type HostEvent = RoomEvent extends infer E
  ? E extends { now: number }
    ? Omit<E, 'now'>
    : never
  : never;

export interface HostOptions {
  deps: EngineDeps;
  clock: Clock;
  transport: Transport;
  log?: (level: 'warn' | 'error' | 'info', text: string) => void;
}

export interface Host {
  rooms(): RoomState[];
  get(code: string): RoomState | undefined;
  /** The room phones auto-join when it is the only open one. */
  house(): RoomState;
  createRoom(): RoomState;
  dispatch(code: string, event: HostEvent): ApplyResult | undefined;
  /** Re-sends the current snapshot/views (a TV or phone that just connected). */
  resend(code: string, playerId?: string): void;
  /** Drops every room and recreates the house room. */
  reset(): void;
  mintPlayer(): { playerId: string; token: string };
  /** Called after every dispatch with the new room state (bots, metrics). */
  subscribe(listener: (room: RoomState) => void): () => void;
  close(): void;
}

export function createHost(options: HostOptions): Host {
  const { deps, clock, transport } = options;
  const log =
    options.log ?? ((level, text) => console[level === 'info' ? 'log' : level](`[host] ${text}`));
  const rooms = new Map<string, RoomState>();
  const timers = new Map<string, NodeJS.Timeout>();
  const codeRng = createRng(randomBytes(4).readUInt32LE(0));
  const listeners = new Set<(room: RoomState) => void>();
  let houseCode = '';
  /**
   * The last TV view sent per room, serialised. A push whose TV view is unchanged (most phone
   * inputs — a Bingo daub — touch nothing the TV shows) skips the TV, so the stage is not
   * re-rendered for every tap in a busy room (Bingo loop 249). A TV that joins late gets a full
   * push through `resend`, which never consults this.
   */
  const lastTvView = new Map<string, string>();

  function push(room: RoomState): void {
    const roomPush: RoomPush = { rev: room.rev, room: snapshot(room, deps), at: clock.now() };
    const playing = room.status === 'playing';
    for (const player of Object.values(room.players)) {
      transport.toPlayer(player.id, 'room', roomPush);
      if (playing) {
        const view = controllerView(room, player.id, deps);
        if (view)
          transport.toPlayer(player.id, 'view', {
            rev: room.rev,
            view,
            at: clock.now(),
          } satisfies ViewPush<unknown>);
      }
    }
    transport.toTvs(room.code, 'room', roomPush);
    if (playing) {
      const view = tvView(room, deps);
      if (view) {
        const wire = JSON.stringify(view);
        if (lastTvView.get(room.code) !== wire) {
          lastTvView.set(room.code, wire);
          transport.toTvs(room.code, 'view', {
            rev: room.rev,
            view,
            at: clock.now(),
          } satisfies ViewPush<unknown>);
        }
      }
    } else lastTvView.delete(room.code);
  }

  function interpret(room: RoomState, result: ApplyResult): void {
    for (const effect of result.effects) {
      switch (effect.type) {
        case 'welcome': {
          const player = room.players[effect.playerId];
          if (!player) break;
          const payload: WelcomePayload = {
            playerId: player.id,
            token: player.token,
            room: snapshot(room, deps),
            at: clock.now(),
          };
          transport.toPlayer(player.id, 'welcome', payload);
          break;
        }
        case 'push':
          push(room);
          break;
        case 'toast': {
          const payload: ToastPayload = {
            kind: effect.kind,
            text: effect.text,
            ...(effect.playerId ? { playerId: effect.playerId } : {}),
          };
          if (effect.to === 'all') transport.toAll(room.code, 'toast', payload);
          else if (effect.to === 'tvs') transport.toTvs(room.code, 'toast', payload); // I-040
          else transport.toPlayer(effect.to, 'toast', payload);
          break;
        }
        case 'kicked': {
          transport.toPlayer(effect.playerId, 'kicked', {
            reason: effect.reason,
          } satisfies KickedPayload);
          transport.disconnectPlayer(effect.playerId);
          break;
        }
        case 'error':
          transport.toPlayer(effect.to, 'error', {
            code: effect.code,
            message: effect.message,
            ...(effect.player ? { player: effect.player } : {}),
          } satisfies ErrorPayload);
          break;
        case 'log':
          log(effect.level, effect.text);
          break;
      }
    }
  }

  function arm(code: string): void {
    const existing = timers.get(code);
    if (existing) clearTimeout(existing);
    timers.delete(code);
    const room = rooms.get(code);
    if (!room || clock.isFrozen()) return;
    const at = nextWakeAt(room);
    if (at === null) return;
    const delay = Math.max(0, at - clock.now());
    const handle = setTimeout(() => {
      timers.delete(code);
      dispatch(code, { type: 'tick' });
    }, delay);
    timers.set(code, handle);
  }

  function dispatch(code: string, event: HostEvent): ApplyResult | undefined {
    const room = rooms.get(code);
    if (!room) return undefined;
    const result = applyRoomEvent(room, { ...event, now: clock.now() } as RoomEvent, deps);
    rooms.set(code, result.room);
    interpret(result.room, result);
    arm(code);
    for (const listener of listeners) listener(result.room);
    return result;
  }

  function createNewRoom(): RoomState {
    let code = roomCodeFrom(codeRng);
    while (rooms.has(code)) code = roomCodeFrom(codeRng);
    const room = createRoom({ code, now: clock.now() });
    rooms.set(code, room);
    return room;
  }

  function reset(): void {
    for (const handle of timers.values()) clearTimeout(handle);
    timers.clear();
    for (const room of rooms.values())
      for (const p of Object.values(room.players)) transport.disconnectPlayer(p.id);
    rooms.clear();
    houseCode = createNewRoom().code;
  }

  // A frozen clock that jumps forward must fire everything that became due.
  clock.onChange(() => {
    for (const code of rooms.keys()) {
      const room = rooms.get(code);
      const at = room ? nextWakeAt(room) : null;
      if (at !== null && clock.now() >= at) dispatch(code, { type: 'tick' });
      else arm(code);
    }
  });

  reset();

  return {
    rooms: () => [...rooms.values()],
    get: (code) => rooms.get(code),
    house: () => rooms.get(houseCode) as RoomState,
    createRoom: createNewRoom,
    dispatch,
    resend(code, playerId) {
      const room = rooms.get(code);
      if (!room) return;
      if (playerId) {
        transport.toPlayer(playerId, 'room', {
          rev: room.rev,
          room: snapshot(room, deps),
          at: clock.now(),
        } satisfies RoomPush);
        const view = room.status === 'playing' ? controllerView(room, playerId, deps) : null;
        if (view)
          transport.toPlayer(playerId, 'view', {
            rev: room.rev,
            view,
            at: clock.now(),
          } satisfies ViewPush<unknown>);
        return;
      }
      transport.toTvs(code, 'room', {
        rev: room.rev,
        room: snapshot(room, deps),
        at: clock.now(),
      } satisfies RoomPush);
      const view = room.status === 'playing' ? tvView(room, deps) : null;
      if (view)
        transport.toTvs(code, 'view', {
          rev: room.rev,
          view,
          at: clock.now(),
        } satisfies ViewPush<unknown>);
    },
    reset,
    mintPlayer: () => ({ playerId: randomUUID(), token: randomBytes(24).toString('hex') }),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    close() {
      for (const handle of timers.values()) clearTimeout(handle);
      timers.clear();
    },
  };
}

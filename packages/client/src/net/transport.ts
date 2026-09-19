// The wire under the controller and TV stores. On the LAN that is a Socket.IO socket; on the
// GitHub Pages build (ADR-034) it is a WebRTC data channel to whoever is hosting the room — or,
// for the host's own phone, a direct call into the host running in the same tab. Both stores are
// written against this interface so neither of them knows which one it got.
import { io } from 'socket.io-client';

export interface NetTransport {
  emit(event: string, payload: unknown): void;
  on<T>(event: string, handler: (payload: T) => void): void;
  connected(): boolean;
  /** Re-establish the link now (the browser came back online, or a kick closed it). */
  connect(): void;
  /** Drop a link that died silently, so the reconnect loop starts now instead of on ping timeout. */
  drop(): void;
}

export function socketTransport(url?: string): NetTransport {
  const socket = io(url ?? '/', { transports: ['websocket', 'polling'] });
  return {
    emit: (event, payload) => void socket.emit(event, payload),
    on: (event, handler) => void socket.on(event, handler as (payload: unknown) => void),
    connected: () => socket.connected,
    connect: () => void socket.connect(),
    drop: () => socket.io.engine?.close(),
  };
}

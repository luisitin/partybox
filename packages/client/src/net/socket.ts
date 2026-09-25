// The one way a PartyBox page connects: WebSocket first, polling as a fallback, and the lobby's
// game list kept from the `catalog` the host sends on every connection (Part 00 §1.2, ADR-049).
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { setCatalog } from '../catalog';

export function openSocket(url?: string): Socket {
  const socket = io(url ?? '/', { transports: ['websocket', 'polling'] });
  socket.on('catalog', setCatalog);
  return socket;
}

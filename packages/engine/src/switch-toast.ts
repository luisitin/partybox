// I-642 C: a room switch changed — the room is told what it means (the phones translate the
// sentence, client server-text.ts). Only the TV and the VIP hear it: a guest's phone shows the
// change itself, and a toast there covered whatever the guest was reading (S2, three design reviews).
import type { Effect, RoomState } from './types';

export function switchToast(room: RoomState, text: string): Effect[] {
  const toVip: Effect[] = room.vipId ? [{ type: 'toast', to: room.vipId, kind: 'info', text }] : [];
  return [{ type: 'toast', to: 'tvs', kind: 'info', text }, ...toVip];
}

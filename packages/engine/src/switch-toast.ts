// I-642 C: a room switch changed — the room is told what it means (the phones translate the
// sentence, client server-text.ts).
import type { Effect } from './types';

export function switchToast(text: string): Effect {
  return { type: 'toast', to: 'all', kind: 'info', text };
}

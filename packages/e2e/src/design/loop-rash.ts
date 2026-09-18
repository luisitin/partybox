// The loop harness's 'rash' scenario (Bingo, loop 317): every ~15 s a random bot presses BINGO!
// on its first card whatever it holds — two taps 200 ms apart (arm, claim) through the dev API —
// so a soak exercises wrong claims, the check's two beats and the 3 · 2 · 1 back, all game long.
import type { DevApi } from './session';
import { settle } from './session';

const EVERY_MS = 15_000;

let lastAt = 0;

/** Taps if it is time (the module keeps the clock: one harness run per process). */
export async function rashTap(api: DevApi, bots: string[]): Promise<void> {
  if (Date.now() - lastAt < EVERY_MS) return;
  lastAt = Date.now();
  const bot = bots[Math.floor(Math.random() * bots.length)];
  if (!bot) return;
  const tap = { type: 'input', now: Date.now(), playerId: bot, input: { type: 'bingo', card: 0 } };
  await api.post('/api/dev/event', { event: tap });
  await settle(200);
  await api.post('/api/dev/event', { event: { ...tap, now: Date.now() } });
}

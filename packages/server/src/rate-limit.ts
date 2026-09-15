// Token bucket per socket: 20 inputs/s sustained, small burst. Non-VIP `vip` attempts cost extra
// so a misbehaving phone throttles itself instead of the room.
import { LIMITS } from '@partybox/shared';

export interface RateLimiter {
  /** Returns true when the action is allowed (and charged). */
  take(cost?: number, now?: number): boolean;
}

export function createRateLimiter(
  perSecond: number = LIMITS.inputsPerSecond,
  burst: number = perSecond,
): RateLimiter {
  let tokens = burst;
  let last = Date.now();
  return {
    take(cost = 1, now = Date.now()) {
      const elapsed = Math.max(0, now - last) / 1000;
      last = now;
      tokens = Math.min(burst, tokens + elapsed * perSecond);
      if (tokens < cost) return false;
      tokens -= cost;
      return true;
    },
  };
}

/** UTF-8 byte length of a JSON payload without allocating a Buffer for small values. */
export function jsonBytes(value: unknown): number {
  try {
    return Buffer.byteLength(JSON.stringify(value) ?? '', 'utf8');
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

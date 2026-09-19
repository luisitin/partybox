// Token bucket per client: 20 inputs/s sustained, small burst. Non-VIP `vip` attempts cost extra
// so a misbehaving phone throttles itself instead of the room. Used by both wires — Socket.IO on
// the LAN and WebRTC data channels on the web (ADR-034) — so it stays free of `node:*`.
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

const encoder = new TextEncoder();

/** UTF-8 byte length of a JSON payload. `Infinity` for anything JSON cannot represent (a cycle). */
export function jsonBytes(value: unknown): number {
  try {
    return encoder.encode(JSON.stringify(value) ?? '').length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

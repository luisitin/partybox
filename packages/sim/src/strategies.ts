// Bot strategies: WHEN a player acts and what mischief `chaos` adds. Pure functions of the rng so
// a (seed, strategy) pair always replays identically.
import type { Rng } from '@partybox/shared';

export type Strategy = 'random' | 'fast' | 'slow' | 'idle' | 'chaos' | 'mixed';
export const STRATEGIES: readonly Strategy[] = ['random', 'fast', 'slow', 'idle', 'chaos', 'mixed'];

/** A concrete per-player behaviour (`mixed` assigns one of these to each player). */
export type PlayerStrategy = Exclude<Strategy, 'mixed'>;

export function assignStrategies(strategy: Strategy, players: number, rng: Rng): PlayerStrategy[] {
  const pool: PlayerStrategy[] = ['random', 'fast', 'slow', 'idle', 'chaos'];
  return Array.from({ length: players }, () => (strategy === 'mixed' ? rng.pick(pool) : strategy));
}

/**
 * Delay before this player acts in the current phase, or null for "never". `remainingMs` is the
 * time until the deadline (Infinity when the phase has none).
 */
export function reactionDelay(
  strategy: PlayerStrategy,
  rng: Rng,
  remainingMs: number,
): number | null {
  switch (strategy) {
    case 'idle':
      return null;
    case 'fast':
      return rng.int(50, 400);
    case 'slow':
      return Number.isFinite(remainingMs)
        ? Math.max(100, remainingMs - rng.int(50, 900))
        : rng.int(2000, 6000);
    case 'chaos':
      return rng.int(0, 3000);
    case 'random':
      return rng.int(300, 5000);
  }
}

export type ChaosAction =
  | 'disconnect'
  | 'reconnect'
  | 'vip-skip'
  | 'vip-pause'
  | 'vip-resume'
  | 'duplicate-input'
  | 'ghost-input'
  | 'stale-timer';

/** What a chaos player does on a turn besides answering (or instead of it). */
export function chaosAction(rng: Rng): ChaosAction | null {
  const roll = rng.float();
  if (roll < 0.06) return 'disconnect';
  if (roll < 0.1) return 'reconnect';
  if (roll < 0.14) return 'vip-skip';
  if (roll < 0.17) return 'vip-pause';
  if (roll < 0.2) return 'vip-resume';
  if (roll < 0.25) return 'duplicate-input';
  if (roll < 0.29) return 'ghost-input';
  if (roll < 0.32) return 'stale-timer';
  return null;
}

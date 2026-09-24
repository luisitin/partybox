// The bot (SPEC §8.11): it reads the same hint everyone reads — from its own phone's view, never
// the stored outcome — turns it into an expected value, and bids around it with a personality
// (0.5 cautious … 1.1 reckless, drawn at init). Sealed: EV × factor ± 10 %, to the nearest 5.
// Live: it keeps raising by the smallest step while that stays within EV × factor and its coins.
import type { Rng } from '@partybox/game-sdk';
import { TIER_CHANCE } from './hints';
import type { Hint } from './hints';
import type { BlindAuctionControllerView } from './views';
import type { Input } from './types';

function valueOf(hint: Hint, view: BlindAuctionControllerView): number {
  const scale = view.startCoins / 100;
  const others = view.players.filter((p) => p.id !== view.me.id).map((p) => p.score ?? 0);
  switch (hint.type) {
    case 'gain':
      return hint.n;
    case 'lose':
      return -hint.n;
    case 'steal':
      return others.length ? (Math.max(...others) * hint.n) / 100 : 0;
    case 'swap':
      return others.length ? others.reduce((a, b) => a + b, 0) / others.length - view.coins : 0;
    case 'double':
      return 100 * scale;
    case 'refund':
      return 50 * scale;
    case 'dud':
      return 0;
  }
}

/** The lot's expected value to this player, from the hint's tier words. */
export function expectedValue(view: BlindAuctionControllerView): number {
  const hints = view.lot?.hints ?? [];
  const total = hints.reduce((sum, h) => sum + TIER_CHANCE[h.tier], 0);
  if (total <= 0) return 0;
  return hints.reduce((sum, h) => sum + (TIER_CHANCE[h.tier] / total) * valueOf(h, view), 0);
}

/** What the bot sends, decided from its controller view alone. */
export function decide(view: BlindAuctionControllerView, factor: number, rng: Rng): Input | null {
  if (view.me.role !== 'player') return null;
  const ev = expectedValue(view);
  if (view.phaseId === 'bid') {
    if (view.myBid !== null) return null;
    if (ev <= 0) return { type: 'bid', amount: 0 };
    const noisy = ev * factor * (0.9 + rng.float() * 0.2);
    const amount = Math.min(view.coins, Math.max(0, Math.round(noisy / 5) * 5));
    return { type: 'bid', amount };
  }
  if (view.phaseId === 'live' && view.auction) {
    const next = view.auction.options[0];
    if (!next || !next.ok || next.amount > ev * factor) return null;
    return { type: 'raise', amount: next.amount };
  }
  return null;
}

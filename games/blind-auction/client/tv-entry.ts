// Blind Auction's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import type { GameTvModule } from '@partybox/game-sdk/ui';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // Every round phase keeps the same table: cut between them, the box never re-rises.
  quickInto: ['box', 'bet', 'swap', 'potato', 'tug', 'shuffle', 'cups', 'open'],
  // Whoever called the open box right.
  stripActive: (view) => {
    const v = view as { phaseId: string; results?: { id: string; delta: number }[] | null };
    return v.phaseId === 'open'
      ? (v.results ?? []).filter((r) => r.delta >= 0).map((r) => r.id)
      : [];
  },
  // The open plays its own cues.
  ownLocks: ['open'],
};

// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const clientModule: GameClientModule = {
  id: 'blind-auction',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // P00 §3.6 / S-005: a phone with no TV gets the stage moments.
  PhoneStage: lazy(() =>
    import('./PhoneStage').then((m) => ({ default: m.PhoneStage })),
  ) as unknown as GameClientModule['PhoneStage'],
  phoneStagePhases: ['intro', 'sold', 'flip'],
  // SPEC §8.4 cues. The shell's `start` already opens the game (intro stays quiet); a lot deals its
  // card; bidding is "pick up your phone" (`phase`); the hammer and the flip cue themselves on the
  // frame they land (TvLadder, TvFlip).
  sounds: {
    intro: 'silence',
    lot: 'card',
    bid: 'phase',
    live: 'phase',
    sold: 'silence',
    flip: 'silence',
  },
  // The lounge under the reading and the reveals, the quiz-show pulse under the bidding. The reveals
  // keep the lounge (the spec names none): a bed that stopped and restarted every ten seconds read
  // as choppy.
  beds: {
    intro: 'lounge',
    lot: 'lounge',
    bid: 'pulse',
    live: 'pulse',
    sold: 'lounge',
    flip: 'lounge',
  },
  // Every lot phase keeps the same table: cut between them, the card never re-rises.
  quickInto: ['lot', 'bid', 'live', 'sold', 'flip'],
  // The high bidder while live; the winner while the card flips.
  stripActive: (view) => {
    const v = view as {
      phaseId: string;
      auction?: { high?: { by: string } | null } | null;
      sale?: { winner: string | null } | null;
    };
    if (v.phaseId === 'live' && v.auction?.high) return [v.auction.high.by];
    if (v.phaseId === 'flip' && v.sale?.winner) return [v.sale.winner];
    return [];
  },
  // The hammer is the sold phase's lock-in; live raises sound `wager` (TvLive).
  ownLocks: ['sold', 'live'],
};

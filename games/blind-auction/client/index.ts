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
  // The rules stay the phone's own screen everywhere (it carries the Ready button).
  phoneStagePhases: ['open'],
  // The game plays its own cues on the frame they belong to (TvTable, TvRules): the dealt box, the
  // `phase` chime under "Place your bets!", the reveal's cue as the box finishes turning, the 3·2·1.
  // Mapped phases re-chime whenever their deadline moves, so every phase maps to `silence`.
  sounds: {
    rules: 'silence',
    box: 'silence',
    bet: 'silence',
    swap: 'silence',
    potato: 'silence',
    open: 'silence',
  },
  // The owner (2026-09-24): the music never stops — one low, continuous caper playlist under the
  // whole auction (no per-phase beds: a bed swapping every ten seconds read as choppy). Whole tracks
  // back to back, quiet under the auctioneer and the cues.
  music: {
    tracks: ['sneaky-snitch', 'hep-cats', 'george-street-shuffle'],
    weights: [3, 2, 2],
    volume: 0.18,
    mode: 'chain',
  },
  // Every round phase keeps the same table: cut between them, the box never re-rises.
  quickInto: ['box', 'bet', 'swap', 'potato', 'open'],
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

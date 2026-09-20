// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';

export const clientModule: GameClientModule = {
  id: 'blanks',
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // Every reveal step is its own phase instance: one soft 'card' pluck per card read out (the
  // owner's pick over the fuller 'reveal', which was too much three cards in a row).
  // The final board is a scores moment too; the results fanfare follows it.
  // The pick is the judge's moment: the phone chime says so (unmapped = 'phase').
  sounds: { reveal: 'card', result: 'tally', final: 'tally' },
  // Music beds (ADR-032, owner's picks 2026-09-17): the warm groove is the general background
  // (round card, read-out, result — it resumes where it left off), the soft bossa plays while
  // people pick a card, the marimba pulse while the room judges. Results stay silent under the
  // win fanfare.
  // One bed per stage, each with its own character (the owner heard no variety, review-loop
  // #161): the warm groove frames the round, the judge's pick gets lo-fi, picking a card the
  // bossa, the reading the warm groove again (it resumes where it left off), judging the marimba
  // pulse, the result the lounge swing. Results stay silent under the win fanfare.
  // Where the room sits every round, the bed changes with the round (loop #197 — the owner heard
  // the same thirty seconds under every vote): picking a card alternates bossa / marimba, judging
  // marimba / lo-fi, the judge's own pick lo-fi / late night. The shell takes the next one each
  // time the phase begins, and each bed resumes where it left off.
  beds: {
    intro: 'warm',
    pick: ['lofi', 'latenight'],
    answer: ['bossa', 'marimba'],
    reveal: 'warm',
    judge: ['marimba', 'lofi'],
    result: 'lounge',
  },
  // The point lands on result entry but the stage names the winner on its last beat: the strip
  // waits for the next phase.
  stripScores: (view) => view.phaseId !== 'result',
  // I-004 B: while the room votes, whoever has not voted yet is ringed in the strip.
  stripActive: (view) =>
    view.phaseId === 'judge'
      ? view.players.filter((p) => p.status === 'active' && p.connected).map((p) => p.id)
      : [],
};

// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';
import { STRINGS } from './strings';

export const clientModule: GameClientModule = {
  id: 'blanks',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // Every reveal step is its own phase instance: one soft 'card' pluck per card read out (the
  // owner's pick over the fuller 'reveal', which was too much three cards in a row).
  // The final board is a scores moment too; the results fanfare follows it.
  // The pick is the judge's moment: the phone chime says so (unmapped = 'phase').
  sounds: { reveal: 'card', result: 'tally', final: 'tally' },
  // I-020 B + the owner's note: the answer phase's lock-in is the `card` pluck as the card lands
  // on the table (TvRound.tsx), so the shell's `lock` tick stays quiet there — one note per card.
  ownLocks: ['answer'],
  // Blanks had no music at all (the owner, 2026-09-21: "Blanks has no music or sounds on phone"):
  // a sly lounge set, quiet, while people pick and while the judge decides — never over the reads
  // (the caller's voice on a phone-only room) or the result's beats.
  music: {
    tracks: ['local-forecast-elevator', 'george-street-shuffle', 'bossa-antigua'],
    volume: 0.2,
    mode: 'chain',
    phases: ['intro', 'pick', 'answer', 'judge'],
  },
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
  // Whoever the room should look at: the seat reading a card out (the judge in czar mode) while
  // it reads (I-017 A); while the room votes, whoever has not voted yet (I-004 B).
  stripActive: (view) => {
    const v = view as unknown as BlanksTvView;
    if (v.phaseId === 'judge')
      return v.players.filter((p) => p.status === 'active' && p.connected).map((p) => p.id);
    if (v.phaseId !== 'reveal') return [];
    const who = v.judgeMode === 'czar' ? v.czar : v.reader;
    return who ? [who.id] : [];
  },
};

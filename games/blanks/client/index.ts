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
  // a sly lounge set. The owner, 2026-09-23: "the background music seems to change between
  // picking, reading, judging — keep it all the same so it does not feel like sharply changing,
  // and lower the volume since it is background": one chain of tracks carries on from the round
  // card through the result (the same plan, so a phase change never restarts it), at 0.12 (was
  // 0.2), and the per-phase synthesized beds that swapped under it are gone. The final board keeps
  // its fanfare to itself.
  music: {
    tracks: ['local-forecast-elevator', 'george-street-shuffle', 'bossa-antigua'],
    volume: 0.12,
    mode: 'chain',
    phases: ['intro', 'pick', 'answer', 'reveal', 'judge', 'result'],
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

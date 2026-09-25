// Blanks' TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import type { GameTvModule } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // I-020 B + the owner's note: the answer phase's lock-in is the `card` pluck as the card lands
  // on the table (TvRound.tsx), so the shell's `lock` tick stays quiet there — one note per card.
  ownLocks: ['answer'],
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

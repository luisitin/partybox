// What the phone and TV entries both carry (ADR-050): the sound plan, the beds and the words.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'secret-hitler',
  strings: STRINGS,
  // §12.2: the reveals play their own cues on their frames (TvMoments' useCueAt: the placard
  // wave, the stamp, the slam), so the shell stays silent as they begin; the choosing phases
  // keep the shell's `phase` chime ("pick up your phone").
  sounds: {
    seating: 'card',
    voteReveal: 'silence',
    hitlerCheck: 'silence',
    enactReveal: 'silence',
    chaos: 'silence',
    powerReveal: 'silence',
    gameOver: 'fanfare',
  },
  // §12.3: reveals hold their breath (no bed).
  beds: {
    seating: 'lounge',
    nominate: 'latenight',
    claims: 'latenight',
    vote: 'pulse',
    presDraw: 'pulse',
    chanEnact: 'pulse',
    vetoAsk: 'pulse',
    power: 'pulse',
  },
};

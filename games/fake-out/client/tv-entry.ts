// Fake-Out's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import type { GameTvModule } from '@partybox/game-sdk/ui';
import type { FakeOutTvView } from '../server/index';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // The question card's tip is its own entrance. The reveal crossfades in: its first frame is a
  // new composition (the grid folds into the deck).
  quickInto: ['question'],
  stripCompact: ['pick', 'reveal'],
  // The reveal hands points out step by step: the strip's totals wait for the scoreboard.
  stripScores: (view) => view.phaseId !== 'reveal',
  // The players who picked the option on stage.
  stripActive: (view) => {
    const reveal = (view as unknown as FakeOutTvView).reveal;
    if (!reveal || reveal.kind !== 'option') return [];
    return reveal.shown[reveal.shown.length - 1]?.pickers ?? [];
  },
};

// Fake-Out's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import type { GameTvModule } from '@partybox/game-sdk/ui';
import type { FakeOutTvView } from '../server/index';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // Every screen but the reveal brings its own entrance (the question card's tip, the lie tray, the
  // grid's deal, the board's rise), so the old text must not linger under it (spy-grid [6ff241]:
  // ~1 s of cross-faded text). The reveal still crossfades in: the grid folds into the deck.
  quickInto: ['question', 'lie', 'pick', 'scores'],
  // The reveal's own faces replace the strip (reviewer [d738fb]); pick keeps full names + scores.
  stripHidden: ['reveal'],
  // The reveal hands points out step by step: the strip's totals wait for the scoreboard.
  stripScores: (view) => view.phaseId !== 'reveal',
  // The players who picked the option on stage.
  stripActive: (view) => {
    const reveal = (view as unknown as FakeOutTvView).reveal;
    if (!reveal || reveal.kind !== 'option') return [];
    return reveal.shown[reveal.shown.length - 1]?.pickers ?? [];
  },
};

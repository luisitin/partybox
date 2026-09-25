// TV view for Fake-Out: one component per phase. Dumb by design: renders `view`, never touches
// sockets or game logic. The shell shows the timer, the player strip and the VIP overlay.
import type { JSX } from 'react';
import { BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { FakeOutTvView } from '../server/index';
import { TvReveal } from './TvReveal';
import { TvIntro, TvLie, TvPick, TvQuestion } from './TvRound';
import { TvScores } from './TvScores';

export function Tv({ view }: GameTvProps<FakeOutTvView>): JSX.Element {
  switch (view.phaseId) {
    case 'intro':
      return <TvIntro view={view} />;
    case 'question':
      return <TvQuestion view={view} />;
    case 'lie':
      return <TvLie view={view} />;
    case 'pick':
      return <TvPick view={view} />;
    case 'reveal':
      return <TvReveal view={view} />;
    case 'scores':
    case 'done':
      return <TvScores view={view} />;
    default:
      return (
        <Stage center>
          <BigText tone="muted">…</BigText>
        </Stage>
      );
  }
}

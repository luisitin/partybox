// TV view for Wisecrack: one small component per phase. Dumb by design: renders `view`, never
// touches sockets or game logic. The shell already shows the timer, player chips and VIP overlay.
import type { JSX } from 'react';
import { BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { WisecrackTvView } from '../server/index';
import { TvReveal } from './TvReveal';
import { TvAnswer, TvIntro } from './TvRound';
import { TvScores } from './TvScores';
import { TvVote } from './TvVote';

export function Tv({ view }: GameTvProps<WisecrackTvView>): JSX.Element {
  switch (view.phaseId) {
    case 'intro':
      return <TvIntro view={view} />;
    case 'answer':
      return <TvAnswer view={view} />;
    case 'vote':
      return <TvVote view={view} />;
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

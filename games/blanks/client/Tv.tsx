// TV view for Blanks: one small component per phase. Dumb by design: renders `view`, never
// touches sockets or game logic. The shell already shows the timer, player chips and VIP overlay.
import type { JSX } from 'react';
import { BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';
import { TvJudge } from './TvJudge';
import { TvReveal } from './TvReveal';
import { TvResult } from './TvResult';
import { TvAnswer, TvIntro, TvPick } from './TvRound';
import { useReading } from './useReading';
import styles from './blanks.module.css';

export function Tv({ view }: GameTvProps<BlanksTvView>): JSX.Element {
  useReading(view.speech); // READER-VOICES: the room hears the question and each card
  switch (view.phaseId) {
    case 'intro':
      return <TvIntro view={view} />;
    case 'pick':
      return <TvPick view={view} />;
    case 'answer':
      return <TvAnswer view={view} />;
    case 'reveal':
      return <TvReveal view={view} />;
    case 'judge':
      return <TvJudge view={view} />;
    case 'result':
    case 'final':
    case 'done':
      return <TvResult view={view} />;
    default:
      return (
        <Stage center className={styles.table}>
          <BigText tone="muted">…</BigText>
        </Stage>
      );
  }
}

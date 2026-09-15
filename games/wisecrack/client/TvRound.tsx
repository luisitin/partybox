// TV: the round card ("intro") and the writing progress ("answer"). Nothing written is shown
// here: answers stay off the TV until "vote".
import type { JSX } from 'react';
import { BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { WisecrackTvView } from '../server/index';
import styles from './wisecrack.module.css';

type Props = GameTvProps<WisecrackTvView>;

export function TvIntro({ view }: Props): JSX.Element {
  const last = view.round === view.rounds;
  return (
    <Stage center>
      <p className={styles.kicker}>Wisecrack</p>
      <BigText level="display">
        Round {view.round} of {view.rounds}
      </BigText>
      {last && view.multiplier > 1 ? (
        <BigText level="h1" tone="accent">
          Final round — double points!
        </BigText>
      ) : (
        <BigText level="h2" tone="muted">
          Two prompts each. Make them laugh.
        </BigText>
      )}
    </Stage>
  );
}

export function TvAnswer({ view }: Props): JSX.Element {
  return (
    <Stage center>
      <p className={styles.kicker}>
        Round {view.round} of {view.rounds}
        {view.multiplier > 1 ? ' · double points' : ''}
      </p>
      <BigText level="display">Write your answers!</BigText>
      <BigText level="h2" tone="muted">
        Two prompts are waiting on your phone.
      </BigText>
      <BigText level="h1" tone="accent">
        {view.answeredCount} / {view.answersExpected} answers in
      </BigText>
    </Stage>
  );
}

// TV view for Lightning Round. Dumb component: renders `view`, composes game-sdk primitives, never
// touches sockets or game logic. The shell already shows the timer, player chips and VIP overlay.
import type { JSX } from 'react';
import { BigText, Scoreboard, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { LightningTvView } from '../server/index';
import { FinalReveal } from './TvFinal';
import { AnswerCard, RevealRows, RoundHeader, TvQuestion } from './TvQuestion';
import styles from './Tv.module.css';

export function Tv({ view }: GameTvProps<LightningTvView>): JSX.Element {
  const standings = view.standings ?? [];
  if (view.phaseId === 'intro') {
    return (
      <Stage center>
        <BigText level="display" tone="accent">
          Lightning Round
        </BigText>
        <BigText level="h2" tone="muted">
          Fast fingers, sharp minds. Bet big on the last one.
        </BigText>
        <p className={styles.count}>{view.categoryLabel} · answer fast for more points</p>
      </Stage>
    );
  }
  if (view.phaseId === 'question') {
    return (
      <Stage>
        <TvQuestion
          round={view.round}
          question={view.question}
          answeredCount={view.answeredCount}
          totalCount={view.totalCount}
        />
      </Stage>
    );
  }
  if (view.phaseId === 'reveal') {
    if (view.round?.final && view.question && view.correctIndex !== undefined) {
      return (
        <Stage>
          <FinalReveal
            key={view.round.number}
            question={view.question}
            correctIndex={view.correctIndex}
            rows={view.rows ?? []}
          />
        </Stage>
      );
    }
    return (
      <Stage>
        <RoundHeader round={view.round} question={view.question} />
        <p className={styles.asked}>{view.question?.text ?? '…'}</p>
        {view.question && view.correctIndex !== undefined ? (
          <AnswerCard question={view.question} correctIndex={view.correctIndex} />
        ) : null}
        <RevealRows rows={view.rows ?? []} />
      </Stage>
    );
  }
  if (view.phaseId === 'wager') {
    return (
      <Stage>
        <div className={styles.header}>
          <span className={`${styles.kicker} ${styles.final}`}>Final question next</span>
        </div>
        <BigText level="h1">Place your wagers</BigText>
        <p className={styles.count} role="status">
          {view.answeredCount} / {view.totalCount} placed · right answer wins it, wrong answer loses
          it
        </p>
        <Scoreboard rows={standings} noTrophy />
      </Stage>
    );
  }
  return (
    <Stage>
      <BigText level="h1" tone="accent">
        That's the round!
      </BigText>
      <Scoreboard rows={standings} />
    </Stage>
  );
}

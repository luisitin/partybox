// TV view for Lightning Round. Dumb component: renders `view`, composes game-sdk primitives, never
// touches sockets or game logic. The shell already shows the timer, player chips and VIP overlay.
import type { CSSProperties, JSX } from 'react';
import { BigText, Scoreboard, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { LightningTvView } from '../server/index';
import { topicLine, drawText } from './labels';
import { STRINGS } from './strings';
import { FinalReveal } from './TvFinal';
import { AnswerCard, RevealRows, RoundHeader, TvQuestion } from './TvQuestion';
import styles from './Tv.module.css';

/** Inline bolt (precedent: game-sdk Avatar), currentColor so every theme's accent-2 paints it. */
function Bolt(): JSX.Element {
  return (
    <svg className={styles.bolt} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M37 3 12 37h17l-4 24 27-34H35z" fill="currentColor" />
    </svg>
  );
}

export function Tv({ view }: GameTvProps<LightningTvView>): JSX.Element {
  const L = useT(STRINGS);
  const standings = view.standings ?? [];
  if (view.phaseId === 'intro') {
    // Bolt + title ride the shell's phase rise; the tagline and the pill follow one beat each.
    return (
      <Stage center>
        <Bolt />
        <BigText level="display" tone="accent">
          Lightning Round
        </BigText>
        <div className={styles.introLine} style={{ '--i': 1 } as CSSProperties}>
          <BigText level="h2">{L('Fast fingers, sharp minds. Bet big on the last one.')}</BigText>
        </div>
        <div className={styles.introLine} style={{ '--i': 2 } as CSSProperties}>
          <span className={styles.introPill}>
            {drawText(view.categoryLabel, L)} · {L('faster is worth more')}
          </span>
        </div>
      </Stage>
    );
  }
  if (view.phaseId === 'question') {
    return (
      <Stage>
        <div className={styles.page}>
          <TvQuestion
            round={view.round}
            question={view.question}
            answeredCount={view.answeredCount}
            totalCount={view.totalCount}
            players={view.players}
          />
        </div>
      </Stage>
    );
  }
  if (view.phaseId === 'reveal') {
    if (view.round?.final && view.question && view.correctIndex !== undefined) {
      return (
        <Stage>
          {/* Same size container as the question page: a four-row roster leaves too little for
              four rows of two-line bet cards, so below 560 px the reveal compacts. */}
          <div className={styles.page}>
            <div className={styles.fit}>
              <FinalReveal
                key={view.round.number}
                question={view.question}
                correctIndex={view.correctIndex}
                rows={view.rows ?? []}
              />
            </div>
          </div>
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
    const gap = standings.length >= 2 ? standings[0]!.score - standings[1]!.score : 0;
    return (
      <Stage>
        <div className={styles.header}>
          <span className={`${styles.kicker} ${styles.final}`}>{L('Final question next')}</span>
          <span className={styles.placed} role="status">
            <span key={view.answeredCount} className={styles.countNum}>
              {view.answeredCount} / {view.totalCount}
            </span>{' '}
            {L('placed')}
          </span>
        </div>
        <BigText level="h2">{L('Place your wagers')}</BigText>
        {/* I-550 A: the bet is on a topic the room can see */}
        {view.finalTopic ? (
          <p className={styles.finalTopic}>
            {L('Final question: {topic}', { topic: topicLine(view.finalTopic, L) })}
          </p>
        ) : null}
        <p className={`pb-muted pb-caption ${styles.rules}`}>
          {L('Right answer wins the bet · wrong answer loses it')}
          {gap > 0 ? ` · ${L('{name} leads by {gap}', { name: standings[0]!.name, gap })}` : ''}
        </p>
        <Scoreboard
          rows={standings}
          noTrophy
          dense={standings.length >= 5}
          // Six h2 rows per column plus this header overflow 1080 px (review-loop #53); once the
          // roster is three rows (9+), even six small rows run into the host bar, and four rows
          // (13+) leave room for four rows of standings only: four columns.
          size={standings.length >= 9 ? 'sm' : 'md'}
          columns={standings.length >= 13 ? 4 : standings.length >= 9 ? 3 : 2}
          markIds={view.players.filter((p) => p.status === 'submitted').map((p) => p.id)}
          stagger="down"
        />
      </Stage>
    );
  }
  return (
    <Stage>
      <BigText level="h1" tone="accent">
        {L("That's the round!")}
      </BigText>
      <Scoreboard rows={standings} stagger="up" />
    </Stage>
  );
}

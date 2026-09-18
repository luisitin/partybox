// TV "reveal": one card at a time, read out loud — the black card with the played whites dropped
// in, big, and the cards already read lined up small underneath so the room can compare. Every
// card is a new phase instance (the shell chimes 'card' for each). The judge stage lives in
// TvJudge.tsx.
import type { JSX } from 'react';
import { BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';
import { fillText } from '../server/cards';
import { FilledCard, FlipCard, LETTERS } from './Cards';
import styles from './blanks.module.css';

type Props = GameTvProps<BlanksTvView>;

/** A filled sentence past this many characters wraps to four lines in a quarter-width mini. */
const STRIP_LONG = 75;
/** Past this many players the chip strip takes three rows next to the timer. */
const BIG_CHIP_ROOM = 10;

export function TvReveal({ view }: Props): JSX.Element {
  const current = view.cards[view.revealIndex];
  // The last four read (the judge grid shows them all) in one row — three when the sentences run
  // long, so the minis stay at three lines and the hero card keeps its room (review-loop #119).
  const before = view.cards.slice(0, view.revealIndex);
  const long =
    view.black !== null &&
    before.some((c) => fillText(view.black?.text ?? '', c.whites).length > STRIP_LONG);
  const read = before.slice(long ? -3 : -4);
  return (
    <Stage className={styles.table}>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} · Card {view.revealIndex + 1} of {view.cardCount}
        </p>
        {/* Somebody has to say it. In judge mode that is the judge (review-loop #172); in vote
            mode a seat is asked by name, rotating round by round, because “read it out loud”
            addressed to a room gets read by nobody (review-loop #248). */}
        <span className={styles.progressPill}>
          {view.judgeMode === 'czar' && view.czar
            ? `${view.czar.name} reads it out`
            : view.reader
              ? `${view.reader.name}, read it out loud`
              : 'Read it out loud'}
        </span>
      </div>
      <div className={styles.stageMain}>
        {view.black && current ? (
          <FlipCard
            flipKey={String(current.slot)}
            key={current.slot}
            text={view.black.text}
            whites={current.whites}
            size="hero"
            letter={LETTERS[current.slot]}
            // Eleven or twelve chips wrap to a third row beside the timer: the hero card steps
            // down a size so it and the strip both fit above the host bar (review-loop #123).
            className={`${styles.stageCard} ${styles.landing} ${view.players.length > BIG_CHIP_ROOM ? styles.long : ''}`}
          />
        ) : null}
      </div>
      {read.length > 0 && view.black ? (
        <ul className={`${styles.strip} ${styles.readRow}`} aria-label="cards read so far">
          {read.map((c) => (
            <li key={c.slot}>
              <FilledCard
                text={view.black?.text ?? ''}
                whites={c.whites}
                size="mini"
                letter={LETTERS[c.slot]}
              />
            </li>
          ))}
        </ul>
      ) : (
        <BigText level="h2" tone="muted">
          {view.judgeMode === 'czar' && view.czar
            ? `${view.czar.name} picks the winner after the last card.`
            : 'The vote opens after the last card.'}
        </BigText>
      )}
    </Stage>
  );
}

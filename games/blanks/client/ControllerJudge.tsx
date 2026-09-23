// Phone during "reveal" (the same card the TV is reading, so a phone-only room can read along)
// and "judge" (voters get the list; the judge in czar mode is the only voter; everyone else reads
// the cards and waits). A voter's own card is listed but not votable.
import type { JSX } from 'react';
import { Avatar, Screen, VoteList, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { BlanksControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FilledCard, FlipCard, InlineFilled, LETTERS } from './Cards';
import { NextButton } from './NextButton';
import styles from './blanks.module.css';

type Props = GameControllerProps<BlanksControllerView, Input>;

export function ControllerReveal({ view, me, send }: Props): JSX.Element {
  const black = view.black;
  const current = view.cards[view.revealIndex];
  // I-157: the whole flight — with the index jumping by two, rendering only `current` would skip
  // every second card on every phone.
  const flight = view.cards.slice(view.revealIndex);
  if (!black || !current)
    return <WaitingScreen title={view.phoneOnly ? 'One moment…' : 'Look at the TV'} mood="watch" />;
  // Slots are anonymous even to the phone: my card is the one whose text is my play.
  const mine =
    view.myPlay !== null && flight.some((c) => c.whites.join('|') === view.myPlay?.join('|'));
  return (
    <Screen
      className="pb-enter"
      title={
        <span className={styles.kicker}>
          Round {view.round} ·{' '}
          {flight.length > 1
            ? `Cards ${view.revealIndex + 1}–${view.revealIndex + flight.length} of ${view.cardCount}`
            : `Card ${view.revealIndex + 1} of ${view.cardCount}`}
        </span>
      }
    >
      {/* The card is the whole screen in a phone-only room: centred in the free space, the
          caption under it (it sat in the top third over a blank two-thirds, review-loop #139). */}
      <div className={styles.readAlong}>
        {flight.map((c) => (
          <FlipCard
            flipKey={String(c.slot)}
            key={c.slot}
            text={black.text}
            whites={c.whites}
            size={flight.length > 1 ? 'mini' : 'phone'}
            letter={LETTERS[c.slot]}
            className={styles.readCard}
          />
        ))}
        {/* I-157 C: the reader moves the room on when they have read it aloud. */}
        {(view.judgeMode === 'czar' ? view.czar?.id : view.reader?.id) === me.id ? (
          <button type="button" className={styles.nextCard} onClick={() => send({ type: 'nextCard' })}>
            {flight.length > 1 ? 'Read them \u2014 next' : 'Read it \u2014 next'}
          </button>
        ) : null}
        {/* The reader is told it is them; everyone else reads along (review-loop #248). */}
        <p className="pb-caption pb-muted">
          {view.reader?.id === me.id
            ? mine
              ? flight.length > 1
                ? "You're reading them out — and one of these is yours. Good luck."
                : "You're reading them out — and this one is yours. Good luck."
              : "You're reading them out. Take your time."
            : mine
              ? flight.length > 1
                ? "One of these is yours — keep a straight face."
                : "This one's yours — keep a straight face."
              : view.role === 'judge'
                ? 'Read along. You pick the winner after the last card.'
                : view.judgeMode === 'czar' && view.czar
                  ? `Read along. ${view.czar.name} decides after the last card.`
                  : view.reader
                    ? `Read along. ${view.reader.name} is reading.`
                    : 'Read along. The vote is next.'}
        </p>
      </div>
    </Screen>
  );
}

export function ControllerJudge({ view, send, skip }: Props): JSX.Element {
  const black = view.black;
  const vote = view.vote;
  if (!black || view.cards.length === 0)
    return <WaitingScreen title={view.phoneOnly ? 'One moment…' : 'Look at the TV'} mood="watch" />;
  const kicker = `Round ${view.round} · ${view.judgeMode === 'czar' ? 'the judge decides' : 'vote'}`;
  if (vote?.canVote) {
    // Two or three cards get VoteList's tall lettered cards (it draws the disc); more get compact
    // rows, where the letter is ours.
    const large = view.cards.length <= 3;
    // A Pick 1 round repeats the question in every row: six rows of the same setup is a long
    // scroll on a phone. The question goes above the list once and the rows carry the answers
    // (review-loop #173). A Pick 2 or 3 keeps the whole sentence — the order is the joke.
    const answersOnly = black.pick === 1;
    return (
      <VoteList
        kicker={kicker}
        header={
          answersOnly ? <FilledCard text={black.text} pick={black.pick} size="phone" /> : null
        }
        prompt={view.judgeMode === 'czar' ? 'Pick the winner' : 'Vote for the best'}
        promptKey={`${view.round}`}
        // Two or three cards: tall lettered cards fill the thumb zone (as Wisecrack's A / B).
        size={large ? 'large' : 'compact'}
        options={view.cards.map((c) => ({
          id: String(c.slot),
          text: (
            <span className={styles.voteRow}>
              {large ? null : (
                <span className={styles.voteLetter} aria-hidden>
                  {LETTERS[c.slot]}
                </span>
              )}
              {answersOnly ? (
                <span className={styles.voteAnswer}>{c.whites.join(' ')}</span>
              ) : (
                <InlineFilled text={black.text} whites={c.whites} />
              )}
            </span>
          ),
          mine: c.slot === vote.mySlot,
        }))}
        votedId={vote.votedSlot === null ? null : String(vote.votedSlot)}
        onVote={(id) => send({ type: 'vote', slot: Number(id) })}
        // The confirmation rides in the footer, above the Next button: a long list pushed the
        // list's own line under the sticky bar. The result lands on this phone too (Blanks plays
        // without a TV), so it counts the room, not the screen across it (review-loop #138).
        lockedLabel={null}
        // Untimed rounds: once the VIP has voted they may close the vote for the room.
        footer={
          vote.votedSlot !== null ? (
            <>
              <p className={styles.voteIn} role="status">
                {view.votedCount >= view.votersExpected
                  ? '✓ That’s everyone — here comes the result…'
                  : `✓ Vote in · ${view.votedCount} / ${view.votersExpected} voted`}
              </p>
              <NextButton skip={skip} timed={view.timed} label="Close the vote now" />
            </>
          ) : undefined
        }
      />
    );
  }
  const judge = view.czar;
  // A connected judge's pick is the phase: nobody skips it. A dropped judge (or vote mode, where
  // this phone cannot vote) leaves Next to the VIP.
  const judgeHolds = view.judgeMode === 'czar' && judge?.connected === true;
  return (
    <Screen
      title={<span className={styles.kicker}>{kicker}</span>}
      footer={judgeHolds ? undefined : <NextButton skip={skip} timed={view.timed} label="Next" />}
    >
      <div className={styles.waitLine} role="status">
        {judge && view.judgeMode === 'czar' ? (
          <>
            <Avatar avatarId={judge.avatarId} size="var(--pb-chip-size)" />
            <span>
              {judge.connected
                ? `${judge.name} is choosing…`
                : `${judge.name} dropped — waiting a moment for them…`}
            </span>
          </>
        ) : (
          <span>
            {view.votedCount} / {view.votersExpected} voted
          </span>
        )}
      </div>
      {/* The question once, then the answers — the same shape as the vote list (review-loop #181). */}
      {black.pick === 1 ? (
        <div className={styles.handBlack}>
          <FilledCard text={black.text} pick={black.pick} size="phone" />
        </div>
      ) : null}
      <ul className={styles.cardList} aria-label="the cards">
        {view.cards.map((c) => (
          <li key={c.slot}>
            <FilledCard
              text={black.pick === 1 ? '____' : black.text}
              whites={c.whites}
              size="mini"
              letter={LETTERS[c.slot]}
              className={c.slot === vote?.mySlot ? styles.mineCard : ''}
            />
          </li>
        ))}
      </ul>
    </Screen>
  );
}

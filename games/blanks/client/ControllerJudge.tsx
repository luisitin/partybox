// Phone during "reveal" (the same card the TV is reading, so a phone-only room can read along)
// and "judge" (voters get the list; the judge in czar mode is the only voter; everyone else reads
// the cards and waits). A voter's own card is listed but not votable.
import type { JSX } from 'react';
import { Avatar, Screen, VoteList, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { BlanksControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FilledCard, InlineFilled, LETTERS } from './Cards';
import styles from './blanks.module.css';

type Props = GameControllerProps<BlanksControllerView, Input>;

export function ControllerReveal({ view }: Props): JSX.Element {
  const black = view.black;
  const current = view.cards[view.revealIndex];
  if (!black || !current) return <WaitingScreen title="Look at the TV" mood="watch" />;
  // Slots are anonymous even to the phone: my card is the one whose text is my play.
  const mine = view.myPlay !== null && view.myPlay.join('|') === current.whites.join('|');
  return (
    <Screen
      className="pb-enter"
      title={
        <span className={styles.kicker}>
          Round {view.round} · Card {view.revealIndex + 1}
        </span>
      }
    >
      <FilledCard
        key={current.slot}
        text={black.text}
        whites={current.whites}
        size="phone"
        letter={LETTERS[current.slot]}
      />
      <p className="pb-caption pb-muted">
        {mine
          ? "This one's yours — keep a straight face."
          : view.role === 'judge'
            ? 'Read along. You pick the winner after the last card.'
            : view.judgeMode === 'czar' && view.czar
              ? `Read along. ${view.czar.name} decides after the last card.`
              : 'Read along. The vote is next.'}
      </p>
    </Screen>
  );
}

export function ControllerJudge({ view, send }: Props): JSX.Element {
  const black = view.black;
  const vote = view.vote;
  if (!black || view.cards.length === 0)
    return <WaitingScreen title="Look at the TV" mood="watch" />;
  const kicker = `Round ${view.round} · ${view.judgeMode === 'czar' ? 'the judge decides' : 'vote'}`;
  if (vote?.canVote) {
    return (
      <VoteList
        kicker={kicker}
        prompt={view.judgeMode === 'czar' ? 'Pick the winner' : 'Vote for the best'}
        promptKey={`${view.round}`}
        options={view.cards.map((c) => ({
          id: String(c.slot),
          text: (
            <span className={styles.voteRow}>
              <span className={styles.voteLetter} aria-hidden>
                {LETTERS[c.slot]}
              </span>
              <InlineFilled text={black.text} whites={c.whites} />
            </span>
          ),
          mine: c.slot === vote.mySlot,
        }))}
        votedId={vote.votedSlot === null ? null : String(vote.votedSlot)}
        onVote={(id) => send({ type: 'vote', slot: Number(id) })}
      />
    );
  }
  const judge = view.czar;
  return (
    <Screen title={<span className={styles.kicker}>{kicker}</span>}>
      <div className={styles.waitLine} role="status">
        {judge && view.judgeMode === 'czar' ? (
          <>
            <Avatar avatarId={judge.avatarId} size="var(--pb-chip-size)" />
            <span>{judge.name} is choosing…</span>
          </>
        ) : (
          <span>
            {view.votedCount} / {view.votersExpected} voted
          </span>
        )}
      </div>
      <ul className={styles.cardList} aria-label="the cards">
        {view.cards.map((c) => (
          <li key={c.slot}>
            <FilledCard
              text={black.text}
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

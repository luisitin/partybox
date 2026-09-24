// Phone during "vote" (voters pick A or B; authors wait, seeing only their own answer) and
// "reveal" (authors see their votes and points; a voter sees what they picked; everyone else is
// pointed at the TV). The phone never spoils the TV: an author's result is held until the TV's last
// reveal beat has landed (timing.ts), and a voter's own pick is the only thing shown to them.
import type { JSX } from 'react';
import { Screen, VoteList, WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import type { Input } from '../server/types';
import { BLANK, answerText } from './blank';
import { PhoneReveal } from './PhoneReveal';
import { RevealMirror } from './RevealMirror';
import { STRINGS } from './strings';
import { REVEAL_HOLD_MS, useHold } from './timing';
import styles from './wisecrack.module.css';

type Props = GameControllerProps<WisecrackControllerView, Input>;

const LETTERS = ['A', 'B'];

/** The server-confirmed vote this phone cast for the prompt on stage (Controller.tsx keeps it). */
export interface LastVote {
  promptId: string;
  slot: number;
  text: string;
}

export function ControllerVote({
  view,
  send,
  onPick,
}: Props & { onPick: (pick: LastVote) => void }): JSX.Element {
  const L = useT(STRINGS);
  const vote = view.vote;
  const tvOff = view.phoneOnly === true;
  if (!vote)
    return <WaitingScreen title={tvOff ? L('Voting…') : L('Look at the TV')} mood="watch" />;
  if (vote.role === 'author') {
    // The other answer too (the owner, 2026-09-21): the pair as the room sees it, mine marked.
    const other = vote.options.find((o) => o.text !== vote.myAnswer);
    return (
      <WaitingScreen
        title={tvOff ? L('Your answer is up') : L('Your answer is on the TV')}
        hint={L("Don't say which one — the others are voting…")}
        mood="watch"
      >
        {other ? (
          <p className={styles.quoteOther}>
            <span className={styles.quoteWho}>{L('against')}</span>
            {answerText(L, other.text)}
          </p>
        ) : null}
        <p className={styles.quote}>
          {vote.myAnswer === null ? null : answerText(L, vote.myAnswer)}
        </p>
      </WaitingScreen>
    );
  }
  const kicker = L('Round {round} · vote', { round: view.round });
  return (
    <VoteList
      kicker={view.multiplier > 1 ? `${kicker} · ${L('double points')}` : kicker}
      prompt={vote.promptText}
      size="large"
      options={vote.options.map((o) => ({
        id: String(o.slot),
        text: answerText(L, o.text),
        muted: o.text === BLANK,
      }))}
      votedId={vote.votedSlot === null ? null : String(vote.votedSlot)}
      onVote={(id) => {
        const slot = Number(id);
        onPick({ promptId: vote.promptId, slot, text: vote.options[slot]?.text ?? '' });
        send({ type: 'vote', promptId: vote.promptId, slot });
      }}
    />
  );
}

export function ControllerReveal({
  view,
  lastVote,
}: Props & { lastVote: LastVote | null }): JSX.Element {
  const L = useT(STRINGS);
  const mine = view.myReveal;
  const shown = useHold(REVEAL_HOLD_MS);
  // A "phone only" room: the TV's reveal on the phone once the hold has passed.
  const onPhone = view.phoneOnly === true && view.reveal ? view.reveal : null;
  // The words follow the ROOM (no TV at all), not whether the reveal data has arrived yet.
  const noTv = view.phoneOnly === true;
  // I-796 K: a TV room's phone mirrors the moment in miniature instead of "Look at the TV".
  const mirror =
    !noTv && view.reveal ? (
      <Screen>
        <RevealMirror reveal={view.reveal} meId={view.me.id} pickedSlot={lastVote?.slot ?? null} />
      </Screen>
    ) : null;
  if (!mine) {
    const picked = lastVote
      ? L('You picked {letter}', { letter: LETTERS[lastVote.slot] ?? '?' })
      : null;
    if (onPhone && shown)
      return (
        <Screen>
          <p className={styles.phoneKicker}>{picked ?? L('Authors revealed!')}</p>
          <PhoneReveal reveal={onPhone} meId={view.me.id} />
        </Screen>
      );
    if (mirror) return mirror;
    if (lastVote) {
      return (
        <WaitingScreen
          title={picked ?? ''}
          hint={noTv ? L('Who wrote it…') : L('See who wrote it on the TV')}
          mood="watch"
        >
          <p className={styles.quote}>{answerText(L, lastVote.text)}</p>
        </WaitingScreen>
      );
    }
    return (
      <WaitingScreen
        title={L('Authors revealed!')}
        hint={noTv ? undefined : L('Look at the TV')}
        mood="watch"
      />
    );
  }
  if (!shown) {
    if (mirror) return mirror;
    return (
      <WaitingScreen
        title={L('Your answer is up')}
        hint={noTv ? L('The votes are in…') : L('Look at the TV')}
        mood="watch"
      >
        <p className={styles.quote}>{answerText(L, mine.text)}</p>
      </WaitingScreen>
    );
  }
  const scored = mine.points > 0;
  const blank = mine.text === BLANK;
  const headline = mine.walkover
    ? L('Wins by default')
    : blank
      ? L('No answer sent')
      : mine.votes === 0
        ? L('No votes this time')
        : mine.votes === 1
          ? L('1 vote')
          : L('{n} votes', { n: mine.votes });
  const caption = mine.walkover
    ? L('The other answer was blank.')
    : blank
      ? L('The other answer wins by default.')
      : scored
        ? L('Nice one.')
        : mine.last
          ? L('That was the last one — scores are next.')
          : L('Better luck on the next prompt.');
  return (
    <Screen>
      <div className={styles.result} role="status" aria-live="polite">
        <p
          className={`${styles.points} ${scored ? '' : styles.pointsZero}`}
          aria-label={L('{n} points', { n: mine.points })}
        >
          +{mine.points}
        </p>
        <h2 className={styles.votesLine}>
          {headline}
          {mine.sweep ? <span className={styles.pill}>{L('Sweep')}</span> : null}
        </h2>
        <p className={styles.quote}>{answerText(L, mine.text)}</p>
        <p className="pb-caption pb-muted">{caption}</p>
      </div>
      {onPhone ? <PhoneReveal reveal={onPhone} meId={view.me.id} /> : null}
    </Screen>
  );
}

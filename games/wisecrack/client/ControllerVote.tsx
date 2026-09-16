// Phone during "vote" (voters pick A or B; authors wait, seeing only their own answer) and
// "reveal" (authors see their votes and points; a voter sees what they picked; everyone else is
// pointed at the TV). The phone never spoils the TV: a voter's own pick is the only thing shown.
import type { JSX } from 'react';
import { Screen, VoteList, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import type { Input } from '../server/types';
import styles from './wisecrack.module.css';

type Props = GameControllerProps<WisecrackControllerView, Input>;

const BLANK = '(no answer)';
const LETTERS = ['A', 'B'];

/** The server-confirmed vote this phone cast for the prompt on stage (Controller.tsx keeps it). */
export interface LastVote {
  promptId: string;
  slot: number;
  text: string;
}

export function ControllerVote({ view, send }: Props): JSX.Element {
  const vote = view.vote;
  if (!vote) return <WaitingScreen title="Look at the TV" mood="watch" />;
  if (vote.role === 'author') {
    return (
      <WaitingScreen
        title="Your answer is on the TV"
        hint="Don't say which one — the others are voting…"
        mood="watch"
      >
        <p className={styles.quote}>{vote.myAnswer}</p>
      </WaitingScreen>
    );
  }
  return (
    <VoteList
      kicker={`Round ${view.round} · vote${view.multiplier > 1 ? ' · double points' : ''}`}
      prompt={vote.promptText}
      size="large"
      options={vote.options.map((o) => ({
        id: String(o.slot),
        text: o.text,
        muted: o.text === BLANK,
      }))}
      votedId={vote.votedSlot === null ? null : String(vote.votedSlot)}
      onVote={(id) => send({ type: 'vote', promptId: vote.promptId, slot: Number(id) })}
    />
  );
}

export function ControllerReveal({
  view,
  lastVote,
}: Props & { lastVote: LastVote | null }): JSX.Element {
  const mine = view.myReveal;
  if (!mine) {
    if (lastVote) {
      return (
        <WaitingScreen
          title={`You picked ${LETTERS[lastVote.slot] ?? '?'}`}
          hint="See who wrote it on the TV"
          mood="watch"
        >
          <p className={styles.quote}>{lastVote.text}</p>
        </WaitingScreen>
      );
    }
    return <WaitingScreen title="Authors revealed!" hint="Look at the TV" mood="watch" />;
  }
  const scored = mine.points > 0;
  return (
    <Screen>
      <div className={styles.result} role="status" aria-live="polite">
        <p
          className={`${styles.points} ${scored ? '' : styles.pointsZero}`}
          aria-label={`${mine.points} points`}
        >
          +{mine.points}
        </p>
        <h2 className={styles.votesLine}>
          {mine.votes === 0
            ? 'No votes this time'
            : `${mine.votes} ${mine.votes === 1 ? 'vote' : 'votes'}`}
          {mine.sweep ? <span className={styles.pill}>Sweep</span> : null}
        </h2>
        <p className={styles.quote}>{mine.text}</p>
        <p className="pb-caption pb-muted">
          {scored ? 'Nice one.' : 'Better luck on the next prompt.'}
        </p>
      </div>
    </Screen>
  );
}

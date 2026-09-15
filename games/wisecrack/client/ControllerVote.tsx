// Phone during "vote" (voters pick A or B; authors wait, seeing only their own answer) and
// "reveal" (authors see their votes and points; everyone else is pointed at the TV).
import type { JSX } from 'react';
import { VoteList, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import type { Input } from '../server/types';
import styles from './wisecrack.module.css';

type Props = GameControllerProps<WisecrackControllerView, Input>;

const BLANK = '(no answer)';

export function ControllerVote({ view, send }: Props): JSX.Element {
  const vote = view.vote;
  if (!vote) return <WaitingScreen title="Look at the TV" mood="watch" />;
  if (vote.role === 'author') {
    return (
      <WaitingScreen title="Your answer is on the TV" hint="The others are voting…" mood="watch">
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

export function ControllerReveal({ view }: Props): JSX.Element {
  const mine = view.myReveal;
  if (!mine) {
    return <WaitingScreen title="Authors revealed!" hint="Look at the TV" mood="watch" />;
  }
  return (
    <WaitingScreen
      title={`${mine.votes} ${mine.votes === 1 ? 'vote' : 'votes'}${mine.sweep ? ' — sweep!' : ''}`}
      hint={mine.points > 0 ? 'Nice one.' : 'Better luck on the next prompt.'}
      mood={mine.points > 0 ? 'done' : 'wait'}
    >
      <p className={styles.points} aria-label={`${mine.points} points`}>
        +{mine.points}
      </p>
      <p className={styles.quote}>{mine.text}</p>
    </WaitingScreen>
  );
}

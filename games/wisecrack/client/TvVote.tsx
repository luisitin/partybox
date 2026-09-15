// TV: the prompt with its two anonymous answers ("vote"), then authors, voters and points
// ("reveal"). Voter avatars and the winner outline carry the result, not colour alone.
import type { JSX } from 'react';
import { Avatar, BigText, Reveal, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { WisecrackTvView } from '../server/index';
import styles from './wisecrack.module.css';

type Props = GameTvProps<WisecrackTvView>;

const LETTERS = ['A', 'B'];
const BLANK = '(no answer)';

function PromptHeader({ view }: Props): JSX.Element {
  return (
    <>
      <p className={styles.kicker}>
        Round {view.round} · Prompt {view.prompt?.number ?? 0} of {view.prompt?.count ?? 0}
        {view.multiplier > 1 ? ' · double points' : ''}
      </p>
      <BigText level="h1">{view.prompt?.text ?? ''}</BigText>
    </>
  );
}

export function TvVote({ view }: Props): JSX.Element {
  return (
    <Stage>
      <PromptHeader view={view} />
      <div className={styles.cards}>
        {view.options.map((option) => (
          <article
            key={option.slot}
            className={styles.card}
            aria-label={`answer ${LETTERS[option.slot]}`}
          >
            <span className={styles.letter} aria-hidden>
              {LETTERS[option.slot]}
            </span>
            <p className={`${styles.answer} ${option.text === BLANK ? styles.blank : ''}`}>
              {option.text}
            </p>
          </article>
        ))}
      </div>
      <p className={styles.progress} aria-live="polite">
        {view.votedCount} / {view.votersExpected} voted — pick the funnier one on your phone
      </p>
    </Stage>
  );
}

export function TvReveal({ view }: Props): JSX.Element {
  const players = new Map(view.players.map((p) => [p.id, p]));
  const top = Math.max(0, ...view.revealed.map((r) => r.votes));
  const items = view.revealed.map((r) => ({
    id: r.playerId,
    text: (
      <>
        <span aria-hidden>{LETTERS[r.slot]} · </span>
        <span className={r.text === BLANK ? styles.blank : ''}>{r.text}</span>
      </>
    ),
    detail: `${r.name} · ${r.votes} ${r.votes === 1 ? 'vote' : 'votes'} · +${r.points}${r.sweep ? ' · SWEEP!' : ''}`,
    aside: (
      <>
        <Avatar avatarId={r.avatarId} />
        {r.voterIds.map((id) => {
          const voter = players.get(id);
          return voter ? (
            <Avatar key={id} avatarId={voter.avatarId} size="var(--pb-space-7)" />
          ) : null;
        })}
      </>
    ),
    emphasis: top > 0 && r.votes === top,
  }));
  return (
    <Stage>
      <PromptHeader view={view} />
      <Reveal items={items} stepMs={700} />
    </Stage>
  );
}

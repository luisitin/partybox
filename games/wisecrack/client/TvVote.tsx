// TV: the prompt with its two anonymous answers ("vote"). The reveal (TvReveal.tsx) reuses the
// same header and cards so the answers never move when the authors land.
import type { JSX } from 'react';
import { BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { WisecrackTvView } from '../server/index';
import styles from './wisecrack.module.css';

type Props = GameTvProps<WisecrackTvView>;

export const LETTERS = ['A', 'B'];
export const BLANK = '(no answer)';

export function answerClass(text: string): string {
  return `${styles.answer} ${text === BLANK ? styles.blank : ''}`;
}

export function PromptHeader({ view }: Props): JSX.Element {
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
            <p className={answerClass(option.text)}>{option.text}</p>
          </article>
        ))}
      </div>
      <p className={styles.progress} aria-live="polite">
        {view.votedCount} / {view.votersExpected} voted — pick the funnier one on your phone
      </p>
    </Stage>
  );
}

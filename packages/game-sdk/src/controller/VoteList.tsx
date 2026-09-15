// Vote between candidate answers. One tap locks the vote; the player's own entry (if any) is shown
// but not votable. Works for 2..N options; long text wraps.
import type { JSX, ReactNode } from 'react';
import { Screen } from './Screen';
import styles from './VoteList.module.css';

export interface VoteOption {
  id: string;
  text: ReactNode;
  /** This option belongs to the voter → rendered disabled with a "yours" tag. */
  mine?: boolean;
}

export interface VoteListProps {
  prompt?: ReactNode;
  kicker?: string;
  options: VoteOption[];
  votedId?: string | null;
  disabled?: boolean;
  onVote: (id: string) => void;
  footer?: ReactNode;
}

export function VoteList(props: VoteListProps): JSX.Element {
  const { prompt, kicker, options, votedId = null, disabled, onVote, footer } = props;
  const locked = votedId !== null || disabled;
  return (
    <Screen footer={footer}>
      {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
      {prompt ? <p className={styles.prompt}>{prompt}</p> : null}
      <div className={styles.list} role="radiogroup" aria-label="vote">
        {options.map((option) => {
          const isVoted = option.id === votedId;
          const classes = [
            styles.option,
            isVoted ? styles.voted : '',
            option.mine ? styles.mine : '',
            locked && !isVoted ? styles.dim : '',
          ].join(' ');
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isVoted}
              className={classes}
              disabled={locked || option.mine}
              onClick={() => onVote(option.id)}
            >
              <span className={styles.text}>{option.text}</span>
              {option.mine ? <span className={styles.tag}>yours</span> : null}
              {isVoted ? (
                <span className={styles.mark} aria-hidden>
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {votedId !== null ? (
        <p className={styles.locked} role="status">
          ✓ Vote in — look at the TV
        </p>
      ) : null}
    </Screen>
  );
}

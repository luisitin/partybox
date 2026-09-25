// TV during `guess`: "Who said it?", the answer big on a card that swings in from the deck (3D),
// quote marks drawn as decoration, "Answer 3 of 6", and how many have tapped. The strip's ✓ shows
// who — the author's too, so nothing gives them away.
import type { JSX } from 'react';
import { Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { WsTvView } from '../server/views';
import { STRINGS } from './strings';
import styles from './tv.module.css';

/** Longer answers drop from h1 (72 px) to 48 px so three lines always fit (SPEC §4.4). */
export const LONG_ANSWER = 40;

export function AnswerCard({ text, small }: { text: string; small?: boolean }): JSX.Element {
  const long = text.length > LONG_ANSWER;
  return (
    <div className={`${styles.answerCard} ${small ? styles.answerSmall : ''}`}>
      <span className={styles.quoteOpen} aria-hidden>
        “
      </span>
      <p className={`${styles.answerText} ${long ? styles.answerLong : ''}`}>{text}</p>
      <span className={styles.quoteClose} aria-hidden>
        ”
      </span>
    </div>
  );
}

export function TvGuess({ view }: GameTvProps<WsTvView>): JSX.Element {
  const L = useT(STRINGS);
  const card = view.card;
  const seated = view.players.filter((p) => view.seated.includes(p.id) && p.connected);
  const tapped = seated.filter((p) => p.status === 'submitted').length;
  return (
    <Stage center>
      <p className={styles.header}>{L('Who said it?')}</p>
      <div className={styles.scene}>
        {card ? (
          <div key={card.number} className={styles.dealIn}>
            <AnswerCard text={card.text} />
          </div>
        ) : null}
      </div>
      <p className={styles.caption}>
        {card ? L('Answer {n} of {total}', { n: card.number, total: card.count }) : ''}
        <span className={styles.dot} aria-hidden>
          ·
        </span>
        <span key={tapped} className="pb-tick" role="status">
          {L('{n} of {total} tapped', { n: tapped, total: seated.length })}
        </span>
      </p>
    </Stage>
  );
}

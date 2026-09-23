// A "phone only" room (S-005) reads the reveal on the phone (the owner, 2026-09-21: "some games
// still reference tv"): the prompt, both answers with their author, the votes and the points —
// the TV's reveal in a list, after the same hold the author's own result waits for.
import type { JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import { answerText } from './blank';
import { STRINGS } from './strings';
import styles from './wisecrack.module.css';

const LETTERS = ['A', 'B'];

export function PhoneReveal({
  reveal,
  meId,
}: {
  reveal: NonNullable<WisecrackControllerView['reveal']>;
  meId: string;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <section className={styles.phoneReveal} aria-label={L('the reveal')}>
      <p className={styles.phonePrompt}>{reveal.promptText}</p>
      <ol className={styles.phoneAnswers}>
        {reveal.revealed.map((a) => (
          <li
            key={a.slot}
            className={`${styles.phoneAnswer} ${a.points > 0 ? styles.phoneAnswerWon : ''} ${a.playerId === meId ? styles.phoneAnswerMine : ''}`}
          >
            <span className={styles.phoneLetter} aria-hidden>
              {LETTERS[a.slot] ?? a.slot + 1}
            </span>
            <span className={styles.phoneText}>{answerText(L, a.text)}</span>
            <span className={styles.phoneAuthor}>
              <Avatar avatarId={a.avatarId} size={22} />
              {a.name}
              {a.playerId === meId ? ` ${L('(you)')}` : ''}
            </span>
            <span className={styles.phoneVotes}>
              {a.walkover
                ? L('by default')
                : a.votes === 1
                  ? L('1 vote')
                  : L('{n} votes', { n: a.votes })}
              {a.sweep ? <span className={styles.pill}>{L('Sweep')}</span> : null}
            </span>
            <span className={styles.phonePoints}>+{a.points}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

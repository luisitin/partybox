// A "phone only" room (S-005) reads the reveal on the phone (the owner, 2026-09-21: "some games
// still reference tv"): the prompt, both answers with their author, the votes and the points —
// the TV's reveal in a list, after the same hold the author's own result waits for.
import type { JSX } from 'react';
import { Avatar } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import styles from './wisecrack.module.css';

const LETTERS = ['A', 'B'];

export function PhoneReveal({
  reveal,
  meId,
}: {
  reveal: NonNullable<WisecrackControllerView['reveal']>;
  meId: string;
}): JSX.Element {
  return (
    <section className={styles.phoneReveal} aria-label="the reveal">
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
            <span className={styles.phoneText}>{a.text}</span>
            <span className={styles.phoneAuthor}>
              <Avatar avatarId={a.avatarId} size={22} />
              {a.name}
              {a.playerId === meId ? ' (you)' : ''}
            </span>
            <span className={styles.phoneVotes}>
              {a.walkover ? 'by default' : `${a.votes} ${a.votes === 1 ? 'vote' : 'votes'}`}
              {a.sweep ? <span className={styles.pill}>Sweep</span> : null}
            </span>
            <span className={styles.phonePoints}>+{a.points}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// I-796 K (design review K): during the reveal a TV room's phone was a spinner and "Look at the
// TV" for the whole beat. Now it holds a quiet mirror of the moment: the prompt and its place in the
// round, the two answers as mini cards ("yours" / "your pick" tagged), the authors and the votes as
// they land, and where you stand in the round. Still quiet enough that eyes stay on the TV, and it
// never spoils it: the authors appear with the TV's author beat and the votes and points with its
// last beat (timing.ts), the same hold an author's own result waits for.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import { BLANK, answerText } from './blank';
import { STRINGS } from './strings';
import { REVEAL_BEATS_MS, REVEAL_HOLD_MS, useHold } from './timing';
import styles from './RevealMirror.module.css';

const LETTERS = ['A', 'B'];

export function RevealMirror({
  reveal,
  meId,
  pickedSlot,
}: {
  reveal: NonNullable<WisecrackControllerView['reveal']>;
  meId: string;
  /** The slot this phone voted for, when it voted. */
  pickedSlot: number | null;
}): JSX.Element {
  const L = useT(STRINGS);
  const authorsShown = useHold(REVEAL_BEATS_MS[2]);
  const votesShown = useHold(REVEAL_HOLD_MS);
  const mine = reveal.revealed.some((a) => a.playerId === meId);
  // The winner's card lights up (both can score; only the bigger haul is outlined, as on the TV).
  const top = Math.max(0, ...reveal.revealed.map((a) => a.points));
  const left = reveal.count - reveal.number;
  const who = mine
    ? L('Your answer is in this one')
    : pickedSlot !== null
      ? L('You picked {letter}', { letter: LETTERS[pickedSlot] ?? '?' })
      : L("You weren't in this one");
  const ahead =
    left <= 0
      ? L('scores are next.')
      : left === 1
        ? L('1 more to go.')
        : L('{n} more to go.', { n: left });
  return (
    <section className={styles.mirror} aria-label={L('the reveal')} data-reveal-mirror>
      <p className={styles.kicker}>
        {L('On the TV now · prompt {n} of {count}', { n: reveal.number, count: reveal.count })}
      </p>
      <h2 className={styles.prompt}>{reveal.promptText}</h2>
      <ol className={styles.cards}>
        {reveal.revealed.map((a) => {
          const won = votesShown && a.points > 0 && a.points === top;
          const tag =
            a.playerId === meId ? L('yours') : pickedSlot === a.slot ? L('your pick') : null;
          return (
            <li key={a.slot} className={`${styles.card} ${won ? styles.won : ''}`}>
              <span className={styles.label}>
                {LETTERS[a.slot] ?? a.slot + 1}
                {authorsShown ? ` · ${a.name}` : ''}
                {tag ? <span className={styles.tag}>{tag}</span> : null}
              </span>
              <span className={`${styles.text} ${a.text === BLANK ? styles.blank : ''}`}>
                {answerText(L, a.text)}
              </span>
              <span className={`${styles.votes} ${won ? styles.votesWon : ''}`}>
                {!votesShown
                  ? '…'
                  : a.walkover
                    ? `+${a.points} · ${L('wins by default')}`
                    : `${a.points > 0 ? `+${a.points} · ` : ''}${
                        a.votes === 1 ? L('1 vote') : L('{n} votes', { n: a.votes })
                      }`}
              </span>
            </li>
          );
        })}
      </ol>
      <p className={styles.where}>
        {who}: {ahead}
      </p>
    </section>
  );
}

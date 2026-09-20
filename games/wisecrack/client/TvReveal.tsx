// TV "reveal": the two cards the room just voted on stay exactly where they were and the result
// lands inside them in four beats — voters pop in (300 ms), the authors rise beside their letter
// (900 ms, the winner's name last), then the vote count, points, the winner outline and a SWEEP /
// TIE pill (1500 ms). The count, the outline and the pill all carry the result, never colour alone.
// Sound: 'reveal' at t=0 (a game cue keeps the shell's generic phase chime quiet), 'sweep' on the
// last beat only when a card swept — never more than two cues per reveal. A walkover (the other
// answer was blank, no vote ran) lands the same way: the real answer's card wins "by default".
import { useEffect } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, Stage, useBeats, useSound } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { WisecrackTvView } from '../server/index';
import { BLANK, LETTERS, PromptHeader, answerClass, isShort } from './TvVote';
import { REVEAL_BEATS_MS } from './timing';
import styles from './wisecrack.module.css';

type Props = GameTvProps<WisecrackTvView>;

const BEAT_VOTERS = 1;
const BEAT_AUTHORS = 2;
const BEAT_POINTS = 3;

export function TvReveal({ view }: Props): JSX.Element {
  const play = useSound();
  const beat = useBeats(REVEAL_BEATS_MS);
  const players = new Map(view.players.map((p) => [p.id, p]));
  const top = Math.max(0, ...view.revealed.map((r) => r.votes));
  const winners = top > 0 ? view.revealed.filter((r) => r.votes === top).length : 0;
  const tie = winners > 1;
  const swept = view.revealed.some((r) => r.sweep);
  useEffect(() => {
    play('reveal');
  }, [play]);
  useEffect(() => {
    if (beat >= BEAT_POINTS && swept) play('sweep');
  }, [beat, swept, play]);
  return (
    <Stage>
      <PromptHeader view={view} />
      <div className={styles.cards}>
        {view.revealed.map((r) => {
          const winner = r.walkover || (top > 0 && r.votes === top);
          const blankLoser = r.text === BLANK && view.revealed.some((o) => o.walkover);
          // The lower-voted author lands first; a clear winner's name is the last thing to arrive.
          const last = winner && !tie;
          const voters = r.voterIds
            .map((id) => players.get(id))
            .filter((p): p is NonNullable<typeof p> => p !== undefined);
          const pill = r.sweep ? 'Sweep' : tie && winner ? 'Tie' : null;
          return (
            <article
              key={r.playerId}
              className={`${styles.card} ${styles.cardStill} ${styles.revealCard} ${winner && beat >= BEAT_POINTS ? styles.winner : ''} ${!winner && top > 0 && !tie && beat >= BEAT_POINTS ? styles.loser : ''}`}
              aria-label={`answer ${LETTERS[r.slot]}`}
            >
              <div className={styles.cardTop}>
                <span className={styles.letter} aria-hidden>
                  {LETTERS[r.slot]}
                </span>
                <span
                  className={`${styles.author} ${beat >= BEAT_AUTHORS ? styles.rise : styles.pending} ${last ? styles.late : ''}`}
                  aria-hidden={beat < BEAT_AUTHORS}
                >
                  <Avatar avatarId={r.avatarId} size="var(--pb-chip-size)" />
                  <span className={styles.authorName}>{r.name}</span>
                </span>
              </div>
              <p className={answerClass(r.text)} data-short={isShort(r.text)}>
                {r.text}
              </p>
              <div className={styles.footer}>
                {voters.length > 0 ? (
                  <span
                    className={styles.voters}
                    role="list"
                    aria-label={`voted for this: ${voters.map((v) => v.name).join(', ')}`}
                    aria-hidden={beat < BEAT_VOTERS}
                  >
                    {voters.map((v, i) => (
                      <span
                        key={v.id}
                        role="listitem"
                        className={`${styles.voter} ${beat >= BEAT_VOTERS ? styles.pop : styles.pending}`}
                        style={{ '--pb-i': i } as CSSProperties}
                      >
                        <Avatar avatarId={v.avatarId} size="var(--pb-space-7)" />
                      </span>
                    ))}
                  </span>
                ) : null}
                {blankLoser ? null : (
                  <span
                    className={`${styles.payoff} ${r.votes === 0 && !r.walkover ? styles.zero : ''} ${beat >= BEAT_POINTS ? styles.pop : styles.pending}`}
                    aria-hidden={beat < BEAT_POINTS}
                  >
                    {r.walkover ? (
                      <span className={styles.voteWord}>wins by default</span>
                    ) : (
                      <>
                        <span className={styles.voteCount}>{r.votes}</span>
                        <span className={styles.voteWord}>{r.votes === 1 ? 'vote' : 'votes'}</span>
                      </>
                    )}
                    {r.points > 0 ? <span className={styles.delta}>+{r.points}</span> : null}
                    {pill ? <span className={styles.pill}>{pill}</span> : null}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </Stage>
  );
}

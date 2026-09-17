// TV "reveal": one card at a time, read out loud — the black card with the played whites dropped
// in, big, and the cards already read lined up small underneath so the room can compare. Every
// card is a new phase instance (the shell chimes 'reveal' for each). "judge": every card up at
// once with its letter, and the vote progress in the kicker row.
import type { JSX } from 'react';
import { Avatar, BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';
import { FilledCard, LETTERS } from './Cards';
import styles from './blanks.module.css';

type Props = GameTvProps<BlanksTvView>;

const NAMED_HOLDOUTS = 3;

function Holdout({ player }: { player: ViewPlayer }): JSX.Element {
  return (
    <span className={styles.holdout}>
      <Avatar avatarId={player.avatarId} size="var(--pb-space-7)" />
      {player.name}
    </span>
  );
}

/** "n / m voted · waiting for …" (vote mode) or "Ana is choosing…" (czar mode). */
function Progress({ view }: Props): JSX.Element {
  if (view.judgeMode === 'czar') {
    const judge = view.czar;
    if (!judge) return <>Judging…</>;
    return view.votedCount > 0 ? (
      <>{judge.name} has decided</>
    ) : (
      <>
        <Avatar avatarId={judge.avatarId} size="var(--pb-space-7)" />
        {judge.name} is choosing…
      </>
    );
  }
  const n = view.votedCount;
  const m = view.votersExpected;
  const holdouts = view.players.filter((p) => p.status === 'active' && p.connected);
  if (n === 0) return <>Vote on your phone · 0 / {m}</>;
  if (holdouts.length === 1)
    return (
      <>
        Just waiting for <Holdout player={holdouts[0]!} />…
      </>
    );
  if (holdouts.length === 0)
    return (
      <>
        {n} / {m} voted
      </>
    );
  const rest = holdouts.length - NAMED_HOLDOUTS;
  return (
    <>
      {n} / {m} voted · waiting for
      {holdouts.slice(0, NAMED_HOLDOUTS).map((p) => (
        <Holdout key={p.id} player={p} />
      ))}
      {rest > 0 ? `+${rest}` : null}
    </>
  );
}

export function TvReveal({ view }: Props): JSX.Element {
  const current = view.cards[view.revealIndex];
  // The last four read (the judge grid shows them all); one row, never pushing the card up.
  const read = view.cards.slice(0, view.revealIndex).slice(-4);
  return (
    <Stage>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} · Card {view.revealIndex + 1} of {view.cardCount}
        </p>
        <span className={styles.progressPill}>Read it out loud</span>
      </div>
      <div className={styles.stageMain}>
        {view.black && current ? (
          <FilledCard
            key={current.slot}
            text={view.black.text}
            whites={current.whites}
            size="hero"
            letter={LETTERS[current.slot]}
            className={`${styles.stageCard} ${styles.landing}`}
          />
        ) : null}
      </div>
      {read.length > 0 && view.black ? (
        <ul className={`${styles.strip} ${styles.readRow}`} aria-label="cards read so far">
          {read.map((c) => (
            <li key={c.slot}>
              <FilledCard
                text={view.black?.text ?? ''}
                whites={c.whites}
                size="mini"
                letter={LETTERS[c.slot]}
              />
            </li>
          ))}
        </ul>
      ) : (
        <BigText level="h2" tone="muted">
          {view.judgeMode === 'czar' && view.czar
            ? `${view.czar.name} picks the winner after the last card.`
            : 'The vote opens after the last card.'}
        </BigText>
      )}
    </Stage>
  );
}

/** How many columns the judge grid needs so every card is readable at 1080p. */
function gridClass(count: number): string {
  if (count <= 2) return styles.grid2 ?? '';
  if (count <= 6) return styles.grid3 ?? '';
  return styles.grid4 ?? '';
}

export function TvJudge({ view }: Props): JSX.Element {
  const dense = view.cards.length > 6;
  return (
    <Stage>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} · {view.judgeMode === 'czar' ? 'The judge decides' : 'Vote'}
        </p>
        <span className={styles.progressSlot} role="status" aria-live="polite">
          <span key={view.votedCount} className={styles.progressPill}>
            <Progress view={view} />
          </span>
        </span>
      </div>
      <ul className={`${styles.judgeGrid} ${gridClass(view.cards.length)}`} aria-label="the cards">
        {view.cards.map((c, i) => (
          <li key={c.slot} style={{ animationDelay: `calc(${i} * var(--pb-motion-fast) / 2)` }}>
            <FilledCard
              text={view.black?.text ?? ''}
              whites={c.whites}
              size={dense ? 'mini' : 'grid'}
              letter={LETTERS[c.slot]}
            />
          </li>
        ))}
      </ul>
    </Stage>
  );
}

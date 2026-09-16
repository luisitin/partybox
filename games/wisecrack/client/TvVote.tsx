// TV: the prompt with its two anonymous answers ("vote"). The reveal (TvReveal.tsx) reuses the
// same header and cards so the answers never move when the authors land. The only status is the
// pill in the kicker row: how many voted, and who the room is waiting for (never a line below the
// cards, which sat in the overscan band).
import type { JSX } from 'react';
import { Avatar, BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import type { WisecrackTvView } from '../server/index';
import styles from './wisecrack.module.css';

type Props = GameTvProps<WisecrackTvView>;

export const LETTERS = ['A', 'B'];
export const BLANK = '(no answer)';

export function answerClass(text: string): string {
  return `${styles.answer} ${text === BLANK ? styles.blank : ''}`;
}

/** One line of 72 px Nunito 800 fits the 784 px inner card at this length: short answers go h1. */
export function isShort(text: string): true | undefined {
  return text.length <= 20 || undefined;
}

const NAMED_HOLDOUTS = 3;

function Holdout({ player }: { player: ViewPlayer }): JSX.Element {
  return (
    <span className={styles.holdout}>
      <Avatar avatarId={player.avatarId} size="var(--pb-space-7)" />
      {player.name}
    </span>
  );
}

/** "n / m voted · waiting for …": authors are 'waiting', voters 'submitted', disconnected voters
 *  never block the phase, so the holdouts are the connected 'active' players. */
function Progress({ view }: Props): JSX.Element {
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
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} · Prompt {view.prompt?.number ?? 0} of {view.prompt?.count ?? 0}
          {view.multiplier > 1 ? ' · double points' : ''}
        </p>
        {/* The slot waits for both answers (R-062); the pill inside re-rises with every vote. */}
        <span className={styles.progressSlot} role="status" aria-live="polite">
          <span key={view.votedCount} className={styles.progressPill}>
            <Progress view={view} />
          </span>
        </span>
      </div>
      <BigText level="h1">{view.prompt?.text ?? ''}</BigText>
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
            <p className={answerClass(option.text)} data-short={isShort(option.text)}>
              {option.text}
            </p>
          </article>
        ))}
      </div>
    </Stage>
  );
}

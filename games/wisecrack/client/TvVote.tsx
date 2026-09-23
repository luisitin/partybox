// TV: the prompt with its two anonymous answers ("vote"). The reveal (TvReveal.tsx) reuses the
// same header and cards so the answers never move when the authors land. The only status is the
// pill in the kicker row: how many voted, and who the room is waiting for (never a line below the
// cards, which sat in the overscan band).
import type { JSX, ReactNode } from 'react';
import { Avatar, BigText, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps, Translator, ViewPlayer } from '@partybox/game-sdk/ui';
import type { WisecrackTvView } from '../server/index';
import { BLANK, answerText } from './blank';
import { STRINGS } from './strings';
import styles from './wisecrack.module.css';

type Props = GameTvProps<WisecrackTvView>;

export const LETTERS = ['A', 'B'];

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

/** A translated sentence with a `{who}` slot, the slot filled with avatars and names. */
function withWho(text: string, who: ReactNode): JSX.Element {
  const [before, after] = text.split('{who}');
  return (
    <>
      {before}
      {who}
      {after}
    </>
  );
}

/** "n / m voted · waiting for …": authors are 'waiting', voters 'submitted', disconnected voters
 *  never block the phase, so the holdouts are the connected 'active' players. */
function Progress({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const n = view.votedCount;
  const m = view.votersExpected;
  const holdouts = view.players.filter((p) => p.status === 'active' && p.connected);
  if (n === 0) return <>{L('Vote on your phone · 0 / {total}', { total: m })}</>;
  if (holdouts.length === 1)
    return withWho(L('Just waiting for {who}…'), <Holdout player={holdouts[0]!} />);
  if (holdouts.length === 0) return <>{L('{n} / {total} voted', { n, total: m })}</>;
  const rest = holdouts.length - NAMED_HOLDOUTS;
  return withWho(
    L('{n} / {total} voted · waiting for {who}', { n, total: m }),
    <>
      {holdouts.slice(0, NAMED_HOLDOUTS).map((p) => (
        <Holdout key={p.id} player={p} />
      ))}
      {rest > 0 ? `+${rest}` : null}
    </>,
  );
}

/** "Round r · Prompt n of N", and " · double points" on the last round. */
function kickerText(L: Translator, view: WisecrackTvView): string {
  const line = L('Round {round} · Prompt {n} of {total}', {
    round: view.round,
    n: view.prompt?.number ?? 0,
    total: view.prompt?.count ?? 0,
  });
  return view.multiplier > 1 ? `${line} · ${L('double points')}` : line;
}

export function PromptHeader({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  return (
    <>
      <p className={styles.kicker}>{kickerText(L, view)}</p>
      <BigText level="h1">{view.prompt?.text ?? ''}</BigText>
    </>
  );
}

export function TvVote({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Stage>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>{kickerText(L, view)}</p>
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
            aria-label={L('answer {letter}', { letter: LETTERS[option.slot] ?? '' })}
          >
            <span className={styles.letter} aria-hidden>
              {LETTERS[option.slot]}
            </span>
            <p className={answerClass(option.text)} data-short={isShort(option.text)}>
              {answerText(L, option.text)}
            </p>
          </article>
        ))}
      </div>
    </Stage>
  );
}

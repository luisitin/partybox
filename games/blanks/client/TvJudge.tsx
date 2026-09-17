// TV "judge": every card up at once with its letter, and the vote progress in the kicker row.
// A grid the stage cannot hold — eleven Pick 2 cards under three rows of chips ran its third row
// under the host bar (review-loop #129) — is measured once and shown in pages that turn every
// few seconds, so every card gets its time on the TV while the phones carry the whole list.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Avatar, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';
import { FilledCard, LETTERS } from './Cards';
import styles from './blanks.module.css';

type Props = GameTvProps<BlanksTvView>;

const NAMED_HOLDOUTS = 3;
/** A page of cards stays up this long before the next turns. */
const PAGE_MS = 6_000;

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

/** How many columns the judge grid needs so every card is readable at 1080p. */
function gridClass(count: number): string {
  if (count <= 2) return styles.grid2 ?? '';
  if (count <= 6) return styles.grid3 ?? '';
  return styles.grid4 ?? '';
}

/**
 * The grid, measured by a ResizeObserver once it has laid out with every card: how many fit
 * above the stage's bottom edge is the page size (`count` when they all do), and while pages are
 * needed the page on show turns every PAGE_MS. Mounted under a per-round key so it starts over
 * with every new set of cards.
 */
function JudgeGrid({ view }: Props): JSX.Element {
  const count = view.cards.length;
  const dense = count > 6;
  const ref = useRef<HTMLUListElement>(null);
  const [pageSize, setPageSize] = useState(count);
  const [page, setPage] = useState(0);
  useEffect(() => {
    const grid = ref.current;
    if (!grid) return undefined;
    const observer = new ResizeObserver(() => {
      const bottom = grid.clientHeight;
      const items = [...grid.children] as HTMLElement[];
      // Full cards only: the first card whose bottom passes the edge starts the next page.
      const fits = items.filter((el) => el.offsetTop + el.offsetHeight <= bottom + 1).length;
      if (fits < items.length) setPageSize(Math.max(1, fits));
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);
  const pages = Math.ceil(count / pageSize);
  useEffect(() => {
    if (pages <= 1) return undefined;
    const id = window.setInterval(() => setPage((p) => (p + 1) % pages), PAGE_MS);
    return () => window.clearInterval(id);
  }, [pages]);
  const paged = pageSize < count;
  const shown = paged ? view.cards.slice(page * pageSize, (page + 1) * pageSize) : view.cards;
  const first = shown[0];
  const last = shown[shown.length - 1];
  return (
    <>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} · {view.judgeMode === 'czar' ? 'The judge decides' : 'Vote'}
          {paged && first && last
            ? ` · cards ${LETTERS[first.slot]}–${LETTERS[last.slot]} (${page + 1} of ${pages})`
            : ''}
        </p>
        <span className={styles.progressSlot} role="status" aria-live="polite">
          <span key={view.votedCount} className={styles.progressPill}>
            <Progress view={view} />
          </span>
        </span>
      </div>
      <ul
        ref={ref}
        className={`${styles.judgeGrid} ${gridClass(count)}`}
        aria-label={paged ? `the cards, page ${page + 1} of ${pages}` : 'the cards'}
      >
        {shown.map((c, i) => (
          // Keyed by slot and page: a page turn rises like a fresh grid.
          <li
            key={`${page}:${c.slot}`}
            style={{ animationDelay: `calc(${i} * var(--pb-motion-fast) / 2)` }}
          >
            <FilledCard
              text={view.black?.text ?? ''}
              whites={c.whites}
              size={dense ? 'mini' : 'grid'}
              letter={LETTERS[c.slot]}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export function TvJudge({ view }: Props): JSX.Element {
  return (
    <Stage>
      <JudgeGrid key={`${view.round}:${view.cards.length}`} view={view} />
    </Stage>
  );
}

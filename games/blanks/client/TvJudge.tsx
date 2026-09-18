// TV "judge": every card up at once with its letter, and the vote progress in the kicker row.
// A grid the stage cannot hold — eleven Pick 2 cards under three rows of chips ran its third row
// under the host bar (review-loop #129) — is measured and shown in pages that turn every few
// seconds, so every card gets its time on the TV while the phones carry the whole list.
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

/** Where each page starts: a card whose bottom would pass the grid's edge opens the next page. */
function pageStarts(grid: HTMLElement): number[] {
  const items = [...grid.children] as HTMLElement[];
  const starts: number[] = [];
  let top = 0;
  items.forEach((el, i) => {
    if (i === 0 || el.offsetTop + el.offsetHeight - top > grid.clientHeight + 1) {
      top = el.offsetTop;
      starts.push(i);
    }
  });
  return starts;
}

/**
 * Every card stays in the (clipped) grid; a ResizeObserver recomputes the page starts whenever
 * the grid's box settles or changes — the stage is still crossfading in when it first lays out —
 * and, while more than one page is needed, the grid scrolls to the next page every PAGE_MS.
 * Mounted under a per-round key so the page count starts over with every new set of cards.
 */
function JudgeGrid({ view }: Props): JSX.Element {
  const count = view.cards.length;
  const dense = count > 6;
  const ref = useRef<HTMLUListElement>(null);
  const [starts, setStarts] = useState<number[]>([0]);
  const [page, setPage] = useState(0);
  useEffect(() => {
    const grid = ref.current;
    if (!grid) return undefined;
    const observer = new ResizeObserver(() => {
      const next = pageStarts(grid);
      setStarts((prev) => (prev.join(',') === next.join(',') ? prev : next));
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);
  const pages = starts.length;
  useEffect(() => {
    if (pages <= 1) return undefined;
    const id = window.setInterval(() => setPage((p) => (p + 1) % pages), PAGE_MS);
    return () => window.clearInterval(id);
  }, [pages]);
  const current = Math.min(page, pages - 1);
  useEffect(() => {
    const grid = ref.current;
    const first = grid?.children[starts[current] ?? 0] as HTMLElement | undefined;
    if (grid && first)
      grid.scrollTop = first.offsetTop - (grid.children[0] as HTMLElement).offsetTop;
  }, [starts, current]);
  const from = starts[current] ?? 0;
  const to = (starts[current + 1] ?? count) - 1;
  return (
    <>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} · {view.judgeMode === 'czar' ? 'The judge decides' : 'Vote'}
          {pages > 1 ? ` · cards ${LETTERS[from]}–${LETTERS[to]} (${current + 1} of ${pages})` : ''}
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
        aria-label={pages > 1 ? `the cards, page ${current + 1} of ${pages}` : 'the cards'}
      >
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
    </>
  );
}

export function TvJudge({ view }: Props): JSX.Element {
  return (
    <Stage className={styles.table}>
      <JudgeGrid key={`${view.round}:${view.cards.length}`} view={view} />
    </Stage>
  );
}

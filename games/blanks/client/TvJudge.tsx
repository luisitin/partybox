// TV "judge": every card up at once with its letter, and the vote progress in the kicker row.
// A grid the stage cannot hold — eleven Pick 2 cards under three rows of chips ran its third row
// under the host bar (review-loop #129) — is measured and shown in pages that turn every few
// seconds, so every card gets its time on the TV while the phones carry the whole list.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Avatar, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';
import { fillText } from '../server/cards';
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
    // Their phone dropped: the round holds a grace for them (review-loop #351).
    if (judge.connected === false && view.votedCount === 0)
      return <>{judge.name} dropped — a moment for them to come back…</>;
    return view.votedCount > 0 ? (
      // The pick is in and the stage holds a beat before the result (loop #228).
      <>{judge.name} has decided — here it comes…</>
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
  // Every vote is in: the stage holds "That's everyone" for a beat, the way the answer stage
  // holds "Everyone's in!", instead of cutting straight to the result (loop #228).
  if (holdouts.length === 0) return <>That&rsquo;s everyone — here comes the result…</>;
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
  // Five or six long cards need three lines each at grid size, which is two rows the stage cannot
  // hold — and the room would rather read six small cards than page through them (review-loop
  // #171). Measured: a 560 px column fits ~110 characters in two rows of the grid size.
  const longest = Math.max(
    0,
    ...view.cards.map((c) => fillText(view.black?.text ?? '', c.whites).length),
  );
  // A small room never pages: six cards or fewer that do not fit step down to the small card and
  // stay there for the round (latched, so measuring the smaller cards cannot bounce them back —
  // loop #196; a four-card round was turning pages with A–C up and D alone behind them).
  const [tight, setTight] = useState(false);
  const dense = tight || count > 6 || (count > 4 && longest > 110);
  const ref = useRef<HTMLUListElement>(null);
  const [starts, setStarts] = useState<number[]>([0]);
  const [page, setPage] = useState(0);
  useEffect(() => {
    const grid = ref.current;
    if (!grid) return undefined;
    const measure = (): void => {
      const next = pageStarts(grid);
      setStarts((prev) => (prev.join(',') === next.join(',') ? prev : next));
      if (next.length > 1 && count <= 6) setTight(true);
    };
    // The grid and every card: the stage grows into its final height while the phase crossfades,
    // and a measurement taken in that first frame paged a four-card round that fits (loop #196).
    // The 600 ms re-measure is the backstop for a layout that settles without resizing the grid.
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    for (const li of grid.children) observer.observe(li);
    const late = window.setTimeout(measure, 600);
    return () => {
      observer.disconnect();
      window.clearTimeout(late);
    };
  }, [dense, count]);
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
        className={`${styles.judgeGrid} ${gridClass(count)} ${pages > 1 ? '' : styles.judgeGridFits}`}
        aria-label={pages > 1 ? `the cards, page ${current + 1} of ${pages}` : 'the cards'}
      >
        {view.cards.map((c, i) => (
          <li key={c.slot} style={{ animationDelay: `calc(${i} * 120ms)` }}>
            {/* Only the current page is lit: the row below used to hang into the stage as a card
                sliced through its own last line (loop #196). The fade sits on this wrapper, not on
                the <li>, whose deal animation fills `both` and would win. */}
            <span className={i >= from && i <= to ? styles.onPage : styles.offPage}>
              <FilledCard
                text={view.black?.text ?? ''}
                whites={c.whites}
                size={dense ? 'mini' : 'grid'}
                letter={LETTERS[c.slot]}
              />
            </span>
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

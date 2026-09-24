// TV "judge": every card up at once with its letter, and the vote progress in the kicker row.
// A grid the stage cannot hold — eleven Pick 2 cards under three rows of chips ran its third row
// under the host bar (review-loop #129) — is measured and shown in pages that turn every few
// seconds, so every card gets its time on the TV while the phones carry the whole list.
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { Avatar, Stage, useSound, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';
import { fillText } from '../server/fill';
import { FilledCard, LETTERS } from './Cards';
import { STRINGS } from './strings';
import styles from './blanks.module.css';

type Props = GameTvProps<BlanksTvView>;

const NAMED_HOLDOUTS = 3;
/** A page of cards stays up this long before the next turns. */
const PAGE_MS = 6_000;
/** The stage's crossfade: measurements before this can see a grid that is still growing. */
const SETTLE_MS = 600;

function Holdout({ player }: { player: ViewPlayer }): JSX.Element {
  return (
    <span className={styles.holdout}>
      <Avatar avatarId={player.avatarId} size="var(--pb-space-7)" />
      {player.name}
    </span>
  );
}

/** A translated sentence with a chip where its `{name}` is (`L` leaves an unfilled `{name}` in). */
function around(sentence: string, node: ReactNode): JSX.Element {
  const [before = '', after = ''] = sentence.split('{name}');
  return (
    <>
      {before}
      {node}
      {after}
    </>
  );
}

/** "n / m voted · waiting for …" (vote mode) or "Ana is choosing…" (czar mode). */
function Progress({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  if (view.judgeMode === 'czar') {
    const judge = view.czar;
    if (!judge) return <>{L('Judging…')}</>;
    // Their phone dropped: the round holds a grace for them (review-loop #351).
    if (judge.connected === false && view.votedCount === 0)
      return <>{L('{name} dropped — a moment for them to come back…', { name: judge.name })}</>;
    return view.votedCount > 0 ? (
      // The pick is in and the stage holds a beat before the result (loop #228).
      <>{L('{name} has decided — here it comes…', { name: judge.name })}</>
    ) : (
      <>
        <Avatar avatarId={judge.avatarId} size="var(--pb-space-7)" />
        {L('{name} is choosing…', { name: judge.name })}
      </>
    );
  }
  const n = view.votedCount;
  const m = view.votersExpected;
  const holdouts = view.players.filter((p) => p.status === 'active' && p.connected);
  // I-773 A: the judge went — the room votes in their place, and the TV says why
  const gone = view.judgeGone;
  if (n === 0 && gone)
    return (
      <>
        {gone.why === 'kicked'
          ? L('{name} was removed — everyone votes this one · 0 / {expected}', {
              name: gone.name,
              expected: m,
            })
          : gone.why === 'left'
            ? L('{name} left — everyone votes this one · 0 / {expected}', {
                name: gone.name,
                expected: m,
              })
            : L('{name} dropped — everyone votes this one · 0 / {expected}', {
                name: gone.name,
                expected: m,
              })}
      </>
    );
  if (n === 0) return <>{L('Vote on your phone · 0 / {expected}', { expected: m })}</>;
  if (holdouts.length === 1)
    return around(L('Just waiting for {name}…'), <Holdout player={holdouts[0]!} />);
  // Every vote is in: the stage holds "That's everyone" for a beat, the way the answer stage
  // holds "Everyone's in!", instead of cutting straight to the result (loop #228).
  if (holdouts.length === 0) return <>{L('That’s everyone — here comes the result…')}</>;
  const rest = holdouts.length - NAMED_HOLDOUTS;
  return (
    <>
      {L('{voted} / {expected} voted · waiting for', { voted: n, expected: m })}
      {holdouts.slice(0, NAMED_HOLDOUTS).map((p) => (
        <Holdout key={p.id} player={p} />
      ))}
      {rest > 0 ? `+${rest}` : null}
    </>
  );
}

/**
 * I-144 A: one chip per vote, showing the voter's face. The TV already knows who has voted — a
 * voter's status is 'submitted' — and it never knows what for, so the chips say who is in and who
 * the room is still waiting on without giving anything away.
 */
function VoteChips({ view }: { view: BlanksTvView }): JSX.Element | null {
  const L = useT(STRINGS);
  const voters = view.players.filter((p) => p.status === 'submitted' && p.id !== view.czar?.id);
  if (view.judgeMode === 'czar' || voters.length === 0) return null;
  return (
    <ul className={styles.voteChips} aria-label={L('votes in')}>
      {voters.map((p, i) => (
        <li key={p.id} className={styles.voteChip} style={{ '--pb-i': i } as CSSProperties}>
          <span className={styles.voteChipInner}>
            {/* the side the room sees: WHO has voted */}
            <span className={styles.voteChipBack}>
              <Avatar avatarId={p.avatarId} size="var(--pb-space-6)" />
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** How many columns the judge grid needs so every card is readable at 1080p. */
function gridClass(count: number): string {
  // I-156 A: four cards are a 2 x 2. Three columns left card D alone on a second page while the
  // TV showed A–C for six seconds and every phone listed all four.
  if (count <= 2 || count === 4) return styles.grid2 ?? '';
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
  const L = useT(STRINGS);
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
  // A full room on a Pick 3 (13 seven-line cards) paged four at a time at 720p, the lower third
  // of the stage empty on every page (loop #448): a grid that would turn more than twice past eight
  // cards takes one more step down (latched, like `tight`) so two rows fit a page.
  const [tiny, setTiny] = useState(false);
  const ref = useRef<HTMLUListElement>(null);
  const [starts, setStarts] = useState<number[]>([0]);
  const [page, setPage] = useState(0);
  useEffect(() => {
    const grid = ref.current;
    if (!grid) return undefined;
    // The step down only latches once the stage has settled: the first measurements can see a
    // grid still growing with the crossfade. (The stage scales with the viewport, so 1080p and
    // 720p measure the same 518 px grid and take the same step — measured in loop #448.)
    const settledAt = performance.now() + SETTLE_MS;
    const measure = (): void => {
      const next = pageStarts(grid);
      setStarts((prev) => (prev.join(',') === next.join(',') ? prev : next));
      // I-156 B: any count that would page takes the step down first — the seven- and eight-card
      // rounds fell between the two latches and paged at full size.
      if (next.length > 1) setTight(true);
      if (next.length > 1 && performance.now() >= settledAt) setTiny(true);
    };
    // The grid and every card: the stage grows into its final height while the phase crossfades,
    // and a measurement taken in that first frame paged a four-card round that fits (loop #196).
    // The 600 ms re-measure is the backstop for a layout that settles without resizing the grid.
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    for (const li of grid.children) observer.observe(li);
    const late = window.setTimeout(measure, SETTLE_MS);
    return () => {
      observer.disconnect();
      window.clearTimeout(late);
    };
  }, [dense, count, tiny]);
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
  // I-004 C: "That's everyone" — every card bumps once, 40 ms apart, with the `tally` note.
  const everyone =
    view.judgeMode === 'vote' &&
    view.votedCount > 0 &&
    !view.players.some((p) => p.status === 'active' && p.connected);
  const play = useSound();
  useEffect(() => {
    if (everyone) play('tally');
  }, [everyone, play]);
  return (
    <>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          {view.judgeMode === 'czar'
            ? L('Round {round} · The judge decides', { round: view.round })
            : L('Round {round} · Vote', { round: view.round })}
          {pages > 1
            ? ` · ${L('cards {from}–{to} ({page} of {pages})', {
                from: LETTERS[from] ?? '',
                to: LETTERS[to] ?? '',
                page: current + 1,
                pages,
              })}`
            : ''}
        </p>
        <span className={styles.progressSlot} role="status" aria-live="polite">
          {/* I-004 A: keyed on the count, so every vote pops the pill once. */}
          <span
            key={view.votedCount}
            className={`${styles.progressPill} ${view.votedCount > 0 ? 'pb-pop' : ''}`}
          >
            <Progress view={view} />
          </span>
        </span>
      </div>
      <ul
        ref={ref}
        className={`${styles.judgeGrid} ${gridClass(count)} ${pages > 1 ? '' : styles.judgeGridFits} ${tiny ? styles.judgeGridTiny : ''} ${everyone ? styles.judgeGridDone : ''}`}
        aria-label={
          pages > 1
            ? L('the cards, page {page} of {pages}', { page: current + 1, pages })
            : L('the cards')
        }
      >
        {view.cards.map((c, i) => (
          <li key={c.slot} style={{ animationDelay: `calc(${i} * 150ms)` }}>
            {/* Only the current page is lit: the row below used to hang into the stage as a card
                sliced through its own last line (loop #196). The fade sits on this wrapper, not on
                the <li>, whose deal animation fills `both` and would win. */}
            <span
              className={i >= from && i <= to ? styles.onPage : styles.offPage}
              style={{ '--pb-i': i } as CSSProperties}
            >
              {/* I-156 C: past eight cards the setup is the same sentence on every one of them and
                  the room has already heard it — the answers alone fit where the sentences did not (one blank
                  per white, so a Pick 2 keeps both marks inline). */}
              <FilledCard
                text={count > 8 ? c.whites.map(() => '____').join(' ') : (view.black?.text ?? '')}
                whites={c.whites}
                size={dense ? 'mini' : 'grid'}
                letter={LETTERS[c.slot]}
              />
            </span>
          </li>
        ))}
      </ul>
      {/* I-144 A: the votes land on the table, not only in a counter. */}
      <VoteChips view={view} />
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

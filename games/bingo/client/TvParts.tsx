// The pieces of the Bingo TV: scoreboard rows, a call (big or small), the hall board, and the
// claim stage — a card dropping in, the pattern's cells turning in reading order with a gold
// sweep, the rest fading in, the verdict popping beside the settled card.
import { memo, useEffect, useState } from 'react';
import type { JSX } from 'react';
import {
  BigText,
  Confetti,
  usePrefersReducedMotion,
  useSequence,
  useSoundApi,
} from '@partybox/game-sdk/ui';
import type { ScoreboardRow } from '@partybox/game-sdk/ui';
import type { BingoTvView, CallView, ClaimView } from '../server/views';
import { Card } from './Card';
import type { SweepKind } from './Card';
import { ARM_MS } from '../server/types';
import styles from './Tv.module.css';

// A claim on the stage, in beats. The card drops in with a bounce (DROP), every daub an outline,
// unread. Then the pattern's cells turn one by one in reading order — a row left to right, a
// column top down, a diagonal from its top corner — a gold sweep travelling a winning line
// (STEP per cell); a breath (LINE_HOLD); then every other tile takes its final look at once,
// slowly (REST), so the room sees the whole card; suspense (HOLD); the card settles left
// (SETTLE) and only then the verdict: BINGO! with the cheer and confetti, or NOT A BINGO with the
// buzzer. After that nothing is on a timer — the phones decide. Before any of it, a beat with
// only the heading on stage (ANNOUNCE): the room hears who, then sees the card. Reduced motion
// keeps the beats (they are sequencing, not decoration) and drops the bounce and the glide.
import {
  ANNOUNCE_MS,
  DROP_MS,
  HOLD_MS,
  LINE_HOLD_MS,
  REST_MS,
  SETTLE_MS,
  STEP_MANY_MS,
  STEP_MS,
  STING_LAG_MS,
} from '../server/reveal';

const BOARD_ROWS = ['B', 'I', 'N', 'G', 'O'] as const;

export function rows(view: BingoTvView): ScoreboardRow[] {
  const avatar = (id: string): string => view.players.find((p) => p.id === id)?.avatarId ?? '';
  return view.standings.map((s) => ({
    playerId: s.playerId,
    name: s.name,
    avatarId: avatar(s.playerId),
    score: s.wins,
    delta: s.delta > 0 ? s.delta : undefined,
    rank: s.rank,
    connected: view.players.find((p) => p.id === s.playerId)?.connected,
  }));
}

/** The disc and the number are keyed on the call so they remount (and drop) for every number; the
 * container is not, so the stage never snapshots a leaving call (a key on the container made
 * every call a crossfade: stacked ghosts and 6.7 long frames per 1000 — loop 247). */
export function Call({ call, big }: { call: CallView; big?: boolean }): JSX.Element {
  return (
    <div className={`${big ? styles.callBig : styles.callSmall} ${big ? '' : 'pb-enter'}`}>
      <span key={`l${call.number}`} className={styles.letter} data-letter={call.letter}>
        {call.letter}
      </span>
      <span key={`n${call.number}`} className={styles.number}>
        {call.number}
      </span>
    </div>
  );
}

/**
 * Dibs (loop 252): "Sam says BINGO?…" with the 3 s window draining under it. The slot is always
 * there — the stage is centred, so nothing jumps when the line lands or leaves. Keyed on the
 * window, so dibs passing on re-pops the line and restarts the drain.
 */
export function DibsLine({
  arm,
  queue,
}: {
  arm: BingoTvView['arm'];
  /** Who is waiting behind the armed player, in order (loop 271: the room sees the queue). */
  queue: string[];
}): JSX.Element {
  const then =
    queue.length === 0
      ? ''
      : queue.length === 1
        ? ` · then ${queue[0]}`
        : ` · then ${queue[0]} and ${queue.length - 1} more`;
  return (
    <div className={styles.armSlot}>
      {arm ? (
        <div key={arm.until} className={`${styles.armLine} pb-pop`}>
          <BigText level="h2" tone="accent">
            {arm.name} says BINGO?…
            {then ? <span className={styles.armThen}>{then}</span> : null}
          </BigText>
          <span className={styles.armDrain} style={{ animationDuration: `${ARM_MS}ms` }} />
        </div>
      ) : null}
    </div>
  );
}

/**
 * The hall board: 5 rows × 15 numbers, lit as called, the current one ringed (review-loop #1).
 * Memoised on the numbers themselves (loop 267): the TV re-renders on every push — a dibs, a
 * menu, a score — and 75 cells diffed each time cost 0.66 long frames per 1000 in a 12-player run
 * (0 with the board off). The `called` array is new on every push; its join is the identity.
 */
export const CalledBoard = memo(CalledBoardView, (a, b) => {
  return a.current === b.current && a.called.join(',') === b.called.join(',');
});

function CalledBoardView({
  called,
  current,
}: {
  called: number[];
  current: number | null;
}): JSX.Element {
  const lit = new Set(called);
  return (
    <div className={styles.board} aria-label={`${called.length} numbers called`}>
      {BOARD_ROWS.map((letter, row) => (
        <div key={letter} className={styles.boardRow} data-letter={letter}>
          <span className={styles.boardLetter}>{letter}</span>
          {Array.from({ length: 15 }, (_, i) => row * 15 + i + 1).map((n) => (
            <span
              key={n}
              className={`${styles.cell} ${lit.has(n) ? styles.cellCalled : ''} ${n === current ? styles.cellCurrent : ''}`}
            >
              {n}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** The pattern's cells in reading order: rows left→right, columns top→down, diagonals from the top. */
function patternOrder(claim: ClaimView): number[] {
  return [...claim.cells].sort((a, b) => a - b);
}

/** Which line five cells make (for the sweep); other shapes get the ordered turns alone. */
function lineOf(cells: readonly number[]): { kind: SweepKind; index: number } | null {
  if (cells.length !== 5) return null;
  const first = cells[0] ?? 0;
  if (cells.every((i) => Math.floor(i / 5) === Math.floor(first / 5)))
    return { kind: 'row', index: Math.floor(first / 5) };
  if (cells.every((i) => i % 5 === first % 5)) return { kind: 'col', index: first % 5 };
  if (cells.every((i, k) => i === k * 6)) return { kind: 'diagA', index: 0 };
  if (cells.every((i, k) => i === 4 + k * 4)) return { kind: 'diagB', index: 0 };
  return null;
}

/** "card 2 of 3" when the claimant holds several cards; nothing for the classic one. */
export function whichCard(claim: ClaimView): string {
  return claim.cardCount > 1 ? ` · card ${claim.cardIndex + 1} of ${claim.cardCount}` : '';
}

export function ClaimStage({
  claim,
  valid,
  verdict,
  aside,
  judged,
}: {
  claim: ClaimView;
  valid: boolean;
  /** The verdict block, rendered once the reveal is done. */
  verdict: JSX.Element;
  /** Anything that belongs with the verdict (how the room moves on). */
  aside?: JSX.Element | null;
  /**
   * The server has already delivered the verdict (`verdictShown`): a TV that mounts now — a
   * reload, a late TV — shows the settled card and the verdict at once, silently, instead of
   * replaying a reveal the room has already seen (loop 293).
   */
  judged?: boolean;
}): JSX.Element {
  const order = patternOrder(claim);
  const step = order.length > 9 ? STEP_MANY_MS : STEP_MS;
  const lineMs = order.length * step;
  const cardAt = ANNOUNCE_MS;
  const restAt = cardAt + DROP_MS + lineMs + LINE_HOLD_MS;
  // A card with nothing beyond the pattern has no "rest" to show: straight on to the suspense.
  const restMs = claim.daubs.some((i) => !order.includes(i)) ? REST_MS : 0;
  const settleAt = restAt + restMs + HOLD_MS;
  const seq = useSequence([0, cardAt, cardAt + DROP_MS, restAt, settleAt, settleAt + SETTLE_MS]);
  const [late] = useState(judged === true); // judged at mount: straight to the end, no sounds
  const beat = late ? 5 : seq;
  const reduced = usePrefersReducedMotion();
  const sound = useSoundApi();
  const landed = beat >= 1; // the card is on stage (dropping in)
  const turning = beat >= 2; // the pattern's cells turn, the sweep runs
  const restShown = beat >= 3; // the other tiles fade in together
  const decided = beat >= 4; // the card settles into its column
  const shown = beat >= 5; // the verdict pops beside it — and sounds
  const line = valid ? lineOf(order) : null;
  const sweeps = turning && line !== null && !reduced && !late;
  // The announce beat has a sound of its own: the caller is hushed, so a lift ("someone has a
  // bingo!") fills the second before the card drops (the resolve lands ~0.7 s in, drop at 1 s).
  useEffect(() => {
    if (!late) sound.play('reveal');
  }, [late, sound]);
  // The first cell's colour lands ~0.2 s into its turn (the squeeze): the sting waits for it.
  useEffect(() => {
    if (!sweeps) return;
    const t = setTimeout(() => sound.play('sweep'), STING_LAG_MS);
    return () => clearTimeout(t);
  }, [sweeps, sound]);
  // The verdict's sound lands on the verdict — cheer + confetti for a bingo, the buzzer otherwise.
  useEffect(() => {
    if (!shown || late) return;
    sound.play(valid ? 'cheer' : 'wrong');
  }, [shown, late, valid, sound]);
  return (
    <div className={`${styles.claimStage} ${decided ? styles.decided : ''}`}>
      {shown && valid ? <Confetti /> : null}
      {landed ? (
        <div
          className={`${styles.claim} ${styles.claimLand} ${shown && valid ? styles.shine : ''}`}
        >
          <Card
            numbers={claim.card}
            daubs={claim.daubs}
            green={claim.green}
            red={valid ? [] : claim.red}
            missing={claim.missing}
            size="tv"
            verdict
            revealOrder={turning ? order : []}
            revealStepMs={step}
            restShown={restShown}
            settled={decided}
            sweep={turning && line && !reduced ? { ...line, ms: lineMs } : null}
          />
        </div>
      ) : (
        <div className={styles.claim} aria-hidden />
      )}
      <div className={`${styles.verdict} ${shown ? 'pb-pop' : styles.verdictPending}`}>
        {shown ? verdict : null}
        {shown ? aside : null}
      </div>
    </div>
  );
}

// The Bingo phone's card-pick step (the intro): the "who is still picking" caption and the two
// buttons under the dealt cards. Split from Overlays.tsx (2026-09-23) to keep both under 300 lines.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { JSX, RefObject } from 'react';
import { PrimaryButton, buzz, useHold, useSecondsLeft, useT } from '@partybox/game-sdk/ui';
import type { PlayCue } from '@partybox/game-sdk/ui';
import { dealDoneMs } from '../server/constants';
import type { Input } from '../server/types';
import type { BingoControllerView } from '../server/views';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

/**
 * The card pick's caption: the deal, then who is still picking. No readiness and no count-in
 * (ADR-053, reviewer 59a5f4): the shell's stage did READY and the 3 · 2 · 1; once everyone has
 * picked, the first number simply comes.
 */
/** How close to the pick's deadline the "cards stand" line shows: long enough to read it. */
const STAND_NOTE_S = 5;

export function IntroCount({
  deadline,
  cards,
  ready,
  waitingOn,
  lastOne,
}: {
  /** The pick's deadline: near it, a calm line says the dealt cards will stand (Foundation note). */
  deadline: number | null;
  /** Cards dealt: the caption says "dealing" only while the deal is on (loop 302). */
  cards: number;
  /** This phone has picked (tapped Play these); who has not yet (the card-pick step, loop 344). */
  ready: boolean;
  waitingOn: string[];
  /** Everyone else has picked: one nudge buzz and the caption says so (loop 351). */
  lastOne: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  const left = useSecondsLeft(deadline, false, 250);
  // Once the last card is down the caption stops saying "dealing" (loop 302; a second a card, 345).
  const dealt = useHold('deal', dealDoneMs(cards));
  useEffect(() => {
    if (lastOne) buzz([30, 50, 30]); // the shell's "needs you" pattern, once
  }, [lastOne]);
  return (
    <p className={styles.introCount} aria-live="polite">
      {dealt
        ? ready
          ? waitingOn.length > 2
            ? L('picked — waiting for {n} more', { n: waitingOn.length })
            : waitingOn.length === 2
              ? L('picked — waiting for {a} and {b}', {
                  a: waitingOn[0] ?? '',
                  b: waitingOn[1] ?? '',
                })
              : waitingOn.length === 1
                ? L('picked — waiting for {name}', { name: waitingOn[0] ?? '' })
                : L('everyone has picked')
          : left !== null && left <= STAND_NOTE_S
            ? // content, not a timeout: an unpicked hand simply plays as dealt
              cards > 1
              ? L('the dealt cards stand in {n} s', { n: left })
              : L('the dealt card stands in {n} s', { n: left })
            : lastOne
              ? L('everyone is waiting for you')
              : cards > 1
                ? L('swap a card, or play these')
                : L('swap it, or play it')
        : L('dealing the cards…')}
    </p>
  );
}

/**
 * The card-pick step's two buttons (loop 344): "🎲 Another · card N" and Play these (picking,
 * not readiness — ADR-053). They rise in once
 * the last card has landed (loop 368) — before that the footer stood bare under an empty table,
 * and Ready could be tapped before a card was even seen.
 */
export function IntroActions({
  view,
  cards,
  pick,
  canSwap,
  send,
  play,
  onSwap,
}: {
  view: BingoControllerView;
  cards: number;
  pick: number;
  canSwap: boolean;
  send: (input: Input) => void;
  play: PlayCue;
  onSwap: () => void;
}): JSX.Element {
  const dealt = useHold('deal', dealDoneMs(cards));
  const L = useT(STRINGS);
  const swap = canSwap ? L('Another') : view.ready ? L('Kept') : L('Swapped');
  return (
    <div className={`${styles.introActions} ${dealt ? styles.introActionsIn : ''}`}>
      <PrimaryButton
        tone="neutral"
        disabled={!canSwap || !dealt}
        onClick={() => {
          // The old card flips away and the new one flips in (loop 268): the flip is the card's
          // key; the pluck lands as the new face turns to the eye (~200 ms in).
          send({ type: 'swap', card: pick });
          onSwap();
          buzz(20);
          setTimeout(() => play('card'), 200);
        }}
      >
        🎲 {swap}
        {cards > 1 ? ` · ${L('card {n}', { n: pick + 1 })}` : ''}
      </PrimaryButton>
      <PrimaryButton
        tone={view.ready ? 'success' : 'accent'}
        disabled={view.ready || !dealt}
        className={view.lastOne ? styles.nudge : undefined}
        onClick={() => {
          buzz(20);
          play('submit');
          send({ type: 'ready' });
        }}
      >
        {view.ready ? L('✓ Picked') : cards > 1 ? L('Play these') : L('Play it')}
      </PrimaryButton>
    </div>
  );
}

/**
 * The pick preview shows whole rows (2026-09-25, font200 ES; review cb99c7): when the body cannot
 * hold the whole card, the preview window ends on a row's edge instead of cutting a row through
 * its digits. The room is measured (the preview's top to the body's visible foot, again on every
 * resize or caption change), never guessed; the floor is the letters and one row — below that
 * the body scrolls, as before.
 * The rest of the card scrolls inside the window, with a fade while there is more.
 */
export function useWholeRows(on: boolean): {
  body: RefObject<HTMLDivElement | null>;
  clip: RefObject<HTMLDivElement | null>;
} {
  const body = useRef<HTMLDivElement | null>(null);
  const clip = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const b = body.current;
    const c = clip.current;
    if (!b || !c || !on) return undefined;
    const more = (): void => {
      c.dataset.more = String(c.scrollTop + c.clientHeight < c.scrollHeight - 1);
    };
    const fit = (): void => {
      c.style.maxHeight = '';
      const grid = c.querySelector('[role="gridcell"]')?.parentElement;
      const natural = c.offsetHeight;
      if (grid && natural) {
        // the room: from the preview's top to the body's visible foot (the pick row of dealt
        // cards may scroll under it, as before: the card read whole comes first)
        let top = parseFloat(getComputedStyle(b).paddingBottom);
        for (let el: HTMLElement | null = c; el && el !== b; el = el.offsetParent as HTMLElement)
          top += el.offsetTop;
        const room = b.clientHeight - top;
        // offsets, not rects: the deal's drop and the swap's flip transform the card mid-measure
        const cells = Array.from(grid.querySelectorAll<HTMLElement>('[role="gridcell"]'));
        const bottoms = cells.map((x) => grid.offsetTop + x.offsetTop + x.offsetHeight);
        const edge = Math.max(bottoms[0] ?? 0, ...bottoms.filter((y) => y <= room));
        if (room < natural) c.style.maxHeight = `${Math.ceil(edge) + 1}px`;
      }
      more();
    };
    let frame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    for (const el of [b, ...Array.from(b.children)]) ro.observe(el);
    c.addEventListener('scroll', more, { passive: true });
    fit();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      c.removeEventListener('scroll', more);
    };
  }, [on]);
  return { body, clip };
}

/** The pattern's rule: two lines, and a tap opens the whole of it (at 200 % the clamp hid it). */
export function PatternRule({ text }: { text: string }): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className={`${styles.hint} ${styles.hintTap} ${open ? styles.hintOpen : ''}`}
      aria-expanded={open}
      onClick={() => setOpen(!open)}
    >
      {text}
    </button>
  );
}

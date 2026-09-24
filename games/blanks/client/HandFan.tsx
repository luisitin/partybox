// I-141 — the hand as the owner picked it (design B, 2026-09-22): a real fan and a counter.
// Each card's shape comes from its distance d to the fan's centre, in cards (0 = the middle card,
// ±1 one card out), read on every scroll frame so it changes as you swipe: rotate(d × 14°) about
// the card's bottom centre (the side cards' tops point away from the middle), the middle card
// lifted 18 px and the sides dropped 26 px a card, the sides 12 % smaller. The counter is page
// dots with "3 of 10" beside them, hung under the pinned black card so it takes no height (Session
// B's rule: nothing may push the cards down on an iPhone SE). "New hand" is the fan's last card.
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './blanks.module.css';

const TILT_DEG = 14;
const LIFT_PX = 18;
const DROP_PX = 26;
const SHRINK = 0.12;
/** Past two cards out the shape stops changing (they are off screen anyway). */
const REACH = 2.2;

/** Shapes the fan's cards from their scroll position; returns the index of the middle card. */
export function useFan(fan: HTMLUListElement | null, items: number): number {
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (!fan) return undefined;
    let raf = 0;
    const paint = (): void => {
      const kids = [...fan.children] as HTMLElement[];
      const gap = parseFloat(getComputedStyle(fan).columnGap) || 0;
      const mid = fan.scrollLeft + fan.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      kids.forEach((card, i) => {
        const d = (card.offsetLeft + card.offsetWidth / 2 - mid) / (card.offsetWidth + gap || 1);
        if (Math.abs(d) < bestD) {
          bestD = Math.abs(d);
          best = i;
        }
        const a = Math.max(-REACH, Math.min(REACH, d));
        const lift = Math.max(0, 1 - Math.abs(a)) * LIFT_PX;
        card.style.translate = `0 ${(Math.abs(a) * DROP_PX - lift).toFixed(1)}px`;
        card.style.rotate = `${(a * TILT_DEG).toFixed(2)}deg`;
        card.style.scale = (1 - Math.min(1, Math.abs(a)) * SHRINK).toFixed(3);
        card.style.zIndex = String(100 - Math.round(Math.abs(a) * 10));
      });
      setAt(best);
    };
    const onScroll = (): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };
    paint();
    fan.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      // I-159/I-160: the list takes over — no card keeps the fan's turn
      for (const card of [...fan.children] as HTMLElement[]) {
        card.style.translate = '';
        card.style.rotate = '';
        card.style.scale = '';
        card.style.zIndex = '';
      }
      fan.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [fan, items]);
  return at;
}

/** Page dots over the fan: the middle card's dot stretched and gold, the New hand card's a hollow
 *  dotted ring (the owner: it must look like the other dots), and "3 of 10" beside them. */
export function FanDots({ cards, at }: { cards: number; at: number }): JSX.Element {
  const L = useT(STRINGS);
  const onNew = at >= cards;
  return (
    <div className={styles.fanDots}>
      <span className={styles.dots} aria-hidden>
        {Array.from({ length: cards + 1 }, (_, i) => (
          <i
            key={i}
            className={`${i === at ? styles.dotOn : ''} ${i === cards ? styles.dotNew : ''}`}
          />
        ))}
      </span>
      <span>{onNew ? L('New hand') : L('{n} of {count}', { n: at + 1, count: cards })}</span>
    </div>
  );
}

/** The fan's last card: a whole new hand (three a game), saying what it does and how many are left. */
export function NewHandCard({
  index,
  cards,
  left,
  disabled,
  onRedraw,
}: {
  index: number;
  cards: number;
  left: number;
  disabled: boolean;
  onRedraw: () => void;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <li style={{ animationDelay: `${index * 150}ms`, '--pb-i': index } as CSSProperties}>
      <button
        type="button"
        className={`${styles.white} ${styles.newHand}`}
        disabled={disabled || left === 0}
        onClick={onRedraw}
      >
        <span className={styles.newHandIcon} aria-hidden>
          ⟳
        </span>
        <span>{L('New hand')}</span>
        <small>{L('Swap all {n} cards for fresh ones', { n: cards })}</small>
        <small>{left === 0 ? L('No new hands left') : L('{n} left', { n: left })}</small>
      </button>
    </li>
  );
}

/** I-159: under this many card-type widths the fan shows one card a screen — the hand is a list. */
const BIG_TEXT_EM = 15;

/** I-159/I-160: true when the fan can't show a readable card — a phone on its side (I-160) or
 *  big type (I-159): the hand is a plain list then. */
export function useHandList(fan: HTMLUListElement | null): boolean {
  const [list, setList] = useState(false);
  useEffect(() => {
    if (!fan) return undefined;
    const check = (): void => {
      const sideways = window.matchMedia(
        '(orientation: landscape) and (max-height: 500px)',
      ).matches;
      // the type of an ordinary white card (a long card steps a size down)
      const card = fan.querySelector(`button.${styles.white}:not(.${styles.whiteLong})`);
      const px = card ? parseFloat(getComputedStyle(card).fontSize) : 18;
      setList(sideways || fan.clientWidth / (px || 18) < BIG_TEXT_EM);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(fan);
    window.addEventListener('resize', check);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [fan]);
  return list;
}

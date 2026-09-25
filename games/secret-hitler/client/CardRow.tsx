// The phone's card row (President's three, Chancellor's two, a peek's three). The decrees are dealt
// face-down one after another; tap the row to turn them all face-up (a 3D flip), tap a card to
// pick it, tap the row's edge to turn them back (the owner's play-test: tap to show, tap to hide).
// A phone set to "hold" instead holds, slides onto a card and lets go to pick it. It turns back on
// pointercancel, blur and the page hiding; numbered keys for keyboards and screen readers name a
// card only as "Card 2", so a glance never shows the hand.
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { buzz, useT } from '@partybox/game-sdk/ui';
import type { ActView } from '../server/views';
import { FlipCard } from './Card';
import { getSecretCardMode } from './cardMode';
import { STRINGS } from './strings';
import styles from './phone.module.css';

function cardAt(x: number, y: number): number | null {
  const hit = document.elementFromPoint(x, y)?.closest('[data-card]');
  const i = Number(hit?.getAttribute('data-card'));
  return hit && Number.isInteger(i) ? i : null;
}

export function CardRow({
  cards,
  marked,
  onMark,
}: {
  cards: ActView['cards'];
  marked: number | null;
  onMark?: (i: number) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const [open, setOpen] = useState(false);
  const [hold] = useState(() => getSecretCardMode() === 'hold');
  useEffect(() => {
    const hide = (): void => {
      if (document.visibilityState === 'hidden') setOpen(false);
    };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);
  const pick = (i: number | null): void => {
    if (i === null || !onMark) return;
    buzz(15);
    onMark(i);
  };
  return (
    <div className={styles.cardRowWrap}>
      {/* Above the face-down cards, so a first-timer reads it before the cards (review 1724cb #2). */}
      {open ? null : (
        <p className={styles.rowHint} data-lead>
          {hold ? L('Hold to see the policies') : L('Tap to see the policies')}
        </p>
      )}
      <div
        className={styles.cardRow}
        role="group"
        tabIndex={-1}
        data-open={open || undefined}
        aria-label={L('The policies in your hand')}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          if (!hold) {
            if (!open) {
              buzz(10);
              return setOpen(true);
            }
            const i = cardAt(e.clientX, e.clientY);
            if (i === null) return setOpen(false);
            return pick(i);
          }
          e.currentTarget.setPointerCapture(e.pointerId);
          setOpen(true);
        }}
        onPointerUp={(e) => {
          if (!hold) return;
          setOpen(false);
          pick(cardAt(e.clientX, e.clientY));
        }}
        onPointerCancel={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {cards.map((c, i) => (
          <span
            key={i}
            data-card={i}
            className={styles.dealt}
            data-marked={(marked === i && open) || undefined}
            style={{ '--deal': `${i * 140}ms` } as CSSProperties}
          >
            <FlipCard
              party={c}
              up={open}
              delayMs={i * 70}
              marked={marked === i}
              label={marked === i ? '✓' : String(i + 1)}
            />
          </span>
        ))}
      </div>
      {open && !hold ? (
        <button type="button" className={styles.rowHint} onClick={() => setOpen(false)}>
          {onMark
            ? L('Tap a card to choose it · tap here to hide them')
            : L('Tap here to hide them')}
        </button>
      ) : null}
      {onMark ? (
        <div className={styles.cardKeys}>
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.cardKey}
              data-on={marked === i || undefined}
              onClick={() => pick(i)}
            >
              {L('Card {n}', { n: i + 1 })}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

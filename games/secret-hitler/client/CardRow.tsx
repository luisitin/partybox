// The phone's card row (President's three, Chancellor's two, a peek's three). Hold mode: hold the
// row to see the cards, slide onto one and let go to pick it (one finger). Tap mode (the phone's
// SecretCard preference): tap to reveal, tap a card to pick it, and it turns back after 5 s.
// Hardened like SecretCard: no selection or callout, pointer capture, and it turns back on
// pointercancel, blur and the page hiding. Numbered keys for keyboards and screen readers name a
// card only as "Card 2", so a glance never shows the hand.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { ActView } from '../server/views';
import { CardBack, PolicyCard } from './Card';
import { AUTO_HIDE_MS, getSecretCardMode } from './standin/mode';
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
  const [tap] = useState(() => getSecretCardMode() === 'tap');
  useEffect(() => {
    const hide = (): void => {
      if (document.visibilityState === 'hidden') setOpen(false);
    };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);
  useEffect(() => {
    if (!open || !tap) return;
    const t = setTimeout(() => setOpen(false), AUTO_HIDE_MS);
    return () => clearTimeout(t);
  }, [open, marked, tap]);
  return (
    <div className={styles.cardRowWrap}>
      <div
        className={styles.cardRow}
        role="group"
        tabIndex={-1}
        data-open={open || undefined}
        aria-label={L('The policies in your hand')}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          if (tap) {
            if (!open) return setOpen(true);
            const i = cardAt(e.clientX, e.clientY);
            if (i !== null && onMark) onMark(i);
            else setOpen(false);
            return;
          }
          e.currentTarget.setPointerCapture(e.pointerId);
          setOpen(true);
        }}
        onPointerUp={(e) => {
          if (tap) return;
          setOpen(false);
          const i = cardAt(e.clientX, e.clientY);
          if (i !== null && onMark) onMark(i);
        }}
        onPointerCancel={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {cards.map((c, i) => (
          <span key={i} data-card={i}>
            {open ? (
              <PolicyCard party={c} marked={marked === i} />
            ) : (
              <CardBack label={marked === i ? '✓' : String(i + 1)} />
            )}
          </span>
        ))}
        {open ? null : (
          <span className={styles.cardHint}>
            {tap ? L('Tap to see the policies') : L('Hold to see the policies')}
          </span>
        )}
      </div>
      {onMark ? (
        <div className={styles.cardKeys}>
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.cardKey}
              data-on={marked === i || undefined}
              onClick={() => onMark(i)}
            >
              {L('Card {n}', { n: i + 1 })}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

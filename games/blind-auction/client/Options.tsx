// What the box might hold, as a row of cards: the content (icon + word), its odds word and chance,
// and what a right call pays. On the phone the cards are the bet picker (a radio group); on the TV
// the bets land on them face by face, then the one that was inside lights up.
import type { CSSProperties, JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { ViewPlayer } from '@partybox/game-sdk/ui';
import type { BetView, OptionView } from '../server/views';
import { COIN, iconOf, nameOf, payText, tierWord, toneOf } from './copy';
import styles from './options.module.css';
import { STRINGS } from './strings';

export function OptionBoard({
  options,
  size = 'tv',
  bets,
  shown = Infinity,
  players = [],
  outcome = null,
  selected = null,
  onSelect,
  compact = false,
  className,
}: {
  options: readonly OptionView[];
  size?: 'tv' | 'phone';
  /** Bets on the table (TV / PhoneStage at `open`): shown one by one, in this order. */
  bets?: readonly BetView[] | null;
  shown?: number;
  players?: readonly ViewPlayer[];
  /** The content that was inside (once the box is open). */
  outcome?: number | null;
  /** Phone: the picked content, and the tap that picks one. */
  selected?: number | null;
  onSelect?: (option: number) => void;
  compact?: boolean;
  className?: string;
}): JSX.Element {
  const L = useT(STRINGS);
  const picker = Boolean(onSelect);
  const visible = (bets ?? []).slice(0, shown);
  // Live events bring four to six options: the TV keeps four in a row (three past that), a phone
  // two or three per row, and the words get smaller rather than break.
  const n = options.length;
  const many = n >= 4;
  const cols = size === 'tv' ? (n <= 4 ? n : 3) : n <= 3 ? n : n === 4 ? 2 : 3;
  return (
    <div
      className={`${styles.board} ${styles[size]} ${compact ? styles.compact : ''} ${many ? styles.many : ''} ${className ?? ''}`}
      role={picker ? 'radiogroup' : 'list'}
      aria-label={L("What's inside?")}
      style={{ '--ba-n': cols } as CSSProperties}
    >
      {options.map((o, i) => {
        const on = selected === i;
        const won = outcome === i;
        const dim = outcome !== null && !won;
        const here = visible.filter((b) => b.option === i);
        const cls = `${styles.option} ${styles[toneOf(o.kind)]} ${on ? styles.selected : ''} ${won ? styles.won : ''} ${dim ? styles.dim : ''}`;
        const body = (
          <>
            <span className={styles.icon} aria-hidden>
              {iconOf(o)}
            </span>
            <span className={styles.name}>{nameOf(L, o)}</span>
            <span className={styles.odds}>
              {tierWord(L, o.tier)} · {o.chance}%
            </span>
            <span className={styles.pay}>{L('pays {x}', { x: payText(L, o.pay) })}</span>
            {bets ? (
              <span className={styles.bets}>
                {here.map((b) => {
                  const p = players.find((x) => x.id === b.id);
                  return (
                    <span key={b.id} className={styles.chip} title={p?.name}>
                      {p ? (
                        <span className={styles.face}>
                          <Avatar avatarId={p.avatarId} size="100%" />
                        </span>
                      ) : null}
                      <span className={styles.chipAmount}>
                        {COIN}
                        {b.amount}
                      </span>
                    </span>
                  );
                })}
              </span>
            ) : null}
            {won ? <span className={styles.inside}>{L('INSIDE!')}</span> : null}
          </>
        );
        return picker ? (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={on}
            className={cls}
            onClick={() => onSelect?.(i)}
          >
            {body}
          </button>
        ) : (
          <div key={i} role="listitem" className={cls} style={{ '--ba-i': i } as CSSProperties}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

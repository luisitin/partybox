// The reveal's deck (TV): every option as a compact chip along the bottom, in the one seeded order.
// The option on stage leaves a dashed gap (it flew to the spotlight); options already shown carry
// their verdict as a glyph and a word-style (✗ struck through · 🤖 · ✓), never colour alone.
import type { JSX } from 'react';
import type { RevealedOption } from '../server/index';
import styles from './tv.module.css';

export interface DeckProps {
  options: readonly { id: string; display: string }[];
  shown: ReadonlyMap<string, RevealedOption>;
  spotlight: string | null;
}

const GLYPH: Readonly<Record<RevealedOption['stamp'], string>> = {
  lie: '✗',
  house: '🤖',
  truth: '✓',
};

export function Deck({ options, shown, spotlight }: DeckProps): JSX.Element {
  return (
    <ul className={styles.deck}>
      {options.map((o, i) => {
        const done = shown.get(o.id);
        const away = spotlight === o.id;
        return (
          <li
            key={o.id}
            className={styles.deckChip}
            data-option={o.id}
            data-away={away ? '' : undefined}
            data-stamp={done && !away ? done.stamp : undefined}
            style={{ ['--i' as string]: i }}
          >
            {done && !away ? (
              <span className={styles.deckGlyph} aria-hidden>
                {GLYPH[done.stamp]}
              </span>
            ) : null}
            <span className={styles.deckText}>{o.display.toUpperCase()}</span>
          </li>
        );
      })}
    </ul>
  );
}

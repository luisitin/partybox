// The ways into the Bingo phone's card-style sheet: the 🃏 pill, the sheet on the card-pick step,
// and the sheet during a round — where a tablet saves its own pick apart from the phone's
// (I-126 A). Split from ControllerParts.tsx / Controller.tsx (2026-09-23), under 300 lines each.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import { StyleSheet } from './Overlays';
import { STRINGS } from './strings';
import { setCardStyle, setTabletStyle } from './styles';
import type { CardStyle, TabletStyle } from './styles';
import styles from './Controller.module.css';

/** The 🃏 pill that opens the card-style sheet (play, and the card-pick step). */
export function StylePill({ onOpen }: { onOpen: () => void }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <button type="button" className={styles.stylePill} onClick={onOpen}>
      {L('🃏 style')}
    </button>
  );
}

/** The sheet on the card-pick step (owner's play-test, 2026-09-19): a tap applies the style at
 *  once — the pick screen keeps its own layout, so there is nothing to preview — and the room
 *  is not held. */
export function IntroStyleSheet({
  cards,
  current,
  onClose,
  onPick,
  tablet,
}: {
  cards: number;
  current: CardStyle;
  onClose: () => void;
  /** I-126 A: a tablet saves its own pick here too (default: the phone's). */
  onPick?: (id: CardStyle) => void;
  tablet?: { on: boolean; onPick: () => void };
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <StyleSheet
      cards={cards}
      current={current}
      preview={null}
      note={L('for this round')}
      onPreview={onPick ?? setCardStyle}
      onConfirm={onClose}
      onClose={onClose}
      {...(tablet ? { tablet } : {})}
    />
  );
}

/** The sheet during a round: tap a style to preview it behind the sheet, Confirm to keep it. On a
 *  wide screen the pick is the tablet's own, and "All cards" returns it to the tablet layout. */
export function RoundStyleSheet({
  cards,
  wide,
  style,
  tabletPick,
  preview,
  setPreview,
  onClose,
}: {
  cards: number;
  wide: boolean;
  style: CardStyle;
  tabletPick: TabletStyle;
  preview: CardStyle | null;
  setPreview: (id: CardStyle | null) => void;
  onClose: () => void;
}): JSX.Element {
  const current = wide && tabletPick !== 'all' ? tabletPick : style;
  return (
    <StyleSheet
      cards={cards}
      current={current}
      preview={preview}
      onPreview={(id) => setPreview(id === (wide ? tabletPick : style) ? null : id)}
      onConfirm={() => {
        // I-126 A: a pick on a tablet is the tablet's; a phone's is the phone's
        if (preview) (wide ? setTabletStyle : setCardStyle)(preview);
        onClose();
      }}
      onClose={onClose}
      onBack={() => setPreview(null)}
      tablet={
        wide
          ? {
              on: tabletPick === 'all',
              onPick: () => {
                setTabletStyle('all');
                setPreview(null);
              },
            }
          : undefined
      }
    />
  );
}

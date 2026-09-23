// The card layouts of the Bingo phone. Focus: one big card with every card as a bordered
// thumbnail below (the one up is marked, a card that won fades); tap a thumbnail to bring it up.
// Grid / Strip / Stack / Side by side / tablet: every card at once with its own BINGO! button; the
// grid's spare slot (three cards) shows the call the way the TV does.
import { useState } from 'react';
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { BingoControllerView } from '../server/views';
import { Card } from './Card';
import { wantedCells } from './close';
import { Ball, BingoButton } from './ControllerParts';
import type { Send } from './ControllerParts';
import { isAnyOf } from '../server/patterns';
import type { Pattern } from '../server/types';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

/**
 * The pattern outlined on a card while the cards are dealt: the pattern's own cells — except for
 * an "any of" pattern (any line, any corner block), where no single set IS the pattern and an
 * outline would say one corner is the target when any corner wins.
 */
export function introOutline(view: { pattern: Pattern; patternCells: number[] }): number[] {
  return isAnyOf(view.pattern) ? [] : view.patternCells;
}

export interface LayoutProps {
  view: BingoControllerView;
  cards: number[][];
  meId: string;
  send: Send;
  /** Phone-only FREE daubs, per card index. */
  freeDaubed: number[];
  onTapFree: (card: number) => void;
  /** A square tapped: the server toggles it; the phone thumps and sounds the dauber at once. */
  onDaub: (card: number, index: number) => void;
  /** intro: fresh cards, no daubs, the pattern outlined, nothing tappable. */
  intro: boolean;
  disabled: boolean;
  /** The TV has reached its verdict: my checked card may show its colours. */
  verdictShown: boolean;
}

/** One card, as it plays: my own failed claim shows as the room sees it until play resumes. */
function PlayCard({
  p,
  c,
  size,
  label,
}: {
  p: LayoutProps;
  c: number;
  size: 'phone' | 'compact';
  label?: string;
}): JSX.Element {
  const { view } = p;
  const claim = view.claim;
  const mine = view.phaseId === 'check' && claim?.playerId === p.meId && claim.cardIndex === c;
  // The card rises in only when it comes BACK after a wipe (loop 302): rising on its first mount
  // left the round's first frame with an empty slot while the TV's ball was already up.
  const [wasWiped, setWasWiped] = useState(false);
  if (view.waitingForCall && !wasWiped) setWasWiped(true);
  const rounds = view.round;
  const [seenRound, setSeenRound] = useState(rounds);
  if (seenRound !== rounds) {
    setSeenRound(rounds);
    setWasWiped(false);
  }
  // My claim is on the TV (a check or a win still being revealed): the card flashes once as it goes.
  const sent =
    (view.phaseId === 'check' || view.phaseId === 'bingo') &&
    claim?.playerId === p.meId &&
    claim.cardIndex === c &&
    !p.verdictShown;
  const won = view.won.includes(c);
  // One to go (loop 420): the squares that would win breathe on a live card, from its own daubs.
  const wanted =
    !p.intro && !won && (view.phaseId === 'play' || view.phaseId === 'check')
      ? wantedCells(view.pattern, view.daubs[c] ?? [])
      : [];
  const heading =
    label === undefined ? null : (
      <p className={`${styles.cardLabel} ${won ? styles.cardLabelWon : ''}`}>
        {won ? 'BINGO ✓' : label}
      </p>
    );
  if (mine && claim && p.verdictShown)
    return (
      <div className={`${styles.slot} ${styles.wiped}`}>
        {heading}
        <Card
          numbers={claim.card}
          daubs={claim.daubs}
          green={claim.green}
          red={claim.red}
          missing={claim.missing}
          verdict
          disabled
          size={size}
        />
      </div>
    );
  return (
    <div
      key={view.waitingForCall ? 'wiped' : 'card'}
      className={`${styles.slot} ${wasWiped && !view.waitingForCall ? 'pb-enter' : ''} ${won ? styles.won : ''}`}
    >
      {heading}
      <Card
        numbers={p.cards[c] ?? []}
        daubs={p.intro ? [] : (view.daubs[c] ?? [])}
        pattern={p.intro ? introOutline(view) : []}
        wanted={wanted}
        freeDaubed={won || p.freeDaubed.includes(c)}
        onTapFree={() => p.onTapFree(c)}
        onTap={(index) => p.onDaub(c, index)}
        disabled={p.disabled}
        size={size}
        sent={sent}
      />
    </div>
  );
}

/** Every card as a small bordered picture; `marked` is the one up (or picked at the intro). */
export function Thumbnails({
  view,
  cards,
  marked,
  markLabel,
  onPick,
  spent = [],
}: {
  view: BingoControllerView;
  cards: number[][];
  marked: number;
  markLabel: string;
  onPick: (card: number) => void;
  /** intro: cards already swapped (a "swapped" tag instead of a border). */
  spent?: number[];
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <div
      className={styles.thumbs}
      style={{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, var(--pb-thumb)))` }}
    >
      {cards.map((numbers, c) => {
        const won = view.phaseId !== 'intro' && view.won.includes(c);
        const cur = c === marked;
        const tag = won ? 'BINGO ✓' : cur ? markLabel : spent.includes(c) ? L('swapped') : null;
        const label = [L('Card {n}', { n: c + 1 }), cur ? markLabel : '', won ? L('won') : ''];
        return (
          <button
            type="button"
            key={c}
            className={`${styles.thumb} ${cur ? styles.thumbCur : ''} ${won ? styles.thumbWon : ''}`}
            style={{ ['--i' as string]: c }}
            disabled={cur}
            onClick={() => onPick(c)}
            aria-label={label.filter(Boolean).join(', ')}
            data-tag={tag ?? undefined}
          >
            <Card
              numbers={numbers}
              daubs={view.daubs[c] ?? []}
              freeDaubed
              disabled
              size="compact"
            />
          </button>
        );
      })}
    </div>
  );
}

/** Focus: the card that is up, big, with the thumbnails under it. One BINGO! in the footer. */
export function FocusLayout(
  p: LayoutProps & { up: number; onUp: (c: number) => void },
): JSX.Element {
  const many = p.cards.length > 1;
  // Bringing a card up (loop 244): the big card rises out of the thumbnail it came from — keyed
  // on the card so it remounts, `--from` the picked thumbnail's column (-1..1 across the row) so
  // the rise starts under that thumbnail and swings into the middle.
  const n = p.cards.length;
  const from = n > 1 ? (p.up - (n - 1) / 2) / ((n - 1) / 2) : 0;
  // Only a pick rises (loop 296): the layout's first card — the intro's card carrying into play,
  // a reconnect — is already where it belongs, and a rise there collided with the phase swap.
  const [picked, setPicked] = useState(false);
  const [seen, setSeen] = useState(p.up);
  const L = useT(STRINGS);
  if (seen !== p.up) {
    setSeen(p.up);
    setPicked(true);
  }
  return (
    <div className={`${styles.focus} ${many ? styles.focusMany : ''}`}>
      <div
        key={p.up}
        className={`${styles.focusMain} ${many && picked ? styles.focusRise : ''}`}
        style={{ ['--from' as string]: from }}
      >
        <PlayCard p={p} c={p.up} size="phone" />
      </div>
      {many ? (
        <Thumbnails
          view={p.view}
          cards={p.cards}
          marked={p.up}
          markLabel={L('up')}
          onPick={p.onUp}
        />
      ) : null}
    </div>
  );
}

/** The spare slot in a three-card grid: the call, the way the TV shows it. */
function MiniCall({ view }: { view: BingoControllerView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <div className={`${styles.slot} ${styles.miniCall}`} role="status">
      {view.current ? <Ball call={view.current} size="lg" /> : <span>{L('first number…')}</span>}
      <span>
        {view.previous ? (
          <>
            {L('before that')} <Ball call={view.previous} size="sm" />
          </>
        ) : (
          '—'
        )}
      </span>
      <span>
        {L('call {n}', { n: view.callIndex })} · {L.sent(view.patternLabel).toLowerCase()}
      </span>
    </div>
  );
}

/** Grid, Strip, Stack, Side by side and the tablet row: every card with its own BINGO!. */
export function AllCardsLayout(
  p: LayoutProps & { kind: 'grid' | 'strip' | 'stack' | 'side' | 'tablet' },
): JSX.Element {
  const n = p.cards.length;
  const L = useT(STRINGS);
  const size = p.kind === 'tablet' ? 'phone' : 'compact';
  const kindClass = styles[`layout_${p.kind}`] ?? '';
  return (
    <div className={`${styles.layout} ${kindClass}`} style={{ ['--n' as string]: n }}>
      {p.cards.map((_, c) => (
        <div key={c} className={styles.slotWrap}>
          <PlayCard
            p={p}
            c={c}
            size={size}
            label={
              p.kind === 'stack' || p.kind === 'side' ? undefined : L('Card {n}', { n: c + 1 })
            }
          />
          {p.intro ? null : (
            <BingoButton
              view={p.view}
              card={c}
              send={p.send}
              meId={p.meId}
              small
              verdictShown={p.verdictShown}
            />
          )}
        </div>
      ))}
      {p.kind === 'grid' && n === 3 && !p.intro ? <MiniCall view={p.view} /> : null}
    </div>
  );
}

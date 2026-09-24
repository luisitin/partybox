// The auction table: the lot's kicker on top, the card on the left, the phase's panel on the right.
// Every lot phase renders this same frame, so across lot → bid → sold → flip the card holds its
// place (the phases cut into each other: `quickInto`) and only the panel changes.
import type { JSX } from 'react';
import { useEffect } from 'react';
import { Stage, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { BlindAuctionTvView } from '../server/views';
import { COIN, ICON, hintText, kickerWord, toneOf } from './copy';
import { HintChips, LotCard } from './LotCard';
import type { CardFace } from './LotCard';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { TvFlip } from './TvFlip';
import { TvLadder } from './TvLadder';
import { TvLive } from './TvLive';
import { useLine, useReading } from './useVoice';

type View = PushedView<BlindAuctionTvView>;

export function faceOf(L: ReturnType<typeof useT>, view: BlindAuctionTvView): CardFace | null {
  const o = view.outcome;
  if (!o) return null;
  const e = view.effect;
  const kind = e && e.kind !== 'none' ? e.kind : o.type;
  const big =
    e && e.kind !== 'none' && e.kind !== 'dud' && e.kind !== 'swap'
      ? `${e.kind === 'lose' ? '−' : '+'}${e.amount}`
      : hintText(L, o);
  return { icon: ICON[o.type], kicker: kickerWord(L, kind), big, tone: toneOf(o.type) };
}

function Kicker({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const lot = view.lot;
  if (lot?.grand)
    return (
      <p className={`${styles.kicker} ${styles.grandKicker}`}>
        <span aria-hidden>★</span> {L('THE GRAND LOT')} <span aria-hidden>★</span>
      </p>
    );
  return (
    <p className={styles.kicker}>
      {L('Lot {n} of {total}', { n: lot?.n ?? 1, total: lot?.of ?? 1 })}
      {view.live ? <span className={styles.liveTag}>● {L('LIVE')}</span> : null}
    </p>
  );
}

function LotPanel({ view }: { view: View }): JSX.Element | null {
  const lot = view.lot;
  const play = useSound();
  // The card is dealt on mount: its pluck (the phase is mapped to silence so a re-timed reading
  // never plucks twice).
  useEffect(() => play('card'), [play]);
  useReading(view.voice);
  if (!lot) return null;
  return (
    <div className={styles.panel}>
      <h1 className={styles.plate}>{lot.name}</h1>
      <p className={styles.flavour}>{lot.flavour}</p>
      <HintChips hints={lot.hints} className={styles.panelChips} />
    </div>
  );
}

function BidPanel({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const lot = view.lot;
  const play = useSound();
  // "Pick up your phone", then the auctioneer's call over it.
  useEffect(() => play('phase'), [play]);
  useLine(view.clips.bids, true, 350);
  if (!lot) return null;
  return (
    <div className={styles.panel}>
      <h1 className={styles.call}>{L('Place your secret bids!')}</h1>
      <p className={styles.plateSmall}>
        <span aria-hidden>{lot.icon}</span> {lot.name}
      </p>
      <HintChips hints={lot.hints} className={styles.panelChips} />
      <p className={styles.count} aria-live="polite">
        <span className={styles.pips} aria-hidden>
          {Array.from({ length: view.bidders }, (_, i) => (
            <span key={i} className={`${styles.pip} ${i < view.bidsIn ? styles.pipIn : ''}`}>
              {i < view.bidsIn ? COIN : '·'}
            </span>
          ))}
        </span>
        {L('{n} of {total} bids in', { n: view.bidsIn, total: view.bidders })}
      </p>
    </div>
  );
}

export function TvTable({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const lot = view.lot;
  const phase = view.phaseId;
  const flipped = phase === 'flip';
  const soldStamp = phase === 'sold' && view.step === 1;
  const sale = view.sale;
  const face = flipped ? faceOf(L, view) : null;
  return (
    <Stage className={styles.table}>
      <Kicker view={view} />
      <div className={styles.row}>
        <div
          className={`${styles.cardCol} ${phase === 'flip' && view.effect?.kind === 'lose' ? styles.shake : ''}`}
        >
          <LotCard
            icon={lot?.icon ?? '📦'}
            grand={lot?.grand ?? false}
            face={face}
            flipped={flipped}
            deal={phase === 'lot'}
            stamp={
              soldStamp ? (
                <span className={`${styles.stampMark} ${sale?.winner ? '' : styles.stampNone}`}>
                  {sale?.winner ? `${L('SOLD')} 🔨` : L('NO TAKERS')}
                </span>
              ) : null
            }
          />
        </div>
        {phase === 'lot' ? <LotPanel view={view} /> : null}
        {phase === 'bid' ? <BidPanel view={view} /> : null}
        {phase === 'live' ? <TvLive view={view} /> : null}
        {phase === 'sold' ? <TvLadder view={view} /> : null}
        {phase === 'flip' ? <TvFlip view={view} /> : null}
      </div>
    </Stage>
  );
}

// `sold` on the TV (SPEC §8.5): sealed bids rise from lowest to highest as a ladder of faces and
// amounts, 0.4 s apart (the same beats the server waits: timing.ts), a tie line if the top was
// tied, then — when the server's step 1 lands — the SOLD stamp and the hammer. Live: the hammer
// falls on the final bid. "No takers!" when nobody bid.
import { useEffect, useRef } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, useSequence, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import { LADDER_LEAD_MS, ladderStepMs } from '../server/timing';
import type { BlindAuctionTvView } from '../server/views';
import { COIN } from './copy';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { useLine, useReading } from './useVoice';

const MAX_RUNGS = 8;

export function TvLadder({ view }: { view: PushedView<BlindAuctionTvView> }): JSX.Element | null {
  const L = useT(STRINGS);
  const play = useSound();
  const sale = view.sale;
  const all = sale?.ladder ?? [];
  // The top eight: a 16-player ladder keeps its rise without running off the stage.
  // A full room's strip leaves less stage: five rungs then.
  const rungs = all.slice(-(view.players.length > 10 ? 5 : MAX_RUNGS));
  const hidden = all.length - rungs.length;
  const step = ladderStepMs(all.length);
  const beats = view.live ? [0] : [0, ...rungs.map((_, i) => LADDER_LEAD_MS + (hidden + i) * step)];
  const seq = useSequence(beats);
  const shown = view.live ? rungs.length : Math.max(0, seq);
  const stamped = view.step === 1;
  const winner = sale?.winner ? view.players.find((p) => p.id === sale.winner) : undefined;
  useLine(view.clips.closed, !view.live);
  // The stamp: the hammer, then the price reading — or the fixed "Sold!" / "No takers!".
  useReading(stamped ? view.voice : null);
  useLine(view.clips.sold, stamped && Boolean(winner) && !view.voice, 120);
  useLine(view.clips.none, stamped && !winner, 120);
  const hit = useRef(false);
  useEffect(() => {
    if (!stamped || hit.current) return;
    hit.current = true;
    play('lock', { gain: winner ? 1 : 0.5 });
  }, [stamped, winner, play]);
  if (!sale) return null;
  const compact = rungs.length > 5;
  return (
    <div className={`${styles.panel} ${styles.soldPanel}`}>
      <p className={styles.soldHead}>
        {view.live ? L('Going… going… gone!') : L('Bidding is closed.')}
      </p>
      {rungs.length === 0 ? (
        stamped ? (
          <p className={styles.call}>{L('No takers!')}</p>
        ) : null
      ) : (
        <ol className={`${styles.ladder} ${compact ? styles.ladderCompact : ''}`}>
          {rungs.slice(0, shown).map((r, i) => {
            const p = view.players.find((x) => x.id === r.id);
            const top = r.id === sale.winner;
            return (
              <li
                key={r.id}
                className={`${styles.rung} ${top && stamped ? styles.rungWon : ''}`}
                style={{ '--ba-i': i } as CSSProperties}
              >
                {p ? <Avatar avatarId={p.avatarId} size={compact ? 40 : 52} /> : null}
                <span className={styles.rungName}>{p?.name ?? '?'}</span>
                <span className={styles.rungAmount}>
                  {COIN} {r.amount}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {(hidden > 0 || shown >= rungs.length) && (sale.passes > 0 || hidden > 0) ? (
        <p className={styles.passes}>
          {[
            hidden > 0 ? L('{n} lower bids', { n: hidden }) : '',
            sale.passes > 0 ? L('{n} passed', { n: sale.passes }) : '',
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      ) : null}
      {sale.tie && shown >= rungs.length ? (
        <p className={styles.tieLine}>{L('Tie: fewer coins wins')}</p>
      ) : null}
      {stamped && winner ? (
        <p className={styles.soldLine}>
          {L('SOLD to {name} for {coin} {n}!', { name: winner.name, coin: COIN, n: sale.price })}
        </p>
      ) : null}
    </div>
  );
}

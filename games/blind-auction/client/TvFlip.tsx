// `flip` on the TV (SPEC §8.5): the card turns (TvTable), and as it lands the outcome's cue and
// fixed line play and the headline pops: "+300!", "TRAP! −60", "HEIST! Ana steals 45 from Ben"
// with coins flying between their faces, "SWAP! Ana ⇄ Cy" with the totals trading places. The
// winner's coins count to their new value. An unsold lot flips too: "Nobody bought it."
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Avatar, Confetti, useCountUp, useSequence, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView, SoundCue, ViewPlayer } from '@partybox/game-sdk/ui';
import { FLIP_LINE_AT_MS } from '../server/timing';
import type { Effect, EffectKind } from '../server/types';
import type { BlindAuctionTvView } from '../server/views';
import { COIN, ICON, effectHeadline, effectKicker, hintText, toneOf } from './copy';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { useLine, useReading } from './useVoice';

const COUNT_AT_MS = 900;
const COUNT_MS = 1200;

const CUE: Record<EffectKind, SoundCue> = {
  gain: 'jackpot',
  double: 'jackpot',
  lose: 'bust',
  steal: 'sweep',
  swap: 'sweep',
  refund: 'tie',
  dud: 'tie',
  none: 'reveal',
};

/** The winner's coins after the flip, from the effect alone. */
export function afterOf(e: Effect): { winner: number; other: number } {
  const { winner, other } = e.before;
  switch (e.kind) {
    case 'gain':
    case 'double':
    case 'refund':
      return { winner: winner + e.amount, other };
    case 'lose':
      return { winner: winner - e.amount, other };
    case 'steal':
      return { winner: winner + e.amount, other: other - e.amount };
    case 'swap':
      return { winner: other, other: winner };
    default:
      return { winner, other };
  }
}

function Purse({
  p,
  from,
  to,
  className,
}: {
  p: ViewPlayer;
  from: number;
  to: number;
  className?: string;
}): JSX.Element {
  const shown = useCountUp(to, from, COUNT_MS, COUNT_AT_MS);
  return (
    <span className={`${styles.purse} ${className ?? ''}`}>
      <span className={styles.purseFace}>
        <Avatar avatarId={p.avatarId} size="100%" />
      </span>
      <span className={styles.purseName}>{p.name}</span>
      <span className={styles.purseCoins}>
        {COIN} {shown}
      </span>
    </span>
  );
}

export function TvFlip({ view }: { view: PushedView<BlindAuctionTvView> }): JSX.Element | null {
  const L = useT(STRINGS);
  const play = useSound();
  const beat = useSequence([0, FLIP_LINE_AT_MS]);
  const e = view.effect;
  const o = view.outcome;
  const winner = view.players.find((p) => p.id === view.sale?.winner);
  const other = view.players.find((p) => p.id === e?.other);
  const landed = beat >= 1;
  const cued = useRef(false);
  useEffect(() => {
    if (!landed || !e || cued.current) return;
    cued.current = true;
    play(CUE[e.kind]);
  }, [landed, e, play]);
  useLine(Object.values(view.clips)[0], landed);
  useReading(view.voice);
  if (!e || !o) return null;
  const after = afterOf(e);
  const tone = toneOf(e.kind === 'none' ? o.type : e.kind);
  const purses =
    winner && e.kind !== 'none' ? (
      <div className={styles.purses}>
        {landed && other && (e.kind === 'steal' || e.kind === 'swap') ? (
          <>
            <Purse p={other} from={e.before.other} to={after.other} className={styles.purseOther} />
            <span
              className={`${styles.transfer} ${e.kind === 'swap' ? styles.swapArrows : ''}`}
              aria-hidden
            >
              {e.kind === 'swap' ? (
                '⇄'
              ) : (
                <>
                  <span className={styles.flyCoin}>{COIN}</span>
                  <span className={styles.flyCoin}>{COIN}</span>
                  <span className={styles.flyCoin}>{COIN}</span>
                  <span className={styles.arrow}>→</span>
                </>
              )}
            </span>
          </>
        ) : null}
        <Purse p={winner} from={e.before.winner} to={after.winner} className={styles.purseWinner} />
      </div>
    ) : null;
  return (
    <div className={`${styles.panel} ${styles.flipPanel}`}>
      {landed && (e.kind === 'gain' || e.kind === 'double') ? <Confetti pieces={36} /> : null}
      {/* From the first frame: who paid what, while the card turns. */}
      <p className={styles.flipSold}>
        {winner
          ? L('{name} paid {coin} {n} for it…', {
              name: winner.name,
              coin: COIN,
              n: view.sale?.price ?? 0,
            })
          : L('Nobody bid on it. What did the room miss?')}
      </p>
      {/* The outcome's words land as the card finishes turning; their room is held from the start. */}
      <div className={`${styles.story} ${styles[tone]}`}>
        {landed ? (
          <>
            <p className={styles.flipKicker}>{effectKicker(L, e.kind)}</p>
            <h1 className={styles.flipHeadline}>
              {effectHeadline(L, e, winner?.name ?? '?', other?.name ?? '?')}
            </h1>
            {e.kind === 'none' ? (
              <p className={styles.itWas}>
                {L('It was: {what}', { what: `${ICON[o.type]} ${hintText(L, o)}` })}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
      {purses}
    </div>
  );
}

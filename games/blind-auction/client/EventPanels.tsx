// The live events' side panels on the TV (doors, hot potato, tug of war, the shell game), next to
// the stage in TvTable.
import { useEffect } from 'react';
import type { JSX } from 'react';
import { useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import { SHELL_SPEED } from '../server/timing';
import type { BlindAuctionTvView } from '../server/views';
import { COIN } from './copy';
import liveStyles from './live.module.css';
import { passWords } from './Potato';
import { taunt } from './Shells';
import { STRINGS } from './strings';
import styles from './tv.module.css';

type View = PushedView<BlindAuctionTvView>;

export function SwapPanel({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const play = useSound();
  useEffect(() => play('phase'), [play]);
  if (!view.box) return null;
  return (
    <div className={styles.panel}>
      <h1 className={styles.call}>{L('Stay or switch?')}</h1>
      <p className={styles.flavour}>
        {L('A goat behind door {n}! Keep your door, or switch to the other one.', {
          n: (view.opened ?? 0) + 1,
        })}
      </p>
      <p className={styles.count} aria-live="polite">
        {L('{n} of {total} have chosen', { n: view.swapsIn, total: view.swappers })}
      </p>
    </div>
  );
}

export function PotatoPanel({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const name = view.players.find((p) => p.id === view.potato?.holder)?.name ?? '?';
  if (!view.box) return null;
  return (
    <div className={styles.panel}>
      <h1 className={styles.call}>{L('Pass it on before it pops!')}</h1>
      <p className={styles.plate}>{L('{name} has the potato', { name })}</p>
      <p className={styles.count} aria-live="polite">
        {passWords(L, view.potato?.passes ?? 0)}
      </p>
    </div>
  );
}

export function TugPanel({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const play = useSound();
  useEffect(() => play('phase'), [play]);
  if (!view.box) return null;
  return (
    <div className={styles.panel}>
      <h1 className={styles.call}>{L('PULL! Tap your phone as fast as you can!')}</h1>
      <p className={styles.flavour}>
        {L('Every tap counts as much as your share of your team’s bet.')}
      </p>
    </div>
  );
}

export function ShufflePanel({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const sh = view.shells;
  if (!sh) return null;
  return (
    <div className={styles.panel}>
      <h1 className={styles.call}>{L('Watch the ball!')}</h1>
      <p className={styles.plate}>
        {L('The pot: {coin} {n}', { coin: COIN, n: sh.pot })}{' '}
        {sh.tier > 0 ? (
          <span className={liveStyles.tierBadge}>
            {L('×{n} speed', { n: SHELL_SPEED[sh.tier] ?? 1 })}
          </span>
        ) : null}
      </p>
      <p className={styles.flavour}>{taunt(L, sh.tier, view.box?.n ?? 0)}</p>
    </div>
  );
}

export function CupsPanel({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const play = useSound();
  useEffect(() => play('phase'), [play]);
  const sh = view.shells;
  if (!sh) return null;
  return (
    <div className={styles.panel}>
      <h1 className={styles.call}>{L('Which cup? Pick on your phone!')}</h1>
      <p className={styles.flavour}>
        {L('Right calls split the whole pot by their stakes. All right or all wrong: stakes back.')}
      </p>
      <p className={styles.count} aria-live="polite">
        {L('{n} of {total} have chosen', { n: sh.picked, total: sh.pickers })}
      </p>
    </div>
  );
}

export function HandsPanel({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const play = useSound();
  useEffect(() => play('phase'), [play]);
  const bj = view.blackjack;
  if (!bj) return null;
  const n = Object.keys(bj.hands).length;
  return (
    <div className={styles.panel}>
      <h1 className={styles.call}>{L('Hit or stand on your phone!')}</h1>
      <p className={styles.flavour}>
        {L(
          'Beat the dealer without going over 21. Win ×2, blackjack ×2.5, a tie gives the stake back.',
        )}
      </p>
      <p className={styles.count} aria-live="polite">
        {L('{n} of {total} have chosen', { n: bj.stood.length, total: n })}
      </p>
    </div>
  );
}

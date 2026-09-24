// The TV's boards (§8.1, plain for M1): the Liberal track (5 slots), the Fascist track (6 slots,
// each with its power), the HITLER ZONE line after Fascist slot 3, and the middle band — the
// election tracker, deck and discard counts, the veto and the next Fascist slot.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { ShTvView } from '../server/views';
import { CardBack, PolicyCard } from './Card';
import { powerName } from './labels';
import { STRINGS } from './strings';
import styles from './tv.module.css';

export function TvBoard({ view }: { view: ShTvView }): JSX.Element {
  const L = useT(STRINGS);
  const zone = view.board.F >= 3;
  const next = view.board.F < 6 ? (view.slots[view.board.F] ?? null) : null;
  return (
    <section className={styles.boards} aria-label={L('The board')}>
      <div className={styles.track}>
        <span className={styles.trackTitle}>{L('Liberal policies')}</span>
        <div className={styles.slots}>
          {[0, 1, 2, 3, 4].map((i) =>
            i < view.board.L ? (
              <PolicyCard key={i} party="L" />
            ) : (
              <CardBack key={i} label={i === 4 ? L('Victory') : ''} />
            ),
          )}
        </div>
      </div>
      <div className={styles.track}>
        <span className={styles.trackTitle}>{L('Fascist policies')}</span>
        <div className={styles.slots}>
          {view.slots.map((power, i) => (
            <div key={i} className={styles.slot}>
              {i === 3 ? (
                <span className={styles.zone} data-on={zone || undefined}>
                  {L('Hitler zone →')}
                </span>
              ) : null}
              {i < view.board.F ? (
                <PolicyCard party="F" />
              ) : (
                <CardBack label={i === 5 ? L('Victory') : power ? powerName(L, power) : ''} />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.band}>
        <span>
          {L('Election tracker')}{' '}
          <span className={styles.rivets} aria-label={L('{n} of 3', { n: view.tracker })}>
            {[0, 1, 2].map((i) => (i < view.tracker ? '●' : '○')).join(' ')}
          </span>
        </span>
        <span>{L('Deck {n}', { n: view.deckCount })}</span>
        <span>{L('Discards {n}', { n: view.discardCount })}</span>
        {view.vetoUnlocked ? <span>{L('Veto unlocked')}</span> : null}
        {next ? (
          <span>{L('Next Fascist slot: {power}', { power: powerName(L, next) })}</span>
        ) : null}
      </div>
    </section>
  );
}

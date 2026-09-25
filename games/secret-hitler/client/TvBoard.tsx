// The TV's boards (SPEC §8.1): the Liberal track (5 slots) above the Fascist track (6 slots, each
// with its power icon and label), the brass HITLER ZONE line after Fascist slot 3 that glows once 3
// Fascist policies are law, VICTORY on the last slots, and the middle band: the election tracker's
// rivets (the fourth reads CHAOS), the deck and discard piles, the veto and the next Fascist slot.
// The newest decree slams into its slot during its reveal.
import type { CSSProperties, JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { Party } from '../server/types';
import type { ShTvView } from '../server/views';
import { PowerIcon, VetoIcon } from './icons';
import { CardBack, PolicyCard } from './Card';
import { powerName } from './labels';
import { STRINGS } from './strings';
import styles from './board.module.css';

function Track({ view, party }: { view: ShTvView; party: Party }): JSX.Element {
  const L = useT(STRINGS);
  const count = view.board[party];
  const n = party === 'L' ? 5 : 6;
  const landing =
    (view.phaseId === 'enactReveal' && view.round.enacted === party) ||
    (view.phaseId === 'chaos' && view.round.chaosCard === party);
  const zone = view.board.F >= 3;
  return (
    <div className={styles.track} data-party={party}>
      <span className={styles.trackTitle}>
        {party === 'L' ? L('Liberal policies') : L('Fascist policies')}
      </span>
      <div className={styles.slots}>
        {Array.from({ length: n }, (_, i) => {
          const power = party === 'F' ? (view.slots[i] ?? null) : null;
          const last = i === n - 1;
          return (
            <div
              key={i}
              className={styles.slot}
              data-zone={(party === 'F' && i === 3) || undefined}
            >
              {party === 'F' && i === 3 ? (
                <span className={styles.zone} data-on={zone || undefined}>
                  {L('Hitler zone')}
                </span>
              ) : null}
              <span className={styles.cardWell}>
                {i < count ? (
                  <span
                    className={styles.enacted}
                    data-landing={(landing && i === count - 1) || undefined}
                  >
                    <PolicyCard party={party} />
                  </span>
                ) : (
                  <CardBack slot />
                )}
                {i >= count && (power || last) ? (
                  <span className={styles.slotMark} aria-hidden="true">
                    {last ? '★' : power ? <PowerIcon kind={power} size={46} /> : null}
                  </span>
                ) : null}
              </span>
              <span className={styles.slotLabel}>
                {last ? L('Victory') : power ? powerName(L, power) : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Tracker({ n }: { n: number }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <div className={styles.tracker} role="img" aria-label={L('Election tracker: {n} of 3', { n })}>
      <span className={styles.bandLabel}>{L('Election tracker')}</span>
      <span className={styles.gauge}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={styles.rivet} data-on={i < n || undefined}>
            {i < n ? '●' : '○'}
          </span>
        ))}
        <span className={styles.chaosMark} data-on={n >= 3 || undefined}>
          {L('Chaos')}
        </span>
      </span>
    </div>
  );
}

function Pile({ count, label }: { count: number; label: string }): JSX.Element {
  const style = { '--depth': Math.min(4, Math.ceil(count / 4)) } as CSSProperties;
  return (
    <span className={styles.pile} style={style}>
      <span className={styles.pileStack} data-empty={count === 0 || undefined}>
        {count > 0 ? <CardBack size="sm" /> : null}
      </span>
      <span className={styles.pileText}>
        <b>{count}</b> {label}
      </span>
    </span>
  );
}

export function TvBoard({ view }: { view: ShTvView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <section className={styles.boards} aria-label={L('The board')}>
      <Track view={view} party="L" />
      <Track view={view} party="F" />
    </section>
  );
}

/** The middle band (§8.1), stacked beside the boards: tracker, piles, veto, next slot. */
export function TvBand({ view }: { view: ShTvView }): JSX.Element {
  const L = useT(STRINGS);
  const next = view.board.F < 6 ? (view.slots[view.board.F] ?? null) : null;
  return (
    <section className={styles.boards}>
      <div className={styles.band}>
        <Tracker n={view.tracker} />
        <Pile count={view.deckCount} label={L('in the deck')} />
        <Pile count={view.discardCount} label={L('discarded')} />
        {view.vetoUnlocked ? (
          <span className={styles.chip}>
            <VetoIcon size={30} /> {L('Veto unlocked')}
          </span>
        ) : null}
        {next ? (
          <span className={styles.chip}>
            <PowerIcon kind={next} size={30} />
            {L('Next Fascist slot: {power}', { power: powerName(L, next) })}
          </span>
        ) : null}
      </div>
    </section>
  );
}

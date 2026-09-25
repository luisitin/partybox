// The Parliament Record on the TV (SPEC §10.3): one row per government attempt, newest on top,
// in typewriter type — who governed, the tally, the outcome, the policy (a small card with its
// seal, never colour alone), a veto or a chaos card. The newest row pulses when it is new.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { ShTvView } from '../server/views';
import { PolicyCard } from './Card';
import { nameIn } from './labels';
import { STRINGS } from './strings';
import styles from './record.module.css';

const FRESH = new Set(['voteReveal', 'enactReveal', 'claims', 'chaos']);

export function TvRecord({ view, rows = 5 }: { view: ShTvView; rows?: number }): JSX.Element {
  const L = useT(STRINGS);
  const name = (i: number): string => nameIn(view.players, view.seats[i]?.id ?? null);
  const list = [...view.history].reverse().slice(0, rows);
  return (
    <section className={styles.record} aria-label={L('Parliament Record')}>
      <header className={styles.head}>{L('Parliament Record')}</header>
      {list.length === 0 ? <p className={styles.empty}>{L('No governments yet.')}</p> : null}
      <ol className={styles.rows}>
        {list.map((h, i) => (
          <li
            key={h.n}
            className={styles.row}
            data-fresh={(i === 0 && FRESH.has(view.phaseId) && view.round.n === h.n) || undefined}
          >
            <span className={styles.n}>#{h.n}</span>
            <span className={styles.gov}>
              {name(h.pres)} → {name(h.chan)}
            </span>
            <span className={styles.line}>
              <span className={styles.tally}>
                {L('{ja} JA · {nein} NEIN', { ja: h.ja, nein: h.nein })}
              </span>
              <span className={styles.verdict} data-ok={h.elected || undefined}>
                {h.elected ? L('Elected') : L('Rejected')}
              </span>
              {h.enacted ? <PolicyCard party={h.enacted} size="sm" /> : null}
              {h.veto ? <span className={styles.flag}>{L('Veto')}</span> : null}
              {h.chaos ? (
                <span className={styles.flag}>
                  {L('Chaos')} <PolicyCard party={h.chaos} size="sm" />
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

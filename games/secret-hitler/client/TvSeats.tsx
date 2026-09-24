// The TV's seat row (§8.1, plain for M1): every seat in seat order with an arrow for the direction
// the presidency moves (D9), its plate, status tags, the vote placard at the reveal, the role at the
// end, and its own "reconnecting…" badge (the platform strip is hidden in this game).
import type { JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { ShTvView } from '../server/views';
import { roleName, tagName } from './labels';
import { STRINGS } from './strings';
import styles from './tv.module.css';

export function TvSeats({ view }: { view: ShTvView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <ol className={styles.seats} aria-label={L('Seat order')}>
      {view.seats.map((seat, i) => {
        const p = view.players.find((x) => x.id === seat.id);
        const gone = seat.tags.includes('executed') || seat.tags.includes('exiled');
        const tags = seat.tags.map((t) => tagName(L, t)).filter((t): t is string => t !== null);
        return (
          <li key={seat.id} className={styles.seat} data-gone={gone || undefined}>
            {seat.vote ? (
              <span className={styles.placard} data-vote={seat.vote}>
                {seat.vote === 'ja' ? L('✓ JA!') : L('✗ NEIN!')}
              </span>
            ) : null}
            {seat.tags.includes('voted') ? (
              <span className={styles.voted}>{L('✓ voted')}</span>
            ) : null}
            <Avatar avatarId={p?.avatarId ?? ''} size={88} dim={gone || p?.connected === false} />
            <span className={styles.seatName}>{p?.name ?? '?'}</span>
            {seat.plate ? (
              <span className={styles.plate} data-plate={seat.plate}>
                {seat.plate === 'president'
                  ? L('President')
                  : seat.plate === 'chancellor'
                    ? L('Chancellor')
                    : L('Nominee')}
              </span>
            ) : null}
            {seat.tags.includes('next') ? <span className={styles.next}>{L('Next')}</span> : null}
            {tags.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
            {p?.connected === false && !gone ? (
              <span className={styles.tag}>{L('reconnecting…')}</span>
            ) : null}
            {seat.role ? <span className={styles.role}>{roleName(L, seat.role)}</span> : null}
            {i < view.seats.length - 1 ? (
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

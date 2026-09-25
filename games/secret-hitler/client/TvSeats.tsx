// The TV's seat row (SPEC §8.1): every seat in seat order with an arrow for the direction the
// presidency moves (D9), brass plates, status tags, a face-down placard once a vote is cast, the
// placards flipping in a wave at the reveal (40 ms apart, §7.8), a spotlight on whoever the room
// should watch, and every dossier turning over in seat order at the end. It also shows its own
// "reconnecting…" badge (the platform strip is hidden in this game).
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { ShTvView } from '../server/views';
import { MaskEmblem, PartyEmblem } from './art';
import { PlateIcon } from './icons';
import { roleName, tagName } from './labels';
import { STRINGS } from './strings';
import styles from './seats.module.css';

/** A placard dealt face-down, then turned over (the reveal's wave: each 40 ms after the last). */
function Placard({
  vote,
  delayMs,
  label,
  back,
  settled,
}: {
  vote: 'ja' | 'nein';
  delayMs: number;
  label: string;
  /** The back's word ("Voted"): a sealed ballot, the same for Ja and Nein. */
  back: string;
  /** Already revealed (the phase after the reveal): face-up at once, no second wave. */
  settled: boolean;
}): JSX.Element {
  const [up, setUp] = useState(settled);
  useEffect(() => {
    const t = setTimeout(() => setUp(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  return (
    <span
      className={styles.placard}
      data-vote={vote}
      data-up={up || undefined}
      data-settled={settled || undefined}
    >
      <span className={styles.placardTurn}>
        <span className={styles.placardBack}>{back}</span>
        <span className={styles.placardFace}>{label}</span>
      </span>
    </span>
  );
}

/** Who the spotlight finds in this phase. */
function spotOf(view: ShTvView): string | null {
  const r = view.round;
  switch (view.phaseId) {
    case 'nominate':
    case 'presDraw':
    case 'vetoAsk':
    case 'power':
      return r.president;
    case 'chanEnact':
    case 'hitlerCheck':
      return r.nominee;
    case 'powerReveal':
      return r.power?.target ?? null;
    default:
      return null;
  }
}

export function TvSeats({ view }: { view: ShTvView }): JSX.Element {
  const L = useT(STRINGS);
  const phase = view.phaseId;
  const over = phase === 'gameOver' || phase === 'done';
  const spot = spotOf(view);
  return (
    <ol className={styles.seats} aria-label={L('Seat order')} data-phase={phase}>
      {view.seats.map((seat, i) => {
        const p = view.players.find((x) => x.id === seat.id);
        const gone = seat.tags.includes('executed') || seat.tags.includes('exiled');
        const plate = over ? undefined : seat.plate;
        const shown = seat.tags.filter(
          (t) => phase === 'nominate' || (t !== 'lastChancellor' && t !== 'lastPresident'),
        );
        const tags = shown.map((t) => tagName(L, t)).filter((t): t is string => t !== null);
        const style = { '--i': i } as CSSProperties;
        return (
          <li
            key={seat.id}
            className={styles.seat}
            style={style}
            data-seat={seat.id}
            data-gone={gone || undefined}
            data-spot={spot === seat.id || undefined}
            data-dim={(spot !== null && spot !== seat.id) || undefined}
          >
            <div className={styles.over}>
              {seat.vote ? (
                <Placard
                  settled={phase !== 'voteReveal'}
                  vote={seat.vote}
                  delayMs={500 + i * 40}
                  label={seat.vote === 'ja' ? L('✓ JA!') : L('✗ NEIN!')}
                  back={L('Voted')}
                />
              ) : seat.tags.includes('voted') ? (
                <span className={styles.voted} role="img" aria-label={L('✓ voted')}>
                  <span className={styles.placardBack}>{L('Voted')}</span>
                </span>
              ) : null}
              {phase === 'seating' && seat.tags.includes('ready') ? (
                <span className={styles.ready}>{L('✓ Ready')}</span>
              ) : null}
              {over && seat.role ? (
                <span className={styles.dossier} data-role={seat.role}>
                  {seat.role === 'hitler' ? (
                    <MaskEmblem size={40} />
                  ) : (
                    <PartyEmblem party={seat.role === 'liberal' ? 'L' : 'F'} size={34} />
                  )}
                  <span>{roleName(L, seat.role)}</span>
                </span>
              ) : null}
            </div>
            <span className={styles.avatar} data-anchor>
              <Avatar avatarId={p?.avatarId ?? ''} size={64} dim={gone || p?.connected === false} />
              {seat.tags.includes('executed') ? <span className={styles.ghost}>👻</span> : null}
            </span>
            <span className={styles.name}>{p?.name ?? '?'}</span>
            {plate ? (
              <span className={styles.plate} data-plate={plate}>
                {plate !== 'nominee' ? <PlateIcon kind={plate} size={18} /> : null}
                {plate === 'president'
                  ? L('President')
                  : plate === 'chancellor'
                    ? L('Chancellor')
                    : L('Nominee')}
              </span>
            ) : seat.tags.includes('next') && !over ? (
              <span className={styles.next}>{L('Next')}</span>
            ) : null}
            {p?.connected === false && !gone ? (
              <span className={styles.tag}>{L('reconnecting…')}</span>
            ) : (
              tags.slice(0, 1).map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))
            )}
            {i < view.seats.length - 1 ? (
              <span className={styles.arrow} aria-hidden="true">
                ›
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

// The phone's roster (the owner's play-test): every seat in seat order along the bottom, so each
// player can see the whole table at once — the President and Chancellor plates, "Next", the
// executed, ✓ Not Hitler, who has voted. While a player's dossier is open, the teammates it names
// are marked too (a Fascist sees the other Fascists and Hitler); closed, the roster shows only
// public facts, so a glance over a shoulder gives nothing away.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { ShControllerView } from '../server/views';
import { MaskEmblem, SerpentEmblem } from './art';
import { PlateIcon } from './icons';
import { roleName } from './labels';
import { STRINGS } from './strings';
import styles from './roster.module.css';

export function Roster({
  view,
  showTeam,
  facesOnly = false,
}: {
  view: ShControllerView;
  showTeam: boolean;
  /** The ballot needs the height: faces only (names stay in each seat's label). */
  facesOnly?: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  const team = new Map((showTeam ? (view.dossier?.team ?? []) : []).map((t) => [t.id, t.role]));
  // More seats than fit: the strip scrolls sideways, and a fade on the hidden side says so.
  const ref = useRef<HTMLOListElement>(null);
  const [more, setMore] = useState<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = (): void => {
      const left = el.scrollLeft > 2;
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
      setMore((m) => (m.left === left && m.right === right ? m : { left, right }));
    };
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      ro.disconnect();
    };
  }, []);
  return (
    <ol
      ref={ref}
      className={styles.roster}
      aria-label={L('Seat order')}
      data-faces={facesOnly || undefined}
      data-more-left={more.left || undefined}
      data-more-right={more.right || undefined}
    >
      {view.seats.map((seat) => {
        const p = view.players.find((x) => x.id === seat.id);
        const gone = seat.tags.includes('executed') || seat.tags.includes('exiled');
        const mate = team.get(seat.id);
        const me = seat.id === view.me.id;
        const plate = seat.plate;
        return (
          <li
            key={seat.id}
            className={styles.seat}
            data-gone={gone || undefined}
            data-me={me || undefined}
            data-mate={mate ? mate : undefined}
            aria-label={[
              p?.name ?? '?',
              plate === 'president' ? L('President') : '',
              plate === 'chancellor' ? L('Chancellor') : '',
              plate === 'nominee' ? L('Nominee') : '',
              mate ? roleName(L, mate) : '',
              seat.tags.includes('executed') ? L('Executed') : '',
              seat.tags.includes('notHitler') ? L('✓ Not Hitler') : '',
            ]
              .filter(Boolean)
              .join(' · ')}
          >
            <span className={styles.face}>
              <Avatar
                avatarId={p?.avatarId ?? ''}
                size="2.1rem"
                dim={gone || p?.connected === false}
              />
              {plate === 'president' || plate === 'chancellor' ? (
                <span className={styles.plate} data-plate={plate}>
                  <PlateIcon kind={plate} size="0.8rem" />
                </span>
              ) : null}
              {mate ? (
                <span className={styles.mateMark} aria-hidden="true">
                  {mate === 'hitler' ? (
                    <MaskEmblem size="1.1rem" />
                  ) : (
                    <SerpentEmblem size="1.1rem" />
                  )}
                </span>
              ) : null}
              {seat.tags.includes('executed') ? <span className={styles.ghost}>👻</span> : null}
              {seat.tags.includes('voted') || seat.vote ? (
                <span className={styles.voted} data-vote={seat.vote ?? undefined}>
                  {seat.vote === 'nein' ? '✗' : '✓'}
                </span>
              ) : null}
            </span>
            <span className={styles.name}>{me ? L('You') : (p?.name ?? '?')}</span>
            {seat.tags.includes('notHitler') ? (
              <span className={styles.nh}>{L('✓ Not Hitler')}</span>
            ) : null}
            {seat.tags.includes('next') && !plate ? (
              <span className={styles.next}>{L('Next')}</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

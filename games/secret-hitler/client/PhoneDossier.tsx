// The dossier (SPEC §9.2): a classified folder at the top of every phone. Tap to open it, tap to
// close it (the owner's play-test: holding was hard to read; a phone set to "hold" still holds).
// Inside, every dossier has the same five sections in the same order — party, role, team, intel,
// power card — with "—" when one is empty, so its size never gives a role away. It turns back
// when the page hides.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { Role } from '../server/types';
import type { ShControllerView } from '../server/views';
import { MaskEmblem, PartyEmblem } from './art';
import { PolicyCard } from './Card';
import { nameIn, partyName, roleGoal, roleName } from './labels';
import { getSecretCardMode } from './cardMode';
import { STRINGS } from './strings';
import styles from './dossier.module.css';

function RoleMark({ role, size }: { role: Role; size: number }): JSX.Element {
  return role === 'hitler' ? (
    <MaskEmblem size={size} />
  ) : (
    <PartyEmblem party={role === 'liberal' ? 'L' : 'F'} size={size} />
  );
}

export function PhoneDossier({
  view,
  open,
  onOpen,
}: {
  view: ShControllerView;
  open: boolean;
  onOpen: (open: boolean) => void;
}): JSX.Element | null {
  const L = useT(STRINGS);
  const [hold] = useState(() => getSecretCardMode() === 'hold');
  useEffect(() => {
    const hide = (): void => {
      if (document.visibilityState === 'hidden') onOpen(false);
    };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, [onOpen]);
  const d = view.dossier;
  if (!d) return null;
  const name = (id: string): string => nameIn(view.players, id);
  return (
    <div className={styles.folder} data-open={open || undefined}>
      <button
        type="button"
        className={styles.cover}
        aria-expanded={open}
        aria-label={open ? L('Close your dossier') : L('Open your dossier')}
        onClick={hold ? undefined : () => onOpen(!open)}
        onPointerDown={hold ? () => onOpen(true) : undefined}
        onPointerUp={hold ? () => onOpen(false) : undefined}
        onPointerCancel={() => onOpen(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className={styles.tab}>{L('Dossier')}</span>
        <span className={styles.stampMark}>{L('Classified')}</span>
        <span className={styles.hint}>
          {open ? L('Tap to close') : hold ? L('Hold to read') : L('Tap to read')}
        </span>
      </button>
      {open ? (
        <dl className={styles.sheet}>
          <div className={styles.row}>
            <dt>{L('Party')}</dt>
            <dd>
              <PolicyCard party={d.party} size="sm" />
              <strong>{partyName(L, d.party)}</strong>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>{L('Role')}</dt>
            <dd>
              <span className={styles.roleMark} data-role={d.role}>
                <RoleMark role={d.role} size={34} />
              </span>
              <span>
                <strong>{roleName(L, d.role)}</strong>
                <span className={styles.goal}>{roleGoal(L, d.role)}</span>
              </span>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>{L('Team')}</dt>
            <dd className={styles.list}>
              {d.team.length === 0
                ? '—'
                : d.team.map((t) => (
                    <span key={t.id} className={styles.mate}>
                      <RoleMark role={t.role} size={20} />
                      {name(t.id)} · {roleName(L, t.role)}
                    </span>
                  ))}
            </dd>
          </div>
          <div className={styles.row}>
            <dt>{L('Intel')}</dt>
            <dd className={styles.list}>
              {d.intel.length === 0
                ? '—'
                : d.intel.map((i) => (
                    <span key={`${i.k}${i.n}`}>
                      {i.k === 'investigate'
                        ? L('Round {n}: {name} is {party}', {
                            n: i.n,
                            name: name(i.who),
                            party: partyName(L, i.party),
                          })
                        : L('Round {n}: the top three were {cards}', {
                            n: i.n,
                            cards: i.cards.join(' '),
                          })}
                    </span>
                  ))}
            </dd>
          </div>
          <div className={styles.row}>
            <dt>{L('Power card')}</dt>
            <dd>—</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}

// The dossier (§9.2, plain for M1): hold to see. Every dossier has the same sections in the same
// order, with "—" when a section is empty, so its size never gives a role away. Power cards are M3.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { ShControllerView } from '../server/views';
import { PolicyCard } from './Card';
import { nameIn, partyName, roleGoal, roleName } from './labels';
import { SecretCard } from './standin/SecretCard';
import { STRINGS } from './strings';
import styles from './phone.module.css';

export function PhoneDossier({ view }: { view: ShControllerView }): JSX.Element | null {
  const L = useT(STRINGS);
  const d = view.dossier;
  if (!d) return null;
  const name = (id: string): string => nameIn(view.players, id);
  return (
    <SecretCard backLabel={L('Hold to see your dossier')} label={L('Your secret dossier')}>
      <dl className={styles.dossier}>
        <dt>{L('Party')}</dt>
        <dd>
          <PolicyCard party={d.party} size="sm" /> {partyName(L, d.party)}
        </dd>
        <dt>{L('Role')}</dt>
        <dd>
          <strong>{roleName(L, d.role)}</strong> · {roleGoal(L, d.role)}
        </dd>
        <dt>{L('Team')}</dt>
        <dd>
          {d.team.length === 0
            ? '—'
            : d.team.map((t) => `${name(t.id)} (${roleName(L, t.role)})`).join(', ')}
        </dd>
        <dt>{L('Intel')}</dt>
        <dd>
          {d.intel.length === 0
            ? '—'
            : d.intel.map((i) => (
                <span key={`${i.k}${i.n}`} className={styles.intel}>
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
        <dt>{L('Power card')}</dt>
        <dd>—</dd>
      </dl>
    </SecretCard>
  );
}

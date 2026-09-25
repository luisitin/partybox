// The phone while the TV tells the story: dawn (the night report strip on every phone that played
// the night, then — once the TV announced it — your own fate), the verdict (your fate once shown)
// and the end (your side's result). Every phone gets the same strips; only what they hide differs.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { NightfallControllerView } from '../server/index';
import { HoldCard } from './HoldCard';
import { roleText } from './lookup';
import { RoleStrip, WatchTheTv } from './PhoneBits';
import { STRINGS } from './strings';
import styles from './Phone.module.css';

type View = NightfallControllerView;

function ownRole(view: View, L: ReturnType<typeof useT>): string {
  return view.role ? `${view.role.icon} ${L.sent(view.role.name)}` : '';
}

export function DawnPhone({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const told = view.step >= 1;
  const diedNow = view.graveyard.some((g) => g.id === view.me.id && g.day === view.day);
  const fate = !told
    ? null
    : diedNow
      ? `👻 ${L("You didn't survive the night.")} ${L('Your role: {role}', { role: ownRole(view, L) })}`
      : view.alive
        ? `🌅 ${L('You survived the night.')}`
        : null;
  return (
    <WatchTheTv>
      {view.report ? (
        <HoldCard strip secret="report">
          <span className={styles.jobLine}>{L.sent(view.report)}</span>
        </HoldCard>
      ) : null}
      <p key={fate ?? 'wait'} className={styles.sub} aria-live="polite">
        {fate ?? L('The village wakes…')}
      </p>
      <RoleStrip view={view} />
    </WatchTheTv>
  );
}

export function VerdictPhone({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const out = view.stage?.verdict?.out ?? null;
  const me = out !== null && out === view.me.id;
  const line = view.step >= 1 && me ? `🪦 ${L('You were voted out.')}` : null;
  return (
    <WatchTheTv>
      {line ? (
        <p className={styles.sub} aria-live="polite">
          {line} {L('Your role: {role}', { role: ownRole(view, L) })}
        </p>
      ) : (
        <p className={styles.sub}>{L('The votes are in.')}</p>
      )}
      <RoleStrip view={view} />
    </WatchTheTv>
  );
}

export function EndPhone({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const r = view.result;
  if (!r) return <WatchTheTv />;
  const role = roleText(view.cast, view.role?.id ?? null);
  return (
    <WatchTheTv title={L.sent(r.headline)}>
      <div className={`${styles.result} ${r.won ? styles.won : styles.lost}`}>
        <span className={styles.roleIcon} aria-hidden="true">
          {role?.icon}
        </span>
        <p className={styles.roleName}>{r.won ? L('You won!') : L('Not this time.')}</p>
        <p className={styles.roleDesc}>
          {L('You were: {role}', { role: role ? L.sent(role.name) : '' })}
        </p>
      </div>
    </WatchTheTv>
  );
}

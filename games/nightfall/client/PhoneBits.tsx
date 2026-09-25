// Pieces every phone screen shares: the role card's face, the one-line role reminder under
// hold-to-see, a small village (the living with hunch bars, the dead with their roles), "Watch the
// TV" and the ghost screen (SPEC §10.9 "Ghost").
import type { CSSProperties, JSX, ReactNode } from 'react';
import { Avatar, Screen, usePhoneOnly, useT } from '@partybox/game-sdk/ui';
import type { NightfallControllerView } from '../server/index';
import { HoldCard } from './HoldCard';
import { castLine, nameOf, playerOf, roleText } from './lookup';
import { STRINGS } from './strings';
import styles from './Phone.module.css';

type View = NightfallControllerView;

/** The role card's face: icon, name, what it does, and the pack for wolves. */
export function RoleFace({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  if (!view.role) return null;
  const pack = view.pack.map((id) => nameOf(view.players, id)).join(', ');
  return (
    <>
      <span className={styles.roleIcon} aria-hidden="true">
        {view.role.icon}
      </span>
      <p className={styles.roleName}>{L.sent(view.role.name)}</p>
      <p className={styles.roleDesc}>{L.sent(view.role.desc)}</p>
      {pack ? (
        <p className={styles.roleExtra}>
          {L.sent(view.words.pack)}: {pack} {view.role.icon}
        </p>
      ) : null}
    </>
  );
}

/** "Hold: your role" — the same strip on every phone. */
export function RoleStrip({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  if (!view.role) return null;
  return (
    <HoldCard strip secret="role">
      <span className={styles.jobLine}>
        {view.role.icon} {L.sent(view.role.name)}
      </span>
    </HoldCard>
  );
}

export function CastLine({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <p className={styles.castLine}>
      {castLine(view.cast, L.sent)
        .map((c) => `${c.icon} ${c.text}`)
        .join(' · ')}
    </p>
  );
}

/** The living (with hunch bars) and the dead (with their roles, or "?"). */
export function MiniVillage({ view, roles }: { view: View; roles?: boolean }): JSX.Element {
  const L = useT(STRINGS);
  const max = Math.max(1, ...view.tally.map((t) => t.n ?? 0));
  const known = new Map((view.roles ?? []).map((r) => [r.id, r.role]));
  return (
    <ul className={styles.faces} aria-label={L('The village')}>
      {view.living.map((id) => {
        const p = playerOf(view.players, id);
        const hunch = view.tally.find((t) => t.id === id);
        const role = roles ? roleText(view.cast, known.get(id) ?? null) : null;
        return p ? (
          <li key={id} className={styles.mini}>
            <span className={styles.miniFace}>
              <Avatar avatarId={p.avatarId} size="100%" dim={!p.connected} />
            </span>
            <span className={styles.miniName}>{p.name}</span>
            {hunch ? (
              <>
                <span
                  className={styles.hunchBar}
                  style={{ transform: `scaleX(${(hunch.n ?? 1) / max})` } as CSSProperties}
                />
                <span className={styles.miniTag}>🤔 {hunch.n ?? ''}</span>
              </>
            ) : null}
            {role ? <span className={styles.miniTag}>{role.icon}</span> : null}
          </li>
        ) : null;
      })}
      {view.graveyard.map((g) => {
        const p = playerOf(view.players, g.id);
        const role = roleText(view.cast, g.role);
        return p ? (
          <li key={g.id} className={`${styles.mini} ${styles.miniDead}`}>
            <span className={styles.miniFace}>
              <Avatar avatarId={p.avatarId} size="100%" dim />
            </span>
            <span className={styles.miniName}>🪦 {p.name}</span>
            <span className={styles.miniTag}>
              {role ? `${role.icon} ${L.sent(role.name)}` : '?'}
            </span>
          </li>
        ) : null;
      })}
    </ul>
  );
}

/** At-TV phones during a reveal: look up (P00 §7.3). Phone-only rooms never say "TV". */
export function WatchTheTv({
  children,
  title,
}: {
  children?: ReactNode;
  title?: string;
}): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  return (
    <Screen className={styles.screen}>
      <div className={styles.stack}>
        <div className={styles.watch}>
          <span className={styles.watchGlyph} aria-hidden="true">
            {phoneOnly ? '🌙' : '👀'}
          </span>
          <p className={styles.head}>
            {title ?? (phoneOnly ? L('One moment…') : L('Watch the TV'))}
          </p>
        </div>
        {children}
      </div>
    </Screen>
  );
}

export function GhostScreen({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const seeAll = view.roles !== null;
  return (
    <Screen className={`${styles.screen} ${styles.ghost}`}>
      <div className={styles.stack}>
        <div className={styles.watch}>
          <span className={styles.ghostGlyph} aria-hidden="true">
            👻
          </span>
          <p className={styles.head}>{L("You're a ghost.")}</p>
          <p className={styles.sub}>{L('Watch, but stay silent.')}</p>
        </div>
        {view.report ? (
          <HoldCard strip secret="report">
            <span className={styles.jobLine}>{L.sent(view.report)}</span>
          </HoldCard>
        ) : null}
        {seeAll ? (
          <HoldCard strip secret="every">
            <span className={styles.jobLine}>
              {(view.roles ?? [])
                .map(
                  (r) => `${nameOf(view.players, r.id)} ${roleText(view.cast, r.role)?.icon ?? ''}`,
                )
                .join(' · ')}
            </span>
          </HoldCard>
        ) : null}
        <MiniVillage view={view} />
      </div>
    </Screen>
  );
}

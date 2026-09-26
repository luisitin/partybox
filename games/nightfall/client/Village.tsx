// The village on the TV (SPEC §10.9): the living as faces with names in a gentle arc (one row up to
// eight, two rows beyond), the graveyard along the bottom with each revealed role or "?". The dead
// are desaturated AND carry a 🪦 (never colour alone). Optional layers: ✓ as picks come in, the
// hunch tally as small bars, the verdict's ballots landing face by face on their targets, and the
// spotlight that dims everyone but one.
import type { CSSProperties, JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { ViewPlayer } from '@partybox/game-sdk/ui';
import type { CastEntry, GraveEntry } from '../server/views-common';
import type { Ballot } from '../server/types';
import { facesOf, playerOf, roleText } from './lookup';
import { STRINGS } from './strings';
import styles from './Village.module.css';

export interface VillageProps {
  players: readonly ViewPlayer[];
  living: readonly string[];
  graveyard: readonly GraveEntry[];
  cast: readonly CastEntry[];
  /** Show ✓ on faces whose chip status is `submitted`. */
  checks?: boolean;
  tally?: readonly { id: string; n: number | null }[];
  spotlight?: string | null;
  ballots?: readonly Ballot[];
  /** Faces shrink to leave room (a town board beside them). */
  narrow?: boolean;
}

function rowsOf<T>(items: readonly T[]): T[][] {
  if (items.length <= 8) return [items.slice()];
  const top = Math.ceil(items.length / 2);
  return [items.slice(0, top), items.slice(top)];
}

function sizeFor(count: number, narrow: boolean): number {
  const base = count <= 6 ? 136 : count <= 8 ? 120 : count <= 12 ? 104 : 92;
  return narrow ? Math.round(base * 0.78) : base;
}

export function Village(p: VillageProps): JSX.Element {
  const L = useT(STRINGS);
  const faces = facesOf(p.players, p.living);
  const size = sizeFor(faces.length, p.narrow === true);
  const wideNames = faces.length > 10;
  const maxHunch = Math.max(1, ...(p.tally ?? []).map((t) => t.n ?? 0));
  const order = new Map((p.tally ?? []).map((t, i) => [t.id, i + 1]));
  const noOne = (p.ballots ?? []).filter((b) => b.target === 'none');
  let landed = 0;
  return (
    <div
      className={`${styles.village} ${wideNames ? styles.wideNames : ''}`}
      style={{ '--face': `${size}px` } as CSSProperties}
    >
      {rowsOf(faces).map((row, r) => (
        <div key={r} className={styles.row}>
          {row.map((f, i) => {
            const mid = (row.length - 1) / 2;
            const lift = mid === 0 ? 0 : ((i - mid) / mid) ** 2;
            const on = p.checks && f.status === 'submitted';
            const dimmed = p.spotlight ? p.spotlight !== f.id : false;
            const hunch = p.tally?.find((t) => t.id === f.id);
            const votes = (p.ballots ?? []).filter((b) => b.target === f.id);
            return (
              <div
                key={f.id}
                className={`${styles.person} ${dimmed ? styles.dimmed : ''} ${p.spotlight === f.id ? styles.lit : ''}`}
                style={{ '--lift': lift, '--i': i + r * 8 } as CSSProperties}
              >
                <div className={styles.inner}>
                  <div className={styles.faceBox}>
                    <Avatar avatarId={f.avatarId} size="100%" dim={!f.connected} />
                    <span
                      className={`${styles.tick} ${on ? styles.tickOn : ''}`}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    {votes.length > 0 ? <span className={styles.count}>{votes.length}</span> : null}
                  </div>
                  <span className={styles.name}>{f.name}</span>
                  {hunch ? (
                    <span className={styles.hunch}>
                      <span
                        className={styles.bar}
                        style={{ '--w': (hunch.n ?? 1) / maxHunch } as CSSProperties}
                      />
                      <span className={styles.hunchText}>
                        🤔 {hunch.n ?? `#${order.get(f.id) ?? ''}`}
                      </span>
                    </span>
                  ) : null}
                  {votes.length > 0 ? (
                    <span className={styles.ballots}>
                      {votes.map((b) => {
                        const voter = playerOf(p.players, b.by);
                        const d = landed++;
                        return voter ? (
                          <span
                            key={b.by}
                            className={styles.ballot}
                            style={{ animationDelay: `${300 + d * 240}ms` }}
                          >
                            <Avatar avatarId={voter.avatarId} size="100%" />
                          </span>
                        ) : null;
                      })}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      {noOne.length > 0 ? (
        <div className={styles.noOne}>
          <span className={styles.noOneLabel}>
            🙅 {L('No one')} · {noOne.length}
          </span>
          <span className={styles.ballots}>
            {noOne.map((b) => {
              const voter = playerOf(p.players, b.by);
              const d = landed++;
              return voter ? (
                <span
                  key={b.by}
                  className={styles.ballot}
                  style={{ animationDelay: `${300 + d * 240}ms` }}
                >
                  <Avatar avatarId={voter.avatarId} size="100%" />
                </span>
              ) : null;
            })}
          </span>
        </div>
      ) : null}
      <Graveyard players={p.players} graveyard={p.graveyard} cast={p.cast} />
    </div>
  );
}

export function Graveyard({
  players,
  graveyard,
  cast,
}: Pick<VillageProps, 'players' | 'graveyard' | 'cast'>): JSX.Element | null {
  const L = useT(STRINGS);
  if (graveyard.length === 0) return null;
  return (
    <div className={styles.graveyard} aria-label={L('The graveyard')}>
      {graveyard.map((g) => {
        const who = playerOf(players, g.id);
        const role = roleText(cast, g.role);
        return (
          <div key={g.id} className={styles.grave}>
            <div className={styles.graveFace}>
              {who ? <Avatar avatarId={who.avatarId} size="100%" dim /> : null}
              <span className={styles.stone} aria-hidden="true">
                🪦
              </span>
            </div>
            <span className={styles.graveName}>{who?.name ?? ''}</span>
            <span className={styles.graveRole}>
              <span aria-hidden="true">{role ? role.icon : '❔'}</span>{' '}
              {role ? L.sent(role.name) : '?'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

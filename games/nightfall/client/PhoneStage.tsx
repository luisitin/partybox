// The TV's moments on a phone (phone-only rooms; remote phones once F4's per-player stage lands):
// dawn, the verdict and the end, at phone size, with the narrator on its frame and every spoken
// line also written (P00 §3.7). The player's own strips (night report, fate) sit underneath.
import type { JSX } from 'react';
import { Avatar, Screen, useT } from '@partybox/game-sdk/ui';
import type { ControllerView, PushedView } from '@partybox/game-sdk/ui';
import type { NightfallControllerView } from '../server/index';
import { HoldCard } from './HoldCard';
import { nameOf, playerOf } from './lookup';
import { MiniVillage } from './PhoneBits';
import { RoleCard } from './RoleCard';
import { STRINGS } from './strings';
import { useNarrator } from './useNarrator';
import styles from './Phone.module.css';
import stage from './PhoneStage.module.css';

type View = NightfallControllerView;

function Ballots({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const v = view.stage?.verdict;
  if (!v) return null;
  return (
    <ul className={stage.ballots}>
      {v.counts
        .slice()
        .sort((a, b) => b.n - a.n)
        .map((c, i) => {
          const who = c.id === 'none' ? null : playerOf(view.players, c.id);
          const voters = v.ballots
            .filter((b) => b.target === c.id)
            .map((b) => nameOf(view.players, b.by));
          return (
            <li
              key={c.id}
              className={`${stage.row} ${v.out === c.id ? stage.out : ''}`}
              style={{ animationDelay: `${i * 160}ms` }}
            >
              <span className={stage.face}>
                {who ? (
                  <Avatar avatarId={who.avatarId} size="100%" />
                ) : (
                  <span aria-hidden="true">🙅</span>
                )}
              </span>
              <span className={stage.who}>
                <strong>{who ? who.name : L('No one')}</strong>
                <span className={stage.voters}>{voters.join(', ')}</span>
              </span>
              <span className={stage.n}>{c.n}</span>
            </li>
          );
        })}
    </ul>
  );
}

export function PhoneStage({ view }: { view: PushedView<ControllerView> }): JSX.Element {
  const v = view as unknown as PushedView<View>;
  const L = useT(STRINGS);
  useNarrator(v.stage?.say ?? null);
  const s = v.stage;
  const dawnDeaths = v.phaseId === 'dawn' && v.step >= 1 ? (s?.news ?? []) : [];
  const out = v.phaseId === 'verdict' && v.step >= 1 ? (s?.verdict?.out ?? null) : null;
  const outWho = out ? playerOf(v.players, out) : undefined;
  return (
    <Screen className={styles.screen}>
      <div className={styles.stack}>
        {(s?.lines ?? []).map((line, i) => (
          <p key={`${v.phaseId}-${v.step}-${i}`} className={`${styles.head} ${stage.line}`}>
            {L.sent(line)}
          </p>
        ))}
        {dawnDeaths.length > 0 ? (
          <div className={stage.cards}>
            {dawnDeaths.map((d) => {
              const who = playerOf(v.players, d.id);
              return (
                <RoleCard
                  key={d.id}
                  name={who?.name ?? ''}
                  avatarId={who?.avatarId ?? ''}
                  cast={v.cast}
                  role={d.role}
                  flipped={v.step >= 2 && d.role !== null}
                  size="small"
                  dead
                />
              );
            })}
          </div>
        ) : null}
        {outWho ? (
          <div className={stage.cards}>
            <RoleCard
              name={outWho.name}
              avatarId={outWho.avatarId}
              cast={v.cast}
              role={s?.verdict?.role ?? null}
              flipped={v.step >= 2 && (s?.verdict?.role ?? null) !== null}
              size="small"
              dead
            />
          </div>
        ) : null}
        {v.phaseId === 'verdict' ? <Ballots view={v} /> : null}
        {v.report ? (
          <HoldCard strip secret="report">
            <span className={styles.jobLine}>{L.sent(v.report)}</span>
          </HoldCard>
        ) : null}
        {v.result ? (
          <p className={styles.sub}>{v.result.won ? L('You won!') : L('Not this time.')}</p>
        ) : null}
        {/* Every role only once the game is over: a ghost's list stays under hold-to-see. */}
        <MiniVillage
          view={v}
          roles={v.roles !== null && (v.phaseId === 'end' || v.phaseId === 'done')}
        />
      </div>
    </Screen>
  );
}

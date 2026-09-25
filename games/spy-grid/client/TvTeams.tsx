// TV during `teams` (SPEC §9.5): two tall columns, ▲ Sun and ● Moon, faces joining live with a
// 🕶️ on each spymaster volunteer; the how-to-play steps and the house rules in a side panel. In
// co-op: one crew and who wants to be spymaster.
import type { JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { SpyTvView } from '../server/views';
import { SHAPE, faceOf, nameOf } from './model';
import type { Team } from './model';
import styles from './Tv.module.css';
import { STRINGS } from './strings';
import { TvDemo } from './TvDemo';

function Column({
  view,
  team,
  title,
}: {
  view: SpyTvView;
  team: Team;
  title: string;
}): JSX.Element {
  return (
    <section className={`${styles.column} ${styles[`col-${team}`]}`}>
      <h2 className={styles.colTitle}>
        <span className={styles.colShape}>{SHAPE[team]}</span> {title}
        <span className={styles.colCount}>{view.teams[team].length}</span>
      </h2>
      <ul className={styles.roster}>
        {view.teams[team].map((id) => {
          const face = faceOf(view, id);
          return (
            <li key={id} className={styles.member}>
              <span className={styles.memberFace}>
                {face ? <Avatar avatarId={face.avatarId} size="100%" /> : null}
              </span>
              <span className={styles.memberName}>{nameOf(view, id)}</span>
              {view.volunteers.includes(id) ? <span className={styles.badge}>🕶️</span> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function TvTeams({ view }: { view: SpyTvView }): JSX.Element {
  const L = useT(STRINGS);
  const coop = view.mode === 'coop';
  return (
    <div className={`${styles.teams} ${coop ? styles.teamsCoop : ''}`}>
      <div className={styles.columns}>
        {coop ? (
          <Column view={view} team="sun" title={L('Your crew')} />
        ) : (
          <>
            <Column view={view} team="sun" title={L('Sun')} />
            <Column view={view} team="moon" title={L('Moon')} />
          </>
        )}
      </div>
      <aside className={styles.howTo}>
        <h2 className={styles.howTitle}>{coop ? L('A co-op mission') : L('How to play')}</h2>
        <TvDemo />
        <p className={styles.callToAction}>
          {coop
            ? L('📱 On your phone: want to give the clues? Tap “I’ll be spymaster”')
            : L('📱 On your phone: pick ▲ Sun or ● Moon')}
        </p>
        {!coop && Math.abs(view.teams.sun.length - view.teams.moon.length) > 1 ? (
          <p className={styles.evenHint}>{L('Teams even out at the start: bots move first.')}</p>
        ) : null}
        {L('The board words are in English.') !== 'The board words are in English.' ? (
          <p className={styles.boardNote}>{L('The board words are in English.')}</p>
        ) : null}
      </aside>
    </div>
  );
}

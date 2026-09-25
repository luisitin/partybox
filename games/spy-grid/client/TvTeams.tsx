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
    <div className={styles.teams}>
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
        <ol className={styles.steps}>
          {coop ? (
            <>
              <li>{L('One spymaster sees which 9 of the 25 words are your agents.')}</li>
              <li>{L('They give one word and a number. Point at the words you think match.')}</li>
              <li>
                {L(
                  'Find all 9 before the clues run out. Touch the assassin and the mission fails.',
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                {L(
                  "Two teams, one grid of 25 words. Only each team's spymaster knows which words are their agents.",
                )}
              </li>
              <li>
                {L(
                  'Your spymaster gives a one-word clue and a number, like "Ocean, 3". Point at the words you think match.',
                )}
              </li>
              <li>
                {L(
                  'Find all your agents first. Touch the assassin and your team loses on the spot.',
                )}
              </li>
            </>
          )}
        </ol>
        <p className={styles.rules}>
          {L(
            'Spymasters: clues are about meaning, not letters or spots on the grid. No hints, no faces, no pointing.',
          )}
        </p>
        <p className={styles.callToAction}>
          {coop
            ? L('Want to be the spymaster? Say so on your phone')
            : L('Pick a team on your phone')}
        </p>
      </aside>
    </div>
  );
}

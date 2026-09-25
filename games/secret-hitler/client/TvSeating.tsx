// The TV while everyone reads their dossier (the owner's pacing rule, 2026-09-24): the front page
// clipping is pinned to a typed briefing that gives the three things to know, one at a
// time, with a line counting who has tapped Got it (the seat row marks each). Once everyone has,
// the 3 · 2 · 1 (Countdown) takes the room.
import type { CSSProperties, JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { ShTvView } from '../server/views';
import { MaskEmblem, PartyEmblem } from './art';
import { PlateIcon } from './icons';
import { Newspaper } from './Newspaper';
import { STRINGS } from './strings';
import styles from './seating.module.css';

export function TvSeating({ view }: { view: ShTvView }): JSX.Element {
  const L = useT(STRINGS);
  const here = view.seats.filter((s) => !s.tags.includes('exiled'));
  const ready = here.filter((s) => s.tags.includes('ready')).length;
  const rules = [
    {
      art: <MaskEmblem size={48} />,
      title: L('Secret roles'),
      text: L(
        'Everyone has a secret role. The Fascists know each other; the Liberals know no one.',
      ),
    },
    {
      art: <PlateIcon kind="president" size={42} />,
      title: L('Elect a government'),
      text: L(
        'The President names a Chancellor and everyone votes Ja! or Nein! If it passes, the two secretly pass one law.',
      ),
    },
    {
      art: (
        <span className={styles.pair}>
          <PartyEmblem party="L" size={36} />
          <PartyEmblem party="F" size={36} />
        </span>
      ),
      title: L('How to win'),
      text: L(
        'Liberals: 5 Liberal laws, or execute Hitler. Fascists: 6 Fascist laws, or Hitler elected Chancellor after 3.',
      ),
    },
  ];
  return (
    <div className={styles.seating}>
      <section className={styles.brief} aria-label={L('How to play')}>
        <header className={styles.head}>
          <span className={styles.tab}>{L('Briefing')}</span>
          <h2 className={styles.heading}>{L('How to play')}</h2>
        </header>
        <div className={styles.clipping}>
          <Newspaper headline={L('A new parliament')} session={0} kicker={L('Special edition')} />
        </div>
        <ol className={styles.rules}>
          {rules.map((r, i) => (
            <li key={r.title} className={styles.rule} style={{ '--i': i } as CSSProperties}>
              <span className={styles.art} data-rule={i}>
                {r.art}
              </span>
              <span className={styles.words}>
                <strong className={styles.ruleTitle}>{r.title}</strong>
                <span className={styles.ruleText}>{r.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <footer className={styles.ready} data-all={ready === here.length || undefined}>
          <span className={styles.readyCount}>
            {L('{ready} of {total} ready', { ready, total: here.length })}
          </span>
          <span className={styles.readyHint}>{L('Read your dossier, then tap Got it')}</span>
        </footer>
      </section>
    </div>
  );
}

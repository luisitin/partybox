// TV intro, the ready-up (the owner, 2026-09-24): the title, the three rules dealt in, the Black
// Sheep spelled out beside its coin, and every face with a ✓ once they've tapped Ready on their
// phone. When all are ready the 3 · 2 · 1 (Tv.tsx) takes over.
import type { CSSProperties, JSX } from 'react';
import { Avatar, BigText, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { HerdTvView } from '../server/views';
import { SheepCoin } from './SheepCoin';
import { STRINGS } from './strings';
import styles from './Tv.module.css';

export function TvIntro({ view }: { view: PushedView<HerdTvView> }): JSX.Element {
  const L = useT(STRINGS);
  const rules = [
    {
      icon: '🎯',
      text: L('Pick the answer you think MOST people will pick — not your favourite.'),
    },
    {
      icon: '👥',
      text: L('The biggest group scores 1 point each. A tie for biggest? Nobody scores.'),
    },
    { icon: '🔁', text: L('You can change your pick until time runs out.') },
  ];
  const seated = view.players.filter((p) => p.status !== 'spectator');
  const ready = seated.filter((p) => view.ready.includes(p.id)).length;
  return (
    <div className={`${styles.intro} ${view.paused ? styles.paused : ''}`}>
      <div className={styles.titleRow}>
        <SheepCoin size="md" spin />
        <div>
          <BigText level="h1">{L('Herd Mind')}</BigText>
        </div>
      </div>
      <ol className={styles.rules}>
        {rules.map((r, i) => (
          <li key={i} className={styles.rule} style={{ '--i': i } as CSSProperties}>
            <span className={styles.ruleNum} aria-hidden>
              {i + 1}
            </span>
            <span className={styles.ruleIcon} aria-hidden>
              {r.icon}
            </span>
            <span>{r.text}</span>
          </li>
        ))}
      </ol>
      <section className={styles.sheepRule} style={{ '--i': 3 } as CSSProperties}>
        <SheepCoin size="md" />
        <div>
          <h2 className={styles.sheepRuleTitle}>{L('The Black Sheep')}</h2>
          <p>
            {L('The only one alone on an answer gets the Black Sheep.')}{' '}
            {L("While you hold it, you can't win — even at {target} points.", {
              target: view.target,
            })}{' '}
            {L(
              'It leaves you when someone else is the only one alone. Two or more alone? It stays put.',
            )}
          </p>
        </div>
      </section>
      <div className={styles.readyRow} aria-live="polite">
        <ul className={styles.readyFaces}>
          {seated.map((p) => {
            const on = view.ready.includes(p.id);
            return (
              <li key={p.id} className={on ? styles.readyOn : styles.readyOff}>
                <Avatar avatarId={p.avatarId} size={56} dim={!on} />
                <span className={styles.readyTick} aria-hidden>
                  {on ? '✓' : ''}
                </span>
                <span className="pb-visually-hidden">
                  {on ? L('{name} is ready', { name: p.name }) : p.name}
                </span>
              </li>
            );
          })}
        </ul>
        <p key={ready} className={styles.readyCount}>
          {ready === seated.length
            ? L('Everyone is ready!')
            : L('{ready} of {total} ready · tap “I’m ready” on your phone', {
                ready,
                total: seated.length,
              })}
        </p>
      </div>
    </div>
  );
}

// TV intro: the title, the three rules dealt in one by one, and the Black Sheep coin turning.
import type { CSSProperties, JSX } from 'react';
import { BigText, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { HerdTvView } from '../server/views';
import { SheepCoin } from './SheepCoin';
import { STRINGS } from './strings';
import styles from './Tv.module.css';

export function TvIntro({ view }: { view: PushedView<HerdTvView> }): JSX.Element {
  const L = useT(STRINGS);
  const rules = [
    { icon: '🎯', text: L('Pick the answer you think most people will pick.') },
    { icon: '👥', text: L('The biggest group scores a point. A tie for biggest scores nothing.') },
    {
      icon: '🐑',
      text: L("Alone with your answer? You take the Black Sheep, and can't win while you hold it."),
    },
  ];
  return (
    <div className={`${styles.intro} ${view.paused ? styles.paused : ''}`}>
      <div className={styles.titleRow}>
        <SheepCoin size="lg" spin />
        <div>
          <BigText level="display">{L('Herd Mind')}</BigText>
          <p className={styles.tagline}>{L("Think like the herd. Don't be the odd sheep.")}</p>
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
      <p className={styles.firstTo}>
        {L('First to {target} points wins.', { target: view.target })}
      </p>
    </div>
  );
}

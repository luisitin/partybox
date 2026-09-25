// THE EVENING REPUBLIC (SPEC §7.5, §18.3): a masthead, a date line ("Session 7"), the headline in
// the headline face, and grey bars for body text. It spins in when a new headline lands (§7.7).
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './moments.module.css';

export function Newspaper({
  headline,
  session,
  kicker,
  spin = true,
  delayMs = 0,
}: {
  headline: string;
  session: number;
  kicker?: string;
  spin?: boolean;
  delayMs?: number;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <article
      className={styles.paper}
      data-spin={spin || undefined}
      style={{ animationDelay: `${delayMs}ms` }}
      aria-label={headline}
    >
      <header className={styles.masthead}>
        <span className={styles.rule} />
        <span className={styles.title}>{L('The Evening Republic')}</span>
        <span className={styles.rule} />
      </header>
      <div className={styles.dateline}>
        <span>{L('Session {n}', { n: session })}</span>
        <span>{kicker ?? L('Extra')}</span>
      </div>
      <h2 className={styles.headline}>{headline}</h2>
      <div className={styles.columns} aria-hidden="true">
        {[0, 1, 2].map((c) => (
          <div key={c} className={styles.column}>
            {[88, 96, 72, 92, 60].map((w, i) => (
              <span key={i} className={styles.bar} style={{ width: `${w - c * 6}%` }} />
            ))}
          </div>
        ))}
      </div>
    </article>
  );
}

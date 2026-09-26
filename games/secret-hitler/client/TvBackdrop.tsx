// The chamber at midnight (SPEC §7.6): tall windows with rain, searchlights sweeping outside in
// tense moments, a vignette and one static layer of film grain (TV only); the alarm colour washes
// it on chaos (the dim around one seat is TvMoments' dimmer). Transform and opacity only; the rain
// stops with reduced motion (theme.module.css) and High Contrast drops rain and grain.
import type { JSX } from 'react';
import styles from './backdrop.module.css';

const TENSE = new Set(['vote', 'voteReveal', 'hitlerCheck', 'power', 'powerReveal', 'vetoAsk']);

export function TvBackdrop({ phase }: { phase: string }): JSX.Element {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.windows}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.window}>
            <div className={styles.rain} style={{ animationDelay: `${-i * 1.7}s` }} />
            <div className={styles.mullion} />
          </div>
        ))}
      </div>
      {TENSE.has(phase) ? (
        <>
          <div className={styles.searchlight} />
          <div className={styles.searchlight} data-late />
        </>
      ) : null}
      {phase === 'chaos' ? <div className={styles.alarm} /> : null}
      <div className={styles.vignette} />
      <div className={styles.grain} />
    </div>
  );
}

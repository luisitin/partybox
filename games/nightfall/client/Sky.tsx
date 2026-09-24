// The sky behind the stage: the mood of each phase, built from tokens only and animated with
// transform and opacity only (the TV performance budget). Night: the theme's darkest surface under
// the scrim, a slow moon and two twinkling star layers. Dawn: a sunrise gradient, a rising sun and
// drifting clouds. Day: warm light and clouds. Court (verdict, hunter): a swaying spotlight beam.
// End: embers rising. Always moving a little, so no frame is dead — and cheap: a handful of layers,
// never one animated element per star (p01: 42 stars cost 5 % long frames).
import type { CSSProperties, JSX } from 'react';
import styles from './Sky.module.css';

export type Mood = 'dusk' | 'night' | 'dawn' | 'day' | 'court' | 'end';

const EMBERS = Array.from({ length: 6 }, (_, i) => ({
  key: i,
  left: `${10 + ((i * 29) % 80)}%`,
  delay: `${((i * 0.9) % 6).toFixed(1)}s`,
}));

export function Sky({ mood, risen }: { mood: Mood; risen?: boolean }): JSX.Element {
  const starry = mood === 'night' || mood === 'dusk';
  const cloudy = mood === 'dawn' || mood === 'day';
  return (
    <div className={styles.sky} data-mood={mood} aria-hidden="true">
      <div className={styles.base} />
      <div className={styles.veil} />
      <div className={styles.glow} />
      {starry ? (
        <>
          <div className={`${styles.stars} ${styles.starsA}`} />
          <div className={`${styles.stars} ${styles.starsB}`} />
          <div className={styles.moonPath}>
            <div className={styles.moon}>
              <span className={styles.crater} />
              <span className={`${styles.crater} ${styles.c2}`} />
              <span className={`${styles.crater} ${styles.c3}`} />
            </div>
          </div>
        </>
      ) : null}
      {mood === 'dawn' ? (
        <div className={`${styles.sunPath} ${risen ? styles.risen : ''}`}>
          <div className={styles.rays} />
          <div className={styles.sun} />
        </div>
      ) : null}
      {cloudy ? (
        <>
          <div className={`${styles.cloud} ${styles.cloudA}`} />
          <div className={`${styles.cloud} ${styles.cloudB}`} />
        </>
      ) : null}
      {mood === 'court' ? <div className={styles.beam} /> : null}
      {mood === 'end'
        ? EMBERS.map((e) => (
            <span
              key={e.key}
              className={styles.ember}
              style={{ left: e.left, animationDelay: e.delay } as CSSProperties}
            />
          ))
        : null}
      <div className={styles.hills} />
    </div>
  );
}

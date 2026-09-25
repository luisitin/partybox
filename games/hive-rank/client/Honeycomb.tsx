// A honeycomb that drifts behind the stage: an SVG hex pattern in the theme's surface colour, one
// slow transform-only loop (still under reduced motion). Decoration only — aria-hidden.
import type { JSX } from 'react';
import styles from './Tv.module.css';

export function Honeycomb(): JSX.Element {
  return (
    <div className={styles.comb} aria-hidden>
      <svg className={styles.combSvg} width="100%" height="100%">
        <defs>
          <pattern id="hr-comb" width="84" height="145.5" patternUnits="userSpaceOnUse">
            <path
              d="M42 0 84 24.25v48.5L42 97 0 72.75v-48.5Zm0 97 42 24.25v48.5M42 97 0 121.25v48.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hr-comb)" />
      </svg>
    </div>
  );
}

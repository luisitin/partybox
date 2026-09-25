// The intro card (once): the title, the mode, the three steps told for that mode, a small dial
// tuning back and forth so the card is never still, and in teams both rosters under their banners.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { BigText, Stage, useReducedMotion, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import { Dial } from '@partybox/game-sdk/ui/dial';
import type { TuneTvView } from '../server/index';
import { modeLine, steps } from './copy';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { Rosters } from './Rosters';
import { useReading } from './useReading';

const SWEEP = [22, 78, 35, 64, 50];

function useSweep(): number {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % SWEEP.length), 900);
    return () => clearInterval(t);
  }, [reduced]);
  return SWEEP[i] ?? 50;
}

export function TvIntro({ view }: GameTvProps<TuneTvView>): JSX.Element {
  const L = useT(STRINGS);
  const needle = useSweep();
  useReading(view.reading);
  const mode = view.turn.mode;
  return (
    <Stage className={styles.intro}>
      <div className={styles.introTop}>
        <div className={styles.introTitle}>
          <BigText level="display">{L('📻 Tune In')}</BigText>
          <BigText level="h2" tone="accent">
            {modeLine(L, mode)}
          </BigText>
        </div>
        <div className={styles.introDial} aria-hidden>
          <Dial
            left={L('Cold')}
            right={L('Hot')}
            target={null}
            bands={view.turn.bands}
            open={false}
            needle={needle}
            entrance
          />
        </div>
      </div>
      <ol className={styles.steps}>
        {steps(L, mode).map((s, i) => (
          <li key={s} className={styles.step} style={{ animationDelay: `${200 + i * 160}ms` }}>
            <span className={styles.stepNo}>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      {mode === 'teams' && view.teams ? (
        <Rosters teams={view.teams} players={view.players} />
      ) : null}
    </Stage>
  );
}

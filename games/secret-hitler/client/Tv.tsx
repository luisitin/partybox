// TV view for Secret Hitler (M1: plain screens): a headline for the phase, the boards and the
// seat row. Dumb: renders the view, never game logic. The Parliament Record (its rows are already
// in the view), the Parliament Noir look, the signature moments and the narrator arrive in M2.
import type { JSX } from 'react';
import { BigText, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { ShTvView } from '../server/views';
import { CREDIT } from './labels';
import { phaseLines } from './lines';
import { STRINGS } from './strings';
import { TvBoard } from './TvBoard';
import { TvSeats } from './TvSeats';
import styles from './tv.module.css';

export function Tv({ view }: GameTvProps<ShTvView>): JSX.Element {
  const L = useT(STRINGS);
  const { title, lines } = phaseLines(L, view);
  const over = view.phaseId === 'gameOver' || view.phaseId === 'done';
  return (
    <Stage>
      <div className={styles.tv}>
        <header className={styles.head} data-silence={view.silence || undefined}>
          <BigText level="h2" tone={over ? 'accent' : 'default'}>
            {title}
          </BigText>
          {lines.filter(Boolean).map((line) => (
            <span key={line} className={styles.line}>
              {line}
            </span>
          ))}
          {view.lastCall ? <span className={styles.lastCall}>{L('Last call!')}</span> : null}
          {over ? <span className={styles.credit}>{L(CREDIT)}</span> : null}
        </header>
        <TvBoard view={view} />
        <TvSeats view={view} />
      </div>
    </Stage>
  );
}

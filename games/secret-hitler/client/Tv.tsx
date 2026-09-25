// TV view for Secret Hitler: a 1930s parliament at midnight (SPEC §7, §8). The chamber backdrop,
// the newspaper ticker, the phase banner with the game's own clock (the shell shows only its quiet
// bar), the boards and the Parliament Record, the seat row, and the signature moments on top.
// Dumb: renders the view, never game logic.
import { useRef } from 'react';
import type { JSX } from 'react';
import { useSecondsLeft, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { ShTvView } from '../server/views';
import { Countdown } from './Countdown';
import { CREDIT } from './labels';
import { phaseLines } from './lines';
import './sh-global.css';
import { STRINGS } from './strings';
import { TvBackdrop } from './TvBackdrop';
import { TvBand, TvBoard } from './TvBoard';
import { TvMoments } from './TvMoments';
import { TvRecord } from './TvRecord';
import { TvSeating } from './TvSeating';
import { TvSeats } from './TvSeats';
import theme from './theme.module.css';
import styles from './tv.module.css';

const CLOCKED = new Set([
  'nominate',
  'vote',
  'vetoAsk',
  'claims',
  'power',
  'presDraw',
  'chanEnact',
]);

function Clock({ view }: { view: ShTvView }): JSX.Element | null {
  const left = useSecondsLeft(view.deadline, view.paused);
  if (left === null || !CLOCKED.has(view.phaseId)) return null;
  const quiet = view.phaseId === 'presDraw' || view.phaseId === 'chanEnact';
  return (
    <span
      className={styles.clock}
      data-urgent={(left <= 5 && !quiet) || undefined}
      data-quiet={quiet || undefined}
    >
      {quiet ? '' : left}
    </span>
  );
}

export function Tv({ view }: GameTvProps<ShTvView>): JSX.Element {
  const L = useT(STRINGS);
  const root = useRef<HTMLDivElement>(null);
  const { title, lines } = phaseLines(L, view);
  const phase = view.phaseId;
  const over = phase === 'gameOver' || phase === 'done';
  return (
    <div
      ref={root}
      className={`${theme.sh} ${styles.tv}`}
      data-phase={phase}
      data-paused={view.paused || undefined}
    >
      <TvBackdrop phase={phase} />
      <div className={styles.layout}>
        <div className={styles.ticker}>
          <span className={styles.extra}>{L('Extra')}</span>
          <span key={view.headline ?? ''} className={styles.tickerText}>
            {view.headline ?? L('The Evening Republic · a new parliament sits tonight')}
          </span>
        </div>
        <header
          key={`${phase}:${view.round.n}`}
          className={styles.banner}
          data-silence={view.silence || undefined}
        >
          <div className={styles.bannerText}>
            <h1 className={styles.title} data-over={over || undefined}>
              {title}
            </h1>
            {lines.filter(Boolean).map((line, i) => (
              <p
                key={line}
                className={styles.line}
                style={{ animationDelay: `${120 + i * 120}ms` }}
              >
                {line}
              </p>
            ))}
            {view.lastCall ? <p className={styles.lastCall}>{L('Last call!')}</p> : null}
            {over ? <p className={styles.credit}>{L(CREDIT)}</p> : null}
          </div>
          <Clock view={view} />
        </header>
        {phase === 'seating' ? (
          <TvSeating view={view} />
        ) : (
          <div className={styles.main}>
            <TvBoard view={view} />
            <div className={styles.side}>
              <TvRecord view={view} rows={4} />
              <TvBand view={view} />
            </div>
          </div>
        )}
        <TvSeats view={view} />
      </div>
      <TvMoments view={view} root={root} />
      {phase === 'seating' && view.startAt !== undefined ? (
        <Countdown until={view.startAt} paused={view.paused} size="tv" />
      ) : null}
    </div>
  );
}

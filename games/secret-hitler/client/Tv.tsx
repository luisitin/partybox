// TV view for Secret Hitler (M1: plain screens). A headline for the phase, the boards, a plain
// Parliament Record, and the seat row. Dumb: renders the view, never game logic. The Parliament
// Noir look, the signature moments and the narrator arrive in M2.
import type { JSX } from 'react';
import { BigText, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { ShTvView } from '../server/views';
import { CREDIT, nameIn } from './labels';
import { phaseLines } from './lines';
import { STRINGS } from './strings';
import { TvBoard } from './TvBoard';
import { TvSeats } from './TvSeats';
import styles from './tv.module.css';

function Record({ view }: { view: ShTvView }): JSX.Element {
  const L = useT(STRINGS);
  const name = (i: number): string => nameIn(view.players, view.seats[i]?.id ?? null);
  return (
    <section className={styles.record} aria-label={L('Parliament Record')}>
      <span className={styles.trackTitle}>{L('Parliament Record')}</span>
      {view.history.length === 0 ? (
        <span className={styles.muted}>{L('No governments yet.')}</span>
      ) : null}
      <ol className={styles.rows}>
        {[...view.history].reverse().map((h) => (
          <li key={h.n}>
            {L('#{n} · {p} → {c} · {ja} JA {nein} NEIN', {
              n: h.n,
              p: name(h.pres),
              c: name(h.chan),
              ja: h.ja,
              nein: h.nein,
            })}{' '}
            · {h.elected ? L('Elected') : L('Rejected')}
            {h.enacted ? ` · ${h.enacted === 'L' ? L('L enacted') : L('F enacted')}` : ''}
            {h.veto ? ` · ${L('Veto agreed')}` : ''}
            {h.chaos ? ` · ${L('Chaos: {x}', { x: h.chaos })}` : ''}
          </li>
        ))}
      </ol>
    </section>
  );
}

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
        <div className={styles.main}>
          <TvBoard view={view} />
          <Record view={view} />
        </div>
        <TvSeats view={view} />
      </div>
    </Stage>
  );
}

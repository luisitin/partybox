// The finale board (§7.8), kept on the results screen: the rating with its icon, the score
// ("7 of 10"), the won words face up and the lost ones face down. Reads the rating aloud.
import type { CSSProperties, JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { GameFinaleProps } from '@partybox/game-sdk/ui';
import { RATINGS } from '../server/deck';
import type { EchoTvView } from '../server/views';
import { useLine } from './useLine';
import { STRINGS } from './strings';
import res from './result.module.css';

export function FinaleBoard({ view }: { view: EchoTvView }): JSX.Element | null {
  const L = useT(STRINGS);
  const f = view.final;
  if (!f) return null;
  const rating = RATINGS.find((r) => r.id === f.rating) ?? RATINGS[RATINGS.length - 1];
  return (
    <div className={res.finale}>
      <span className={res.rating}>
        <span aria-hidden>{rating?.icon}</span>
        {L(rating?.label ?? '')}
      </span>
      <span className={res.score}>
        {L('{won} of {total} words', { won: f.won.length, total: view.deckSize })}
      </span>
      <div className={res.board}>
        {f.won.map((w, i) => (
          <span
            key={`w${w}`}
            className={`${res.mini} ${res.miniWon}`}
            style={{ '--i': i } as CSSProperties}
          >
            ✓ {w}
          </span>
        ))}
        {Array.from({ length: f.lost }, (_, i) => (
          <span
            key={`l${i}`}
            className={`${res.mini} ${res.miniLost}`}
            style={{ '--i': f.won.length + i } as CSSProperties}
            aria-label={L('a lost word')}
          >
            ✗
          </span>
        ))}
      </div>
    </div>
  );
}

export function Finale({ lastView }: GameFinaleProps<EchoTvView>): JSX.Element | null {
  useLine(lastView.say[0], 600, lastView.phaseAt);
  return <FinaleBoard view={lastView} />;
}
